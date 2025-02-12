// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ThriftToken} from "./thrift.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// DonationAndRecycling Contract
contract DonationAndRecycling is Ownable, ReentrancyGuard {
    ThriftToken public thriftToken;

    struct DonationCenter {
        string name;
        string description;
        string location;
        bool isActive;
        bool acceptsTokens;
        bool acceptsRecycling;
    }

    struct Donation {
        address donor;
        uint256 itemCount;
        string itemType;
        string description;
        uint256 timestamp;
        bool isRecycling;
        uint256 tokenAmount;
        uint256 weightInKg;
    }

    mapping(uint256 => DonationCenter) public donationCenters;
    mapping(uint256 => Donation) public donations;
    uint256 public donationCenterCount;
    uint256 public donationCount;

    // Reward bases (multiply by quantity/weight then divide by denominator)
    uint256 public constant REWARD_BASE = 10 ** 18; // 1 token in wei
    uint256 public clothingItemRewardNumerator = REWARD_BASE;
    uint256 public clothingItemRewardDenominator = 15; // 1 token per 15 items
    uint256 public clothingWeightRewardNumerator = REWARD_BASE;
    uint256 public clothingWeightRewardDenominator = 10; // 1 token per 10kg
    uint256 public recyclingRewardNumerator = REWARD_BASE;
    uint256 public recyclingRewardDenominator = 30; // 1 token per 30kg

    // Maximum reward
    uint256 public maxDonationReward = 200 * 10 ** 18; // 200 tokens

    event DonationCenterAdded(uint256 indexed id, string name, string location);
    event DonationCenterUpdated(uint256 indexed id, bool isActive);
    event DonationRegistered(
        uint256 indexed donationId,
        address indexed donor,
        uint256 itemCount,
        uint256 weightInKg,
        uint256 rewardAmount
    );
    event RecyclingRegistered(
        uint256 indexed donationId,
        address indexed donor,
        uint256 weightInKg,
        uint256 rewardAmount
    );

    constructor(address payable _thriftTokenAddress) {
        _transferOwnership(msg.sender);
        thriftToken = ThriftToken(_thriftTokenAddress);
    }

    // New function to get total donation centers
    function getTotalDonationCenters() external view returns (uint256) {
        return donationCenterCount;
    }

    // New function to get total active donation centers
    function getTotalActiveDonationCenters() external view returns (uint256) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= donationCenterCount; i++) {
            if (donationCenters[i].isActive) {
                activeCount++;
            }
        }
        return activeCount;
    }

    // Get all donation centers
    function getAllDonationCenters() external view returns (DonationCenter[] memory) {
        DonationCenter[] memory centers = new DonationCenter[](donationCenterCount);
        for (uint256 i = 1; i <= donationCenterCount; i++) {
            centers[i - 1] = donationCenters[i];
        }
        return centers;
    }

    // Get active donation centers
    function getActiveDonationCenters() external view returns (DonationCenter[] memory) {
        uint256 activeCount = 0;
        
        // First count active centers
        for (uint256 i = 1; i <= donationCenterCount; i++) {
            if (donationCenters[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of correct size and populate
        DonationCenter[] memory activeCenters = new DonationCenter[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= donationCenterCount; i++) {
            if (donationCenters[i].isActive) {
                activeCenters[currentIndex] = donationCenters[i];
                currentIndex++;
            }
        }
        
        return activeCenters;
    }

    // Get a specific donation center
    function getDonationCenter(uint256 centerId) external view returns (DonationCenter memory) {
        require(centerId <= donationCenterCount && centerId > 0, "Invalid center ID");
        return donationCenters[centerId];
    }

    function calculateClothingReward(
        uint256 itemCount,
        uint256 weightInKg
    ) public view returns (uint256) {
        // Calculate item-based reward
        uint256 itemBasedReward = (itemCount * clothingItemRewardNumerator) /
            clothingItemRewardDenominator;

        // Calculate weight-based reward
        uint256 weightBasedReward = (weightInKg *
            clothingWeightRewardNumerator) / clothingWeightRewardDenominator;

        // Take the higher of the two rewards
        uint256 reward = itemBasedReward > weightBasedReward
            ? itemBasedReward
            : weightBasedReward;

        // Cap the reward
        return reward > maxDonationReward ? maxDonationReward : reward;
    }

    function calculateRecyclingReward(
        uint256 weightInKg
    ) public view returns (uint256) {
        uint256 reward = (weightInKg * recyclingRewardNumerator) /
            recyclingRewardDenominator;
        return reward > maxDonationReward ? maxDonationReward : reward;
    }

    function addDonationCenter(
        string memory name,
        string memory description,
        string memory location,
        bool acceptsTokens,
        bool acceptsRecycling
    ) external onlyOwner {
        donationCenterCount++;
        donationCenters[donationCenterCount] = DonationCenter(
            name,
            description,
            location,
            true,
            acceptsTokens,
            acceptsRecycling
        );

        emit DonationCenterAdded(donationCenterCount, name, location);
    }

    function updateDonationCenter(
        uint256 centerId,
        bool isActive,
        bool acceptsTokens,
        bool acceptsRecycling
    ) external onlyOwner {
        require(centerId <= donationCenterCount, "Invalid center ID");

        DonationCenter storage center = donationCenters[centerId];
        center.isActive = isActive;
        center.acceptsTokens = acceptsTokens;
        center.acceptsRecycling = acceptsRecycling;

        emit DonationCenterUpdated(centerId, isActive);
    }

    function registerDonation(
        uint256 centerId,
        uint256 itemCount,
        string memory itemType,
        string memory description,
        uint256 weightInKg
    ) external nonReentrant {
        require(centerId <= donationCenterCount, "Invalid center ID");
        require(donationCenters[centerId].isActive, "Center not active");
        require(
            itemCount > 0 || weightInKg > 0,
            "Must specify items or weight"
        );

        uint256 rewardAmount = calculateClothingReward(itemCount, weightInKg);

        donationCount++;
        donations[donationCount] = Donation(
            msg.sender,
            itemCount,
            itemType,
            description,
            block.timestamp,
            false,
            0,
            weightInKg
        );

        if (rewardAmount > 0) {
            thriftToken.mintReward(msg.sender, rewardAmount);
        }

        emit DonationRegistered(
            donationCount,
            msg.sender,
            itemCount,
            weightInKg,
            rewardAmount
        );
    }

    function registerRecycling(
        uint256 centerId,
        string memory description,
        uint256 weightInKg
    ) external nonReentrant {
        require(centerId <= donationCenterCount, "Invalid center ID");
        require(donationCenters[centerId].isActive, "Center not active");
        require(
            donationCenters[centerId].acceptsRecycling,
            "Center doesn't accept recycling"
        );
        require(weightInKg > 0, "Weight must be greater than 0");

        uint256 rewardAmount = calculateRecyclingReward(weightInKg);

        donationCount++;
        donations[donationCount] = Donation(
            msg.sender,
            0,
            "RECYCLING",
            description,
            block.timestamp,
            true,
            0,
            weightInKg
        );

        if (rewardAmount > 0) {
            thriftToken.mintReward(msg.sender, rewardAmount);
        }

        emit RecyclingRegistered(
            donationCount,
            msg.sender,
            weightInKg,
            rewardAmount
        );
    }

    function updateRewardRates(
        uint256 _clothingItemRewardNumerator,
        uint256 _clothingItemRewardDenominator,
        uint256 _clothingWeightRewardNumerator,
        uint256 _clothingWeightRewardDenominator,
        uint256 _recyclingRewardNumerator,
        uint256 _recyclingRewardDenominator,
        uint256 _maxDonationReward
    ) external onlyOwner {
        require(_clothingItemRewardDenominator > 0, "Invalid item denominator");
        require(
            _clothingWeightRewardDenominator > 0,
            "Invalid weight denominator"
        );
        require(
            _recyclingRewardDenominator > 0,
            "Invalid recycling denominator"
        );

        clothingItemRewardNumerator = _clothingItemRewardNumerator;
        clothingItemRewardDenominator = _clothingItemRewardDenominator;
        clothingWeightRewardNumerator = _clothingWeightRewardNumerator;
        clothingWeightRewardDenominator = _clothingWeightRewardDenominator;
        recyclingRewardNumerator = _recyclingRewardNumerator;
        recyclingRewardDenominator = _recyclingRewardDenominator;
        maxDonationReward = _maxDonationReward;
    }
}