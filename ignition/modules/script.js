const { Web3 } = require('web3');
const { ethers } = require("hardhat");
require("dotenv").config()

const { RPC_URL_BSC,BSCSCAN_API_KEY} = process.env;

// For Hardhat
const web3 = new Web3("http://127.0.0.1:8545"); 
// For BSC
// const web3 = new Web3(RPC_URL_BSC);

const ERC20 = require("../../artifacts/contracts/Erc20.sol/erc20token.json");
const ICO  = require("../../artifacts/contracts/Ico.sol/ICO.json");
const STABLECOIN = require("../../artifacts/contracts/Token.sol/stablecoin.json")

// //Abi of contract
const icoAbi = ICO.abi;
const tokenAbi = ERC20.abi;
const stablecoinAbi = STABLECOIN.abi;

// Contract Addresses BSC
// const tokenAddress ="0x6e6317545b222A6979B008e482dcc00c16121C82";
// const icoAddress ="0x304DCAE86e661Eb5F15AAA81D4F049626727Fb8e";
// const account ="0x02E7813237CDD2B288D0cFB98352DeeC93289766"
// const investor ="0x2bc91471cFA63ecD5d3EC3fC408326D3B338E18b"

// Contract Addresses Hardhat
const tokenAddress ="0x0165878A594ca255338adfa4d48449f69242Eb8F";
const icoAddress ="0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const account ="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const investor ="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
const usdc = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
const usdt = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"


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
async function buyTokens(paymentMethod,paymentAmount) {
    try {
        const stableCoinUsdc = new web3.eth.Contract(stablecoinAbi, usdc);
        const mint = await stableCoinUsdc.methods.PublicMint(investor,paymentAmount).send({from:investor, gas:1000000})
        console.log("Balance of investor",await stableCoinUsdc.methods.balanceOf(investor).call());
        // const stableCoinUsdt = new web3.eth.Contract(stablecoinAbi, usdt);
        const approvedAmount = await stableCoinUsdc.methods.approve(icoAddress,paymentAmount).send({from : investor})
        console.log("Approved",approvedAmount);
        
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        // console.log(icoContract);
        let tx;
        
            if(paymentMethod === 0 ||paymentMethod === 1 ){
                console.log("entered If Lop");
                const gasCostBuyTokensNative = await icoContract.methods.buyTokens(paymentMethod,paymentAmount).estimateGas({
                    from : investor, value : paymentAmount})
                    console.log("gasCostBuyTokensNative",gasCostBuyTokensNative);
                    
                tx = await icoContract.methods.buyTokens(paymentMethod,paymentAmount).send({
                    from: investor,
                    value: paymentAmount,
                    gas: gasCostBuyTokensNative
                })
            }
            else if(paymentMethod === 2 ||paymentMethod === 3 ){
                console.log("Entered Else If loop");
                console.log("Payment Method",paymentMethod);
                console.log("Payment Amount",paymentAmount);
                
                const gasCostBuyTokens = await icoContract.methods.buyTokens(paymentMethod,paymentAmount).estimateGas({from: investor})
                    console.log("gasCostBuyTokens",gasCostBuyTokens);
                    
                tx = await icoContract.methods.buyTokens(paymentMethod,paymentAmount).send({
                    from: investor,
                    gas: gasCostBuyTokens
                })
            }
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}



//investor functionality
async function calculateTokenAmount(paymentMethod,paymentAmount) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostBuyTokens = await icoContract.methods.calculateTokenAmount(paymentMethod,paymentAmount).estimateGas({
            from : investor, value : _amount})
        const tx = await icoContract.methods.calculateTokenAmount(paymentMethod,paymentAmount).send({
            from: investor,
            value: _amount,
            gas: gasCostBuyTokens
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

async function whitelistInvestor(_address) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostEstimationwhitelistInvestor = await icoContract.methods.whitelistUser(_address).estimateGas()
        const tx = await icoContract.methods.whitelistUser(_address).send({
            from : account,
            gas : gasCostEstimationwhitelistInvestor
        })
        console.log("Investor Whitelisted : ",tx.transactionHash);
        
    } catch (error) {
        console.error('An error occurred:', error);
    }
}



//public functionality
async function getCurrentSaleId() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        // const gasCostGetCurrentSaleId = await icoContract.methods.getCurrentSaleId().estimateGas({from : investor})
        const tx = await icoContract.methods.getCurrentSaleId().call()
        // send({
        //     from:account,
        //     gas: gasCostGetCurrentSaleId
        // })
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


//=============Investor============//

async function userTokenBalance(_address) {
    try {
        const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
        const userBalance =   await tokenContract.methods.balanceOf(_address).call();
        console.log("Token Balance of Investors :", userBalance);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


async function softCapAmount() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const softCap = await icoContract.methods.softCapInUSD().call()
        console.log("Minimum Fund Required ", softCap);
    } catch (error) {
        console.error('An error occurred:', error); 
    }
}


async function hardCapAmount() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const hardCap = await icoContract.methods.hardCapInUSD().call()
        console.log("Maximum Fund Required ", hardCap);
    } catch (error) {
        console.error('An error occurred:', error); 
    }
}


async function saleDetails(_index) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.sales(_index).call()
        console.log("All details of the sale is here", tx);
    } catch (error) {
        console.error('An error occurred:', error); 
    }
}


const startTime =  Math.floor(Date.now() / 1000) +25;
console.log(startTime, " start Time");

const endTime = startTime + 3600    
console.log(endTime, "  endTime");

const tokenPrice = Number(ethers.parseEther('1'))
console.log(tokenPrice, " tokenPrice");

// const value = ethers.parseEther('0.01')
// console.log(value, " amount");



//=============================Admin==================================//

// whitelistInvestor(_address)
// createSale(startTime,endTime,tokenPrice)
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
// tokensBoughtByInvestor()
// contributions()

//================================Investor=================================//

buyTokens(3,Number(1000000))
// userTokenBalance(investor)
// softCapAmount()
// hardCapAmount()
// saleDetails(1)
