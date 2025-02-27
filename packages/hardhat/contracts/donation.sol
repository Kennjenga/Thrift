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
        bool isDonation; // Added isDonation field
        address owner;
        uint256 totalDonationsReceived;
        uint256 totalRecyclingReceived;
        uint256 totalTokenDonationsReceived;
        uint256[] tokenDonationIds; // Track token donation IDs for this center
        uint256[] clothingDonationIds; // Track clothing donation IDs for this center
        uint256[] recyclingDonationIds; // Track recycling donation IDs for this center
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
    mapping(uint256 => uint256[]) private centerPendingDonations; // Track pending donations by center
    uint256 public donationCenterCount;
    uint256 public pendingDonationCount;
    uint256 public approvedDonationCount;

    // Donation expiry period in seconds (2 days = 172800 seconds)
    uint256 public constant DONATION_EXPIRY_PERIOD = 2 days;

    // Reward constants
    uint256 public constant REWARD_BASE = 10 ** 18;
    uint256 public clothingItemRewardNumerator = REWARD_BASE;
    uint256 public clothingItemRewardDenominator = 15;
    uint256 public clothingWeightRewardNumerator = REWARD_BASE;
    uint256 public clothingWeightRewardDenominator = 10;
    uint256 public recyclingRewardNumerator = REWARD_BASE;
    uint256 public recyclingRewardDenominator = 30;
    uint256 public maxDonationReward = 200 * 10 ** 18; // 200 tokens

    // address[] private approvedCreatorsList;
    // mapping(address => uint256) private creatorIndexes;

    // Events
    event DonationCenterAdded(
        uint256 indexed id,
        string name,
        string location,
        address owner,
        bool isDonation
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
    event DonationExpired(
        uint256 indexed pendingDonationId,
        uint256 indexed centerId,
        address indexed donor
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

    // Helper function to check if a donation is expired
    function isDonationExpired(uint256 donationId) public view returns (bool) {
        PendingDonation storage donation = pendingDonations[donationId];

        // If the donation is already processed, it's not considered expired
        if (donation.isProcessed) {
            return false;
        }

        return (block.timestamp - donation.timestamp) > DONATION_EXPIRY_PERIOD;
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

    //     function approveCreator(address creator) external onlyOwner {
    //     // Check if not already approved
    //     if (!approvedCreators[creator]) {
    //         approvedCreators[creator] = true;
    //         creatorIndexes[creator] = approvedCreatorsList.length;
    //         approvedCreatorsList.push(creator);
    //         emit CreatorApproved(creator);
    //     }
    // }

    // // Replace your revokeCreator function with:
    // function revokeCreator(address creator) external onlyOwner {
    //     if (approvedCreators[creator]) {
    //         uint256 indexToRemove = creatorIndexes[creator];
    //         uint256 lastIndex = approvedCreatorsList.length - 1;

    //         // Only process if creator is actually in the array
    //         if (indexToRemove < approvedCreatorsList.length) {
    //             // Swap with the last element if not already the last
    //             if (indexToRemove != lastIndex) {
    //                 address lastCreator = approvedCreatorsList[lastIndex];
    //                 approvedCreatorsList[indexToRemove] = lastCreator;
    //                 creatorIndexes[lastCreator] = indexToRemove;
    //             }

    //             // Remove the last element (which is now the element we wanted to remove)
    //             approvedCreatorsList.pop();

    //             // Remove from mapping
    //             delete creatorIndexes[creator];
    //         }

    //         approvedCreators[creator] = false;
    //         emit CreatorRevoked(creator);
    //     }
    // }

    // // Add this new function to get the list of approved creators
    // function getApprovedCreatorsList() external view returns (address[] memory) {
    //     // Create a new array containing only current approved creators
    //     uint256 approvedCount = 0;

    //     // First, count how many creators are actually approved
    //     for (uint256 i = 0; i < approvedCreatorsList.length; i++) {
    //         if (approvedCreators[approvedCreatorsList[i]]) {
    //             approvedCount++;
    //         }
    //     }

    //     // Then create an array of exactly that size
    //     address[] memory activeCreators = new address[](approvedCount);

    //     // Fill the array with approved creators
    //     uint256 index = 0;
    //     for (uint256 i = 0; i < approvedCreatorsList.length; i++) {
    //         address creator = approvedCreatorsList[i];
    //         if (approvedCreators[creator]) {
    //             activeCreators[index] = creator;
    //             index++;
    //         }
    //     }

    //     return activeCreators;
    // }

    // Donation center management functions
    function addDonationCenter(
        string memory name,
        string memory description,
        string memory location,
        bool acceptsTokens,
        bool acceptsRecycling,
        bool isDonation
    ) external onlyApprovedCreator {
        donationCenterCount++;

        // Initialize empty arrays for donation IDs
        uint256[] memory emptyArray = new uint256[](0);

        donationCenters[donationCenterCount] = DonationCenter(
            name,
            description,
            location,
            true,
            acceptsTokens,
            acceptsRecycling,
            isDonation,
            msg.sender,
            0,
            0,
            0,
            emptyArray, // tokenDonationIds
            emptyArray, // clothingDonationIds
            emptyArray // recyclingDonationIds
        );

        emit DonationCenterAdded(
            donationCenterCount,
            name,
            location,
            msg.sender,
            isDonation
        );
    }

    function updateDonationCenter(
        uint256 centerId,
        bool isActive,
        bool acceptsTokens,
        bool acceptsRecycling,
        bool isDonation
    ) external onlyCenterOwner(centerId) {
        require(centerId <= donationCenterCount, "Invalid center ID");

        DonationCenter storage center = donationCenters[centerId];
        center.isActive = isActive;
        center.acceptsTokens = acceptsTokens;
        center.acceptsRecycling = acceptsRecycling;
        center.isDonation = isDonation;

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
            donationCenters[centerId].isDonation,
            "Center doesn't accept donations"
        );
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
        centerPendingDonations[centerId].push(pendingDonationCount);

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
        centerPendingDonations[centerId].push(pendingDonationCount);

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

        // Add to the center's token donation IDs array
        donationCenters[centerId].tokenDonationIds.push(approvedDonationCount);

        emit TokenDonationRegistered(
            approvedDonationCount,
            centerId,
            msg.sender,
            tokenAmount
        );
    }

    // Function to handle expired donations
    function expireDonation(uint256 pendingDonationId) external {
        require(
            pendingDonationId <= pendingDonationCount,
            "Invalid pending donation ID"
        );
        PendingDonation storage pending = pendingDonations[pendingDonationId];
        require(!pending.isProcessed, "Donation already processed");
        require(isDonationExpired(pendingDonationId), "Donation not expired");

        pending.isProcessed = true;
        pending.isApproved = false;

        emit DonationExpired(
            pendingDonationId,
            pending.centerId,
            pending.donor
        );
    }

    // Function to batch expire multiple donations
    function batchExpireDonations(
        uint256[] calldata pendingDonationIds
    ) external {
        for (uint256 i = 0; i < pendingDonationIds.length; i++) {
            uint256 donationId = pendingDonationIds[i];

            // Skip if donation ID is invalid or already processed or not expired
            if (
                donationId > pendingDonationCount ||
                pendingDonations[donationId].isProcessed ||
                !isDonationExpired(donationId)
            ) {
                continue;
            }

            PendingDonation storage pending = pendingDonations[donationId];
            pending.isProcessed = true;
            pending.isApproved = false;

            emit DonationExpired(donationId, pending.centerId, pending.donor);
        }
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
        require(!isDonationExpired(pendingDonationId), "Donation expired");

        pending.isApproved = true;
        pending.isProcessed = true;
        pending.itemCount = verifiedItemCount;
        pending.weightInKg = verifiedWeightInKg;

        // Calculate and issue reward
        uint256 rewardAmount;
        approvedDonationCount++;

        if (pending.isRecycling) {
            rewardAmount = calculateRecyclingReward(verifiedWeightInKg);
            donationCenters[pending.centerId]
                .totalRecyclingReceived += verifiedWeightInKg;

            approvedDonations[approvedDonationCount] = pending;
            userDonations[pending.donor].push(approvedDonationCount);

            // Add to the center's recycling donations list
            donationCenters[pending.centerId].recyclingDonationIds.push(
                approvedDonationCount
            );

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

            approvedDonations[approvedDonationCount] = pending;
            userDonations[pending.donor].push(approvedDonationCount);

            // Add to the center's clothing donations list
            donationCenters[pending.centerId].clothingDonationIds.push(
                approvedDonationCount
            );

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
        require(!isDonationExpired(pendingDonationId), "Donation expired");

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

    // Function to get the latest token donations for a center (up to 10)
    function getLatestTokenDonations(
        uint256 centerId
    ) external view returns (PendingDonation[] memory) {
        require(centerId <= donationCenterCount, "Invalid center ID");

        uint256[] storage tokenDonationIds = donationCenters[centerId]
            .tokenDonationIds;
        uint256 donationCount = tokenDonationIds.length;

        // Determine how many donations to return (up to 10)
        uint256 resultCount = donationCount > 10 ? 10 : donationCount;

        // Create result array
        PendingDonation[] memory result = new PendingDonation[](resultCount);

        // Fill with the latest donations (most recent first)
        for (uint256 i = 0; i < resultCount; i++) {
            // Get donation from the end of the array (newest donations)
            uint256 donationId = tokenDonationIds[donationCount - 1 - i];
            result[i] = approvedDonations[donationId];
        }

        return result;
    }

    // Function to get all inactive centers owned by the caller
    function getOwnerInactiveCenters()
        external
        view
        returns (DonationCenter[] memory)
    {
        // Count the number of inactive centers owned by the caller
        uint256 ownedInactiveCount = 0;

        for (uint256 i = 1; i <= donationCenterCount; i++) {
            if (
                donationCenters[i].owner == msg.sender &&
                !donationCenters[i].isActive
            ) {
                ownedInactiveCount++;
            }
        }

        // Create array to hold the inactive centers
        DonationCenter[] memory inactiveCenters = new DonationCenter[](
            ownedInactiveCount
        );

        // Fill the array with inactive centers
        uint256 index = 0;
        for (uint256 i = 1; i <= donationCenterCount; i++) {
            if (
                donationCenters[i].owner == msg.sender &&
                !donationCenters[i].isActive
            ) {
                inactiveCenters[index] = donationCenters[i];
                index++;
            }
        }

        return inactiveCenters;
    }

    // Function to get all inactive center IDs owned by the caller
    function getOwnerInactiveCenterIds()
        external
        view
        returns (uint256[] memory)
    {
        // Count the number of inactive centers owned by the caller
        uint256 ownedInactiveCount = 0;

        for (uint256 i = 1; i <= donationCenterCount; i++) {
            if (
                donationCenters[i].owner == msg.sender &&
                !donationCenters[i].isActive
            ) {
                ownedInactiveCount++;
            }
        }

        // Create array to hold the inactive center IDs
        uint256[] memory inactiveCenterIds = new uint256[](ownedInactiveCount);

        // Fill the array with inactive center IDs
        uint256 index = 0;
        for (uint256 i = 1; i <= donationCenterCount; i++) {
            if (
                donationCenters[i].owner == msg.sender &&
                !donationCenters[i].isActive
            ) {
                inactiveCenterIds[index] = i;
                index++;
            }
        }

        return inactiveCenterIds;
    }

    // Function to get the latest clothing donations for a center (up to 10)
    function getLatestClothingDonations(
        uint256 centerId
    ) external view returns (PendingDonation[] memory) {
        require(centerId <= donationCenterCount, "Invalid center ID");

        uint256[] storage clothingDonationIds = donationCenters[centerId]
            .clothingDonationIds;
        uint256 donationCount = clothingDonationIds.length;

        // Determine how many donations to return (up to 10)
        uint256 resultCount = donationCount > 10 ? 10 : donationCount;

        // Create result array
        PendingDonation[] memory result = new PendingDonation[](resultCount);

        // Fill with the latest donations (most recent first)
        for (uint256 i = 0; i < resultCount; i++) {
            // Get donation from the end of the array (newest donations)
            uint256 donationId = clothingDonationIds[donationCount - 1 - i];
            result[i] = approvedDonations[donationId];
        }

        return result;
    }

    // Function to get the latest recycling donations for a center (up to 10)
    function getLatestRecyclingDonations(
        uint256 centerId
    ) external view returns (PendingDonation[] memory) {
        require(centerId <= donationCenterCount, "Invalid center ID");

        uint256[] storage recyclingDonationIds = donationCenters[centerId]
            .recyclingDonationIds;
        uint256 donationCount = recyclingDonationIds.length;

        // Determine how many donations to return (up to 10)
        uint256 resultCount = donationCount > 10 ? 10 : donationCount;

        // Create result array
        PendingDonation[] memory result = new PendingDonation[](resultCount);

        // Fill with the latest donations (most recent first)
        for (uint256 i = 0; i < resultCount; i++) {
            // Get donation from the end of the array (newest donations)
            uint256 donationId = recyclingDonationIds[donationCount - 1 - i];
            result[i] = approvedDonations[donationId];
        }

        return result;
    }

    // Getter functions for transparency and frontend integration
    function getAllActiveCenters()
        external
        view
        returns (DonationCenter[] memory)
    {
        DonationCenter[] memory activeCenters = new DonationCenter[](
            donationCenterCount
        );
        uint256 activeCount = 0;

        for (uint256 i = 1; i <= donationCenterCount; i++) {
            if (donationCenters[i].isActive) {
                activeCenters[activeCount] = donationCenters[i];
                activeCount++;
            }
        }

        // Create properly sized array
        DonationCenter[] memory result = new DonationCenter[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeCenters[i];
        }

        return result;
    }

    function getDonationCenterById(
        uint256 centerId
    ) external view returns (DonationCenter memory) {
        require(
            centerId > 0 && centerId <= donationCenterCount,
            "Invalid center ID"
        );
        return donationCenters[centerId];
    }

    // Function to get a donation center by ID with individual fields
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
            bool isDonation,
            address owner,
            uint256 totalDonationsReceived,
            uint256 totalRecyclingReceived,
            uint256 totalTokenDonationsReceived
        )
    {
        require(
            centerId > 0 && centerId <= donationCenterCount,
            "Invalid center ID"
        );
        DonationCenter storage center = donationCenters[centerId];
        return (
            center.name,
            center.description,
            center.location,
            center.isActive,
            center.acceptsTokens,
            center.acceptsRecycling,
            center.isDonation,
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

    function getCenterPendingDonations(
        uint256 centerId
    ) external view returns (uint256[] memory) {
        require(centerId <= donationCenterCount, "Invalid center ID");
        return centerPendingDonations[centerId];
    }

    // Get active pending donations for a center (not expired, not processed)
    function getActiveCenterPendingDonations(
        uint256 centerId
    ) external view returns (uint256[] memory) {
        require(centerId <= donationCenterCount, "Invalid center ID");

        uint256[] memory allCenterDonations = centerPendingDonations[centerId];

        // First count active donations
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allCenterDonations.length; i++) {
            uint256 donationId = allCenterDonations[i];
            if (
                !pendingDonations[donationId].isProcessed &&
                !isDonationExpired(donationId)
            ) {
                activeCount++;
            }
        }

        // Create result array with correct size
        uint256[] memory activeDonations = new uint256[](activeCount);

        // Fill array with active donation IDs
        uint256 index = 0;
        for (uint256 i = 0; i < allCenterDonations.length; i++) {
            uint256 donationId = allCenterDonations[i];
            if (
                !pendingDonations[donationId].isProcessed &&
                !isDonationExpired(donationId)
            ) {
                activeDonations[index] = donationId;
                index++;
            }
        }

        return activeDonations;
    }

    function getDonationById(
        uint256 donationId,
        bool isApproved
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
            bool _isApproved,
            bool isProcessed
        )
    {
        PendingDonation storage donation = isApproved
            ? approvedDonations[donationId]
            : pendingDonations[donationId];
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
