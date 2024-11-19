require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
const { PRIVATE_KEY, RPC_URL_BSC,BSCSCAN_API_KEY} = process.env;



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // defaultNetwork: "BSC",
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
      bsc: BSCSCAN_API_KEY,
    },
  },

};
