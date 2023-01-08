const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../hardhat-helper");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe;
      let deployer;
      let mockV3Aggresgator;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        // const accounts = await ethers.getSigners();
        // account[0]
        // Deploy on hard hat netwowkr
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer); // Get the mort recently deployed fund me contract
        mockV3Aggresgator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async () => {
        it("sets aggregator adddresses", async () => {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggresgator.address);
        });
      });

      describe("fund", async () => {
        it("fails if you don't send enough eth", async () => {
          await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough");
        });

        it("updated the amount funded", async () => {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });

        it("adds funder to array of funders", async () => {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });
        it("can withdraw eth as a founder", async () => {
          //A Arrange
          // Act
          // Assert
          const startingContractBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const txResponse = await fundMe.withdraw();
          const txReciept = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReciept;
          const totalGasCost = gasUsed.mul(effectiveGasPrice);

          const endingContractBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingContractBalance, 0);
          assert.equal(
            startingContractBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(totalGasCost).toString()
          );
        });

        it("can withdraw eth as a founder (cheaper)", async () => {
          //A Arrange
          // Act
          // Assert
          const startingContractBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const txResponse = await fundMe.cheaperWithdraw();
          const txReciept = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReciept;
          const totalGasCost = gasUsed.mul(effectiveGasPrice);

          const endingContractBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingContractBalance, 0);
          assert.equal(
            startingContractBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(totalGasCost).toString()
          );
        });

        it("allows us to withdraw ith multuple funders", async () => {
          const accounts = await ethers.getSigners();

          for (let i = 1; i < 6; i++) {
            // No longer connected to deployer
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);

            await fundMeConnectedContract.fund({ value: sendValue });

            const startingContractBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const startingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );

            const txResponse = await fundMe.withdraw();
            const txReciept = await txResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = txReciept;
            const totalGasCost = gasUsed.mul(effectiveGasPrice);

            const endingContractBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const endingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );

            assert.equal(endingContractBalance, 0);
            assert.equal(
              startingContractBalance.add(startingDeployerBalance).toString(),
              endingDeployerBalance.add(totalGasCost).toString()
            );

            // Make sure funders is reset
            await expect(fundMe.getFunder(0)).to.be.reverted;

            for (i = 1; i < 6; i++) {
              assert.equal(
                await fundMe.getAddressToAmountFunded(accounts[i].address),
                0
              );
            }
          }
        });

        it("cheaper withdraw testing", async () => {
          const accounts = await ethers.getSigners();

          for (let i = 1; i < 6; i++) {
            // No longer connected to deployer
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);

            await fundMeConnectedContract.fund({ value: sendValue });

            const startingContractBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const startingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );

            const txResponse = await fundMe.cheaperWithdraw();
            const txReciept = await txResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = txReciept;
            const totalGasCost = gasUsed.mul(effectiveGasPrice);

            const endingContractBalance = await fundMe.provider.getBalance(
              fundMe.address
            );

            const endingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );

            assert.equal(endingContractBalance, 0);
            assert.equal(
              startingContractBalance.add(startingDeployerBalance).toString(),
              endingDeployerBalance.add(totalGasCost).toString()
            );

            // Make sure funders is reset
            await expect(fundMe.getFunder(0)).to.be.reverted;

            for (i = 1; i < 6; i++) {
              assert.equal(
                await fundMe.getAddressToAmountFunded(accounts[i].address),
                0
              );
            }
          }
        });

        it("only allows owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];

          const attackedConnected = await fundMe.connect(attacker);

          await expect(
            attackedConnected.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });
      });
    });
