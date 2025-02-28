// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the common data structures
import "./ThriftMarketplaceTypes.sol";

/**
 * External interfaces
 */
interface IThriftToken {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function burn(uint256 amount) external;
    function mint(address to, uint256 amount) external;
}

interface IUserAesthetics {
    function getUserAesthetics(
        address user
    )
        external
        view
        returns (string[] memory preferences, bool isSet, uint256 timestamp);
}

/**
 * @title IMarketplaceStorage
 * @dev Interface for the central storage contract
 */
interface IMarketplaceStorage {
    // Constants
    function MAX_BULK_PURCHASE() external view returns (uint256);
    function BURN_PERCENTAGE() external view returns (uint256);
    function TREASURY_PERCENTAGE() external view returns (uint256);
    function SPENDING_REWARD_PERCENTAGE() external view returns (uint256);

    // Config getters
    function thriftToken() external view returns (address);
    function userAesthetics() external view returns (address);
    function treasuryWallet() external view returns (address);
    function isPaused() external view returns (bool);
    function tokenPlatformFee() external view returns (uint256);
    function ethPlatformFee() external view returns (uint256);

    // Product getters
    function getProduct(
        uint256 productId
    ) external view returns (Product memory);
    function getProductWithAvailability(
        uint256 productId
    ) external view returns (ProductWithAvailability memory);
    function getUserProductIds(
        address user
    ) external view returns (uint256[] memory);
    function getProductsInCategory(
        string memory category
    ) external view returns (uint256[] memory);
    function getAvailableQuantity(
        uint256 productId
    ) external view returns (uint256);
    function getProductCount() external view returns (uint256);

    // Escrow getters
    function getEscrow(uint256 escrowId) external view returns (Escrow memory);
    function getUserEscrowTracking(
        address user
    ) external view returns (UserEscrowTracking memory);
    function getExchangeOffersForProduct(
        uint256 productId
    ) external view returns (ExchangeOffer[] memory);

    // Authorization
    function isAuthorizedContract(
        address contractAddress
    ) external view returns (bool);
    function setAuthorizedContract(
        address contractAddress,
        bool authorized
    ) external;

    // Product functions
    function createProduct(
        address seller,
        uint256 tokenPrice,
        uint256 ethPrice,
        uint256 quantity,
        string memory name,
        string memory description,
        string memory size,
        string memory condition,
        string memory brand,
        string[] memory categories,
        string memory gender,
        string memory image,
        bool isAvailableForExchange,
        string memory exchangePreference
    ) external returns (uint256);

    function updateProduct(
        uint256 productId,
        string memory name,
        string memory description,
        string memory size,
        string memory condition,
        string memory brand,
        string[] memory categories,
        string memory gender,
        string memory image,
        uint256 tokenPrice,
        uint256 ethPrice,
        bool isAvailableForExchange,
        string memory exchangePreference
    ) external;

    function updateProductQuantity(
        uint256 productId,
        uint256 newQuantity
    ) external;
    function updateInEscrowQuantity(
        uint256 productId,
        uint256 change,
        bool increase
    ) external;
    function markProductSold(uint256 productId) external;
    function markProductDeleted(uint256 productId) external;

    // Escrow functions
    function createEscrow(
        uint256 productId,
        address buyer,
        address seller,
        uint256 amount,
        uint256 quantity,
        bool isToken,
        bool isExchange,
        uint256 exchangeProductId,
        uint256 tokenTopUp
    ) external returns (uint256);

    function updateEscrowStatus(
        uint256 escrowId,
        bool buyerConfirmed,
        bool sellerConfirmed,
        bool completed,
        bool refunded
    ) external;

    function createExchangeOffer(
        uint256 offeredProductId,
        uint256 wantedProductId,
        address offerer,
        uint256 tokenTopUp,
        uint256 escrowId
    ) external;

