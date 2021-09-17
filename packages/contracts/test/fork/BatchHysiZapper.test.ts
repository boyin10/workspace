import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers, network, waffle } from "hardhat";
import { BatchType } from "../adapters/HYSIBatchInteraction/HYSIBatchInteractionAdapter";
import {
  HysiBatchZapper,
  MockCurveMetapool,
  MockCurveThreepool,
  MockERC20,
  MockYearnV2Vault,
} from "../typechain";
import { HysiBatchInteraction } from "../typechain/HysiBatchInteraction";
import { MockBasicIssuanceModule } from "../typechain/MockBasicIssuanceModule";

const provider = waffle.provider;

interface Contracts {
  mock3Crv: MockERC20;
  mockDAI: MockERC20;
  mockUSDC: MockERC20;
  mockUSDT: MockERC20;
  mockCrvUSDX: MockERC20;
  mockCrvUST: MockERC20;
  mockSetToken: MockERC20;
  mockYearnVaultUSDX: MockYearnV2Vault;
  mockYearnVaultUST: MockYearnV2Vault;
  mockCurveMetapoolUSDX: MockCurveMetapool;
  mockCurveMetapoolUST: MockCurveMetapool;
  mockCurveThreePool: MockCurveThreepool;
  mockBasicIssuanceModule: MockBasicIssuanceModule;
  hysiBatchInteraction: HysiBatchInteraction;
  hysiBatchZapper: HysiBatchZapper;
}

const DAY = 60 * 60 * 24;

const DepositorInitial = parseEther("100");
let owner: SignerWithAddress, depositor: SignerWithAddress;
let contracts: Contracts;

