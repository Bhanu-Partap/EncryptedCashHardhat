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
const STABLECOIN = require("../../artifacts/contracts/Token.sol/stablecoin.json")

// //Abi of contract
const icoAbi = ICO.abi;
const tokenAbi = ERC20.abi;
const stablecoinAbi = STABLECOIN.abi;

// Contract Addresses BSC
// const tokenAddress ="0x5d0561433AC8c970aE584b5b5c9f9e1268ca3140";
// const icoAddress ="0x3Ff930c86c9C2e58055d5b0a9cfF4C34C68519b5";
// const account ="0x02E7813237CDD2B288D0cFB98352DeeC93289766"
// const investor ="0x2bc91471cFA63ecD5d3EC3fC408326D3B338E18b"
// const usdc = "0x29F135E92205f8f19dfB5Ea4D8885594FE77C8BD"
// const usdt = "0x635979B242FCD793cBF74b6FB5c29e380aF73CFB"


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


// admin
async function createSale(_startTime, _endTime,_tokenPrice) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostCreateSale = await icoContract.methods.createSale(_startTime, _endTime,_tokenPrice).estimateGas({from : account})
        console.log(gasCostCreateSale, " Sale gas");
        
        const tx = await icoContract.methods.createSale(_startTime, _endTime,_tokenPrice).send({
            from: account,
            gas:gasCostCreateSale,
        });
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


async function buyTokens(paymentMethod,paymentAmount) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        let tx;
        
            if(paymentMethod === 0 ||paymentMethod === 1 ){
                const gasCostBuyTokensNative = await icoContract.methods.buyTokens(paymentMethod,paymentAmount).estimateGas({
                    from : investor, value : paymentAmount})
                tx = await icoContract.methods.buyTokens(paymentMethod,paymentAmount).send({
                    from: investor,
                    value: paymentAmount,
                    gas: gasCostBuyTokensNative
                })
            }
            else if(paymentMethod === 2 ||paymentMethod === 3 ){
                const gasCostBuyTokens = await icoContract.methods.buyTokens(paymentMethod,paymentAmount).estimateGas({from: investor})
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



async function calculateTokenAmount(paymentMethod,paymentAmount) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);

        if(paymentMethod === 0|| (paymentMethod === 1)) {
            const tx = await icoContract.methods.calculateTokenAmount(paymentMethod,paymentAmount).call()
        }
        else if(paymentMethod === 2|| (paymentMethod === 3)){
            const tx = await icoContract.methods.calculateTokenAmount(paymentMethod,paymentAmount).call()
        }
        console.log('Transaction successful:', tx);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}



async function calculatePaymentAmount(paymentMethod, tokenAmount) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        if (paymentMethod === 0|| (paymentMethod === 1)) {
        const tx = await icoContract.methods.calculatePaymentAmount(paymentMethod, tokenAmount).call()
        }
        else if(paymentMethod === 2|| (paymentMethod === 3)){
        const tx = await icoContract.methods.calculatePaymentAmount(paymentMethod, tokenAmount).call()
        }
        console.log('Transaction successful:', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


async function finalizeICO() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostFinalizeIco = await icoContract.methods.finalizeICO().estimateGas({from : account})
        const tx = await icoContract.methods.finalizeICO().send({
            from: account,
            gas: gasCostFinalizeIco,
        })
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}



async function initiateRefund() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostInitiateRefund = await icoContract.methods.initiateRefund().estimateGas({from : account})
        const tx = await icoContract.methods.initiateRefund().send({
            from: account,
            gas: gasCostInitiateRefund,
        })
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}



async function airdropTokens() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostAirdropTokens = await icoContract.methods.airdropTokens().estimateGas({from: account})
        const tx = await icoContract.methods.airdropTokens().send({
            from: account,
            gas: gasCostAirdropTokens,
        })
        console.log('Transaction successful:', tx.transactionHash);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}




async function setAllowImmediateFinalization(_saleId, _allow) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const gasCostSetAllowImmediateFinalization = await icoContract.methods.setAllowImmediateFinalization(_saleId, _allow).estimateGas({from : account})
        const tx = await icoContract.methods.setAllowImmediateFinalization(_saleId, _allow).send({
            from : account,
            gas:gasCostSetAllowImmediateFinalization
        })
        console.log('Soft Cap Reached :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// async function whitelistInvestor(_address) {
//     try {
//         const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
//         const gasCostEstimationwhitelistInvestor = await icoContract.methods.whitelistUser(_address).estimateGas()
//         const tx = await icoContract.methods.whitelistUser(_address).send({
//             from : account,
//             gas : gasCostEstimationwhitelistInvestor
//         })
//         console.log("Investor Whitelisted : ",tx.transactionHash);
        
//     } catch (error) {
//         console.error('An error occurred:', error);
//     }
// }



async function getCurrentSaleId() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.getCurrentSaleId().call()
        console.log('Transaction successful:', tx);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}



async function getSaleStartEndTime(_saleId) {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.getSaleStartEndTime(_saleId).call()
        console.log('Transaction successful:', tx);
    } catch (error) {
        console.error('An error occurred:', error);
        
    }
}



async function getSoftCapReached() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.getSoftCapReached().call()
        console.log('Soft Cap Reached :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


async function getHardCapReached() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.getHardCapReached().call()
        console.log('Hard Cap Reached :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}



async function tokensBoughtByInvestor() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.tokensBoughtByInvestor().call()
        console.log('Tokens Bought By Investor :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}






async function totalTokensSold() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.totalTokensSold().call()
        console.log('Total Tokens Sold :', tx);
    } catch (error) {
        console.error('An error occurred:', error);async function contributionsInUSD() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.contributionsInUSD().call()
        console.log('Contributions :', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

    }
}



    async function totalFundsRaised() {
        try {
            const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
            const tx = await icoContract.methods.totalFundsRaisedUSD().call()
            console.log('Total Funds Raised :', tx);
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }


async function getInvestorCount() {
    try {
        const icoContract = new web3.eth.Contract(icoAbi, icoAddress);
        const tx = await icoContract.methods.getInvestorCount().call()
        console.log("No. of Investors :",  tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


//=============Investor============//
async function userTokenBalance(_address) {
    try {
        const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
        console.log( tokenContract.methods);
        const userBalance =   await tokenContract.methods.balanceOf(_address).call();
        console.log("Token Balance of Investors :", userBalance);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


async function walletTokenBalance(tokenAddress, userAddress) {
    try {
        
        const contract = new web3.eth.Contract(stablecoinAbi, tokenAddress);
        // console.log(contract);
        const rawBalance = await contract.methods.balanceOf(userAddress).call()
        console.log("Token Balance of Investors :", rawBalance);
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


// const startTime =  Math.floor(Date.now() / 1000) +25;
// console.log(startTime, " start Time");

// const endTime = startTime + 3600    
// console.log(endTime, "  endTime");

// const tokenPrice = Number(ethers.parseEther('1'))
// console.log(tokenPrice, " tokenPrice");

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

// buyTokens(3,Number(1000000))
// userTokenBalance(investor)
// softCapAmount()
// hardCapAmount()
// saleDetails(1)
// walletTokenBalance("0x29F135E92205f8f19dfB5Ea4D8885594FE77C8BD","0x2bc91471cFA63ecD5d3EC3fC408326D3B338E18b")