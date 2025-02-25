// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ThriftToken} from "./thrift.sol";
import {UserAesthetics} from "./userAesthetics.sol";

/**
 * @title MarketplaceBase
 * @dev Base contract with core state variables, structs, and basic functionality
 */
contract MarketplaceBase is ReentrancyGuard {
    using Counters for Counters.Counter;

    // Core state variables
    ThriftToken public thriftToken;
    UserAesthetics public userAesthetics;
    address public treasuryWallet;

    // Counters for IDs
    Counters.Counter internal _productIds;
    Counters.Counter internal _escrowIds;

    // Constants
    uint256 public tokenPlatformFee = 35; // 3.5% total platform fee
    uint256 public ethPlatformFee = 35; // 3.5% total platform fee
    uint256 public constant BURN_PERCENTAGE = 60;
    uint256 public constant TREASURY_PERCENTAGE = 40;
    uint256 public constant SPENDING_REWARD_PERCENTAGE = 20;
    uint256 public constant MAX_ESCROW_DURATION = 5 days;
    uint256 public constant MAX_BULK_PURCHASE = 50;

    // Structs
    struct Product {
        uint256 id;
        address seller;
        uint256 tokenPrice;
        uint256 ethPrice;
        uint256 quantity;
        string name;
        string description;
        string size;
        string condition;
        string brand;
        string[] categories;
        string gender;
        string image;
        bool isAvailableForExchange;
        string exchangePreference;
        bool isSold;
        bool isDeleted;
        uint256 inEscrowQuantity;
    }

    struct ProductWithAvailability {
        uint256 id;
        address seller;
        uint256 tokenPrice;
        uint256 ethPrice;
        uint256 totalQuantity;
        uint256 availableQuantity;
        string name;
        string description;
        string size;
        string condition;
        string brand;
        string[] categories;
        string gender;
        string image;
        bool isAvailableForExchange;
        string exchangePreference;
        bool isSold;
        bool isDeleted;
        uint256 inEscrowQuantity;
    }

    struct Escrow {
        uint256 escrowId;
        uint256 productId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 deadline;
        uint256 quantity;
        bool buyerConfirmed;
        bool sellerConfirmed;
        bool completed;
        bool refunded;
        bool isToken;
        bool isExchange;
        uint256 exchangeProductId;
        uint256 tokenTopUp;
    }

    struct ExchangeOffer {
        uint256 offeredProductId;
        uint256 wantedProductId;
        address offerer;
        bool isActive;
        uint256 tokenTopUp;
        uint256 escrowId;
    }

    struct UserEscrowTracking {
        uint256[] activeEscrows;
        uint256[] completedEscrows;
    }

    struct SearchParams {
        string nameQuery;
        string[] categories;
        string brand;
        string condition;
        string gender;
        string size;
        uint256 minPrice;
        uint256 maxPrice;
        bool onlyAvailable;
        bool exchangeOnly;
        uint256 page;
        uint256 pageSize;
    }

    struct SearchResult {
        ProductWithAvailability[] products;
        uint256 totalResults;
        uint256 totalPages;
        uint256 currentPage;
    }

    // Mappings
    mapping(uint256 => Product) public products;
    mapping(uint256 => Escrow) public escrows;
    mapping(address => uint256[]) public userProducts;
    mapping(string => uint256[]) public categoryToProducts;
    mapping(uint256 => ExchangeOffer[]) public exchangeOffers;
    mapping(address => UserEscrowTracking) internal userEscrowInfos;
    mapping(address => mapping(uint256 => uint256))
        internal escrowToActiveIndex;

    // Pause state
    bool public isPaused;

    // Events
    event ProductCreated(
        uint256 indexed productId,
        address indexed seller,
        string[] categories,
        uint256 quantity,
        uint256 tokenPrice,
        uint256 ethPrice
    );

    event ProductUpdated(
        uint256 indexed productId,
        address indexed seller,
        string[] categories,
        uint256 quantity,
        uint256 tokenPrice,
        uint256 ethPrice
    );

    event ProductMarkedSold(uint256 indexed productId, address indexed seller);

    event QuantityUpdate(
        uint256 indexed productId,
        uint256 newTotal,
        uint256 newAvailable
    );

    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed productId,
        address indexed buyer,
        address seller,
        uint256 quantity,
        uint256 amount,
        bool isToken
    );

    event BulkEscrowCreated(
        uint256 indexed firstEscrowId,
        uint256 count,
        address indexed buyer,
        uint256 totalAmount,
        bool isToken
    );

    event EscrowConfirmed(
        uint256 indexed escrowId,
        address indexed confirmer,
        bool isBuyer
    );

    event EscrowCompleted(
        uint256 indexed escrowId,
        uint256 indexed productId,
        uint256 quantity,
        uint256 amount
    );

    event EscrowRefunded(
        uint256 indexed escrowId,
        address indexed buyer,
        uint256 amount
    );

    event ExchangeOfferCreated(
        uint256 indexed offeredProductId,
        uint256 indexed wantedProductId,
        address indexed offerer,
        uint256 tokenTopUp,
        uint256 escrowId
    );

    event ExchangeCompleted(
        uint256 indexed offeredProductId,
        uint256 indexed wantedProductId,
        address party1,
        address party2,
        uint256 tokenTopUp
    );

    event EscrowRejected(
        uint256 indexed escrowId,
        address indexed rejector,
        string reason
    );

    event EscrowCancelled(uint256 indexed escrowId, address indexed canceller);

    event PlatformFeesUpdated(uint256 newTokenFee, uint256 newEthFee);
    event TreasuryWalletUpdated(address newTreasury);
    event UserAestheticsUpdated(address newUserAesthetics);

    /**
     * @dev Contract constructor
     */
    constructor(
        address payable _thriftToken,
        address _userAesthetics,
        address payable _treasuryWallet
    ) {
        require(_thriftToken != address(0), "Invalid token address");
        require(_userAesthetics != address(0), "Invalid aesthetics address");
        require(_treasuryWallet != address(0), "Invalid treasury address");

        thriftToken = ThriftToken(_thriftToken);
        userAesthetics = UserAesthetics(_userAesthetics);
        treasuryWallet = _treasuryWallet;
    }

    // Modifiers
    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    /**
     * @dev Helper to convert Product to ProductWithAvailability
     */
    function _convertToProductWithAvailability(
        Product storage product
    ) internal view returns (ProductWithAvailability memory) {
        return
            ProductWithAvailability({
                id: product.id,
                seller: product.seller,
                tokenPrice: product.tokenPrice,
                ethPrice: product.ethPrice,
                totalQuantity: product.quantity,
                availableQuantity: product.quantity - product.inEscrowQuantity,
                name: product.name,
                description: product.description,
                size: product.size,
                condition: product.condition,
                brand: product.brand,
                categories: product.categories,
                gender: product.gender,
                image: product.image,
                isAvailableForExchange: product.isAvailableForExchange,
                exchangePreference: product.exchangePreference,
                isSold: product.isSold,
                isDeleted: product.isDeleted,
                inEscrowQuantity: product.inEscrowQuantity
            });
    }

    /**
     * @dev Checks if product has no available quantity and marks it as sold
     */
    function _checkAndMarkProductSold(uint256 productId) internal {
        Product storage product = products[productId];
        if (
            product.quantity - product.inEscrowQuantity == 0 && !product.isSold
        ) {
            product.isSold = true;
            emit ProductMarkedSold(productId, product.seller);
        }
    }

    /**
     * @dev Updates product quantities after sale completion
     */
    function _completeQuantitySale(
        uint256 productId,
        uint256 quantity
    ) internal {
        Product storage product = products[productId];
        require(product.quantity >= quantity, "Invalid quantity");

        unchecked {
            product.quantity -= quantity;
            product.inEscrowQuantity -= quantity;
        }

        if (product.quantity == 0) {
            product.isSold = true;
            emit ProductMarkedSold(productId, product.seller);
        }

        emit QuantityUpdate(
            productId,
            product.quantity,
            product.quantity - product.inEscrowQuantity
        );
    }

    /**
     * @dev Calculates available quantity for a product
     */
    function getAvailableQuantity(
        uint256 productId
    ) public view returns (uint256) {
        Product storage product = products[productId];
        if (product.isDeleted || product.isSold) {
            return 0;
        }
        return product.quantity - product.inEscrowQuantity;
    }

    /**
     * @dev Helper to check if a string parameter is non-empty and different from product value
     */
    function _nonEmptyAndDifferent(
        string memory param,
        string memory productValue
    ) internal pure returns (bool) {
        return
            bytes(param).length > 0 &&
            keccak256(bytes(productValue)) != keccak256(bytes(param));
    }

    // Receive and fallback functions
    receive() external payable {}
    fallback() external payable {}
}
