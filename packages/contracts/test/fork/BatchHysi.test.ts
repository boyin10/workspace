import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers, network, waffle } from "hardhat";
import CurveMetapoolAbi from "../../lib/Curve/CurveMetapoolAbi.json";
import BasicIssuanceModuleAbi from "../../lib/SetToken/vendor/set-protocol/artifacts/BasicIssuanceModule.json";
import SetTokenAbi from "../../lib/SetToken/vendor/set-protocol/artifacts/SetToken.json";
import { BasicIssuanceModule } from "../../lib/SetToken/vendor/set-protocol/types/BasicIssuanceModule";
import { SetToken } from "../../lib/SetToken/vendor/set-protocol/types/SetToken";
import {
  CurveMetapool,
  ERC20,
  Faucet,
  HysiBatchInteraction,
  MockERC20,
  MockYearnV2Vault,
  Test,
  Test2,
} from "../../typechain";

const provider = waffle.provider;

interface Contracts {
  threeCrv: ERC20;
  crvDUSD: ERC20;
  crvFRAX: ERC20;
  crvUSDN: ERC20;
  crvUST: ERC20;
  dusdMetapool: CurveMetapool;
  fraxMetapool: CurveMetapool;
  usdnMetapool: CurveMetapool;
  ustMetapool: CurveMetapool;
  yDUSD: MockYearnV2Vault;
  yFRAX: MockYearnV2Vault;
  yUSDN: MockYearnV2Vault;
  yUST: MockYearnV2Vault;
  hysi: SetToken;
  basicIssuanceModule: BasicIssuanceModule;
  hysiBatchInteraction: HysiBatchInteraction;
  faucet: Faucet;
}

enum BatchType {
  Mint,
  Redeem,
}

const DepositorInitial = parseEther("100000");
let owner: SignerWithAddress,
  depositor: SignerWithAddress,
  depositor1: SignerWithAddress,
  depositor2: SignerWithAddress,
  depositor3: SignerWithAddress,
  rewardsManager: SignerWithAddress;
let contracts: Contracts;

const HYSI_TOKEN_ADDRESS = "0x8d1621a27bb8c84e59ca339cf9b21e15b907e408";

const SET_BASIC_ISSUANCE_MODULE_ADDRESS =
  "0xd8EF3cACe8b4907117a45B0b125c68560532F94D";

const THREE_CRV_TOKEN_ADDRESS = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";

const CRV_DUSD_TOKEN_ADDRESS = "0x3a664ab939fd8482048609f652f9a0b0677337b9";
const CRV_FRAX_TOKEN_ADDRESS = "0xd632f22692fac7611d2aa1c0d552930d43caed3b";
const CRV_USDN_TOKEN_ADDRESS = "0x4f3e8f405cf5afc05d68142f3783bdfe13811522";
const CRV_UST_TOKEN_ADDRESS = "0x94e131324b6054c0d789b190b2dac504e4361b53";

const DUSD_METAPOOL_ADDRESS = "0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c";
const FRAX_METAPOOL_ADDRESS = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
const USDN_METAPOOL_ADDRESS = "0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1";
const UST_METAPOOL_ADDRESS = "0x890f4e345B1dAED0367A877a1612f86A1f86985f";

const YDUSD_TOKEN_ADDRESS = "0x30fcf7c6cdfc46ec237783d94fc78553e79d4e9c";
const YFRAX_TOKEN_ADDRESS = "0xb4ada607b9d6b2c9ee07a275e9616b84ac560139";
const YUSDN_TOKEN_ADDRESS = "0x3b96d491f067912d18563d56858ba7d6ec67a6fa";
const YUST_TOKEN_ADDRESS = "0x1c6a9783f812b3af3abbf7de64c3cd7cc7d1af44";

const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const CURVE_ADDRESS_PROVIDER_ADDRESS =
  "0x0000000022D53366457F9d5E68Ec105046FC4383";
const CURVE_FACTORY_METAPOOL_DEPOSIT_ZAP_ADDRESS =
  "0xA79828DF1850E8a3A3064576f380D90aECDD3359";

