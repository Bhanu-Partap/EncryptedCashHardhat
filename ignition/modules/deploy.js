const { ethers } = require("hardhat");


async function main() {

  console.log(BSCSCAN_API_KEY,"");
  

  const accounts = await ethers.getSigners();

  console.log("User Address :",accounts[0].address);
  const tokenName = "EncryptedCash Coin"; 
  const tokenSymbol = "ECC"; 


  const Token = await ethers.getContractFactory("erc20token");
  const tokenContract = await Token.deploy("EncryptedCash Coin", "ECC");
  await tokenContract.waitForDeployment();

  const softCap=100
  const hardCap=200
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


// // npx hardhat run scripts/deploy.js --network sepolia


// const { ethers } = require("hardhat");
// const tokenArtifact = require("../../artifacts/contracts/Erc20.sol/erc20token.json");

// async function main() {
//   // console.log(tokenArtifact.abi);
//   // console.log(tokenArtifact.bytecode);
//   // console.log( );
//   const [signer] = await ethers.getSigners()
//   console.log(signer);
  
  
//   const Token = new ethers.ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, signer);
//   const [deployer] = await ethers.getSigners();
//   const tokenContract = await Token.connect(deployer).deploy("EncryptedCash Coin", "ECC");
//   await tokenContract.deployed();
//   console.log("Token Contract Address:", tokenContract.address);
// }

// main().catch((error) => {
//   console.error(error);
//   process.exit(1);
// });
