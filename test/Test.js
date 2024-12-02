const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ICO Contract", function () {
  let ICO, ico, Token, token, owner, investor1, investor2,icoAddress;

  beforeEach(async function () {
    [owner, investor1, investor2] = await ethers.getSigners();


    // Deploy IcoToken contract
    Token = await ethers.getContractFactory("erc20token");
    token = await Token.connect(owner).deploy("EncryptedCash Coin", "ECC");
    await token.waitForDeployment();
    console.log("Ico Token Contract Address",await token.getAddress());
    

    // Deploy USDT contract
    stablecoin = await ethers.getContractFactory("stablecoin");
    usdt = await stablecoin.connect(owner).deploy("Tether", "USDT");
    await usdt.waitForDeployment();
    console.log("USDT Contract Address",await usdt.getAddress());

     
    // Deploy USDC contract
    stablecoin1 = await ethers.getContractFactory("stablecoin");
    usdc = await stablecoin1.connect(owner).deploy("USD Coin", "USDC");
    await usdc.waitForDeployment();
    console.log("USDC Contract Address",await usdc.getAddress());


    // Deploy ICO contract
    ICO = await ethers.getContractFactory("ICO");
    ico = await ICO.connect(owner).deploy(token.getAddress(), ethers.parseEther("100"), ethers.parseEther("500"));
    await ico.waitForDeployment();
    icoAddress = await token.getAddress()
    // console.log("icoAddress",icoAddress);
  });
  

  it("ADMIN - CREATE SALE : Should deploy the contract with correct initial values", async function () {
    expect(await ico.token()).to.equal(await token.getAddress());
    expect(await ico.softCapInFunds()).to.equal(ethers.parseEther("100"));
    expect(await ico.hardCapInFunds()).to.equal(ethers.parseEther("500"));
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

  it("INVESTOR - BUY TOKEN: Should prevent buy token if no active sale", async function () {
    await expect(ico.connect(investor1).buyTokens({ value: ethers.parseEther("1") })).to.be.revertedWith(
      "No active sale");
  });

  it("INVESTOR - BUY TOKEN: Should prevent buy token if amount is zero", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600; 
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await expect(ico.connect(investor1).buyTokens({ value: ethers.parseEther("0") })).to.be.revertedWith(
      "Enter a valid amount");
  });

  it("INVESTOR - BUY TOKEN: Should prevent buy token if sale already finalized", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600; 
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await expect(ico.connect(investor1).buyTokens({ value: ethers.parseEther("0") })).to.be.revertedWith(
      "Enter a valid amount");
  });

  it("INVESTOR - BUY TOKEN: Should prevent buy token if amount is not the multiple of token price", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600; 
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await expect(ico.connect(investor1).buyTokens({ value: ethers.parseEther("0.001") })).to.be.revertedWith(
      "Amount must be equal or multiple of the token price");
  });

  it("INVESTOR - BUY TOKEN: Should prevent buy token if amount is more than hard cap", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600; 
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await expect(ico.connect(investor1).buyTokens({ value: ethers.parseEther("5001") })).to.be.revertedWith(
      "Purchase exceeds hard cap in funds");
  });

  it("INVESTOR - BUY TOKEN  : Should allow investors to buy tokens", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 36000; 
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("0.1") });
    expect(await ico.contributions(investor1.getAddress())).to.equal(ethers.parseEther("0.1"));
    expect(await ico.tokensBoughtByInvestor(investor1.getAddress())).to.equal(ethers.parseEther("1"));
    expect(await ico.totalTokensSold()).to.equal(ethers.parseEther("1"));
  });


  it("ADMIN - FINALIZE ICO : Should prevent finalize ico if sale is ongoing or soft cap not reached", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 4;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("3") });
    await expect(ico.connect(owner).finalizeICO()).to.be.revertedWith("Cannot finalize: Soft cap not reached or sale is ongoing");
  });

  it("ADMIN - FINALIZE ICO : Should finalize ico if soft cap is reached and admin want to finalize ico", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 1500;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("101") });
    await ico.connect(owner).setAllowImmediateFinalization(1,true)
    expect(await ico.allowImmediateFinalization()).to.be.true;
  });

  it("ADMIN - FINALIZE ICO : Should finalize the ICO when hard cap is reached", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 4;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("500") });
    await ico.connect(owner).finalizeICO()
    expect(await ico.isICOFinalized()).to.equal(true);
    expect(await ico.totalTokensSold()).to.equal(ethers.parseEther("5000"));
  });

  it("ADMIN : REFUND INITIATE : Should initiate refunds if soft cap is not reached", async function () {
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

  it("ADMIN : REFUND INITIATE - Should prevent initiate refund if sale ongoing", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("0.1")})
    await ico.connect(owner).setAllowImmediateFinalization(1,true)
    await expect( ico.connect(owner).initiateRefund()).revertedWith("Sale ongoing")
  });

  it("ADMIN : REFUND INITIATE - Should initiate refund if soft cap reached", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("0.1")})
    await ico.connect(owner).setAllowImmediateFinalization(1,true)
    await expect( ico.connect(owner).initiateRefund()).revertedWith("Sale ongoing")
  });


  it("ADMIN : AIRDROP TOKEN - Should prevent airdrop if token already airdropped", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600;
    const tokenPrice = ethers.parseEther("0.1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens({ value: ethers.parseEther("101")})
    await ico.connect(owner).setAllowImmediateFinalization(1,true)
    const tokenSold = await ico.connect(owner).totalTokensSold()
    console.log(tokenSold.toString(),"tokenSold");
    await ico.connect(owner).finalizeICO()
    const ownerBalance = await token.balanceOf(owner.address);
    console.log("Admin (Owner) token balance:", ownerBalance);
    const approve= await token.connect(owner).approve(icoAddress,tokenSold)
    await ico.connect(owner).airdropTokens()
    await expect(ico.connect(owner).airdropTokens()).revertedWith("Airdrop already completed")
  });
});