const underlying = [
  {
    crvToken: CRV_DUSD_TOKEN_ADDRESS,
    yToken: YDUSD_TOKEN_ADDRESS,
    curveMetaPool: DUSD_METAPOOL_ADDRESS,
  },
  {
    crvToken: CRV_FRAX_TOKEN_ADDRESS,
    yToken: YFRAX_TOKEN_ADDRESS,
    curveMetaPool: FRAX_METAPOOL_ADDRESS,
  },
  {
    crvToken: CRV_USDN_TOKEN_ADDRESS,
    yToken: YUSDN_TOKEN_ADDRESS,
    curveMetaPool: USDN_METAPOOL_ADDRESS,
  },
  {
    crvToken: CRV_UST_TOKEN_ADDRESS,
    yToken: YUST_TOKEN_ADDRESS,
    curveMetaPool: UST_METAPOOL_ADDRESS,
  },
];

async function deployContracts(): Promise<Contracts> {
  //Deploy helper Faucet
  const Faucet = await ethers.getContractFactory("Faucet");
  const faucet = await (
    await Faucet.deploy(
      UNISWAP_ROUTER_ADDRESS,
      CURVE_ADDRESS_PROVIDER_ADDRESS,
      CURVE_FACTORY_METAPOOL_DEPOSIT_ZAP_ADDRESS
    )
  ).deployed();
  await network.provider.send("hardhat_setBalance", [
    faucet.address,
    "0x152d02c7e14af6800000", // 100k ETH
  ]);

  //Deploy Curve Token
  const threeCrv = (await ethers.getContractAt(
    "ERC20",
    THREE_CRV_TOKEN_ADDRESS
  )) as ERC20;

  const crvDUSD = (await ethers.getContractAt(
    "ERC20",
    CRV_DUSD_TOKEN_ADDRESS
  )) as ERC20;

  const crvFRAX = (await ethers.getContractAt(
    "ERC20",
    CRV_FRAX_TOKEN_ADDRESS
  )) as ERC20;

  const crvUSDN = (await ethers.getContractAt(
    "ERC20",
    CRV_USDN_TOKEN_ADDRESS
  )) as ERC20;

  const crvUST = (await ethers.getContractAt(
    "ERC20",
    CRV_UST_TOKEN_ADDRESS
  )) as ERC20;

  //Deploy Curve Metapool
  const dusdMetapool = (await ethers.getContractAt(
    CurveMetapoolAbi,
    DUSD_METAPOOL_ADDRESS
  )) as CurveMetapool;

  const fraxMetapool = (await ethers.getContractAt(
    CurveMetapoolAbi,
    FRAX_METAPOOL_ADDRESS
  )) as CurveMetapool;

  const usdnMetapool = (await ethers.getContractAt(
    CurveMetapoolAbi,
    USDN_METAPOOL_ADDRESS
  )) as CurveMetapool;

  const ustMetapool = (await ethers.getContractAt(
    CurveMetapoolAbi,
    UST_METAPOOL_ADDRESS
  )) as CurveMetapool;

  //Deploy Yearn Vaults
  const yDUSD = (await ethers.getContractAt(
    "MockYearnV2Vault",
    YDUSD_TOKEN_ADDRESS
  )) as MockYearnV2Vault;

  const yFRAX = (await ethers.getContractAt(
    "MockYearnV2Vault",
    YFRAX_TOKEN_ADDRESS
  )) as MockYearnV2Vault;

  const yUSDN = (await ethers.getContractAt(
    "MockYearnV2Vault",
    YUSDN_TOKEN_ADDRESS
  )) as MockYearnV2Vault;

  const yUST = (await ethers.getContractAt(
    "MockYearnV2Vault",
    YUST_TOKEN_ADDRESS
  )) as MockYearnV2Vault;

  //Deploy Set Procotol
  const hysi = (await ethers.getContractAt(
    SetTokenAbi.abi,
    HYSI_TOKEN_ADDRESS
  )) as SetToken;

  const basicIssuanceModule = (await ethers.getContractAt(
    BasicIssuanceModuleAbi.abi,
    SET_BASIC_ISSUANCE_MODULE_ADDRESS
  )) as BasicIssuanceModule;

  //Deploy HysiBatchInteraction
  const HysiBatchInteraction = await ethers.getContractFactory(
    "HysiBatchInteraction"
  );
  const hysiBatchInteraction = await (
    await HysiBatchInteraction.deploy(
      THREE_CRV_TOKEN_ADDRESS,
      HYSI_TOKEN_ADDRESS,
      SET_BASIC_ISSUANCE_MODULE_ADDRESS,
      1500,
      parseEther("100"),
      parseEther("10")
    )
  ).deployed();

  await hysiBatchInteraction.connect(owner).setUnderylingToken(underlying);

  return {
    threeCrv,
    crvDUSD,
    crvFRAX,
    crvUSDN,
    crvUST,
    dusdMetapool,
    fraxMetapool,
    usdnMetapool,
    ustMetapool,
    yDUSD,
    yFRAX,
    yUSDN,
    yUST,
    hysi,
    basicIssuanceModule,
    hysiBatchInteraction,
    faucet,
  };
}