    function addToUserActiveEscrows(address user, uint256 escrowId) external;
    function moveEscrowToCompleted(
        uint256 escrowId,
        address buyer,
        address seller
    ) external;
    function removeEscrowFromActiveList(
        uint256 escrowId,
        address buyer,
        address seller
    ) external;

    // Admin functions
    function updatePlatformFees(
        uint256 newTokenFee,
        uint256 newEthFee
    ) external;
    function updateTreasuryWallet(address newTreasury) external;
    function updateUserAesthetics(address newUserAesthetics) external;
    function togglePause() external;
    function emergencyTokenWithdraw(address token, uint256 amount) external;
    function emergencyEthWithdraw() external;
}

interface IMarketplaceProduct {
    function createProduct(
        address originalSender,
        string memory name,
        string memory description,
        string memory size,
        string memory condition,
        string memory brand,
        string[] memory categories,
        string memory gender,
        string memory image,
        uint256 tokenPrice,
        uint256 ethPrice,
        uint256 quantity,
        bool isAvailableForExchange,
        string memory exchangePreference
    ) external returns (uint256);

    function updateProduct(
        address originalSender,
        uint256 productId,
        string memory name,
        string memory description,
        string memory size,
        string memory condition,
        string memory brand,
        string[] memory categories,
        string memory gender,
        string memory image,
        uint256 tokenPrice,
        uint256 ethPrice,
        bool isAvailableForExchange,
        string memory exchangePreference
    ) external;

    function updateProductQuantity(
        address originalSender,
        uint256 productId,
        uint256 newQuantity
    ) external;

    function batchUpdateQuantities(
        address originalSender,
        uint256[] calldata productIds,
        uint256[] calldata newQuantities
    ) external;

    // View methods don't need originalSender as they don't modify state
    function getUserProducts(
        address user
    ) external view returns (ProductWithAvailability[] memory);

    function getAllActiveProducts()
        external
        view
        returns (ProductWithAvailability[] memory);
}

interface IMarketplaceEscrow {
    function createEscrowWithEth(
        address originalSender,
        uint256 productId,
        uint256 quantity
    ) external payable;

    function createEscrowWithTokens(
        address originalSender,
        uint256 productId,
        uint256 quantity
    ) external;

    function createExchangeOffer(
        address originalSender,
        uint256 offeredProductId,
        uint256 wantedProductId,
        uint256 quantity,
        uint256 tokenTopUp
    ) external;

    function createBulkEscrowWithEth(
        address originalSender,
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external payable returns (uint256[] memory);

    function createBulkEscrowWithTokens(
        address originalSender,
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external returns (uint256[] memory);

    function confirmEscrow(address originalSender, uint256 escrowId) external;
    function rejectEscrow(
        address originalSender,
        uint256 escrowId,
        string memory reason
    ) external;
    function cancelEscrow(address originalSender, uint256 escrowId) external;
    function bulkConfirmEscrowsAsBuyer(
        address originalSender,
        uint256[] calldata escrowIds
    ) external;
    function bulkConfirmEscrowsForSeller(
        address originalSender,
        uint256[] calldata escrowIds
    ) external;

    // View functions don't need the sender parameter since they don't modify state
    function getUserActiveEscrowsAsBuyer(
        address user
    ) external view returns (uint256[] memory);

    function getUserActiveEscrowsAsSeller(
        address user
    ) external view returns (uint256[] memory);

    function getUserCompletedEscrows(
        address user
    ) external view returns (uint256[] memory);

    function getExchangeOffers(
        uint256 productId
    ) external view returns (ExchangeOffer[] memory);
}

interface IMarketplaceQuery {
    function searchProducts(
        SearchParams memory params
    ) external view returns (SearchResult memory);
    function getProductsByUserAesthetics(
        address user,
        uint256 page,
        uint256 pageSize
    ) external view returns (SearchResult memory);
    function getProductsById(
        uint256[] calldata productIds
    ) external view returns (ProductWithAvailability[] memory);
}
