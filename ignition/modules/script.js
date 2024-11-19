const { Web3 } = require('web3');
const { ethers } = require("hardhat");
require("dotenv").config()

const { RPC_URL_BSC,BSCSCAN_API_KEY} = process.env;


// For BSC
const web3 = new Web3(RPC_URL_BSC);

const ERC20 = require("../../artifacts/contracts/Ico.sol/ICO.json");
const ICO = require("../../artifacts/contracts/Erc20.sol/erc20token.json");

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

// connect Metamask 
if (typeof window.ethereum !== "undefined") {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    }); 
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x61" }], // Bsc Testnet
    //   params: [{ chainId: "0x38" }], // Bsc Mainnet
    });
    const userAccount = accounts[0];
    const result = await window.ethereum.request({
      method: "eth_getBalance",
      params: [userAccount, "latest"],
    });
    console.log(result);
}


//admin functionality
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

//investor functionality
async function buyTokens() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostButTokens = await icoContract.methods.buyTokens().estimateGas()
        const tx = await icoContract.methods.buyTokens().send({
            from: account,
            gas: gasCostButTokens,
        })
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}

//admin functionality
async function finalizeICO() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostFinalizeIco = await icoContract.methods.finalizeICO().estimateGas()
        const tx = await icoContract.methods.finalizeICO().send({
            from: account,
            gas: gasCostFinalizeIco,
        })
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}

//admin functionality
async function initiateRefund() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostInitiateRefund = await icoContract.methods.initiateRefund().estimateGas()
        const tx = await icoContract.methods.initiateRefund().send({
            from: account,
            gas: gasCostInitiateRefund,
        })
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}

//admin functionality
async function airdropTokens() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostAirdropTokens = await icoContract.methods.airdropTokens().estimateGas()
        const tx = await icoContract.methods.airdropTokens().send({
            from: account,
            gas: gasCostAirdropTokens,
        })
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}

//Admin functionality
async function setAllowImmediateFinalization(_saleId, _allow) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostSetAllowImmediateFinalization = await icoContract.methods.setAllowImmediateFinalization(_saleId, _allow).estimateGas()
        const tx = await icoContract.methods.setAllowImmediateFinalization(_saleId, _allow).send({
            from : account,
            gas:gasCostSetAllowImmediateFinalization
        })
        console.log('Soft Cap Reached :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


//public functionality
async function getCurrentSaleId() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.getCurrentSaleId().call()
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}

//public functionality
async function getSaleStartEndTime() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.getSaleStartEndTime().call()
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}

//public functionality
async function getSoftCapReached() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.getSoftCapReached().call()
        console.log('Soft Cap Reached :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

//public functionality
async function getHardCapReached() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.getHardCapReached().call()
        console.log('Hard Cap Reached :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}