describe("HysiBatchInteraction Network Test", function () {
  before(async function () {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.FORKING_RPC_URL,
            blockNumber: parseInt(process.env.FORKING_BLOCK_NUMBER),
          },
        },
      ],
    });
  });

  beforeEach(async function () {
    [owner, depositor, depositor1, depositor2, depositor3] =
      await ethers.getSigners();
    contracts = await deployContracts();
    [depositor, depositor1, depositor2, depositor3].forEach(async (account) => {
      await contracts.faucet.sendThreeCrv(1000, account.address);
    });
  });
  describe.only("test", function () {
    it("tests dynamic amounts", async function () {
      console.log("approve");
      await contracts.threeCrv
        .connect(depositor)
        .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
      console.log("deposit");
      await contracts.hysiBatchInteraction
        .connect(depositor)
        .depositForMint(parseEther("100"));
      console.log("get quantities");
      const [quantities, pools] =
        await contracts.hysiBatchInteraction.getPoolAllocations();
      console.log(quantities);
      // quantities.forEach((e) =>
      //   console.log(e.div(parseEther("1")).mul(parseEther("1")).toString())
      // );
      console.log("send to curve");
      await contracts.hysiBatchInteraction.sendToCurve(quantities);
      console.log(
        await (
          await contracts.crvDUSD.balanceOf(
            contracts.hysiBatchInteraction.address
          )
        ).toString()
      );
    });
    it("tests fixed amounts", async function () {
      console.log("approve");
      await contracts.threeCrv
        .connect(depositor)
        .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
      console.log("deposit");
      await contracts.hysiBatchInteraction
        .connect(depositor)
        .depositForMint(parseEther("100"));
      console.log("get quantities");
      const [quantities, pools] =
        await contracts.hysiBatchInteraction.getPoolAllocations();
      quantities.forEach((e) => console.log(e.toString()));
      console.log("send to curve");
      await contracts.hysiBatchInteraction.sendToCurve([
        parseEther("25"),
        parseEther("25"),
        parseEther("25"),
        parseEther("25"),
      ]);
      console.log(
        await (
          await contracts.crvDUSD.balanceOf(
            contracts.hysiBatchInteraction.address
          )
        ).toString()
      );
    });
    it.only("batch mint", async function () {
      console.log("approve");
      await contracts.threeCrv
        .connect(depositor)
        .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
      console.log("deposit");
      await contracts.hysiBatchInteraction
        .connect(depositor)
        .depositForMint(parseEther("100"));
      console.log("batchMint");
      await contracts.hysiBatchInteraction.batchMint();
      console.log(
        await (
          await contracts.crvDUSD.balanceOf(
            contracts.hysiBatchInteraction.address
          )
        ).toString()
      );
    });
  });
  describe("mint", function () {
    context("depositing", function () {
      it("deposits 3crv in the current mintBatch", async function () {
        await contracts.threeCrv
          .connect(depositor)
          .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
        expect(
          await contracts.hysiBatchInteraction
            .connect(depositor)
            .depositForMint(parseEther("10"))
        )
          .to.emit(contracts.hysiBatchInteraction, "Deposit")
          .withArgs(depositor.address, parseEther("10"));
        expect(
          await contracts.threeCrv.balanceOf(
            contracts.hysiBatchInteraction.address
          )
        ).to.equal(parseEther("10"));
        const currentMintBatchId =
          await contracts.hysiBatchInteraction.currentMintBatchId();
        const currentBatch = await contracts.hysiBatchInteraction.batches(
          currentMintBatchId
        );
        expect(currentBatch.suppliedToken).to.equal(parseEther("10"));
        expect(currentBatch.unclaimedShares).to.equal(parseEther("10"));
      });
      it("adds the mintBatch to the users batches", async function () {
        await contracts.threeCrv
          .connect(depositor)
          .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
        await contracts.hysiBatchInteraction
          .connect(depositor)
          .depositForMint(parseEther("100"));

        const currentMintBatchId =
          await contracts.hysiBatchInteraction.currentMintBatchId();
        expect(
          await contracts.hysiBatchInteraction.batchesOfAccount(
            depositor.address,
            0
          )
        ).to.equal(currentMintBatchId);
      });
      it("allows multiple deposits", async function () {
        await contracts.threeCrv
          .connect(depositor)
          .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
        await contracts.hysiBatchInteraction
          .connect(depositor)
          .depositForMint(parseEther("100"));
        await contracts.threeCrv
          .connect(depositor1)
          .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
        await contracts.hysiBatchInteraction
          .connect(depositor1)
          .depositForMint(parseEther("100"));
        await contracts.threeCrv
          .connect(depositor2)
          .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
        await contracts.hysiBatchInteraction
          .connect(depositor2)
          .depositForMint(parseEther("50"));
        await contracts.hysiBatchInteraction
          .connect(depositor2)
          .depositForMint(parseEther("50"));
        const currentMintBatchId =
          await contracts.hysiBatchInteraction.currentMintBatchId();
        const currentBatch = await contracts.hysiBatchInteraction.batches(
          currentMintBatchId
        );
        expect(currentBatch.suppliedToken).to.equal(parseEther("300"));
        expect(currentBatch.unclaimedShares).to.equal(parseEther("300"));
        expect(
          await contracts.hysiBatchInteraction.batchesOfAccount(
            depositor.address,
            0
          )
        ).to.equal(currentMintBatchId);
        expect(
          await contracts.hysiBatchInteraction.batchesOfAccount(
            depositor1.address,
            0
          )
        ).to.equal(currentMintBatchId);
        expect(
          await contracts.hysiBatchInteraction.batchesOfAccount(
            depositor2.address,
            0
          )
        ).to.equal(currentMintBatchId);
      });
    });
    context("batch minting", function () {
      context("reverts", function () {
        it("reverts when minting too early", async function () {
          await contracts.threeCrv
            .connect(depositor)
            .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
          await contracts.hysiBatchInteraction
            .connect(depositor)
            .depositForMint(parseEther("100"));
          await expect(
            contracts.hysiBatchInteraction.connect(owner).batchMint()
          ).to.be.revertedWith("can not execute batch action yet");
        });
      });
      context("success", function () {
        it("test", async function () {
          //getQuantities -- works
          //getYPrices -- works
          //getCRVPrices -- works
          //getYInCRV -- works
          //getQuantitiesIn3Crv -- works
          //getHysiIn3Crv -- works
          //getPoolAllocations -- works
          await contracts.threeCrv
            .connect(depositor)
            .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
          await contracts.hysiBatchInteraction
            .connect(depositor)
            .depositForMint(parseEther("100"));

          const quantities =
            await contracts.hysiBatchInteraction.getPoolAllocations();
          console.log(quantities);
        });
        it("batch mints", async function () {
          await contracts.threeCrv
            .connect(depositor)
            .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
          await contracts.hysiBatchInteraction
            .connect(depositor)
            .depositForMint(parseEther("100"));
          await provider.send("evm_increaseTime", [1800]);
          await provider.send("evm_mine", []);
          const currentId =
            await contracts.hysiBatchInteraction.currentMintBatchId();
          const result = await contracts.hysiBatchInteraction
            .connect(depositor)
            .batchMint();
          expect(result)
            .to.emit(contracts.hysiBatchInteraction, "BatchMinted")
            .withArgs(parseEther("100"));
          expect(
            await contracts.hysi.balanceOf(
              contracts.hysiBatchInteraction.address
            )
          ).to.equal(parseEther("100"));
        });
        it("mints early when mintThreshold is met", async function () {
          await contracts.threeCrv
            .connect(depositor)
            .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
          await contracts.hysiBatchInteraction
            .connect(depositor)
            .depositForMint(parseEther("100"));
          await contracts.threeCrv
            .connect(depositor1)
            .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
          await contracts.hysiBatchInteraction
            .connect(depositor1)
            .depositForMint(parseEther("100"));
          await expect(
            contracts.hysiBatchInteraction.connect(owner).batchMint()
          ).to.emit(contracts.hysiBatchInteraction, "BatchMinted");
        });
        it("advances to the next batch", async function () {
          await contracts.threeCrv
            .connect(depositor)
            .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
          await contracts.hysiBatchInteraction
            .connect(depositor)
            .depositForMint(parseEther("100"));
          await provider.send("evm_increaseTime", [1800]);

          const previousMintBatchId =
            await contracts.hysiBatchInteraction.currentMintBatchId();
          await contracts.hysiBatchInteraction.batchMint();

          const previousBatch = await contracts.hysiBatchInteraction.batches(
            previousMintBatchId
          );
          expect(previousBatch.claimable).to.equal(true);

          const currentMintBatchId =
            await contracts.hysiBatchInteraction.currentMintBatchId();
          expect(currentMintBatchId).to.not.equal(previousMintBatchId);
        });
      });
    });
    context("claim batch", function () {
      beforeEach(async function () {
        await contracts.threeCrv
          .connect(depositor)
          .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
        await contracts.hysiBatchInteraction
          .connect(depositor)
          .depositForMint(parseEther("100"));
        await contracts.threeCrv
          .connect(depositor1)
          .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
        await contracts.hysiBatchInteraction
          .connect(depositor1)
          .depositForMint(parseEther("100"));
        await contracts.threeCrv
          .connect(depositor2)
          .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
        await contracts.hysiBatchInteraction
          .connect(depositor2)
          .depositForMint(parseEther("100"));
        await contracts.threeCrv
          .connect(depositor3)
          .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
        await contracts.hysiBatchInteraction
          .connect(depositor3)
          .depositForMint(parseEther("100"));
      });
      it("reverts when batch is not yet claimable", async function () {
        const batchId = await contracts.hysiBatchInteraction.batchesOfAccount(
          depositor.address,
          0
        );
        await expect(
          contracts.hysiBatchInteraction.claim(batchId, BatchType.Redeem)
        ).to.be.revertedWith("not yet claimable");
      });
      it("claim batch successfully", async function () {
        await provider.send("evm_increaseTime", [1800]);

        await contracts.hysiBatchInteraction.connect(owner).batchMint();
        const batchId = await contracts.hysiBatchInteraction.batchesOfAccount(
          depositor.address,
          0
        );
        expect(
          await contracts.hysiBatchInteraction
            .connect(depositor)
            .claim(batchId, BatchType.Mint)
        )
          .to.emit(contracts.hysiBatchInteraction, "Claimed")
          .withArgs(depositor.address, parseEther("100"));
        expect(await contracts.hysi.balanceOf(depositor.address)).to.equal(
          parseEther("100")
        );
        const batch = await contracts.hysiBatchInteraction.batches(batchId);
        expect(batch.unclaimedShares).to.equal(parseEther("30000"));
        expect(batch.claimableToken).to.equal(parseEther("300"));
      });
    });
  });
  // describe("redeem", function () {
  //   beforeEach(async function () {
  //     await contracts.hysi.mint(depositor.address, parseEther("100"));
  //     await contracts.hysi.mint(depositor1.address, parseEther("100"));
  //     await contracts.hysi.mint(depositor2.address, parseEther("100"));
  //     await contracts.hysi.mint(depositor3.address, parseEther("100"));
  //     await contracts.mockYearnVaultUSDX.mint(
  //       contracts.mockBasicIssuanceModule.address,
  //       parseEther("20000")
  //     );
  //     await contracts.mockYearnVaultUST.mint(
  //       contracts.mockBasicIssuanceModule.address,
  //       parseEther("20000")
  //     );
  //   });
  //   context("depositing", function () {
  //     it("deposits setToken in the current redeemBatch", async function () {
  //       await contracts.hysi
  //         .connect(depositor)
  //         .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //       const result = await contracts.hysiBatchInteraction
  //         .connect(depositor)
  //         .depositForRedeem(parseEther("100"));
  //       expect(result)
  //         .to.emit(contracts.hysiBatchInteraction, "Deposit")
  //         .withArgs(depositor.address, parseEther("100"));
  //       expect(
  //         await contracts.hysi.balanceOf(contracts.hysiBatchInteraction.address)
  //       ).to.equal(parseEther("100"));
  //       const currentRedeemBatchId =
  //         await contracts.hysiBatchInteraction.currentRedeemBatchId();
  //       const currentBatch = await contracts.hysiBatchInteraction.batches(
  //         currentRedeemBatchId
  //       );
  //       expect(currentBatch.suppliedToken).to.equal(parseEther("100"));
  //       expect(currentBatch.unclaimedShares).to.equal(parseEther("100"));
  //     });
  //     it("adds the redeemBatch to the users batches", async function () {
  //       await contracts.hysi
  //         .connect(depositor)
  //         .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //       await contracts.hysiBatchInteraction
  //         .connect(depositor)
  //         .depositForRedeem(parseEther("100"));

  //       const currentRedeemBatchId =
  //         await contracts.hysiBatchInteraction.currentRedeemBatchId();
  //       expect(
  //         await contracts.hysiBatchInteraction.batchesOfAccount(
  //           depositor.address,
  //           0
  //         )
  //       ).to.equal(currentRedeemBatchId);
  //     });
  //     it("allows multiple deposits", async function () {
  //       await contracts.hysi
  //         .connect(depositor)
  //         .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //       await contracts.hysiBatchInteraction
  //         .connect(depositor)
  //         .depositForRedeem(parseEther("100"));
  //       await contracts.hysi
  //         .connect(depositor1)
  //         .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //       await contracts.hysiBatchInteraction
  //         .connect(depositor1)
  //         .depositForRedeem(parseEther("100"));
  //       await contracts.hysi
  //         .connect(depositor2)
  //         .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //       await contracts.hysiBatchInteraction
  //         .connect(depositor2)
  //         .depositForRedeem(parseEther("50"));
  //       await contracts.hysiBatchInteraction
  //         .connect(depositor2)
  //         .depositForRedeem(parseEther("50"));
  //       const currentRedeemBatchId =
  //         await contracts.hysiBatchInteraction.currentRedeemBatchId();
  //       const currentBatch = await contracts.hysiBatchInteraction.batches(
  //         currentRedeemBatchId
  //       );
  //       expect(currentBatch.suppliedToken).to.equal(parseEther("300"));
  //       expect(currentBatch.unclaimedShares).to.equal(parseEther("300"));
  //       expect(
  //         await contracts.hysiBatchInteraction.batchesOfAccount(
  //           depositor.address,
  //           0
  //         )
  //       ).to.equal(currentRedeemBatchId);
  //       expect(
  //         await contracts.hysiBatchInteraction.batchesOfAccount(
  //           depositor1.address,
  //           0
  //         )
  //       ).to.equal(currentRedeemBatchId);
  //       expect(
  //         await contracts.hysiBatchInteraction.batchesOfAccount(
  //           depositor2.address,
  //           0
  //         )
  //       ).to.equal(currentRedeemBatchId);
  //     });
  //   });
  // context("batch redeeming", function () {
  //   beforeEach(async function () {
  //     await contracts.hysi.mint(depositor.address, parseEther("100"));
  //     await contracts.hysi.mint(depositor1.address, parseEther("100"));
  //     await contracts.hysi.mint(depositor2.address, parseEther("100"));
  //     await contracts.hysi.mint(depositor3.address, parseEther("100"));
  //     await contracts.mockCrvUSDX.mint(
  //       contracts.mockYearnVaultUSDX.address,
  //       parseEther("20000")
  //     );
  //     await contracts.mockCrvUST.mint(
  //       contracts.mockYearnVaultUST.address,
  //       parseEther("20000")
  //     );
  //   });

  //   context("reverts", function () {
  //     it("reverts when redeeming too early", async function () {
  //       await contracts.hysi
  //         .connect(depositor)
  //         .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //       await contracts.hysiBatchInteraction
  //         .connect(depositor)
  //         .depositForRedeem(parseEther("100"));
  //       await expect(
  //         contracts.hysiBatchInteraction.connect(owner).batchRedeem()
  //       ).to.be.revertedWith("can not execute batch action yet");
  //     });
  //   });
  //   context("success", function () {
  //     it("batch redeems", async function () {
  //       await contracts.hysi
  //         .connect(depositor)
  //         .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //       await contracts.hysiBatchInteraction
  //         .connect(depositor)
  //         .depositForRedeem(parseEther("100"));

  //       await provider.send("evm_increaseTime", [1800]);
  //       const result = await contracts.hysiBatchInteraction
  //         .connect(owner)
  //         .batchRedeem();
  //       expect(result)
  //         .to.emit(contracts.hysiBatchInteraction, "BatchRedeemed")
  //         .withArgs(parseEther("100"));
  //       expect(
  //         await contracts.threeCrv.balanceOf(
  //           contracts.hysiBatchInteraction.address
  //         )
  //       ).to.equal(parseEther("9990"));
  //     });
  //     it("mints early when redeemThreshold is met", async function () {
  //       await contracts.hysi
  //         .connect(depositor)
  //         .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //       await contracts.hysiBatchInteraction
  //         .connect(depositor)
  //         .depositForRedeem(parseEther("100"));
  //       await contracts.hysi
  //         .connect(depositor1)
  //         .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //       await contracts.hysiBatchInteraction
  //         .connect(depositor1)
  //         .depositForRedeem(parseEther("100"));
  //       const result = await contracts.hysiBatchInteraction
  //         .connect(owner)
  //         .batchRedeem();
  //       expect(result).to.emit(
  //         contracts.hysiBatchInteraction,
  //         "BatchRedeemed"
  //       );
  //     });
  //     it("advances to the next batch", async function () {
  //       await contracts.hysi
  //         .connect(depositor)
  //         .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //       await contracts.hysiBatchInteraction
  //         .connect(depositor)
  //         .depositForRedeem(parseEther("100"));
  //       await provider.send("evm_increaseTime", [1800]);

  //       const previousRedeemBatchId =
  //         await contracts.hysiBatchInteraction.currentRedeemBatchId();
  //       await contracts.hysiBatchInteraction.batchRedeem();

  //       const previousBatch = await contracts.hysiBatchInteraction.batches(
  //         previousRedeemBatchId
  //       );
  //       expect(previousBatch.claimable).to.equal(true);

  //       const currentRedeemBatchId =
  //         await contracts.hysiBatchInteraction.currentRedeemBatchId();
  //       expect(currentRedeemBatchId).to.not.equal(previousRedeemBatchId);
  //     });
  //   });
  // });
  // context("claim batch", function () {
  //   beforeEach(async function () {
  //     await contracts.hysi
  //       .connect(depositor)
  //       .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //     await contracts.hysiBatchInteraction
  //       .connect(depositor)
  //       .depositForRedeem(parseEther("100"));
  //     await contracts.hysi
  //       .connect(depositor1)
  //       .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //     await contracts.hysiBatchInteraction
  //       .connect(depositor1)
  //       .depositForRedeem(parseEther("100"));
  //     await contracts.hysi
  //       .connect(depositor2)
  //       .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //     await contracts.hysiBatchInteraction
  //       .connect(depositor2)
  //       .depositForRedeem(parseEther("100"));
  //     await contracts.hysi
  //       .connect(depositor3)
  //       .approve(contracts.hysiBatchInteraction.address, parseEther("100"));
  //     await contracts.hysiBatchInteraction
  //       .connect(depositor3)
  //       .depositForRedeem(parseEther("100"));
  //     await contracts.mockCrvUSDX.mint(
  //       contracts.mockYearnVaultUSDX.address,
  //       parseEther("20000")
  //     );
  //     await contracts.mockCrvUST.mint(
  //       contracts.mockYearnVaultUST.address,
  //       parseEther("20000")
  //     );
  //   });
  //   it("reverts when batch is not yet claimable", async function () {
  //     const batchId = await contracts.hysiBatchInteraction.batchesOfAccount(
  //       depositor.address,
  //       0
  //     );
  //     await expect(
  //       contracts.hysiBatchInteraction.claim(batchId, BatchType.Redeem)
  //     ).to.be.revertedWith("not yet claimable");
  //   });
  //   it("claim batch successfully", async function () {
  //     await provider.send("evm_increaseTime", [1800]);
  //     await contracts.hysiBatchInteraction.connect(owner).batchRedeem();
  //     const batchId = await contracts.hysiBatchInteraction.batchesOfAccount(
  //       depositor.address,
  //       0
  //     );
  //     expect(
  //       await contracts.hysiBatchInteraction
  //         .connect(depositor)
  //         .claim(batchId, BatchType.Redeem)
  //     )
  //       .to.emit(contracts.hysiBatchInteraction, "Claimed")
  //       .withArgs(depositor.address, parseEther("100"));
  //     expect(await contracts.threeCrv.balanceOf(depositor.address)).to.equal(
  //       parseEther("109990")
  //     );
  //     const batch = await contracts.hysiBatchInteraction.batches(batchId);
  //     expect(batch.unclaimedShares).to.equal(parseEther("300"));
  //   });
  // });
});
