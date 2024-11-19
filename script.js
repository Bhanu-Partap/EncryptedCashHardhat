const { Web3 } = require('web3');
const { ethers } = require("hardhat");
require("dotenv").config()

const { RPC_URL_BNB,BSCSCAN_API_KEY} = process.env;


// For bnb
const web3 = new Web3(RPC_URL_BNB);

const ERC20 = require("./artifacts/contracts/Ico.sol/ICO.json");
const ICO = require("./artifacts/contracts/Erc20.sol/erc20token.json");

// //Abi of contract
const icoAbi = ICO.abi;
const erc20Abi = ERC20.abi;

// Contract Addresses
const erc20Address = "";
const icoAddress = "";


await window.ethereum.request({ method: 'eth_requestAccounts' });
// Get the currently selected account in MetaMask
const accounts = await web3.eth.getAccounts();
const account = accounts[0];


async function createSale(_startTime, _endTime,_tokenPrice) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostCreateSale = await icoContract.methods.createSale(_startTime, _endTime,_tokenPrice).estimateGas()
        const tx = await icoContract.methods.createSale(_startTime, _endTime,_tokenPrice).send({
            from: account,
            gas:gasCostCreateSale , 
        });
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
    }

    
}