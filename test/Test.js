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

  it("ADMIN - CREATE SALE : Should deploy the contract with correct initial values", async function () {
    expect(await ico.token()).to.equal(await token.getAddress());
    expect(await ico.softCapInFunds()).to.equal(ethers.parseEther("1000"));
    expect(await ico.hardCapInFunds()).to.equal(ethers.parseEther("5000"));
  });

  it("ADMIN - CREATE SALE : Should not allow non-owner to create a sale", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 60;
    const endTime = startTime + 3600;
    const tokenPrice = ethers.parseEther("0.1");

    await expect(ico.connect(investor1).createSale(startTime, endTime, tokenPrice)
    ).to.be.revertedWithCustomError(ico, "OwnableUnauthorizedAccount");
});

  it("ADMIN - CREATE SALE : Should create a new sale", async function () {
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

  it("ADMIN - CREATE SALE : Should prevent creating a sale that starts before the last sale ends", async function () {
    const startTime1 = (await ethers.provider.getBlock("latest")).timestamp + 60;
    const endTime1 = startTime1 + 3600;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.connect(owner).createSale(startTime1, endTime1, tokenPrice);
    const startTime2 = startTime1 + 1800; 
    const endTime2 = startTime2 + 3600;
    await expect(
        ico.connect(owner).createSale(startTime2, endTime2, tokenPrice)
    ).to.be.revertedWith("New sale must start after the last sale ends");
});

  it("ADMIN - CREATE SALE : Should prevent creating a sale that starts before the current time", async function () {
    const startTime1 = (await ethers.provider.getBlock("latest")).timestamp + 1;
    const endTime1 = startTime1 + 3600;
    const tokenPrice = ethers.parseEther("0.1");
    await expect( ico.connect(owner).createSale(startTime1, endTime1, tokenPrice)).to.be.revertedWith("Start time must be greater than current time");
});

  it("ADMIN - CREATE SALE : Should prevent creating a sale with the end time less than current time", async function () {
    const startTime1 = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime1 = startTime1 ;
    const tokenPrice = ethers.parseEther("0.1");
    await expect( ico.connect(owner).createSale(startTime1, endTime1, tokenPrice)).to.be.revertedWith("End time must be greater than start time");
});

  it("ADMIN - BUY TOKEN: Should prevent the owner from buying tokens", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600; 
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await expect(ico.connect(owner).buyTokens({ value: ethers.parseEther("1") })).to.be.revertedWith(
      "Owner cannot buy tokens"
    );
  });

  it("ADMIN - BUY TOKEN: Should prevent buy token if no active sale", async function () {
    await expect(ico.connect(investor1).buyTokens({ value: ethers.parseEther("1") })).to.be.revertedWith(
      "No active sale");
  });

  it("ADMIN - BUY TOKEN: Should prevent buy token if amount is zero", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600; 
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await expect(ico.connect(investor1).buyTokens({ value: ethers.parseEther("0") })).to.be.revertedWith(
      "Enter a valid amount");
  });

  it("ADMIN : Should finalize the ICO when hard cap is reached", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 4;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("5000") });
    await ico.connect(owner).finalizeICO()
    expect(await ico.isICOFinalized()).to.equal(true);
    expect(await ico.totalTokensSold()).to.equal(ethers.parseEther("50000"));
  });

  it("ADMIN : Should initiate refunds if soft cap is not reached", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 1;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("0.1")})
    await ico.connect(owner).setAllowImmediateFinalization(1,true)
    expect ( await ico.connect(owner).initiateRefund());
    expect(await ethers.provider.getBalance(ico.getAddress())).to.equal(0);
    expect(await ico.contributions(investor1.getAddress())).to.equal(0);
  });

  it("ADMIN : Refund Initiate - sale ongoing", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("0.1")})
    await ico.connect(owner).setAllowImmediateFinalization(1,true)
    await expect( ico.connect(owner).initiateRefund()).revertedWith("Sale ongoing")
  });


//   it("Should finalize sale automatically if it ends", async function () {
//     const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
//     const endTime = startTime + 5; 
//     const tokenPrice = ethers.parseEther("0.1");

//     await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
//     await ico.connect(investor1).buyTokens({ value: ethers.parseEther("1") });

//     const sale = await ico.sales(1);
//     expect(sale.isFinalized).to.be.true;
// });


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

});
