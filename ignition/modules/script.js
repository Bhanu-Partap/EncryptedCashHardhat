const { Web3 } = require('web3');
const { ethers } = require("hardhat");
require("dotenv").config()

const { RPC_URL_BSC,BSCSCAN_API_KEY} = process.env;

// For Hardhat
// const web3 = new Web3("http://127.0.0.1:8545"); 
// For BSC
const web3 = new Web3(RPC_URL_BSC);

const ERC20 = require("../../artifacts/contracts/Erc20.sol/erc20token.json");
const ICO  = require("../../artifacts/contracts/Ico.sol/ICO.json");

// //Abi of contract
const icoAbi = ICO.abi;
const erc20Abi = ERC20.abi;

// Contract Addresses
const erc20Address = "0x6e6317545b222A6979B008e482dcc00c16121C82";
const icoAddress = "0x304DCAE86e661Eb5F15AAA81D4F049626727Fb8e";
const account = "0x02E7813237CDD2B288D0cFB98352DeeC93289766"
const investor = "0xC5b448AbaEbAeEe1e0077FA455D1d543B51C322e"


// await window.ethereum.request({ method: 'eth_requestAccounts' });
// // Get the currently selected account in MetaMask
// const accounts = await web3.eth.getAccounts();
// const account = accounts[0];

//================= ICO CONTRACT SCRIPTING =================//
// connect Metamask 
async function connectMetamask(){
    try {
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
    } catch (error) {
        console.log("An Error occured", error);
        
    }
}

//admin functionality
async function createSale(_startTime, _endTime,_tokenPrice) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        // console.log("methods",icoContract.methods );
        const gasCostCreateSale = await icoContract.methods.createSale(_startTime, _endTime,_tokenPrice).estimateGas()
        const tx = await icoContract.methods.createSale(_startTime, _endTime,_tokenPrice).send({
            from: account,
            gas:gasCostCreateSale,
        });
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

//investor functionality
async function buyTokens(_amount) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostButTokens = await icoContract.methods.buyTokens().estimateGas({from : investor, value : _amount})
        const tx = await icoContract.methods.buyTokens().send({
            from: investor,
            gas: gasCostButTokens,
            value: amount
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
        const gasCostGetCurrentSaleId = await icoContract.methods.getCurrentSaleId().estimateGas()
        const tx = await icoContract.methods.getCurrentSaleId().send({
            from:account,
            gas: gasCostGetCurrentSaleId
        })
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}

//public functionality
async function getSaleStartEndTime(_saleId) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        // const gasCostGetSaleStartEndTime = await icoContract.methods.getSaleStartEndTime(_saleId).estimateGas()
        const tx = await icoContract.methods.getSaleStartEndTime(_saleId).call()
        console.log('Transaction successful:', tx);
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

//public functionality
async function tokensBoughtByInvestor() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.tokensBoughtByInvestor().call()
        console.log('Tokens Bought By Investor :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

//public functionality
async function contributions() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.contributions().call()
        console.log('Contributions :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

//public functionality
async function totalTokensSold() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.totalTokensSold().call()
        console.log('Total Tokens Sold :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

//public functionality
async function totalFundsRaised() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.totalFundsRaised().call()
        console.log('Total Funds Raised :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


//public functionality
async function softCapInFunds() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.softCapInFunds().call()
        console.log("Soft Cap In Funds :", tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


//public functionality
async function hardCapInFunds() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.hardCapInFunds().call()
        console.log("Hard Cap In Funds :", tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


//public functionality
async function getInvestorCount() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        // const gasCostGetInvestorCount = await icoContract.methods.getInvestorCount().estimateGas()
        const tx =  icoContract.methods.getInvestorCount().call()
        console.log("No. of Investors :", await tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


// const startTime =  Math.floor(Date.now() / 1000) + 5;
// console.log(startTime, " start Time");

// const endTime = startTime + 3600    
// console.log(endTime, "  endTime");

// const tokenPrice = Number(ethers.parseEther('0.01'))
// console.log(tokenPrice, " tokenPrice");


// createSale(startTime,endTime,tokenPrice)
buyTokens(ethers.parseEther('0.01'))
// finalizeICO()
// initiateRefund()
// airdropTokens()
// setAllowImmediateFinalization(_saleId, _allow)
// getCurrentSaleId()
// getSaleStartEndTime(1)
// getSoftCapReached()
// getHardCapReached()
// getInvestorCount()
// totalFundsRaised()