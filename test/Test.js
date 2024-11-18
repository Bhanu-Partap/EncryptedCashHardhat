const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ICO Contract", function () {
  let ICO, ico, Token, token, owner, investor1, investor2;

  beforeEach(async function () {
    [owner, investor1, investor2] = await ethers.getSigners();

    // Deploy token contract
    Token = await ethers.getContractFactory("erc20token");
    token = await Token.connect(owner).deploy("EncryptedCash Coin", "ECC");
    await token.waitForDeployment();

    // Deploy ICO contract
    ICO = await ethers.getContractFactory("ICO");
    ico = await ICO.deploy(token.getAddress(), ethers.parseEther("1000"), ethers.parseEther("5000"));
    await ico.waitForDeployment();
  });

  it("OWNER : Should deploy the contract with correct initial values", async function () {
    expect(await ico.token()).to.equal(await token.getAddress());
    expect(await ico.softCapInFunds()).to.equal(ethers.parseEther("1000"));
    expect(await ico.hardCapInFunds()).to.equal(ethers.parseEther("5000"));
  });

  it("OWNER : Should create a new sale", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 3600;
    const endTime = startTime + 7200; 
    const tokenPrice = ethers.parseEther("0.1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    const sale = await ico.sales(1);
    expect(sale.startTime).to.equal(startTime);
    expect(sale.endTime).to.equal(endTime);
    expect(sale.tokenPrice).to.equal(tokenPrice);
    expect(sale.tokensSold).to.equal(0);
    expect(sale.isFinalized).to.equal(false);
  });

  it("INVESTOR : Should allow investors to buy tokens", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 36000; 
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("0.1") });
    expect(await ico.contributions(investor1.getAddress())).to.equal(ethers.parseEther("0.1"));
    expect(await ico.tokensBoughtByInvestor(investor1.getAddress())).to.equal(ethers.parseEther("1"));
    expect(await ico.totalTokensSold()).to.equal(ethers.parseEther("1"));
  });

  it("OWNER : Should prevent the owner from buying tokens", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600; 
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await expect(ico.buyTokens({ value: ethers.parseEther("1") })).to.be.revertedWith(
      "Owner cannot buy tokens"
    );
  });

  it("OWNER : Should finalize the ICO when hard cap is reached", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 4;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("5000") });
    await ico.connect(owner).finalizeICO()
    expect(await ico.isICOFinalized()).to.equal(true);
    expect(await ico.totalTokensSold()).to.equal(ethers.parseEther("50000"));
  });

  it("OWNER : Should initiate refunds if soft cap is not reached", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 2;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("0.1")})
    await ico.connect(owner).setAllowImmediateFinalization(1,true)
    setTimeout(() => {
       ico.connect(owner).initiateRefund();
    }, 5000);

    await expect(await ethers.provider.getBalance(ico.getAddress())).to.equal(0);
    await expect(await ico.contributions(investor1.getAddress())).to.equal(0);
  });
});
