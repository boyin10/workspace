import { BigNumber } from "@ethersproject/bignumber";
import { Web3Provider } from "@ethersproject/providers";
import { parseEther } from "@ethersproject/units";
import {
  BasicIssuanceModule,
  Curve3Pool,
  CurveMetapool,
  MockYearnV2Vault,
} from "packages/contracts/typechain";
import { SetToken } from "../../lib/SetToken/vendor/set-protocol/types/SetToken";
import { HysiBatchInteraction } from "../../typechain/HysiBatchInteraction";

export enum BatchType {
  Mint,
  Redeem,
}

export interface TimeTillBatchProcessing {
  timeTillProcessing: Date;
  progressPercentage: number;
}
export interface Batch {
  batchType: BatchType;
  batchId: string;
  claimable: boolean;
  unclaimedShares: BigNumber;
  suppliedTokenBalance: BigNumber;
  claimableTokenBalance: BigNumber;
  suppliedTokenAddress: string;
  claimableTokenAddress: string;
}

export interface ComponentMap {
  // key is yTokenAddress
  [key: string]: {
    metaPool?: CurveMetapool;
    yPool?: MockYearnV2Vault;
  };
}

class HysiBatchInteractionAdapter {
  constructor(private contract: HysiBatchInteraction) {}

  async getBatch(batchId: string): Promise<Batch> {
    const batch = await this.contract.batches(batchId);
    return {
      batchType: batch.batchType,
      batchId: batch.batchId,
      claimable: batch.claimable,
      unclaimedShares: batch.unclaimedShares,
      suppliedTokenBalance: batch.suppliedTokenBalance,
      claimableTokenBalance: batch.claimableTokenBalance,
      suppliedTokenAddress: batch.suppliedTokenAddress,
      claimableTokenAddress: batch.claimableTokenAddress,
    };
  }

  async calculateAmountToReceiveForClaim(batchId, address): Promise<BigNumber> {
    const batch = await this.contract.batches(batchId);
    const unclaimedShares = batch.unclaimedShares;

    const claimableTokenBalance = batch.claimableTokenBalance;

    const accountBalance = await this.contract.accountBalances(
      batchId,
      address
    );
    const amountToReceive = accountBalance
      .div(unclaimedShares)
      .mul(claimableTokenBalance);
    return amountToReceive;
  }

  static async getMinAmountOf3CrvToReceiveForBatchRedeem(
    slippage: number = 0.005,
    contracts: {
      hysiBatchInteraction: HysiBatchInteraction;
      basicIssuanceModule: BasicIssuanceModule;
      setToken: SetToken;
    },
    componentMap: ComponentMap
  ): Promise<BigNumber> {
    const batchId = await contracts.hysiBatchInteraction.currentRedeemBatchId();

    // get expected units of HYSI given 3crv amount:
    const HYSIInBatch = (await contracts.hysiBatchInteraction.batches(batchId))
      .suppliedTokenBalance;

    const components =
      await contracts.basicIssuanceModule.getRequiredComponentUnitsForIssue(
        contracts.setToken.address,
        HYSIInBatch
      );
    const componentAddresses = components[0];
    const componentAmounts = components[1];

    const componentVirtualPrices = await Promise.all(
      componentAddresses.map(async (component) => {
        const metapool = componentMap[component.toLowerCase()]
          .metaPool as CurveMetapool;
        const yPool = componentMap[component.toLowerCase()]
          .yPool as MockYearnV2Vault;
        const yPoolPricePerShare = await yPool.pricePerShare();
        const metapoolPrice = await metapool.get_virtual_price();
        return yPoolPricePerShare.mul(metapoolPrice).div(parseEther("1"));
      })
    );

    const componentValuesInUSD = componentVirtualPrices.reduce(
      (sum, componentPrice, i) => {
        return sum.add(
          componentPrice.mul(componentAmounts[i]).div(parseEther("1"))
        );
      },
      parseEther("0")
    );

    // 50 bps slippage tolerance
    const slippageTolerance = 1 - Number(slippage);
    const minAmountToReceive = componentValuesInUSD
      .mul(parseEther(slippageTolerance.toString()))
      .div(parseEther("1"));

    return minAmountToReceive;
  }

