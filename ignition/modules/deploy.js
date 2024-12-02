const { ethers } = require("hardhat");


async function main() {

  const accounts = await ethers.getSigners();

  console.log("Admin Address :",accounts[0].address);
  console.log("Investor Address :",accounts[1].address);
  const tokenName = "EncryptedCash Coin"; 
  const tokenSymbol = "ECC"; 


  const Token = await ethers.getContractFactory("erc20token");
  const tokenContract = await Token.deploy("EncryptedCash Coin", "ECC");
  await tokenContract.waitForDeployment();
  const tokenContractAddress = await tokenContract.getAddress()
  console.log("ERC 20 Addres :",tokenContractAddress);
  

  const USDC = await ethers.getContractFactory("stablecoin");
  const usdcContract = await USDC.deploy("USD Coin", "USDC");
  await usdcContract.waitForDeployment();
  const usdcAddress = await usdcContract.getAddress()
  console.log("USDC Address",usdcAddress);


  const USDT = await ethers.getContractFactory("stablecoin");
  const usdtContract = await USDT.deploy("Tether", "USDT");
  await usdtContract.waitForDeployment();
  const usdtAddress = await usdtContract.getAddress()
  console.log("USDT Address",usdtAddress);


  
  const softCap = ethers.parseEther("100")
  const hardCap = ethers.parseEther("200")
  const priceFeedETH = "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
  const priceFeedBNB = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"
  const priceFeedUSDT = "0xEca2605f0BCF2BA5966372C99837b1F182d3D620"
  const priceFeedUSDC = "0x90c069C4538adAc136E051052E14c1cD799C41B7"



  const Ico = await ethers.getContractFactory("ICO")
  const icoContract = await Ico.deploy(tokenContractAddress,usdtAddress,usdcAddress,softCap,hardCap,priceFeedETH,priceFeedBNB,priceFeedUSDT,priceFeedUSDC);
  await icoContract.waitForDeployment();
  console.log("Ico Contract Address : ", await icoContract.getAddress());
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat run scripts/deploy.js --network any
