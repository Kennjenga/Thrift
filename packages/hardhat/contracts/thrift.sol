// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ThriftToken is ERC20, Ownable {
    uint256 public constant INITIAL_CAP = 1000000 * 10 ** 18; // 1 million tokens
    uint256 public currentCap;
    address public devWallet;
    bool public isCapped;
    uint256 public tokenPrice = 0.001 ether; // Base price in ETH (1 token = 0.001 ETH)

    // Track dev allocation
    uint256 public devAllocation;
    uint256 public constant DEV_PERCENTAGE = 20; // 20% of initial cap
    uint256 public constant DEV_INCREASE_PERCENTAGE = 15; // 15% of cap increases

    event TokenPriceUpdated(uint256 newPrice);
    event TokensBurned(address indexed burner, uint256 amount);
    event DevAllocationMinted(uint256 amount);

    constructor(
        address initialOwner,
        address _devWallet
    ) ERC20("ThriftToken", "THRIFT") Ownable(initialOwner) {
        devWallet = _devWallet;
        currentCap = INITIAL_CAP;
        isCapped = true;

        // Mint initial dev allocation (20% of initial cap)
        devAllocation = (INITIAL_CAP * DEV_PERCENTAGE) / 100;
        _mint(devWallet, devAllocation);
    }

    function _processBuyTokens(uint256 msgValue) internal {
        require(msgValue > 0, "Must send ETH");
        uint256 tokenAmount = (msgValue * 1e18) / tokenPrice;
        require(tokenAmount > 0, "Amount too small");

        if (isCapped) {
            require(totalSupply() + tokenAmount <= currentCap, "Cap exceeded");
        }

        // Mint tokens directly to buyer (no dev share taken from purchases)
        _mint(msg.sender, tokenAmount);
    }

    function buyTokens() external payable {
        _processBuyTokens(msg.value);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        if (isCapped) {
            require(totalSupply() + amount <= currentCap, "Cap exceeded");
        }

        _mint(to, amount);
    }

    // New burn function
    function burn(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    // Modified setCap function to handle dev allocation for cap increases
    function setCap(uint256 newCap) external onlyOwner {
        require(
            newCap >= totalSupply(),
            "Cap cannot be less than total supply"
        );

        if (newCap > currentCap) {
            uint256 increase = newCap - currentCap;
            uint256 newDevAllocation = (increase * DEV_INCREASE_PERCENTAGE) /
                100;

            // Mint additional dev allocation
            _mint(devWallet, newDevAllocation);
            devAllocation += newDevAllocation;
            emit DevAllocationMinted(newDevAllocation);
        }

        currentCap = newCap;
        isCapped = true;
    }

    // View function to check remaining mintable supply
    function remainingMintableSupply() public view returns (uint256) {
        if (!isCapped) return type(uint256).max;
        if (totalSupply() >= currentCap) return 0;
        return currentCap - totalSupply();
    }

    function setTokenPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Invalid price");
        tokenPrice = newPrice;
        emit TokenPriceUpdated(newPrice);
    }

    function getEthAmount(uint256 tokenAmount) public view returns (uint256) {
        return (tokenAmount * tokenPrice) / 1e18;
    }

    function removeCap() external onlyOwner {
        isCapped = false;
    }

    receive() external payable {
        _processBuyTokens(msg.value);
    }
}