  public async getHysiPrice(
    contract: BasicIssuanceModule,
    componentMap: ComponentMap
  ): Promise<BigNumber> {
    const components = await contract.getRequiredComponentUnitsForIssue(
      process.env.ADDR_HYSI,
      parseEther("1")
    );
    const componentAddresses = components[0];
    const componentAmounts = components[1];
    console.log(componentMap);

    const componentVirtualPrices = await Promise.all(
      componentAddresses.map(async (address) => {
        const metapool = componentMap[address.toLowerCase()].metaPool;
        const yPool = componentMap[address.toLowerCase()].yPool;
        const yPoolPricePerShare = await yPool.pricePerShare();
        const metapoolPrice = await metapool.get_virtual_price();
        return yPoolPricePerShare
          .mul(metapoolPrice)
          .div(parseEther("1")) as BigNumber;
      })
    );

    const hysiPrice = componentVirtualPrices.reduce(
      (sum: BigNumber, componentPrice: BigNumber, i) => {
        return sum.add(
          componentPrice.mul(componentAmounts[i]).div(parseEther("1"))
        );
      },
      parseEther("0")
    );

    return hysiPrice as BigNumber;
  }

  public async getThreeCrvPrice(contract: Curve3Pool): Promise<BigNumber> {
    return await contract.get_virtual_price();
  }

  public async getBatches(account: string): Promise<Batch[]> {
    const batchIds = await this.contract.getAccountBatches(account);
    const batches = await Promise.all(
      batchIds.map(async (id) => {
        const batch = await this.contract.batches(id);
        const shares = await this.contract.accountBalances(id, account);
        return {
          batchType: batch.batchType,
          batchId: batch.batchId,
          claimable: batch.claimable,
          unclaimedShares: batch.unclaimedShares,
          suppliedTokenBalance: shares,
          claimableTokenBalance: batch.claimableTokenBalance
            .mul(shares)
            .div(batch.unclaimedShares),
          suppliedTokenAddress: batch.suppliedTokenAddress,
          claimableTokenAddress: batch.claimableTokenAddress,
        };
      })
    );
    return (batches as Batch[]).filter(
      (batch) => batch.suppliedTokenBalance > BigNumber.from("0")
    );
  }

  public async getBatchCooldowns(): Promise<BigNumber[]> {
    const lastMintedAt = await this.contract.lastMintedAt();
    const lastRedeemedAt = await this.contract.lastRedeemedAt();
    const cooldown = await this.contract.batchCooldown();
    return [lastMintedAt.add(cooldown), lastRedeemedAt.add(cooldown)];
  }

  public async calcBatchTimes(
    library: Web3Provider
  ): Promise<TimeTillBatchProcessing[]> {
    const cooldowns = await this.getBatchCooldowns();
    const currentBlockTime = await (await library.getBlock("latest")).timestamp;
    const secondsTillMint = new Date(
      (currentBlockTime / Number(cooldowns[0].toString())) * 1000
    );
    const secondsTillRedeem = new Date(
      (currentBlockTime / Number(cooldowns[1].toString())) * 1000
    );
    const percentageTillMint =
      currentBlockTime / Number(cooldowns[0].toString());
    const percentageTillRedeem =
      (currentBlockTime / Number(cooldowns[1].toString())) * 100;
    return [
      {
        timeTillProcessing: secondsTillMint,
        progressPercentage: percentageTillMint,
      },
      {
        timeTillProcessing: secondsTillRedeem,
        progressPercentage: percentageTillRedeem,
      },
    ];
  }
}

export default HysiBatchInteractionAdapter;