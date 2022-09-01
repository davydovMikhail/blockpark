import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
dotenv.config();


const config: HardhatUserConfig = {
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.9" 
      },
      {
        version: "0.8.4" 
      }
    ]
  },
  networks: {
    bscmainnet: {
      url: "https://bsc-dataseed3.binance.org",
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
    
    bsctestnet: {
      url: "https://data-seed-prebsc-2-s2.binance.org:8545",
      accounts: [`${process.env.PRIVATE_KEY}`],
    }
  }
};

export default config;
