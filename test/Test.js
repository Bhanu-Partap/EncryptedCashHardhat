const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ICO Contract", function () {
  let ICO, ico, Token, token, owner, investor1, investor2,icoAddress, usdt, usdc;

  beforeEach(async function () {
    [owner, investor1, investor2] = await ethers.getSigners();
    


    // Deploy IcoToken contract
    Token = await ethers.getContractFactory("erc20token");
    token = await Token.connect(owner).deploy("EncryptedCash Coin", "ECC");
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress()
    // console.log("Ico Token Contract Address",tokenAddress);
    

    // Deploy USDT contract
    stablecoin = await ethers.getContractFactory("stablecoin");
    usdt = await stablecoin.connect(owner).deploy("Tether", "USDT");
    await usdt.waitForDeployment();
    const usdtAddress = await usdt.getAddress()
    // console.log("USDT Contract Address",usdtAddress);

     
    // Deploy USDC contract
    stablecoin1 = await ethers.getContractFactory("stablecoin");
    usdc = await stablecoin1.connect(owner).deploy("USD Coin", "USDC");
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress()
    // console.log("USDC Contract Address",usdcAddress);


    const priceFeedETH = "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
    const priceFeedBNB = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"
    const priceFeedUSDT = "0xEca2605f0BCF2BA5966372C99837b1F182d3D620"
    const priceFeedUSDC = "0x90c069C4538adAc136E051052E14c1cD799C41B7"


    // Deploy ICO contract
    ICO = await ethers.getContractFactory("ICO");
    ico = await ICO.connect(owner).deploy(tokenAddress, usdtAddress, usdcAddress ,ethers.parseEther("100"), ethers.parseEther("200"),priceFeedETH, priceFeedBNB, priceFeedUSDT, priceFeedUSDC);
    await ico.waitForDeployment();
    icoAddress = await token.getAddress()
    // console.log("icoAddress",icoAddress);
  });


  it("ADMIN - CREATE SALE : Should deploy the contract with correct initial values", async function () {
    expect(await ico.token()).to.equal(await token.getAddress());
    expect(await ico.softCapInUSD()).to.equal(ethers.parseEther("100"));
    expect(await ico.hardCapInUSD()).to.equal(ethers.parseEther("200"));
  });

  it("ADMIN - CREATE SALE : Should not allow non-owner to create a sale", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 60;
    const endTime = startTime + 3600;
    const tokenPrice = ethers.parseEther("1");

    await expect(ico.connect(investor1).createSale(startTime, endTime, tokenPrice)
    ).to.be.revertedWithCustomError(ico, "OwnableUnauthorizedAccount");
});

  it("ADMIN - CREATE SALE : Should create a new sale", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 3600;
    const endTime = startTime + 7200; 
    const tokenPrice = ethers.parseEther("1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    const sale = await ico.sales(1);
    expect(sale.startTime).to.equal(startTime);
    expect(sale.endTime).to.equal(endTime);
    expect(sale.tokenPriceUSD).to.equal(tokenPrice);
    expect(sale.tokensSold).to.equal(0);
    expect(sale.isFinalized).to.equal(false);
  });

  it("ADMIN - CREATE SALE : Should prevent creating a sale that starts before the last sale ends", async function () {
    const startTime1 = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime1 = startTime1 + 3600;
    const tokenPrice = ethers.parseEther("1");
    await ico.connect(owner).createSale(startTime1, endTime1, tokenPrice);
    const startTime2 = startTime1 + 1800; 
    const endTime2 = startTime2 + 3600;
    await expect(ico.connect(owner).createSale(startTime2, endTime2, tokenPrice)).to.be.revertedWith("New sale must start after the last sale ends");
});

  it("ADMIN - CREATE SALE : Should prevent creating a sale that starts before the current time", async function () {
    const startTime1 = (await ethers.provider.getBlock("latest")).timestamp + 1;
    const endTime1 = startTime1 + 3600;
    const tokenPrice = ethers.parseEther("1");
    await expect( ico.connect(owner).createSale(startTime1, endTime1, tokenPrice)).to.be.revertedWith("Start time must be greater than current time");
});

  it("ADMIN - CREATE SALE : Should prevent creating a sale with the end time less than current time", async function () {
    const startTime1 = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime1 = startTime1 ;
    const tokenPrice = ethers.parseEther("1");
    await expect( ico.connect(owner).createSale(startTime1, endTime1, tokenPrice)).to.be.revertedWith("End time must be greater than start time");
});

  it("ADMIN - BUY TOKEN: Should prevent the owner from buying tokens", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600; 
    const tokenPrice = ethers.parseEther("1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await expect(ico.connect(owner).buyTokens(1,ethers.parseEther("0.1"),{value : ethers.parseEther("0.1")})).to.be.revertedWith(
      "Owner cannot buy tokens"
    );
  });

  it("INVESTOR - BUY TOKEN: Should prevent buy token if no active sale", async function () {
    await expect(ico.connect(investor1).buyTokens(1,ethers.parseEther("0.1"),{value : ethers.parseEther("0.1")})).to.be.revertedWith(
      "No active sale");
  });

  it("INVESTOR - BUY TOKEN: Should prevent buy token if amount is zero", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600; 
    const tokenPrice = ethers.parseEther("1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await expect(ico.connect(investor1).buyTokens(1,ethers.parseEther("1"),{value : ethers.parseEther("0")})).to.be.revertedWith(
      "Send a valid ETH/BNB amount");
  });

  it("INVESTOR - BUY TOKEN: Should prevent buy token if sale already finalized", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 20; 
    const tokenPrice = ethers.parseEther("1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    await ico.connect(owner).setAllowImmediateFinalization(1,true);
    const saleData = await ico.sales(1)
    await expect(saleData.isFinalized).to.be.true;
  });


  it("INVESTOR - BUY TOKEN: Should prevent buy token if amount is more than hard cap", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600; 
    const tokenPrice = ethers.parseEther("1");
    await ico.createSale(startTime, endTime, tokenPrice);
    expect(ico.connect(investor1).buyTokens(1,ethers.parseEther("202"),{value : ethers.parseEther("202")})).to.be.revertedWith("Hard cap reached");
  });
  

  it("INVESTOR - BUY TOKEN  : Should allow investors to buy tokens", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 36000; 
    const tokenPrice = ethers.parseEther("1");
    await ico.createSale(startTime, endTime, tokenPrice);
    expect( ico.connect(investor1).buyTokens(1,ethers.parseEther("0.1"),{value : ethers.parseEther("0.1")}));
  });


  it("ADMIN - FINALIZE ICO : Should prevent finalize ico if sale is ongoing or soft cap not reached", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 4;
    const tokenPrice = ethers.parseEther("1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await expect(ico.connect(owner).finalizeICO()).to.be.revertedWith("Cannot finalize: Soft cap not reached or sale is ongoing");
  });

  it("ADMIN - FINALIZE ICO : Should finalize ico if soft cap is reached and admin want to finalize ico", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 1500;
    const tokenPrice = ethers.parseEther("1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    setTimeout(async() => {
      const tokenRecieveAmount=  await ico.connect(investor1).calculateTokenAmount(1,ethers.parseEther("1"))
      console.log(tokenRecieveAmount); 
    }, 20000);
    await ico.connect(investor1).buyTokens(1,ethers.parseEther("0.15"),{value : ethers.parseEther("0.15")})
    await ico.connect(owner).setAllowImmediateFinalization(1,true)
    await ico.connect(owner).finalizeICO()
    const icoFinalized = await ico.isICOFinalized()
    expect(icoFinalized).to.be.true
  });

  it("ADMIN - FINALIZE ICO : Should finalize the ICO when hard cap is reached", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 1500;
    const tokenPrice = ethers.parseEther("1");
    await ico.createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens(1,ethers.parseEther("0.2"),{value : ethers.parseEther("0.2")});
    await ico.connect(owner).setAllowImmediateFinalization(1,true)
    await ico.connect(owner).finalizeICO()
    expect(await ico.isICOFinalized()).to.equal(true);
  });

  it("ADMIN : REFUND INITIATE : Should initiate refunds if soft cap is not reached", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 2;
    const tokenPrice = ethers.parseEther("1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens(1,ethers.parseEther("0.002"),{value : ethers.parseEther("0.002")})
    await ico.connect(owner).setAllowImmediateFinalization(1,true)
    expect ( await ico.connect(owner).initiateRefund());
    expect(await ethers.provider.getBalance(icoAddress)).to.be.equal(0);
  });

  it("ADMIN : REFUND INITIATE - Should prevent initiate refund if sale ongoing", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600;
    const tokenPrice = ethers.parseEther("1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens(1,ethers.parseEther("0.002"),{value : ethers.parseEther("0.002")})
    await expect( ico.connect(owner).initiateRefund()).revertedWith("Sale ongoing")
  });

  it("ADMIN : REFUND INITIATE - Should initiate refund if soft cap not reached", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600;
    const tokenPrice = ethers.parseEther("1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens(1,ethers.parseEther("0.002"),{value : ethers.parseEther("0.002")})
    await ico.connect(owner).setAllowImmediateFinalization(1,true)
    await ico.connect(owner).initiateRefund();
    expect (await ico.isICOFinalized()).to.be.true
  })

  it("ADMIN : AIRDROP TOKEN - Should prevent airdrop if ico not finalized ", async function () {
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime = startTime + 3600;
    const tokenPrice = ethers.parseEther("1");
    await ico.connect(owner).createSale(startTime, endTime, tokenPrice);
    await ico.connect(investor1).buyTokens(1,ethers.parseEther("0.2"),{value : ethers.parseEther("0.2")})
    const tokenSold = String(await ico.totalTokensSold())
    await token.connect(owner).approve(icoAddress,tokenSold)
    await expect(ico.connect(owner).airdropTokens()).revertedWith("ICO not finalized")
  });

  it("ANY - CALCULATE TOKEN AMOUNT : Should prevent calculating token amount if amount is zero", async function () {
    const startTime1 = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime1 = startTime1 + 3600 ;
    const tokenPrice = ethers.parseEther("1");
    await ico.connect(owner).createSale(startTime1, endTime1, tokenPrice)
    await expect(ico.calculatePaymentAmount(1,ethers.parseEther("0"))).to.be.revertedWith("Token amount must be greater than zero");
});

  it("ANY - GET PRICE FEED : Should fetching correct price(BNB) from the feed ", async function () {
    const startTime1 = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime1 = startTime1 + 3600 ;
    const tokenPrice = ethers.parseEther("1");
    expect(await ico.connect(owner)._getPriceFeed(2)).to.be.equal(100000000);
});

  it("ANY - GET PRICE FEED : Should fetching correct price(USDT) from the feed ", async function () {
    const startTime1 = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime1 = startTime1 + 3600 ;
    const tokenPrice = ethers.parseEther("1");
    expect(await ico.connect(owner)._getPriceFeed(3)).to.be.equal(100000000);
});

  it("ANY - GET PRICE FEED : Should fetching correct price(USDC) from the feed ", async function () {
    const startTime1 = (await ethers.provider.getBlock("latest")).timestamp + 2;
    const endTime1 = startTime1 + 3600 ;
    const tokenPrice = ethers.parseEther("1");
    expect(await ico.connect(owner)._getPriceFeed(1)).to.be.equal(67000000000);
});
});

