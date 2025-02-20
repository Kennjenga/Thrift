// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ThriftToken} from "./thrift.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DonationAndRecycling is Ownable, ReentrancyGuard {
    ThriftToken public thriftToken;

    // Mapping for approved center creators
    mapping(address => bool) public approvedCreators;

    struct DonationCenter {
        string name;
        string description;
        string location;
        bool isActive;
        bool acceptsTokens;
        bool acceptsRecycling;
        address owner;
        uint256 totalDonationsReceived;
        uint256 totalRecyclingReceived;
        uint256 totalTokenDonationsReceived;
    }

    struct PendingDonation {
        address donor;
        uint256 itemCount;
        string itemType;
        string description;
        uint256 timestamp;
        bool isRecycling;
        uint256 tokenAmount; // For token donations
        uint256 weightInKg;
        bool isTokenDonation; // Track token donations
        uint256 centerId; // Track which center received the donation
        bool isApproved; // Track approval status
        bool isProcessed; // Track if donation has been processed
    }

    mapping(uint256 => DonationCenter) public donationCenters;
    mapping(uint256 => PendingDonation) public pendingDonations;
    mapping(uint256 => PendingDonation) public approvedDonations;
    mapping(address => uint256[]) public userDonations; // Track approved donations by user
    mapping(address => uint256[]) public userPendingDonations; // Track pending donations by user
    uint256 public donationCenterCount;
    uint256 public pendingDonationCount;
    uint256 public approvedDonationCount;

    // Reward constants
    uint256 public constant REWARD_BASE = 10 ** 18;
    uint256 public clothingItemRewardNumerator = REWARD_BASE;
    uint256 public clothingItemRewardDenominator = 15;
    uint256 public clothingWeightRewardNumerator = REWARD_BASE;
    uint256 public clothingWeightRewardDenominator = 10;
    uint256 public recyclingRewardNumerator = REWARD_BASE;
    uint256 public recyclingRewardDenominator = 30;
    uint256 public maxDonationReward = 200 * 10 ** 18; // 200 tokens

    // Events
    event DonationCenterAdded(
        uint256 indexed id,
        string name,
        string location,
        address owner
    );
    event DonationCenterUpdated(uint256 indexed id, bool isActive);
    event DonationSubmitted(
        uint256 indexed pendingDonationId,
        uint256 indexed centerId,
        address indexed donor
    );
    event DonationApproved(
        uint256 indexed pendingDonationId,
        uint256 indexed approvedDonationId,
        address indexed approver
    );
    event DonationRejected(
        uint256 indexed pendingDonationId,
        address indexed rejector,
        string reason
    );
    event DonationRegistered(
        uint256 indexed donationId,
        uint256 indexed centerId,
        address indexed donor,
        uint256 itemCount,
        uint256 weightInKg,
        uint256 rewardAmount
    );
    event TokenDonationRegistered(
        uint256 indexed donationId,
        uint256 indexed centerId,
        address indexed donor,
        uint256 tokenAmount
    );
    event RecyclingRegistered(
        uint256 indexed donationId,
        uint256 indexed centerId,
        address indexed donor,
        uint256 weightInKg,
        uint256 rewardAmount
    );
    event CreatorApproved(address indexed creator);
    event CreatorRevoked(address indexed creator);
    event DonationCenterOwnershipTransferred(
        uint256 indexed centerId,
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor(address payable _thriftTokenAddress) {
        _transferOwnership(msg.sender);
        thriftToken = ThriftToken(_thriftTokenAddress);
        approvedCreators[msg.sender] = true;
        emit CreatorApproved(msg.sender);
    }

    // Modifiers
    modifier onlyApprovedCreator() {
        require(approvedCreators[msg.sender], "Not approved to create centers");
        _;
    }

    modifier onlyCenterOwner(uint256 centerId) {
        require(
            donationCenters[centerId].owner == msg.sender,
            "Not center owner"
        );
        _;
    }

    // Creator management functions
    function approveCreator(address creator) external onlyOwner {
        approvedCreators[creator] = true;
        emit CreatorApproved(creator);
    }

    function revokeCreator(address creator) external onlyOwner {
        approvedCreators[creator] = false;
        emit CreatorRevoked(creator);
    }

    // Donation center management functions
    function addDonationCenter(
        string memory name,
        string memory description,
        string memory location,
        bool acceptsTokens,
        bool acceptsRecycling
    ) external onlyApprovedCreator {
        donationCenterCount++;
        donationCenters[donationCenterCount] = DonationCenter(
            name,
            description,
            location,
            true,
            acceptsTokens,
            acceptsRecycling,
            msg.sender,
            0,
            0,
            0
        );

        emit DonationCenterAdded(
            donationCenterCount,
            name,
            location,
            msg.sender
        );
    }

    function updateDonationCenter(
        uint256 centerId,
        bool isActive,
        bool acceptsTokens,
        bool acceptsRecycling
    ) external onlyCenterOwner(centerId) {
        require(centerId <= donationCenterCount, "Invalid center ID");

        DonationCenter storage center = donationCenters[centerId];
        center.isActive = isActive;
        center.acceptsTokens = acceptsTokens;
        center.acceptsRecycling = acceptsRecycling;

        emit DonationCenterUpdated(centerId, isActive);
    }

    function transferCenterOwnership(
        uint256 centerId,
        address newOwner
    ) external onlyCenterOwner(centerId) {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(centerId <= donationCenterCount, "Invalid center ID");

        address previousOwner = donationCenters[centerId].owner;
        donationCenters[centerId].owner = newOwner;

        emit DonationCenterOwnershipTransferred(
            centerId,
            previousOwner,
            newOwner
        );
    }

    // Donation submission functions
    function submitDonation(
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

        pendingDonationCount++;
        pendingDonations[pendingDonationCount] = PendingDonation({
            donor: msg.sender,
            itemCount: itemCount,
            itemType: itemType,
            description: description,
            timestamp: block.timestamp,
            isRecycling: false,
            tokenAmount: 0,
            weightInKg: weightInKg,
            isTokenDonation: false,
            centerId: centerId,
            isApproved: false,
            isProcessed: false
        });

        userPendingDonations[msg.sender].push(pendingDonationCount);

        emit DonationSubmitted(pendingDonationCount, centerId, msg.sender);
    }

    function submitRecycling(
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

        pendingDonationCount++;
        pendingDonations[pendingDonationCount] = PendingDonation({
            donor: msg.sender,
            itemCount: 0,
            itemType: "RECYCLING",
            description: description,
            timestamp: block.timestamp,
            isRecycling: true,
            tokenAmount: 0,
            weightInKg: weightInKg,
            isTokenDonation: false,
            centerId: centerId,
            isApproved: false,
            isProcessed: false
        });

        userPendingDonations[msg.sender].push(pendingDonationCount);

        emit DonationSubmitted(pendingDonationCount, centerId, msg.sender);
    }

    function donateTokens(
        uint256 centerId,
        uint256 tokenAmount
    ) external nonReentrant {
        require(centerId <= donationCenterCount, "Invalid center ID");
        require(donationCenters[centerId].isActive, "Center not active");
        require(
            donationCenters[centerId].acceptsTokens,
            "Center doesn't accept tokens"
        );
        require(tokenAmount > 0, "Token amount must be greater than 0");

        require(
            thriftToken.transferFrom(
                msg.sender,
                donationCenters[centerId].owner,
                tokenAmount
            ),
            "Token transfer failed"
        );

        approvedDonationCount++;
        approvedDonations[approvedDonationCount] = PendingDonation({
            donor: msg.sender,
            itemCount: 0,
            itemType: "TOKEN_DONATION",
            description: "Token Donation",
            timestamp: block.timestamp,
            isRecycling: false,
            tokenAmount: tokenAmount,
            weightInKg: 0,
            isTokenDonation: true,
            centerId: centerId,
            isApproved: true,
            isProcessed: true
        });

        userDonations[msg.sender].push(approvedDonationCount);
        donationCenters[centerId].totalTokenDonationsReceived += tokenAmount;

        emit TokenDonationRegistered(
            approvedDonationCount,
            centerId,
            msg.sender,
            tokenAmount
        );
    }

    // Donation approval functions
    function approveDonation(
        uint256 pendingDonationId,
        uint256 verifiedItemCount,
        uint256 verifiedWeightInKg
    )
        external
        nonReentrant
        onlyCenterOwner(pendingDonations[pendingDonationId].centerId)
    {
        require(
            pendingDonationId <= pendingDonationCount,
            "Invalid pending donation ID"
        );
        PendingDonation storage pending = pendingDonations[pendingDonationId];
        require(!pending.isProcessed, "Donation already processed");
        require(!pending.isTokenDonation, "Cannot approve token donations");

        pending.isApproved = true;
        pending.isProcessed = true;
        pending.itemCount = verifiedItemCount;
        pending.weightInKg = verifiedWeightInKg;

        // Calculate and issue reward
        uint256 rewardAmount;
        if (pending.isRecycling) {
            rewardAmount = calculateRecyclingReward(verifiedWeightInKg);
            donationCenters[pending.centerId]
                .totalRecyclingReceived += verifiedWeightInKg;

            approvedDonationCount++;
            approvedDonations[approvedDonationCount] = pending;
            userDonations[pending.donor].push(approvedDonationCount);

            emit RecyclingRegistered(
                approvedDonationCount,
                pending.centerId,
                pending.donor,
                verifiedWeightInKg,
                rewardAmount
            );
        } else {
            rewardAmount = calculateClothingReward(
                verifiedItemCount,
                verifiedWeightInKg
            );
            donationCenters[pending.centerId].totalDonationsReceived++;

            approvedDonationCount++;
            approvedDonations[approvedDonationCount] = pending;
            userDonations[pending.donor].push(approvedDonationCount);

            emit DonationRegistered(
                approvedDonationCount,
                pending.centerId,
                pending.donor,
                verifiedItemCount,
                verifiedWeightInKg,
                rewardAmount
            );
        }

        if (rewardAmount > 0) {
            thriftToken.mintReward(pending.donor, rewardAmount);
        }

        emit DonationApproved(
            pendingDonationId,
            approvedDonationCount,
            msg.sender
        );
    }

    function rejectDonation(
        uint256 pendingDonationId,
        string memory reason
    ) external onlyCenterOwner(pendingDonations[pendingDonationId].centerId) {
        require(
            pendingDonationId <= pendingDonationCount,
            "Invalid pending donation ID"
        );
        PendingDonation storage pending = pendingDonations[pendingDonationId];
        require(!pending.isProcessed, "Donation already processed");

        pending.isProcessed = true;
        pending.isApproved = false;

        emit DonationRejected(pendingDonationId, msg.sender, reason);
    }

    // Reward calculation functions
    function calculateClothingReward(
        uint256 itemCount,
        uint256 weightInKg
    ) public view returns (uint256) {
        uint256 itemBasedReward = (itemCount * clothingItemRewardNumerator) /
            clothingItemRewardDenominator;
        uint256 weightBasedReward = (weightInKg *
            clothingWeightRewardNumerator) / clothingWeightRewardDenominator;
        uint256 reward = itemBasedReward > weightBasedReward
            ? itemBasedReward
            : weightBasedReward;
        return reward > maxDonationReward ? maxDonationReward : reward;
    }

    function calculateRecyclingReward(
        uint256 weightInKg
    ) public view returns (uint256) {
        uint256 reward = (weightInKg * recyclingRewardNumerator) /
            recyclingRewardDenominator;
        return reward > maxDonationReward ? maxDonationReward : reward;
    }

    // Reward rate management
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

    // Getter functions for transparency and frontend integration
    function getDonationCenter(
        uint256 centerId
    )
        external
        view
        returns (
            string memory name,
            string memory description,
            string memory location,
            bool isActive,
            bool acceptsTokens,
            bool acceptsRecycling,
            address owner,
            uint256 totalDonationsReceived,
            uint256 totalRecyclingReceived,
            uint256 totalTokenDonationsReceived
        )
    {
        DonationCenter storage center = donationCenters[centerId];
        return (
            center.name,
            center.description,
            center.location,
            center.isActive,
            center.acceptsTokens,
            center.acceptsRecycling,
            center.owner,
            center.totalDonationsReceived,
            center.totalRecyclingReceived,
            center.totalTokenDonationsReceived
        );
    }

    function getUserPendingDonations(
        address user
    ) external view returns (uint256[] memory) {
        return userPendingDonations[user];
    }

    function getUserApprovedDonations(
        address user
    ) external view returns (uint256[] memory) {
        return userDonations[user];
    }

    function getPendingDonation(
        uint256 donationId
    )
        external
        view
        returns (
            address donor,
            uint256 itemCount,
            string memory itemType,
            string memory description,
            uint256 timestamp,
            bool isRecycling,
            uint256 tokenAmount,
            uint256 weightInKg,
            bool isTokenDonation,
            uint256 centerId,
            bool isApproved,
            bool isProcessed
        )
    {
        PendingDonation storage donation = pendingDonations[donationId];
        return (
            donation.donor,
            donation.itemCount,
            donation.itemType,
            donation.description,
            donation.timestamp,
            donation.isRecycling,
            donation.tokenAmount,
            donation.weightInKg,
            donation.isTokenDonation,
            donation.centerId,
            donation.isApproved,
            donation.isProcessed
        );
    }

    function getApprovedDonation(
        uint256 donationId
    )
        external
        view
        returns (
            address donor,
            uint256 itemCount,
            string memory itemType,
            string memory description,
            uint256 timestamp,
            bool isRecycling,
            uint256 tokenAmount,
            uint256 weightInKg,
            bool isTokenDonation,
            uint256 centerId,
            bool isApproved,
            bool isProcessed
        )
    {
        PendingDonation storage donation = approvedDonations[donationId];
        return (
            donation.donor,
            donation.itemCount,
            donation.itemType,
            donation.description,
            donation.timestamp,
            donation.isRecycling,
            donation.tokenAmount,
            donation.weightInKg,
            donation.isTokenDonation,
            donation.centerId,
            donation.isApproved,
            donation.isProcessed
        );
    }

    // Function to get current reward rates
    function getRewardRates()
        external
        view
        returns (
            uint256 _clothingItemRewardNumerator,
            uint256 _clothingItemRewardDenominator,
            uint256 _clothingWeightRewardNumerator,
            uint256 _clothingWeightRewardDenominator,
            uint256 _recyclingRewardNumerator,
            uint256 _recyclingRewardDenominator,
            uint256 _maxDonationReward
        )
    {
        return (
            clothingItemRewardNumerator,
            clothingItemRewardDenominator,
            clothingWeightRewardNumerator,
            clothingWeightRewardDenominator,
            recyclingRewardNumerator,
            recyclingRewardDenominator,
            maxDonationReward
        );
    }
}
