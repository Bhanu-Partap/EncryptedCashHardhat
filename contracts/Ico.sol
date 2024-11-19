// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./Erc20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ICO is Ownable {

    // Struct
    struct Sale {
        uint256 startTime;
        uint256 endTime;
        uint256 tokenPrice; 
        uint256 tokensSold;
        bool isFinalized; 
    }

    // State variables
    erc20token public token;
    uint256 public softCapInFunds;
    uint256 public hardCapInFunds; 
    uint256 public saleCount;
    uint256 public totalFundsRaised; // Total funds raised in ETH
    uint256 public totalTokensSold; // Total tokens sold in the ICO
    address[] public investors;
    bool public isICOFinalized = false;
    bool public isTokensAirdropped = false;
    bool public allowImmediateFinalization = false; 

    // Mappings
    mapping(uint256 => Sale) public sales;
    // mapping(address => bool) public whitelisted;
    mapping(address => uint256) public contributions;  
    mapping(address => uint256) public tokensBoughtByInvestor; 

    //events
    // event Whitelisted(address indexed account);
    event ICOFinalized(uint256 totalTokensSold);
    event tokenAirdropped(address investor, uint256 airdroppedAmount);
    event RefundInitiated(address investor, uint256 amount);
    event TokensPurchased(address buyer, uint256 saleId, uint256 tokenPurchaseAmount, uint256 tokenPrice, uint256 amountPaid);
    event NewSaleCreated(uint256 saleId, uint256 startTime, uint256 endTime, uint256 tokenPrice);

    constructor(erc20token _token, uint256 _softCapInFunds, uint256 _hardCapInFunds) Ownable(msg.sender) {
        token = _token;
        softCapInFunds = _softCapInFunds;
        hardCapInFunds = _hardCapInFunds;
    }

        // modifier isWhitelisted() {
    //     require(whitelisted[msg.sender], "Not a whitelisted user");
    //     _;
    // }

    // function whitelistUser(address _user) external onlyOwner {
    //     require(_user != address(0), "Invalid address");
    //     whitelisted[_user] = true;
    //     emit Whitelisted(_user);
    // }

    modifier icoNotFinalized() {
        require(!isICOFinalized, "ICO already finalized");
        _;
    }

    function createSale(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _tokenPrice
    ) external onlyOwner icoNotFinalized {
        require(_startTime > block.timestamp, "Start time must be greater than current time");
        require(_endTime > _startTime, "End time must be greater than start time");
        require(_startTime > getLatestSaleEndTime(), "New sale must start after the last sale ends");

        saleCount++;
        sales[saleCount] = Sale({
            startTime: _startTime,
            endTime: _endTime,
            tokenPrice: _tokenPrice,
            tokensSold: 0,
            isFinalized: false
        });
        emit NewSaleCreated(saleCount, _startTime, _endTime, _tokenPrice);
    }

    // if using whitelisting mechanism then add isWhitelisted modifier in buy token funtion
    function buyTokens() external payable icoNotFinalized {
        require(msg.sender != owner(), "Owner cannot buy tokens");
        uint256 currentSaleId = getCurrentSaleId();
        require(currentSaleId != 0, "No active sale");
        require(msg.value > 0, "Enter a valid amount");

        // Finalize previous sales
        for (uint256 i = 1; i <= saleCount; i++) {
            finalizeSaleIfEnded(i);
        }

        Sale storage sale = sales[currentSaleId];
        require(!sale.isFinalized, "Sale already finalized");
        uint256 tokenDecimals = 10 ** erc20token(token).decimals();

        uint256 tokenPrice = sale.tokenPrice;
        uint256 tokensToBuy = (msg.value/ tokenPrice) * uint256(tokenDecimals);
        require(totalFundsRaised + msg.value <= hardCapInFunds, "Purchase exceeds hard cap in funds");

        contributions[msg.sender] += msg.value;
        totalFundsRaised += msg.value;
        sale.tokensSold += tokensToBuy;
        totalTokensSold += tokensToBuy;

        // Track investors and their purchases
        if (tokensBoughtByInvestor[msg.sender] == 0) {
            investors.push(msg.sender);
        }
        tokensBoughtByInvestor[msg.sender] += tokensToBuy;

        emit TokensPurchased(msg.sender, currentSaleId, tokensToBuy, tokenPrice, msg.value);
    }

    function finalizeSaleIfEnded(uint256 saleId) internal {
        Sale storage sale = sales[saleId];

        if (block.timestamp >= sale.endTime && !sale.isFinalized) {
            sale.isFinalized = true;
        }
    }

    // Owner decides whether immediate finalization is allowed
    function setAllowImmediateFinalization(uint256 saleId, bool _allow) external onlyOwner {
        allowImmediateFinalization = _allow; 
        finalizeSaleIfEnded(saleId);
    }

    function finalizeICO() public onlyOwner icoNotFinalized {
        require(
            totalFundsRaised >= softCapInFunds || totalFundsRaised >= hardCapInFunds || block.timestamp >= getLatestSaleEndTime(),
            "Cannot finalize: Soft cap not reached or sale is ongoing"
        );

        for (uint256 i = 1; i <= saleCount; i++) {
            Sale storage sale = sales[i];
            if (block.timestamp >= sale.endTime && !sale.isFinalized) {
                sale.isFinalized = true;
            }
        }

        // If the hard cap has been reached, finalize immediately.
        if (totalFundsRaised >= hardCapInFunds) {
            isICOFinalized = true;
            payable(owner()).transfer(address(this).balance);
            emit ICOFinalized(totalTokensSold);
        }
        // If the soft cap is reached but sale is not ended, the owner can finalize immediately if allowed.
        else if (totalFundsRaised >= softCapInFunds && allowImmediateFinalization) {
            isICOFinalized = true;
            payable(owner()).transfer(address(this).balance);
            emit ICOFinalized(totalTokensSold);
        }
        // If the soft cap is reached and all sales are completed, finalize the ICO.
        else {
            require(block.timestamp >= getLatestSaleEndTime(), "Sale is still ongoing");
            isICOFinalized = true;
            payable(owner()).transfer(address(this).balance);
            emit ICOFinalized(totalTokensSold);
        }
    }

    function initiateRefund() external onlyOwner icoNotFinalized {
        require(block.timestamp > getLatestSaleEndTime(), "Sale ongoing");
        require(totalFundsRaised < softCapInFunds, "Soft cap reached");

        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 amount = contributions[investor];

            if (amount > 0) {
                contributions[investor] = 0; // resetting the mapping before the transfer (reentrancy)
                payable(investor).transfer(amount); 
                emit RefundInitiated(investor, amount);
            }
        }
        isICOFinalized = true;
    }

    function airdropTokens() external onlyOwner {
        require(!isTokensAirdropped, "Airdrop already completed");
        require(isICOFinalized, "ICO not finalized");
        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 tokensBought = tokensBoughtByInvestor[investor] ;
            if (tokensBought > 0) {
                bool success = token.transferFrom(owner(), investor, tokensBought);
                require(success, "Token transfer failed");
                emit tokenAirdropped(investor, tokensBought);
            }
        }
        isTokensAirdropped = true;
    }

    // Getter Functions
    function getCurrentSaleId() public view returns (uint256) {
        for (uint256 i = 1; i <= saleCount; i++) {
            if (block.timestamp >= sales[i].startTime && block.timestamp <= sales[i].endTime && !sales[i].isFinalized) {
                return i;
            }
        }
        return 0;
    }

    function getLatestSaleEndTime() internal view returns (uint256) {
        uint256 latestEndTime;
        for (uint256 i = 1; i <= saleCount; i++) {
            if (sales[i].endTime > latestEndTime) {
                latestEndTime = sales[i].endTime;
            }
        }
        return latestEndTime;
    }

    function getSaleStartEndTime(uint256 _saleId) public view returns(uint256 _startTime, uint256 _endTime) {
        Sale memory sale = sales[_saleId];
        return (sale.startTime, sale.endTime);
    }

    function getSoftCapReached() public view onlyOwner returns(bool) {
        return (totalFundsRaised >= softCapInFunds);
    }

    function getHardCapReached() public view onlyOwner returns(bool) {
        return (totalFundsRaised >= hardCapInFunds);
    }
}