async function deployContracts(): Promise<Contracts> {
  const MockERC20 = await ethers.getContractFactory("MockERC20");

  const mock3Crv = await (
    await MockERC20.deploy("3Crv", "3Crv", 18)
  ).deployed();
  const mockDAI = await (await MockERC20.deploy("DAI", "DAI", 18)).deployed();
  const mockUSDC = await (
    await MockERC20.deploy("USDC", "USDC", 18)
  ).deployed();
  const mockUSDT = await (
    await MockERC20.deploy("USDT", "USDT", 18)
  ).deployed();

  const mockBasicCoin = await (
    await MockERC20.deploy("Basic", "Basic", 18)
  ).deployed();

  const mockCrvUSDX = await (
    await MockERC20.deploy("crvUSDX", "crvUSDX", 18)
  ).deployed();
  const mockCrvUST = await (
    await MockERC20.deploy("crvUST", "crvUST", 18)
  ).deployed();

  const mockSetToken = await await MockERC20.deploy("setToken", "setToken", 18);

  const MockYearnV2Vault = await ethers.getContractFactory("MockYearnV2Vault");
  const mockYearnVaultUSDX = await (
    await MockYearnV2Vault.deploy(mockCrvUSDX.address)
  ).deployed();
  const mockYearnVaultUST = await (
    await MockYearnV2Vault.deploy(mockCrvUST.address)
  ).deployed();

  const MockCurveMetapool = await ethers.getContractFactory(
    "MockCurveMetapool"
  );

  //Besides crvUSDX and 3Crv no coins are needed in this test which is why i used the same token in the other places
  const mockCurveMetapoolUSDX = await (
    await MockCurveMetapool.deploy(
      mockBasicCoin.address,
      mockCrvUSDX.address,
      mock3Crv.address,
      mockBasicCoin.address,
      mockBasicCoin.address,
      mockBasicCoin.address
    )
  ).deployed();
  const mockCurveMetapoolUST = await (
    await MockCurveMetapool.deploy(
      mockBasicCoin.address,
      mockCrvUST.address,
      mock3Crv.address,
      mockBasicCoin.address,
      mockBasicCoin.address,
      mockBasicCoin.address
    )
  ).deployed();

  const MockCurveThreepool = await ethers.getContractFactory(
    "MockCurveThreepool"
  );
  const mockCurveThreePool = await (
    await MockCurveThreepool.deploy(
      mock3Crv.address,
      mockDAI.address,
      mockUSDC.address,
      mockUSDT.address
    )
  ).deployed();

  const mockBasicIssuanceModule = (await (
    await (
      await ethers.getContractFactory("MockBasicIssuanceModule")
    ).deploy([mockYearnVaultUSDX.address, mockYearnVaultUST.address], [50, 50])
  ).deployed()) as MockBasicIssuanceModule;

  const hysiBatchInteraction = (await (
    await (
      await ethers.getContractFactory("HysiBatchInteraction")
    ).deploy(
      mock3Crv.address,
      mockSetToken.address,
      mockBasicIssuanceModule.address,
      [mockYearnVaultUSDX.address, mockYearnVaultUST.address],
      [
        {
          curveMetaPool: mockCurveMetapoolUSDX.address,
          crvLPToken: mockCrvUSDX.address,
        },
        {
          curveMetaPool: mockCurveMetapoolUST.address,
          crvLPToken: mockCrvUST.address,
        },
      ],
      1800,
      parseEther("20000"),
      parseEther("200")
    )
  ).deployed()) as HysiBatchInteraction;

  const hysiBatchZapper = await (
    await (
      await ethers.getContractFactory("HysiBatchZapper")
    ).deploy(
      hysiBatchInteraction.address,
      mockCurveThreePool.address,
      mock3Crv.address,
      [mockDAI.address, mockUSDC.address, mockUSDT.address]
    )
  ).deployed();

  await mockYearnVaultUSDX.mint(
    mockBasicIssuanceModule.address,
    parseEther("20000")
  );
  await mockYearnVaultUST.mint(
    mockBasicIssuanceModule.address,
    parseEther("20000")
  );
  await mockCrvUSDX.mint(mockYearnVaultUSDX.address, parseEther("20000"));
  await mockCrvUST.mint(mockYearnVaultUST.address, parseEther("20000"));

  await mockDAI.mint(depositor.address, DepositorInitial);
  await mockDAI
    .connect(depositor)
    .approve(hysiBatchZapper.address, DepositorInitial);

  await mockUSDC.mint(depositor.address, DepositorInitial);
  await mockUSDC
    .connect(depositor)
    .approve(hysiBatchZapper.address, DepositorInitial);

  await mockSetToken.mint(depositor.address, DepositorInitial);
  await mockSetToken
    .connect(depositor)
    .approve(hysiBatchInteraction.address, DepositorInitial);

  await hysiBatchInteraction.setZapper(hysiBatchZapper.address);

  return {
    mock3Crv,
    mockDAI,
    mockUSDC,
    mockUSDT,
    mockCrvUSDX,
    mockCrvUST,
    mockSetToken,
    mockYearnVaultUSDX,
    mockYearnVaultUST,
    mockCurveMetapoolUSDX,
    mockCurveMetapoolUST,
    mockCurveThreePool,
    mockBasicIssuanceModule,
    hysiBatchInteraction,
    hysiBatchZapper,
  };
}

const deployAndAssignContracts = async () => {
  [owner, depositor] = await ethers.getSigners();
  contracts = await deployContracts();
  await contracts.mock3Crv
    .connect(depositor)
    .approve(contracts.hysiBatchInteraction.address, parseEther("100000000"));
};

const timeTravel = async (time: number) => {
  await provider.send("evm_increaseTime", [time]);
  await provider.send("evm_mine", []);
};

