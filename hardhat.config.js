require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
const { PRIVATE_KEY, RPC_URL_BNB,BSCSCAN_API_KEY} = process.env;



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // defaultNetwork: "bnb",
  networks: {
    hardhat: {
    },
    bnb: {
      url: RPC_URL_BNB,
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
