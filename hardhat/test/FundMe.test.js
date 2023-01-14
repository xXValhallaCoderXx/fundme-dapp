const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../hardhat-helper");
const { assert, expect } = require("chai");
const { formatEther } = ethers.utils;

const CAMPAIGN_1 = {
  NAME: "Philippine Charity",
  DESCRIPTION: "Funding little ones, so they can shine",
};

const CAMPAIGN_2 = {
  NAME: "Animal Fund",
  DESCRIPTION: "We are supporitng animals",
};

const CAMPAIGN_3 = {
  NAME: "Monk Fund",
  DESCRIPTION: "We are supporitng monks",
};

const CAMPAIGN_4 = {
  NAME: "Save the turtles",
  DESCRIPTION: "We are saving turtles because they are cute",
};

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("CrowdFunder", function () {
      let deployerConnectedCrowdFund;
      let deployer;
      let mockV3Aggresgator;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        // const accounts = await ethers.getSigners();
        // account[0]
        // Deploy on hard hat netwowkr
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        deployerConnectedCrowdFund = await ethers.getContract(
          "CrowdFunder",
          deployer
        ); // Get the mort recently deployed fund me contract
        mockV3Aggresgator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async () => {
        it("sets chainlink oracle price aggregator address on deployment", async () => {
          const response = await deployerConnectedCrowdFund.getPriceFeed();
          assert.equal(response, mockV3Aggresgator.address);
        });
      });

      describe("create campaign", async () => {
        it("allows a wallet (user) to create a campaign", async () => {
          const createTxResponse =
            await deployerConnectedCrowdFund.createCampaign(
              CAMPAIGN_1.NAME,
              CAMPAIGN_1.DESCRIPTION
            );
          await createTxResponse.wait(1);
          await deployerConnectedCrowdFund.getCampaign(deployer);
        });

        it("doesnt allow a user to create another if they have another campaign active", async () => {
          const createTxResponse =
            await deployerConnectedCrowdFund.createCampaign(
              CAMPAIGN_1.NAME,
              CAMPAIGN_1.DESCRIPTION
            );
          await createTxResponse.wait(1);

          await expect(
            deployerConnectedCrowdFund.createCampaign(
              CAMPAIGN_2.NAME,
              CAMPAIGN_2.DESCRIPTION
            )
          ).to.be.revertedWith("You have an active campaign");
        });

        it("it allows multiple different campaigns to be made", async () => {
          const wallet1 = (await getNamedAccounts()).wallet1;
          const wallet2 = (await getNamedAccounts()).wallet2;

          wallet1Connected = await ethers.getContract("CrowdFunder", wallet1);
          wallet2Connected = await ethers.getContract("CrowdFunder", wallet2);

          const createTxResponse1 =
            await deployerConnectedCrowdFund.createCampaign(
              CAMPAIGN_1.NAME,
              CAMPAIGN_1.DESCRIPTION
            );
          await createTxResponse1.wait(1);

          const createTxResponse2 = await wallet1Connected.createCampaign(
            CAMPAIGN_2.NAME,
            CAMPAIGN_2.DESCRIPTION
          );
          await createTxResponse2.wait(1);

          const createTxResponse3 = await wallet2Connected.createCampaign(
            CAMPAIGN_3.NAME,
            CAMPAIGN_3.DESCRIPTION
          );
          await createTxResponse3.wait(1);

          const campaign1 = await deployerConnectedCrowdFund.getCampaign(
            deployer
          );
          const campaign2 = await deployerConnectedCrowdFund.getCampaign(
            wallet1
          );
          const campaign3 = await deployerConnectedCrowdFund.getCampaign(
            wallet2
          );
          assert.equal(campaign1.name, CAMPAIGN_1.NAME);
          assert.equal(campaign2.name, CAMPAIGN_2.NAME);
          assert.equal(campaign3.name, CAMPAIGN_3.NAME);
        });
      });

      describe("fetch campaign", async () => {
        beforeEach(async () => {
          const createTxResponse1 =
            await deployerConnectedCrowdFund.createCampaign(
              CAMPAIGN_1.NAME,
              CAMPAIGN_1.DESCRIPTION
            );
          await createTxResponse1.wait(1);
        });
        it("allows you to get campaign info", async () => {
          const campaign = await deployerConnectedCrowdFund.getCampaign(
            deployer
          );
          assert.equal(campaign.name, CAMPAIGN_1.NAME);
          assert.equal(campaign.description, CAMPAIGN_1.DESCRIPTION);
          assert.equal(campaign.allocatedFunds, 0);
        });
      });

      describe("fund campaign", async () => {
        beforeEach(async () => {
          const createTxResponse1 =
            await deployerConnectedCrowdFund.createCampaign(
              CAMPAIGN_1.NAME,
              CAMPAIGN_1.DESCRIPTION
            );
          await createTxResponse1.wait(1);
        });

        it("will error if the campaign doesnt exist", async () => {
          await expect(
            deployerConnectedCrowdFund.fundCampaign(
              "0x2CD689A94a5bCd2EBA25E4b9F47088af70562A3B",
              { value: sendValue }
            )
          ).to.be.revertedWith("Address has no campaign");
        });

        it("will deposit funds into a campaign", async () => {
          const startingContractBalance =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );

          const contractBalanceEther = formatEther(startingContractBalance);

          assert.equal(contractBalanceEther, 0);
          await deployerConnectedCrowdFund.fundCampaign(deployer, {
            value: sendValue,
          });
          const afterDepostBalance =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );

          const afterContractEthers = formatEther(afterDepostBalance);

          assert.equal(afterContractEthers, 1);
        });

        it("will handle multiple people adding funds to campaign", async () => {
          const wallet1 = (await getNamedAccounts()).wallet1;
          const wallet2 = (await getNamedAccounts()).wallet2;

          wallet1Connected = await ethers.getContract("CrowdFunder", wallet1);
          wallet2Connected = await ethers.getContract("CrowdFunder", wallet2);

          await wallet1Connected.fundCampaign(deployer, { value: sendValue });
          await wallet2Connected.fundCampaign(deployer, { value: sendValue });

          const startingContractBalance =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );

          const contractBalanceEther = formatEther(startingContractBalance);

          assert.equal(contractBalanceEther, 2);

          // Check funds allocated to campaign correctly
          const campaign = await deployerConnectedCrowdFund.getCampaign(
            deployer
          );
          assert.equal(campaign.name, CAMPAIGN_1.NAME);
          assert.equal(campaign.description, CAMPAIGN_1.DESCRIPTION);
          assert.equal(ethers.utils.formatEther(campaign.allocatedFunds), 2);
        });

        it("will handle multiple people adding funds to multiple campaigns", async () => {
          const wallet1 = (await getNamedAccounts()).wallet1;
          const wallet2 = (await getNamedAccounts()).wallet2;

          wallet1Connected = await ethers.getContract("CrowdFunder", wallet1);
          wallet2Connected = await ethers.getContract("CrowdFunder", wallet2);

          const createTxResponse1 = await wallet1Connected.createCampaign(
            CAMPAIGN_2.NAME,
            CAMPAIGN_2.DESCRIPTION
          );
          await createTxResponse1.wait(1);

          const createTxResponse2 = await wallet2Connected.createCampaign(
            CAMPAIGN_3.NAME,
            CAMPAIGN_3.DESCRIPTION
          );
          await createTxResponse2.wait(1);

          // Check campaigns
          const campaign1 = await deployerConnectedCrowdFund.getCampaign(
            deployer
          );
          const campaign2 = await deployerConnectedCrowdFund.getCampaign(
            wallet1
          );
          const campaign3 = await deployerConnectedCrowdFund.getCampaign(
            wallet2
          );

          const startingContractBalance =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );

          assert.equal(startingContractBalance, 0);
          assert.equal(campaign1.name, CAMPAIGN_1.NAME);
          assert.equal(campaign2.name, CAMPAIGN_2.NAME);
          assert.equal(campaign3.name, CAMPAIGN_3.NAME);

          await wallet1Connected.fundCampaign(deployer, {
            value: ethers.utils.parseEther("1"),
          });
          await wallet1Connected.fundCampaign(wallet2, {
            value: ethers.utils.parseEther("2"),
          });

          await wallet2Connected.fundCampaign(deployer, {
            value: ethers.utils.parseEther("2"),
          });
          await wallet2Connected.fundCampaign(wallet1, {
            value: ethers.utils.parseEther("1"),
          });

          await deployerConnectedCrowdFund.fundCampaign(wallet1, {
            value: ethers.utils.parseEther("2"),
          });

          const contractBalanceAfterDeposit =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );
          const contractBalanceEther = formatEther(contractBalanceAfterDeposit);
          assert.equal(contractBalanceEther, 8);
        });
      });

      describe("withdraw", async () => {
        beforeEach(async () => {
          const createTxResponse1 =
            await deployerConnectedCrowdFund.createCampaign(
              CAMPAIGN_1.NAME,
              CAMPAIGN_1.DESCRIPTION
            );
          await createTxResponse1.wait(1);
        });
        it("handles creating, depositing funds and allow campaign owner to wirthdraw", async () => {
          const wallet1 = (await getNamedAccounts()).wallet1;
          const wallet2 = (await getNamedAccounts()).wallet2;

          const wallet1Connected = await ethers.getContract(
            "CrowdFunder",
            wallet1
          );
          const wallet2Connected = await ethers.getContract(
            "CrowdFunder",
            wallet2
          );

          const startingContractBalance =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );

          const deployerStartingBalance =
            await deployerConnectedCrowdFund.provider.getBalance(deployer);

          const deployerStart = formatEther(deployerStartingBalance);
          // console.log("START: ", deployerStart);

          await wallet1Connected.fundCampaign(deployer, {
            value: ethers.utils.parseEther("2"),
          });
          await wallet2Connected.fundCampaign(deployer, {
            value: ethers.utils.parseEther("10"),
          });

          const contractBalanceAfterDeposit =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );

          assert.equal(startingContractBalance, 0);

          const afterDeposit = formatEther(contractBalanceAfterDeposit);
          assert.equal(afterDeposit, 12);

          const txResponse =
            await deployerConnectedCrowdFund.withdrawFundsFromCampaign();
          const txReciept = await txResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = txReciept;
          const totalGasCost = gasUsed.mul(effectiveGasPrice);
          const endingContractBalance =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );

          const deploerEndingBalance =
            await deployerConnectedCrowdFund.provider.getBalance(deployer);

          const deployerEnd = formatEther(deploerEndingBalance);
          // console.log("START: ", deployerEnd);
          assert.equal(endingContractBalance, 0);
          // assert.equal(
          //   startingContractBalance.add(deployerStartingBalance).toString(),
          //   deploerEndingBalance.add(totalGasCost).toString()
          // );
        });
        it("handles multiple contracts with funds and respective owners withdrawing their allocation", async () => {
          const wallet1 = (await getNamedAccounts()).wallet1;
          const wallet2 = (await getNamedAccounts()).wallet2;

          wallet1Connected = await ethers.getContract("CrowdFunder", wallet1);
          wallet2Connected = await ethers.getContract("CrowdFunder", wallet2);

          const createTxResponse1 = await wallet1Connected.createCampaign(
            CAMPAIGN_2.NAME,
            CAMPAIGN_2.DESCRIPTION
          );
          await createTxResponse1.wait(1);

          const createTxResponse2 = await wallet2Connected.createCampaign(
            CAMPAIGN_3.NAME,
            CAMPAIGN_3.DESCRIPTION
          );
          await createTxResponse2.wait(1);

          // Check campaigns
          const campaign1 = await deployerConnectedCrowdFund.getCampaign(
            deployer
          );
          const campaign2 = await deployerConnectedCrowdFund.getCampaign(
            wallet1
          );
          const campaign3 = await deployerConnectedCrowdFund.getCampaign(
            wallet2
          );

          const startingContractBalance =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );

          assert.equal(startingContractBalance, 0);
          assert.equal(campaign1.name, CAMPAIGN_1.NAME);
          assert.equal(campaign2.name, CAMPAIGN_2.NAME);
          assert.equal(campaign3.name, CAMPAIGN_3.NAME);

          await wallet1Connected.fundCampaign(deployer, {
            value: ethers.utils.parseEther("1"),
          });
          await wallet1Connected.fundCampaign(wallet2, {
            value: ethers.utils.parseEther("2"),
          });

          await wallet2Connected.fundCampaign(deployer, {
            value: ethers.utils.parseEther("2"),
          });
          await wallet2Connected.fundCampaign(wallet1, {
            value: ethers.utils.parseEther("1"),
          });

          await deployerConnectedCrowdFund.fundCampaign(wallet1, {
            value: ethers.utils.parseEther("2"),
          });

          const contractBalanceAfterDeposit =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );
          const contractBalanceEther = formatEther(contractBalanceAfterDeposit);
          assert.equal(contractBalanceEther, 8);

          const txResponse =
            await deployerConnectedCrowdFund.withdrawFundsFromCampaign();
          await txResponse.wait(1);

          const contractBalanceAfteDeployerWithdraw =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );
          const parsedBalance = formatEther(
            contractBalanceAfteDeployerWithdraw
          );
          assert.equal(parsedBalance, 5);

          const txResponse2 =
            await wallet1Connected.withdrawFundsFromCampaign();
          await txResponse2.wait(1);

          const contractBalanceAfteDeployerWithdraw2 =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );
          const parsedBalance2 = formatEther(
            contractBalanceAfteDeployerWithdraw2
          );
          assert.equal(parsedBalance2, 2);

          const txResponse3 =
            await wallet2Connected.withdrawFundsFromCampaign();
          await txResponse3.wait(1);

          const contractBalanceAfteDeployerWithdraw3 =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );
          const parsedBalance3 = formatEther(
            contractBalanceAfteDeployerWithdraw3
          );
          assert.equal(parsedBalance3, 0);
        });

        it("allows campaign owner to start new campaign after claiming funds of previous one", async () => {
          const wallet1 = (await getNamedAccounts()).wallet1;
          const wallet2 = (await getNamedAccounts()).wallet2;

          wallet1Connected = await ethers.getContract("CrowdFunder", wallet1);
          wallet2Connected = await ethers.getContract("CrowdFunder", wallet2);

          await wallet1Connected.fundCampaign(deployer, { value: sendValue });
          await wallet2Connected.fundCampaign(deployer, { value: sendValue });

          const startingContractBalance =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );

          const contractBalanceEther = formatEther(startingContractBalance);

          assert.equal(contractBalanceEther, 2);

          const txResponse =
            await deployerConnectedCrowdFund.withdrawFundsFromCampaign();
          await txResponse.wait(1);

          const contractBalanceAfteDeployerWithdraw =
            await deployerConnectedCrowdFund.provider.getBalance(
              deployerConnectedCrowdFund.address
            );
          const parsedBalance = formatEther(
            contractBalanceAfteDeployerWithdraw
          );
          assert.equal(parsedBalance, 0);

          const createNewCampaign =
            await deployerConnectedCrowdFund.createCampaign(
              CAMPAIGN_2.NAME,
              CAMPAIGN_2.DESCRIPTION
            );
          await createNewCampaign.wait(1);

          const campaign = await deployerConnectedCrowdFund.getCampaign(
            deployer
          );
          assert.equal(campaign.name, CAMPAIGN_2.NAME);
          assert.equal(campaign.description, CAMPAIGN_2.DESCRIPTION);
          assert.equal(ethers.utils.formatEther(campaign.allocatedFunds), 0);
        });
      });
    });