describe("HysiBatchZapper Network Test", function () {
  before(async function () {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.FORKING_RPC_URL,
            blockNumber: 13206601,
          },
        },
      ],
    });
  });
  beforeEach(async function () {
    await deployAndAssignContracts();
  });
  describe("zapIntoQueue", function () {
    it("zaps into a mint queue with one stablecoin", async function () {
      const result = await contracts.hysiBatchZapper
        .connect(depositor)
        .zapIntoQueue([DepositorInitial, 0, 0], 0);

      expect(result)
        .to.emit(contracts.hysiBatchZapper, "ZappedIntoQueue")
        .withArgs(DepositorInitial, depositor.address);

      expect(result)
        .to.emit(contracts.hysiBatchInteraction, "Deposit")
        .withArgs(depositor.address, DepositorInitial);

      expect(await contracts.mockDAI.balanceOf(depositor.address)).to.equal(0);
    });

    it("zaps into a mint queue with multiple stablecoins", async function () {
      const result = await contracts.hysiBatchZapper
        .connect(depositor)
        .zapIntoQueue([DepositorInitial, DepositorInitial, 0], 0);

      expect(result)
        .to.emit(contracts.hysiBatchZapper, "ZappedIntoQueue")
        .withArgs(DepositorInitial.mul(2), depositor.address);

      expect(result)
        .to.emit(contracts.hysiBatchInteraction, "Deposit")
        .withArgs(depositor.address, DepositorInitial.mul(2));

      expect(await contracts.mockDAI.balanceOf(depositor.address)).to.equal(0);
      expect(await contracts.mockUSDC.balanceOf(depositor.address)).to.equal(0);
    });
  });
  describe("zapOutOfQueue", function () {
    it("zaps out of the queue into a stablecoin", async function () {
      //TODO calculate amounts
      const expectedStableAmount = parseEther("99.9");
      //Create Batch
      await contracts.hysiBatchZapper
        .connect(depositor)
        .zapIntoQueue([DepositorInitial, 0, 0], 0);
      const [batchId] = await contracts.hysiBatchInteraction.getAccountBatches(
        depositor.address
      );
      //Actual Test
      const result = await contracts.hysiBatchZapper
        .connect(depositor)
        .zapOutOfQueue(batchId, DepositorInitial, 0, 0);

      expect(result)
        .to.emit(contracts.hysiBatchZapper, "ZappedOutOfQueue")
        .withArgs(
          batchId,
          0,
          DepositorInitial,
          expectedStableAmount,
          depositor.address
        );

      expect(result)
        .to.emit(contracts.hysiBatchInteraction, "WithdrawnFromBatch")
        .withArgs(batchId, DepositorInitial, depositor.address);

      expect(await contracts.mockDAI.balanceOf(depositor.address)).to.equal(
        expectedStableAmount
      );
    });
  });
  describe("claimAndSwapToStable", function () {
    it("claims batch and swaps into stablecoin", async function () {
      //TODO calculate amounts
      const claimableAmount = parseEther("999");
      const expectedStableAmount = parseEther("998.001");
      //Create Batch
      await contracts.hysiBatchInteraction
        .connect(depositor)
        .depositForRedeem(parseEther("10"), depositor.address);
      const [batchId] = await contracts.hysiBatchInteraction.getAccountBatches(
        depositor.address
      );
      timeTravel(1800);
      await contracts.hysiBatchInteraction.connect(owner).batchRedeem(0);

      //Actual Test
      const result = await contracts.hysiBatchZapper
        .connect(depositor)
        .claimAndSwapToStable(batchId, 0, 0);

      expect(result)
        .to.emit(contracts.hysiBatchZapper, "ClaimedIntoStable")
        .withArgs(
          batchId,
          0,
          claimableAmount,
          expectedStableAmount,
          depositor.address
        );

      expect(result)
        .to.emit(contracts.hysiBatchInteraction, "Claimed")
        .withArgs(
          depositor.address,
          BatchType.Redeem,
          parseEther("10"),
          claimableAmount
        );

      expect(await contracts.mockDAI.balanceOf(depositor.address)).to.equal(
        expectedStableAmount.add(DepositorInitial)
      );
    });
  });
});
