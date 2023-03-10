require("dotenv").config();
const { network } = require("hardhat");
const { networkConfig, developmentChains } = require("../hardhat-helper");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
    log("----------------------------------------------------");
    log("Deployed Mock Aggregator...");
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  log("----------------------------------------------------");
  log("Deploying CrowdFunder and waiting for confirmations...");

  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("CrowdFunder", {
    from: deployer,
    args: args,
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`CrowdFunder deployed at ${fundMe.address}`);

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API) {
    await verify(fundMe.address, args);
  }
};

module.exports.tags = ["all", "fundme"];
