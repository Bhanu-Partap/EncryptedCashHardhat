require('dotenv').config({path:__dirname+'/.env'})
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-contract-sizer");
const { PRIVATE_KEY,PRIVATE_KEY_INVESTOR, RPC_URL_BSC,BSCSCAN_API_KEY} = process.env;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    BSC: {
      url: RPC_URL_BSC,
      accounts:[`0x${PRIVATE_KEY_INVESTOR}`]
    }
  },
  solidity: "0.8.26",
  etherscan: {
    apiKey: {
      bscTestnet: BSCSCAN_API_KEY,
    },
  },
};
