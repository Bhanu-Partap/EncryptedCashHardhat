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

  const softCap=ethers.parseEther("100")
  const hardCap=ethers.parseEther("200")
  const tokenAddress = await tokenContract.getAddress()
  console.log("Token Address" ,tokenAddress);
  
  const Ico = await ethers.getContractFactory("ICO")
  const icoContract = await Ico.deploy(tokenAddress,softCap,hardCap);
  await icoContract.waitForDeployment();
  console.log("Ico Contract Address : ", await icoContract.getAddress());
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat run scripts/deploy.js --network any
