// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// ThriftToken Contract
contract ThriftToken is ERC20, Ownable {
    uint256 public constant INITIAL_CAP = 1000000 * 10 ** 18; // 1 million tokens
    uint256 public currentCap;
    address public devWallet;
    bool public isCapped;
    uint256 public tokenPrice = 0.001 ether; // Base price in ETH

    uint256 public devAllocation;
    uint256 public rewardPoolAllocation;
    uint256 public constant DEV_PERCENTAGE = 20; // 20% of initial cap
    uint256 public constant DEV_INCREASE_PERCENTAGE = 15; // 15% of cap increases
    uint256 public constant REWARD_POOL_PERCENTAGE = 10; // 10% of cap increases

    mapping(address => bool) public isRewardContract;

    event TokenPriceUpdated(uint256 newPrice);
    event TokensBurned(address indexed burner, uint256 amount);
    event DevAllocationMinted(uint256 amount);
    event RewardPoolIncreased(uint256 amount);

    constructor(
        address initialOwner,
        address _devWallet
    ) ERC20("ThriftToken", "THRIFT") {
        _transferOwnership(initialOwner);
        devWallet = _devWallet;
        currentCap = INITIAL_CAP;
        isCapped = true;

        devAllocation = (INITIAL_CAP * DEV_PERCENTAGE) / 100;
        _mint(devWallet, devAllocation);

        rewardPoolAllocation = (INITIAL_CAP * REWARD_POOL_PERCENTAGE) / 100;
        _mint(address(this), rewardPoolAllocation);
    }

    function buyTokens() public payable {
        require(msg.value > 0, "Must send ETH");
        uint256 tokenAmount = (msg.value * 1e18) / tokenPrice;
        require(tokenAmount > 0, "Amount too small");

        if (isCapped) {
            require(totalSupply() + tokenAmount <= currentCap, "Cap exceeded");
        }

        _mint(msg.sender, tokenAmount);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        if (isCapped) {
            require(totalSupply() + amount <= currentCap, "Cap exceeded");
        }
        _mint(to, amount);
    }

    function mintReward(address to, uint256 amount) external {
        require(
            msg.sender == address(this) || isRewardContract[msg.sender],
            "Unauthorized"
        );
        require(rewardPoolAllocation >= amount, "Insufficient reward pool");

        rewardPoolAllocation -= amount;
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    function setCap(uint256 newCap) external onlyOwner {
        require(newCap >= totalSupply(), "Cap cannot be less than supply");

        if (newCap > currentCap) {
            uint256 increase = newCap - currentCap;

            uint256 newDevAllocation = (increase * DEV_INCREASE_PERCENTAGE) /
                100;
            uint256 newRewardAllocation = (increase * REWARD_POOL_PERCENTAGE) /
                100;

            _mint(devWallet, newDevAllocation);
            _mint(address(this), newRewardAllocation);

            devAllocation += newDevAllocation;
            rewardPoolAllocation += newRewardAllocation;

            emit DevAllocationMinted(newDevAllocation);
            emit RewardPoolIncreased(newRewardAllocation);
        }

        currentCap = newCap;
        isCapped = true;
    }

    function setRewardContract(
        address contractAddress,
        bool authorized
    ) external onlyOwner {
        isRewardContract[contractAddress] = authorized;
    }

    function setTokenPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Invalid price");
        tokenPrice = newPrice;
        emit TokenPriceUpdated(newPrice);
    }

    receive() external payable {
        buyTokens();
    }
}
