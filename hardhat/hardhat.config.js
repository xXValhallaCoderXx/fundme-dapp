require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");

module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
      // gasPrice: 130000000000,
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [process.env.DEV_WALLET_PK],
      chainId: 5,
      blockConfirmations: 6, // Give etherscan time to index data
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API,
    customChains: [],
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKET_CAP_API,
    token: "MATIC",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    wallet1: {
      default: 1,
    },
    wallet2: {
      default: 2,
    },
  },
};
