// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ThriftToken is ERC20, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");

    // Supply management
    uint256 public maxSupply;
    bool public supplyCapped;

    // Trading settings
    bool public tradingEnabled;
    mapping(address => bool) public isExcludedFromFees;
    uint256 public platformFee; // In basis points (1% = 100)
    address public platformWallet;

    // Price feed for token purchases
    address public priceFeedAddress;
    uint256 public tokenPrice; // Price in wei

    // Anti-bot measures
    mapping(address => uint256) public lastTradeTimestamp;
    uint256 public cooldownPeriod;
    uint256 public maxTransactionAmount;

    // Events
    event TradingEnabled(bool enabled);
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event PriceUpdated(uint256 newPrice);
    event PlatformFeeUpdated(uint256 newFee);
    event CooldownUpdated(uint256 newPeriod);
    event MaxTransactionUpdated(uint256 newAmount);

    constructor(
        uint256 _initialSupply,
        uint256 _maxSupply,
        address _platformWallet,
        address[] memory _admins
    ) ERC20("ThriftToken", "THRIFT") {
        require(_platformWallet != address(0), "Invalid platform wallet");

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        for (uint i = 0; i < _admins.length; i++) {
            _setupRole(ADMIN_ROLE, _admins[i]);
        }

        maxSupply = _maxSupply;
        supplyCapped = true;
        platformWallet = _platformWallet;

        // Initial settings
        platformFee = 100; // 1%
        tokenPrice = 1e14; // 0.0001 ETH
        cooldownPeriod = 60; // 1 minute
        maxTransactionAmount = _maxSupply / 100; // 1% of max supply

        // Exclude platform and owner from fees
        isExcludedFromFees[_platformWallet] = true;
        isExcludedFromFees[msg.sender] = true;

        // Mint initial supply
        _mint(msg.sender, _initialSupply);
    }

    // Trading control functions
    function enableTrading(bool _enabled) external onlyRole(ADMIN_ROLE) {
        tradingEnabled = _enabled;
        emit TradingEnabled(_enabled);
    }

    function setTokenPrice(uint256 _newPrice) external onlyRole(ADMIN_ROLE) {
        tokenPrice = _newPrice;
        emit PriceUpdated(_newPrice);
    }

    function setPlatformFee(uint256 _newFee) external onlyRole(ADMIN_ROLE) {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }

    function setCooldownPeriod(uint256 _period) external onlyRole(ADMIN_ROLE) {
        cooldownPeriod = _period;
        emit CooldownUpdated(_period);
    }

    function setMaxTransactionAmount(
        uint256 _amount
    ) external onlyRole(ADMIN_ROLE) {
        maxTransactionAmount = _amount;
        emit MaxTransactionUpdated(_amount);
    }

    // Purchase tokens with ETH
    function purchaseTokens() external payable nonReentrant whenNotPaused {
        require(tradingEnabled, "Trading not enabled");
        require(msg.value > 0, "No ETH sent");

        uint256 tokenAmount = (msg.value * 1e18) / tokenPrice;
        require(tokenAmount > 0, "Zero tokens");
        require(tokenAmount <= maxTransactionAmount, "Exceeds max transaction");

        if (supplyCapped) {
            require(
                totalSupply() + tokenAmount <= maxSupply,
                "Exceeds max supply"
            );
        }

        // Transfer ETH to platform wallet
        (bool success, ) = platformWallet.call{value: msg.value}("");
        require(success, "ETH transfer failed");

        // Mint tokens to buyer
        _mint(msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }

    // Override transfer function to implement fees and restrictions
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        require(sender != address(0), "Invalid sender");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Zero amount");

        // Check trading status
        if (sender != owner() && recipient != owner()) {
            require(tradingEnabled, "Trading not enabled");
            require(amount <= maxTransactionAmount, "Exceeds max transaction");

            // Apply cooldown
            if (!isExcludedFromFees[sender]) {
                require(
                    block.timestamp >=
                        lastTradeTimestamp[sender] + cooldownPeriod,
                    "Cooldown active"
                );
                lastTradeTimestamp[sender] = block.timestamp;
            }
        }

        // Calculate and apply fee if applicable
        if (!isExcludedFromFees[sender] && !isExcludedFromFees[recipient]) {
            uint256 feeAmount = (amount * platformFee) / 10000;
            super._transfer(sender, platformWallet, feeAmount);
            amount -= feeAmount;
        }

        super._transfer(sender, recipient, amount);
    }

    // Utility functions
    function excludeFromFees(
        address account,
        bool excluded
    ) external onlyRole(ADMIN_ROLE) {
        isExcludedFromFees[account] = excluded;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
