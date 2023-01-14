const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../hardhat-helper");
const { assert, expect } = require("chai");

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
        it("sets aggregator address on deployment", async () => {
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
          const { formatEther } = ethers.utils;
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
          const { formatEther } = ethers.utils;

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
          const { formatEther } = ethers.utils;

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
        // beforeEach(async () => {
        //   await deployerConnectedCrowdFund.fund({ value: sendValue });
        // });
        // it("can withdraw eth as a founder", async () => {
        //   //A Arrange
        //   // Act
        //   // Assert
        //   const startingContractBalance = await fundMe.provider.getBalance(
        //     fundMe.address
        //   );
        //   const startingDeployerBalance = await fundMe.provider.getBalance(
        //     deployer
        //   );
        //   const txResponse = await fundMe.withdraw();
        //   const txReciept = await txResponse.wait(1);
        //   const { gasUsed, effectiveGasPrice } = txReciept;
        //   const totalGasCost = gasUsed.mul(effectiveGasPrice);
        //   const endingContractBalance = await fundMe.provider.getBalance(
        //     fundMe.address
        //   );
        //   const endingDeployerBalance = await fundMe.provider.getBalance(
        //     deployer
        //   );
        //   assert.equal(endingContractBalance, 0);
        //   assert.equal(
        //     startingContractBalance.add(startingDeployerBalance).toString(),
        //     endingDeployerBalance.add(totalGasCost).toString()
        //   );
        // });
        // it("can withdraw eth as a founder (cheaper)", async () => {
        //   //A Arrange
        //   // Act
        //   // Assert
        //   const startingContractBalance = await fundMe.provider.getBalance(
        //     fundMe.address
        //   );
        //   const startingDeployerBalance = await fundMe.provider.getBalance(
        //     deployer
        //   );
        //   const txResponse = await fundMe.cheaperWithdraw();
        //   const txReciept = await txResponse.wait(1);
        //   const { gasUsed, effectiveGasPrice } = txReciept;
        //   const totalGasCost = gasUsed.mul(effectiveGasPrice);
        //   const endingContractBalance = await fundMe.provider.getBalance(
        //     fundMe.address
        //   );
        //   const endingDeployerBalance = await fundMe.provider.getBalance(
        //     deployer
        //   );
        //   assert.equal(endingContractBalance, 0);
        //   assert.equal(
        //     startingContractBalance.add(startingDeployerBalance).toString(),
        //     endingDeployerBalance.add(totalGasCost).toString()
        //   );
        // });
        // it("allows us to withdraw ith multuple funders", async () => {
        //   const accounts = await ethers.getSigners();
        //   for (let i = 1; i < 6; i++) {
        //     // No longer connected to deployer
        //     const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        //     await fundMeConnectedContract.fund({ value: sendValue });
        //     const startingContractBalance = await fundMe.provider.getBalance(
        //       fundMe.address
        //     );
        //     const startingDeployerBalance = await fundMe.provider.getBalance(
        //       deployer
        //     );
        //     const txResponse = await fundMe.withdraw();
        //     const txReciept = await txResponse.wait(1);
        //     const { gasUsed, effectiveGasPrice } = txReciept;
        //     const totalGasCost = gasUsed.mul(effectiveGasPrice);
        //     const endingContractBalance = await fundMe.provider.getBalance(
        //       fundMe.address
        //     );
        //     const endingDeployerBalance = await fundMe.provider.getBalance(
        //       deployer
        //     );
        //     assert.equal(endingContractBalance, 0);
        //     assert.equal(
        //       startingContractBalance.add(startingDeployerBalance).toString(),
        //       endingDeployerBalance.add(totalGasCost).toString()
        //     );
        //     // Make sure funders is reset
        //     await expect(fundMe.getFunder(0)).to.be.reverted;
        //     for (i = 1; i < 6; i++) {
        //       assert.equal(
        //         await fundMe.getAddressToAmountFunded(accounts[i].address),
        //         0
        //       );
        //     }
        //   }
        // });
        // it("cheaper withdraw testing", async () => {
        //   const accounts = await ethers.getSigners();
        //   for (let i = 1; i < 6; i++) {
        //     // No longer connected to deployer
        //     const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        //     await fundMeConnectedContract.fund({ value: sendValue });
        //     const startingContractBalance = await fundMe.provider.getBalance(
        //       fundMe.address
        //     );
        //     const startingDeployerBalance = await fundMe.provider.getBalance(
        //       deployer
        //     );
        //     const txResponse = await fundMe.cheaperWithdraw();
        //     const txReciept = await txResponse.wait(1);
        //     const { gasUsed, effectiveGasPrice } = txReciept;
        //     const totalGasCost = gasUsed.mul(effectiveGasPrice);
        //     const endingContractBalance = await fundMe.provider.getBalance(
        //       fundMe.address
        //     );
        //     const endingDeployerBalance = await fundMe.provider.getBalance(
        //       deployer
        //     );
        //     assert.equal(endingContractBalance, 0);
        //     assert.equal(
        //       startingContractBalance.add(startingDeployerBalance).toString(),
        //       endingDeployerBalance.add(totalGasCost).toString()
        //     );
        //     // Make sure funders is reset
        //     await expect(fundMe.getFunder(0)).to.be.reverted;
        //     for (i = 1; i < 6; i++) {
        //       assert.equal(
        //         await fundMe.getAddressToAmountFunded(accounts[i].address),
        //         0
        //       );
        //     }
        //   }
        // });
        // it("only allows owner to withdraw", async () => {
        //   const accounts = await ethers.getSigners();
        //   const attacker = accounts[1];
        //   const attackedConnected = await fundMe.connect(attacker);
        // await expect(
        //   attackedConnected.withdraw()
        // ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        // });
      });
    });
