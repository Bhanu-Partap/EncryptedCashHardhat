require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-contract-sizer");
const { PRIVATE_KEY, RPC_URL_BSC,BSCSCAN_API_KEY} = process.env;



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    BSC: {
      url: RPC_URL_BSC,
      accounts:[`0x${PRIVATE_KEY}`]
    }
  },
  solidity: "0.8.27",
  etherscan: {
    apiKey: {
      bscTestnet: BSCSCAN_API_KEY,
    },
  },

};
