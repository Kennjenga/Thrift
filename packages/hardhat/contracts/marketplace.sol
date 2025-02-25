// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ThriftToken} from "./thrift.sol";
import {UserAesthetics} from "./userAesthetics.sol";

/**
 * @title Marketplace
 * @dev A decentralized marketplace for buying, selling, and exchanging products
 * with support for both ETH and token payments, escrow system, and aesthetic tracking
 */
contract Marketplace is ReentrancyGuard {
    using Counters for Counters.Counter;

    // Core state variables
    ThriftToken public thriftToken;
    UserAesthetics public userAesthetics;
    address public treasuryWallet;

    // Counters for IDs
    Counters.Counter private _productIds;
    Counters.Counter private _escrowIds;

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
    mapping(address => UserEscrowTracking) private userEscrowInfos;
    mapping(address => mapping(uint256 => uint256)) private escrowToActiveIndex;

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

    // Product Management Functions

    /**
     * @dev Creates a new product listing
     * @return uint256 ID of the created product
     */
    function createProduct(
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
    ) external whenNotPaused returns (uint256) {
        require(msg.sender != address(0), "Invalid sender address");
        require(quantity > 0, "Quantity must be positive");
        require(tokenPrice > 0 || ethPrice > 0, "Must set at least one price");
        require(
            categories.length > 0 && categories.length <= 20,
            "Invalid categories count"
        );
        require(bytes(name).length > 0, "Name required");
        require(bytes(name).length <= 100, "Name too long");
        require(bytes(description).length <= 1000, "Description too long");

        _productIds.increment();
        uint256 productId = _productIds.current();

        products[productId] = Product({
            id: productId,
            seller: msg.sender,
            tokenPrice: tokenPrice,
            ethPrice: ethPrice,
            quantity: quantity,
            name: name,
            description: description,
            size: size,
            condition: condition,
            brand: brand,
            categories: categories,
            gender: gender,
            image: image,
            isAvailableForExchange: isAvailableForExchange,
            exchangePreference: exchangePreference,
            isSold: false,
            isDeleted: false,
            inEscrowQuantity: 0
        });

        userProducts[msg.sender].push(productId);

        // Index product by categories (aesthetics)
        for (uint256 i = 0; i < categories.length; ) {
            categoryToProducts[categories[i]].push(productId);
            unchecked {
                ++i;
            }
        }

        emit ProductCreated(
            productId,
            msg.sender,
            categories,
            quantity,
            tokenPrice,
            ethPrice
        );

        return productId;
    }

    /**
     * @dev Updates an existing product
     */
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
    ) external {
        Product storage product = products[productId];
        require(product.seller == msg.sender, "Not your product");
        require(!product.isDeleted && !product.isSold, "Product not available");
        require(tokenPrice > 0 || ethPrice > 0, "Must set at least one price");
        require(
            categories.length > 0 && categories.length <= 20,
            "Invalid categories count"
        );

        // Remove from old category indices
        string[] memory oldCategories = product.categories;
        for (uint256 i = 0; i < oldCategories.length; ) {
            removeFromCategoryIndex(oldCategories[i], productId);
            unchecked {
                ++i;
            }
        }

        // Update product details
        product.name = name;
        product.description = description;
        product.size = size;
        product.condition = condition;
        product.brand = brand;
        product.categories = categories;
        product.gender = gender;
        product.image = image;
        product.tokenPrice = tokenPrice;
        product.ethPrice = ethPrice;
        product.isAvailableForExchange = isAvailableForExchange;
        product.exchangePreference = exchangePreference;

        // Add to new category indices
        for (uint256 i = 0; i < categories.length; ) {
            categoryToProducts[categories[i]].push(productId);
            unchecked {
                ++i;
            }
        }

        emit ProductUpdated(
            productId,
            msg.sender,
            categories,
            product.quantity,
            tokenPrice,
            ethPrice
        );
    }

    /**
     * @dev Updates product quantity
     */
    function updateProductQuantity(
        uint256 productId,
        uint256 newQuantity
    ) public {
        Product storage product = products[productId];
        require(product.seller == msg.sender, "Not your product");
        require(!product.isDeleted && !product.isSold, "Product not available");
        require(
            newQuantity >= product.inEscrowQuantity,
            "Cannot set below escrow quantity"
        );

        product.quantity = newQuantity;

        // Check if product is now effectively sold out
        _checkAndMarkProductSold(productId);

        emit QuantityUpdate(
            productId,
            newQuantity,
            newQuantity - product.inEscrowQuantity
        );
    }

    /**
     * @dev Batch update product quantities
     */
    function batchUpdateQuantities(
        uint256[] calldata productIds,
        uint256[] calldata newQuantities
    ) external {
        require(productIds.length == newQuantities.length, "Length mismatch");
        for (uint256 i = 0; i < productIds.length; ) {
            updateProductQuantity(productIds[i], newQuantities[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Removes product from category index
     */
    function removeFromCategoryIndex(
        string memory category,
        uint256 productId
    ) internal {
        uint256[] storage productsInCategory = categoryToProducts[category];
        uint256 length = productsInCategory.length;

        for (uint256 i = 0; i < length; ) {
            if (productsInCategory[i] == productId) {
                // Move last element to this position and pop
                if (i < length - 1) {
                    productsInCategory[i] = productsInCategory[length - 1];
                }
                productsInCategory.pop();
                break;
            }
            unchecked {
                ++i;
            }
        }
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

    // Escrow System Functions

    /**
     * @dev Escrow tracking helper functions
     */
    function _addToUserActiveEscrows(address user, uint256 escrowId) internal {
        UserEscrowTracking storage userInfo = userEscrowInfos[user];
        escrowToActiveIndex[user][escrowId] = userInfo.activeEscrows.length;
        userInfo.activeEscrows.push(escrowId);
    }

    function _moveEscrowToCompleted(
        uint256 escrowId,
        address buyer,
        address seller
    ) internal {
        // Handle buyer's escrow tracking
        _removeFromActiveAddToCompleted(buyer, escrowId);
        // Handle seller's escrow tracking
        _removeFromActiveAddToCompleted(seller, escrowId);
    }

    function _removeFromActiveAddToCompleted(
        address user,
        uint256 escrowId
    ) internal {
        UserEscrowTracking storage userInfo = userEscrowInfos[user];
        uint256 index = escrowToActiveIndex[user][escrowId];

        if (
            index < userInfo.activeEscrows.length &&
            userInfo.activeEscrows[index] == escrowId
        ) {
            // Remove from active (swap with last element and pop)
            uint256 lastIndex = userInfo.activeEscrows.length - 1;
            if (index != lastIndex) {
                userInfo.activeEscrows[index] = userInfo.activeEscrows[
                    lastIndex
                ];
                escrowToActiveIndex[user][
                    userInfo.activeEscrows[index]
                ] = index;
            }
            userInfo.activeEscrows.pop();
            delete escrowToActiveIndex[user][escrowId];

            // Add to completed
            userInfo.completedEscrows.push(escrowId);
        }
    }

    function _removeEscrowFromActiveList(
        uint256 escrowId,
        address buyer,
        address seller
    ) internal {
        // Remove from buyer's active list
        UserEscrowTracking storage buyerInfo = userEscrowInfos[buyer];
        uint256 buyerIndex = escrowToActiveIndex[buyer][escrowId];

        if (
            buyerIndex < buyerInfo.activeEscrows.length &&
            buyerInfo.activeEscrows[buyerIndex] == escrowId
        ) {
            // Remove (swap with last element and pop)
            uint256 lastIndex = buyerInfo.activeEscrows.length - 1;
            if (buyerIndex != lastIndex) {
                buyerInfo.activeEscrows[buyerIndex] = buyerInfo.activeEscrows[
                    lastIndex
                ];
                escrowToActiveIndex[buyer][
                    buyerInfo.activeEscrows[buyerIndex]
                ] = buyerIndex;
            }
            buyerInfo.activeEscrows.pop();
            delete escrowToActiveIndex[buyer][escrowId];
        }

        // Remove from seller's active list
        UserEscrowTracking storage sellerInfo = userEscrowInfos[seller];
        uint256 sellerIndex = escrowToActiveIndex[seller][escrowId];

        if (
            sellerIndex < sellerInfo.activeEscrows.length &&
            sellerInfo.activeEscrows[sellerIndex] == escrowId
        ) {
            // Remove (swap with last element and pop)
            uint256 lastIndex = sellerInfo.activeEscrows.length - 1;
            if (sellerIndex != lastIndex) {
                sellerInfo.activeEscrows[sellerIndex] = sellerInfo
                    .activeEscrows[lastIndex];
                escrowToActiveIndex[seller][
                    sellerInfo.activeEscrows[sellerIndex]
                ] = sellerIndex;
            }
            sellerInfo.activeEscrows.pop();
            delete escrowToActiveIndex[seller][escrowId];
        }
    }

    /**
     * @dev Creates an escrow with ETH payment
     */
    function createEscrowWithEth(
        uint256 productId,
        uint256 quantity
    ) external payable whenNotPaused nonReentrant {
        Product storage product = products[productId];
        require(!product.isDeleted && !product.isSold, "Product not available");
        require(product.ethPrice > 0, "ETH price not set");
        require(
            quantity > 0 && quantity <= MAX_BULK_PURCHASE,
            "Invalid quantity"
        );

        uint256 availableQuantity = product.quantity - product.inEscrowQuantity;
        require(availableQuantity >= quantity, "Insufficient quantity");

        uint256 totalCost = product.ethPrice * quantity;
        require(msg.value == totalCost, "Incorrect ETH amount");

        _escrowIds.increment();
        uint256 escrowId = _escrowIds.current();

        // Update product state
        product.inEscrowQuantity += quantity;
        _checkAndMarkProductSold(productId);

        // Create escrow
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            productId: productId,
            buyer: msg.sender,
            seller: product.seller,
            amount: totalCost,
            deadline: block.timestamp + MAX_ESCROW_DURATION,
            quantity: quantity,
            buyerConfirmed: false,
            sellerConfirmed: false,
            completed: false,
            refunded: false,
            isToken: false,
            isExchange: false,
            exchangeProductId: 0,
            tokenTopUp: 0
        });

        // Add to user escrow lists
        _addToUserActiveEscrows(msg.sender, escrowId);
        _addToUserActiveEscrows(product.seller, escrowId);

        emit EscrowCreated(
            escrowId,
            productId,
            msg.sender,
            product.seller,
            quantity,
            totalCost,
            false
        );
    }

    /**
     * @dev Creates an escrow with token payment
     */
    function createEscrowWithTokens(
        uint256 productId,
        uint256 quantity
    ) external whenNotPaused nonReentrant {
        Product storage product = products[productId];
        require(!product.isDeleted && !product.isSold, "Product not available");
        require(product.tokenPrice > 0, "Token price not set");
        require(
            quantity > 0 && quantity <= MAX_BULK_PURCHASE,
            "Invalid quantity"
        );

        uint256 availableQuantity = product.quantity - product.inEscrowQuantity;
        require(availableQuantity >= quantity, "Insufficient quantity");

        uint256 totalCost = product.tokenPrice * quantity;

        require(
            thriftToken.transferFrom(msg.sender, address(this), totalCost),
            "Token transfer failed"
        );

        _escrowIds.increment();
        uint256 escrowId = _escrowIds.current();

        // Update product state
        product.inEscrowQuantity += quantity;
        _checkAndMarkProductSold(productId);

        // Create escrow
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            productId: productId,
            buyer: msg.sender,
            seller: product.seller,
            amount: totalCost,
            deadline: block.timestamp + MAX_ESCROW_DURATION,
            quantity: quantity,
            buyerConfirmed: false,
            sellerConfirmed: false,
            completed: false,
            refunded: false,
            isToken: true,
            isExchange: false,
            exchangeProductId: 0,
            tokenTopUp: 0
        });

        // Add to user escrow lists
        _addToUserActiveEscrows(msg.sender, escrowId);
        _addToUserActiveEscrows(product.seller, escrowId);

        emit EscrowCreated(
            escrowId,
            productId,
            msg.sender,
            product.seller,
            quantity,
            totalCost,
            true
        );
    }

    /**
     * @dev Creates an exchange offer
     */
    function createExchangeOffer(
        uint256 offeredProductId,
        uint256 wantedProductId,
        uint256 quantity,
        uint256 tokenTopUp
    ) external whenNotPaused nonReentrant {
        Product storage offeredProduct = products[offeredProductId];
        Product storage wantedProduct = products[wantedProductId];

        require(offeredProduct.seller == msg.sender, "Not your product");
        require(
            !offeredProduct.isDeleted &&
                !offeredProduct.isSold &&
                !wantedProduct.isDeleted &&
                !wantedProduct.isSold,
            "Products not available"
        );
        require(
            wantedProduct.isAvailableForExchange,
            "Product not for exchange"
        );
        require(
            quantity > 0 && quantity <= MAX_BULK_PURCHASE,
            "Invalid quantity"
        );

        uint256 availableQuantity = offeredProduct.quantity -
            offeredProduct.inEscrowQuantity;
        require(availableQuantity >= quantity, "Insufficient quantity");

        if (tokenTopUp > 0) {
            require(
                thriftToken.transferFrom(msg.sender, address(this), tokenTopUp),
                "Token top-up transfer failed"
            );
        }

        _escrowIds.increment();
        uint256 escrowId = _escrowIds.current();

        // Update product states
        offeredProduct.inEscrowQuantity += quantity;
        wantedProduct.inEscrowQuantity += quantity;

        // Check if products are now effectively sold out
        _checkAndMarkProductSold(offeredProductId);
        _checkAndMarkProductSold(wantedProductId);

        // Create escrow
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            productId: offeredProductId,
            buyer: msg.sender,
            seller: wantedProduct.seller,
            amount: 0,
            deadline: block.timestamp + MAX_ESCROW_DURATION,
            quantity: quantity,
            buyerConfirmed: true,
            sellerConfirmed: false,
            completed: false,
            refunded: false,
            isToken: false,
            isExchange: true,
            exchangeProductId: wantedProductId,
            tokenTopUp: tokenTopUp
        });

        exchangeOffers[wantedProductId].push(
            ExchangeOffer({
                offeredProductId: offeredProductId,
                wantedProductId: wantedProductId,
                offerer: msg.sender,
                isActive: true,
                tokenTopUp: tokenTopUp,
                escrowId: escrowId
            })
        );

        // Add to user escrow lists
        _addToUserActiveEscrows(msg.sender, escrowId);
        _addToUserActiveEscrows(wantedProduct.seller, escrowId);

        emit ExchangeOfferCreated(
            offeredProductId,
            wantedProductId,
            msg.sender,
            tokenTopUp,
            escrowId
        );
    }

    /**
     * @dev Validates and creates bulk escrows (common logic)
     */
    function _validateAndCreateBulkEscrow(
        uint256[] calldata productIds,
        uint256[] calldata quantities,
        bool isToken,
        uint256 paymentAmount
    ) internal returns (uint256[] memory) {
        require(productIds.length > 0, "Empty product array");
        require(
            productIds.length == quantities.length,
            "Array length mismatch"
        );
        require(productIds.length <= MAX_BULK_PURCHASE, "Too many products");

        uint256 totalCost = 0;

        // Validate products and calculate total cost
        for (uint256 i = 0; i < productIds.length; i++) {
            Product storage product = products[productIds[i]];

            // Validation checks
            require(
                !product.isDeleted && !product.isSold,
                "Product not available"
            );
            require(
                quantities[i] > 0 && quantities[i] <= MAX_BULK_PURCHASE,
                "Invalid quantity"
            );
            uint256 availableQuantity = product.quantity -
                product.inEscrowQuantity;
            require(
                availableQuantity >= quantities[i],
                "Insufficient quantity"
            );

            // Price check and calculation
            uint256 price = isToken ? product.tokenPrice : product.ethPrice;
            require(price > 0, "Price not set");
            totalCost += price * quantities[i];
        }

        // Verify payment
        require(paymentAmount == totalCost, "Incorrect payment amount");

        uint256[] memory escrowIds = new uint256[](productIds.length);

        // Create escrows
        for (uint256 i = 0; i < productIds.length; i++) {
            Product storage product = products[productIds[i]];
            uint256 productCost = (
                isToken ? product.tokenPrice : product.ethPrice
            ) * quantities[i];

            // Reserve quantity
            product.inEscrowQuantity += quantities[i];
            _checkAndMarkProductSold(productIds[i]);

            // Create escrow
            _escrowIds.increment();
            uint256 escrowId = _escrowIds.current();

            escrows[escrowId] = Escrow({
                escrowId: escrowId,
                productId: productIds[i],
                buyer: msg.sender,
                seller: product.seller,
                amount: productCost,
                deadline: block.timestamp + MAX_ESCROW_DURATION,
                quantity: quantities[i],
                buyerConfirmed: false,
                sellerConfirmed: false,
                completed: false,
                refunded: false,
                isToken: isToken,
                isExchange: false,
                exchangeProductId: 0,
                tokenTopUp: 0
            });

            escrowIds[i] = escrowId;

            // Add to tracking
            _addToUserActiveEscrows(msg.sender, escrowId);
            _addToUserActiveEscrows(product.seller, escrowId);

            emit EscrowCreated(
                escrowId,
                productIds[i],
                msg.sender,
                product.seller,
                quantities[i],
                productCost,
                isToken
            );
        }

        // Emit bulk event
        emit BulkEscrowCreated(
            escrowIds[0],
            productIds.length,
            msg.sender,
            totalCost,
            isToken
        );

        return escrowIds;
    }

    /**
     * @dev Creates multiple escrows with ETH payment in a single transaction
     */
    function createBulkEscrowWithEth(
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external payable whenNotPaused nonReentrant returns (uint256[] memory) {
        return
            _validateAndCreateBulkEscrow(
                productIds,
                quantities,
                false,
                msg.value
            );
    }

    /**
     * @dev Creates multiple escrows with token payment in a single transaction
     */
    function createBulkEscrowWithTokens(
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external whenNotPaused nonReentrant returns (uint256[] memory) {
        // Calculate total cost first to make a single token transfer
        uint256 totalCost = 0;

        for (uint256 i = 0; i < productIds.length; i++) {
            Product storage product = products[productIds[i]];
            require(product.tokenPrice > 0, "Token price not set");
            totalCost += product.tokenPrice * quantities[i];
        }

        // Transfer tokens for all products at once
        require(
            thriftToken.transferFrom(msg.sender, address(this), totalCost),
            "Token transfer failed"
        );

        return
            _validateAndCreateBulkEscrow(
                productIds,
                quantities,
                true,
                totalCost
            );
    }

    /**
     * @dev Confirms an escrow
     */
    function confirmEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(!escrow.completed && !escrow.refunded, "Escrow not active");
        require(block.timestamp <= escrow.deadline, "Escrow expired");

        bool isBuyer = msg.sender == escrow.buyer;
        bool isSeller = msg.sender == escrow.seller;
        require(isBuyer || isSeller, "Not authorized");

        if (isBuyer) {
            require(!escrow.buyerConfirmed, "Already confirmed");
            escrow.buyerConfirmed = true;
        } else {
            require(!escrow.sellerConfirmed, "Already confirmed");
            escrow.sellerConfirmed = true;
        }

        emit EscrowConfirmed(escrowId, msg.sender, isBuyer);

        if (escrow.buyerConfirmed && escrow.sellerConfirmed) {
            _completeEscrow(escrowId);
        }
    }

    /**
     * @dev Internal function to complete an escrow
     */
    function _completeEscrow(uint256 escrowId) internal {
        Escrow storage escrow = escrows[escrowId];
        require(!escrow.completed && !escrow.refunded, "Invalid escrow state");
        require(
            escrow.buyerConfirmed && escrow.sellerConfirmed,
            "Not confirmed"
        );

        escrow.completed = true;

        if (escrow.isExchange) {
            _completeExchange(escrow);
        } else {
            _completeSale(escrow);
        }

        // Remove escrow from active lists and move to completed lists
        _moveEscrowToCompleted(escrowId, escrow.buyer, escrow.seller);

        emit EscrowCompleted(
            escrowId,
            escrow.productId,
            escrow.quantity,
            escrow.amount
        );
    }

    /**
     * @dev Completes a regular sale
     */
    function _completeSale(Escrow storage escrow) internal {
        uint256 platformFee = escrow.isToken
            ? tokenPlatformFee
            : ethPlatformFee;
        uint256 feeAmount = (escrow.amount * platformFee) / 1000;
        uint256 sellerAmount = escrow.amount - feeAmount;

        // Process platform fee
        if (escrow.isToken) {
            // Calculate burn and treasury amounts
            uint256 burnAmount = (feeAmount * BURN_PERCENTAGE) / 100;
            uint256 treasuryAmount = feeAmount - burnAmount;

            // Transfer tokens
            require(
                thriftToken.transfer(escrow.seller, sellerAmount),
                "Seller transfer failed"
            );
            require(
                thriftToken.transfer(treasuryWallet, treasuryAmount),
                "Treasury transfer failed"
            );
            thriftToken.burn(burnAmount);

            // Process spending rewards
            uint256 rewardAmount = (escrow.amount *
                SPENDING_REWARD_PERCENTAGE) / 1000;
            thriftToken.mint(escrow.buyer, rewardAmount);
        } else {
            // Transfer ETH
            payable(escrow.seller).transfer(sellerAmount);
            payable(treasuryWallet).transfer(feeAmount);
        }

        _completeQuantitySale(escrow.productId, escrow.quantity);
    }

    /**
     * @dev Completes an exchange
     */
    function _completeExchange(Escrow storage escrow) internal {
        Product storage wantedProduct = products[escrow.exchangeProductId];

        // Process token top-up if any
        if (escrow.tokenTopUp > 0) {
            uint256 platformFee = (escrow.tokenTopUp * tokenPlatformFee) / 1000;
            uint256 sellerAmount = escrow.tokenTopUp - platformFee;

            uint256 burnAmount = (platformFee * BURN_PERCENTAGE) / 100;
            uint256 treasuryAmount = platformFee - burnAmount;

            require(
                thriftToken.transfer(wantedProduct.seller, sellerAmount),
                "Top-up transfer failed"
            );
            require(
                thriftToken.transfer(treasuryWallet, treasuryAmount),
                "Treasury transfer failed"
            );
            thriftToken.burn(burnAmount);
        }

        // Update product states
        _completeQuantitySale(escrow.productId, escrow.quantity);
        _completeQuantitySale(escrow.exchangeProductId, escrow.quantity);

        emit ExchangeCompleted(
            escrow.productId,
            escrow.exchangeProductId,
            escrow.buyer,
            escrow.seller,
            escrow.tokenTopUp
        );
    }

    /**
     * @dev Common escrow rejection/cancellation logic
     */
    function _rejectOrCancelEscrow(
        uint256 escrowId,
        bool isSeller,
        string memory reason
    ) internal {
        Escrow storage escrow = escrows[escrowId];

        // Validate permissions
        if (isSeller) {
            require(escrow.seller == msg.sender, "Not authorized");
        } else {
            require(escrow.buyer == msg.sender, "Not authorized");
            require(!escrow.sellerConfirmed, "Seller already confirmed");
        }

        require(!escrow.completed && !escrow.refunded, "Escrow not active");

        escrow.refunded = true;

        // Refund buyer
        if (escrow.isToken) {
            require(
                thriftToken.transfer(escrow.buyer, escrow.amount),
                "Token refund failed"
            );
        } else if (!escrow.isExchange) {
            payable(escrow.buyer).transfer(escrow.amount);
        }

        // Release quantities
        Product storage product = products[escrow.productId];
        product.inEscrowQuantity -= escrow.quantity;

        if (escrow.isExchange) {
            Product storage exchangeProduct = products[
                escrow.exchangeProductId
            ];
            exchangeProduct.inEscrowQuantity -= escrow.quantity;

            if (escrow.tokenTopUp > 0) {
                require(
                    thriftToken.transfer(escrow.buyer, escrow.tokenTopUp),
                    "Token top-up refund failed"
                );
            }
        }

        // Remove escrow from active lists
        _removeEscrowFromActiveList(escrowId, escrow.buyer, escrow.seller);

        // Emit appropriate event
        if (isSeller) {
            emit EscrowRejected(escrowId, msg.sender, reason);
        } else {
            emit EscrowCancelled(escrowId, msg.sender);
        }
    }

    /**
     * @dev Rejects an escrow (seller only)
     */
    function rejectEscrow(
        uint256 escrowId,
        string memory reason
    ) external nonReentrant {
        _rejectOrCancelEscrow(escrowId, true, reason);
    }

    /**
     * @dev Cancels an escrow (buyer only)
     */
    function cancelEscrow(uint256 escrowId) external nonReentrant {
        _rejectOrCancelEscrow(escrowId, false, "");
    }

    /**
     * @dev Confirms multiple escrows
     */
    function _bulkConfirmEscrows(
        uint256[] calldata escrowIds,
        bool isBuyer
    ) internal {
        require(escrowIds.length > 0, "Empty escrow array");
        require(escrowIds.length <= MAX_BULK_PURCHASE, "Too many escrows");

        for (uint256 i = 0; i < escrowIds.length; ) {
            Escrow storage escrow = escrows[escrowIds[i]];

            // Validate permissions
            if (isBuyer) {
                require(escrow.buyer == msg.sender, "Not buyer's escrow");
                require(!escrow.buyerConfirmed, "Already confirmed");
                escrow.buyerConfirmed = true;
            } else {
                require(escrow.seller == msg.sender, "Not seller's escrow");
                require(!escrow.sellerConfirmed, "Already confirmed");
                escrow.sellerConfirmed = true;
            }

            require(!escrow.completed && !escrow.refunded, "Escrow not active");
            require(block.timestamp <= escrow.deadline, "Escrow expired");

            emit EscrowConfirmed(escrowIds[i], msg.sender, isBuyer);

            // Auto-complete if both parties have confirmed
            if (escrow.buyerConfirmed && escrow.sellerConfirmed) {
                _completeEscrow(escrowIds[i]);
            }

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Bulk confirm all escrows for the buyer
     */
    function bulkConfirmEscrowsAsBuyer(
        uint256[] calldata escrowIds
    ) external nonReentrant {
        _bulkConfirmEscrows(escrowIds, true);
    }

    /**
     * @dev Bulk confirm multiple escrows from the same seller
     */
    function bulkConfirmEscrowsForSeller(
        uint256[] calldata escrowIds
    ) external nonReentrant {
        _bulkConfirmEscrows(escrowIds, false);
    }

    // Query Functions

    /**
     * @dev Gets all active products
     */
    function getAllActiveProducts()
        external
        view
        returns (ProductWithAvailability[] memory)
    {
        uint256 totalProducts = _productIds.current();
        uint256 activeCount = 0;

        // Count active products
        for (uint256 i = 1; i <= totalProducts; ) {
            Product storage product = products[i];
            if (
                !product.isDeleted &&
                !product.isSold &&
                (product.quantity - product.inEscrowQuantity) > 0
            ) {
                unchecked {
                    ++activeCount;
                }
            }
            unchecked {
                ++i;
            }
        }

        ProductWithAvailability[]
            memory activeProducts = new ProductWithAvailability[](activeCount);
        uint256 currentIndex = 0;

        // Fill active products array
        for (uint256 i = 1; i <= totalProducts; ) {
            Product storage product = products[i];
            if (
                !product.isDeleted &&
                !product.isSold &&
                (product.quantity - product.inEscrowQuantity) > 0
            ) {
                activeProducts[
                    currentIndex
                ] = _convertToProductWithAvailability(product);
                unchecked {
                    ++currentIndex;
                }
            }
            unchecked {
                ++i;
            }
        }

        return activeProducts;
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
     * @dev Gets products by their IDs
     */
    function getProductsById(
        uint256[] calldata productIds
    ) external view returns (ProductWithAvailability[] memory) {
        ProductWithAvailability[] memory result = new ProductWithAvailability[](
            productIds.length
        );

        for (uint256 i = 0; i < productIds.length; ) {
            result[i] = _convertToProductWithAvailability(
                products[productIds[i]]
            );
            unchecked {
                ++i;
            }
        }
        return result;
    }

    /**
     * @dev Check if a product matches search parameters
     */
    function _productMatchesSearch(
        Product storage product,
        SearchParams memory params
    ) internal view returns (bool) {
        // Check if product is available
        if (
            params.onlyAvailable &&
            (product.isDeleted ||
                product.isSold ||
                (product.quantity - product.inEscrowQuantity) == 0)
        ) {
            return false;
        }

        // Check if product is for exchange
        if (params.exchangeOnly && !product.isAvailableForExchange) {
            return false;
        }

        // Name query match
        if (bytes(params.nameQuery).length > 0) {
            // Simple contains check - can be improved with more advanced search
            bytes memory nameBytes = bytes(product.name);
            bytes memory queryBytes = bytes(params.nameQuery);
            bool nameMatch = false;

            // Simple substring search
            if (queryBytes.length <= nameBytes.length) {
                for (
                    uint i = 0;
                    i <= nameBytes.length - queryBytes.length;
                    i++
                ) {
                    bool isMatching = true;
                    for (uint j = 0; j < queryBytes.length; j++) {
                        if (nameBytes[i + j] != queryBytes[j]) {
                            isMatching = false;
                            break;
                        }
                    }
                    if (isMatching) {
                        nameMatch = true;
                        break;
                    }
                }
            }

            if (!nameMatch) {
                return false;
            }
        }

        // Category filter (aesthetics)
        if (params.categories.length > 0) {
            bool categoryMatch = false;
            for (uint256 i = 0; i < params.categories.length; i++) {
                for (uint256 j = 0; j < product.categories.length; j++) {
                    if (
                        keccak256(bytes(params.categories[i])) ==
                        keccak256(bytes(product.categories[j]))
                    ) {
                        categoryMatch = true;
                        break;
                    }
                }
                if (categoryMatch) break;
            }
            if (!categoryMatch) return false;
        }

        // String filter checks
        if (_nonEmptyAndDifferent(params.brand, product.brand)) return false;
        if (_nonEmptyAndDifferent(params.condition, product.condition))
            return false;
        if (_nonEmptyAndDifferent(params.gender, product.gender)) return false;
        if (_nonEmptyAndDifferent(params.size, product.size)) return false;

        // Price range filter (using token price)
        if (params.minPrice > 0 && product.tokenPrice < params.minPrice) {
            return false;
        }
        if (params.maxPrice > 0 && product.tokenPrice > params.maxPrice) {
            return false;
        }

        return true;
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

    /**
     * @dev Search products with filters and pagination
     */
    function searchProducts(
        SearchParams memory params
    ) public view returns (SearchResult memory) {
        // Validate pagination parameters
        require(params.page > 0, "Invalid page number");
        require(
            params.pageSize > 0 && params.pageSize <= 50,
            "Invalid page size"
        );

        uint256 totalProducts = _productIds.current();
        uint256 totalMatches = 0;

        // First pass: count total matches
        for (uint256 i = 1; i <= totalProducts; ) {
            if (_productMatchesSearch(products[i], params)) {
                unchecked {
                    ++totalMatches;
                }
            }
            unchecked {
                ++i;
            }
        }

        // Calculate pagination values
        uint256 totalPages = (totalMatches + params.pageSize - 1) /
            params.pageSize;
        uint256 startIndex = (params.page - 1) * params.pageSize;

        // Ensure valid page number
        if (totalMatches == 0) {
            totalPages = 1;
        }
        require(params.page <= totalPages, "Page number exceeds total pages");

        // Create array for current page results
        ProductWithAvailability[]
            memory pageProducts = new ProductWithAvailability[](
                Math.min(params.pageSize, totalMatches)
            );

        uint256 currentIndex = 0;
        uint256 matchesFound = 0;

        // Second pass: fill matching products array for current page
        for (
            uint256 i = 1;
            i <= totalProducts && currentIndex < pageProducts.length;

        ) {
            Product storage product = products[i];
            if (_productMatchesSearch(product, params)) {
                if (matchesFound >= startIndex) {
                    pageProducts[
                        currentIndex
                    ] = _convertToProductWithAvailability(product);
                    unchecked {
                        ++currentIndex;
                    }
                }
                unchecked {
                    ++matchesFound;
                }
            }
            unchecked {
                ++i;
            }
        }

        // Return search results with pagination info
        return
            SearchResult({
                products: pageProducts,
                totalResults: totalMatches,
                totalPages: totalPages,
                currentPage: params.page
            });
    }

    /**
     * @dev Get products based on user aesthetics
     */
    function getProductsByUserAesthetics(
        address user,
        uint256 page,
        uint256 pageSize
    ) external view returns (SearchResult memory) {
        // Get user aesthetics
        (string[] memory userPreferences, bool isSet, ) = userAesthetics
            .getUserAesthetics(user);
        require(isSet, "User aesthetics not set");

        return
            searchProducts(
                SearchParams({
                    nameQuery: "",
                    categories: userPreferences,
                    brand: "",
                    condition: "",
                    gender: "",
                    size: "",
                    minPrice: 0,
                    maxPrice: 0,
                    onlyAvailable: true,
                    exchangeOnly: false,
                    page: page,
                    pageSize: pageSize
                })
            );
    }

    /**
     * @dev Get user escrow IDs based on role
     */
    function _getUserEscrows(
        address user,
        bool completed,
        bool asBuyer
    ) internal view returns (uint256[] memory) {
        UserEscrowTracking storage userInfo = userEscrowInfos[user];
        uint256[] storage sourceList = completed
            ? userInfo.completedEscrows
            : userInfo.activeEscrows;

        if (!asBuyer) {
            // Just return all escrows where user is seller (no need to filter)
            return sourceList;
        }

        // Count relevant escrows
        uint256 count = 0;
        for (uint256 i = 0; i < sourceList.length; i++) {
            if (escrows[sourceList[i]].buyer == user) {
                count++;
            }
        }

        // Create filtered array
        uint256[] memory result = new uint256[](count);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < sourceList.length && resultIndex < count; i++) {
            if (escrows[sourceList[i]].buyer == user) {
                result[resultIndex] = sourceList[i];
                resultIndex++;
            }
        }

        return result;
    }

    /**
     * @dev Get user active escrows where user is buyer
     */
    function getUserActiveEscrowsAsBuyer(
        address user
    ) external view returns (uint256[] memory) {
        return _getUserEscrows(user, false, true);
    }

    /**
     * @dev Get user active escrows where user is seller
     */
    function getUserActiveEscrowsAsSeller(
        address user
    ) external view returns (uint256[] memory) {
        return _getUserEscrows(user, false, false);
    }

    /**
     * @dev Get user's completed escrows
     */
    function getUserCompletedEscrows(
        address user
    ) external view returns (uint256[] memory) {
        return userEscrowInfos[user].completedEscrows;
    }

    /**
     * @dev Gets all exchange offers for a product
     */
    function getExchangeOffers(
        uint256 productId
    ) external view returns (ExchangeOffer[] memory) {
        ExchangeOffer[] storage offers = exchangeOffers[productId];
        uint256 activeCount = 0;

        // Count active offers
        for (uint256 i = 0; i < offers.length; ) {
            if (offers[i].isActive) {
                unchecked {
                    ++activeCount;
                }
            }
            unchecked {
                ++i;
            }
        }

        // Create array of active offers
        ExchangeOffer[] memory activeOffers = new ExchangeOffer[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < offers.length; ) {
            if (offers[i].isActive) {
                activeOffers[currentIndex] = offers[i];
                unchecked {
                    ++currentIndex;
                }
            }
            unchecked {
                ++i;
            }
        }

        return activeOffers;
    }

    /**
     * @dev Gets user's products
     */
    function getUserProducts(
        address user
    ) external view returns (ProductWithAvailability[] memory) {
        uint256[] storage userProductIds = userProducts[user];
        uint256 activeCount = 0;

        // Count active products
        for (uint256 i = 0; i < userProductIds.length; ) {
            Product storage product = products[userProductIds[i]];
            if (!product.isDeleted) {
                unchecked {
                    ++activeCount;
                }
            }
            unchecked {
                ++i;
            }
        }

        ProductWithAvailability[]
            memory userActiveProducts = new ProductWithAvailability[](
                activeCount
            );
        uint256 currentIndex = 0;

        // Fill active products array
        for (uint256 i = 0; i < userProductIds.length; ) {
            Product storage product = products[userProductIds[i]];
            if (!product.isDeleted) {
                userActiveProducts[
                    currentIndex
                ] = _convertToProductWithAvailability(product);
                unchecked {
                    ++currentIndex;
                }
            }
            unchecked {
                ++i;
            }
        }

        return userActiveProducts;
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

    // Admin Functions

    /**
     * @dev Updates platform fees
     */
    function updatePlatformFees(
        uint256 newTokenFee,
        uint256 newEthFee
    ) external {
        require(msg.sender == treasuryWallet, "Not authorized");
        require(newTokenFee <= 100 && newEthFee <= 100, "Fee too high");

        tokenPlatformFee = newTokenFee;
        ethPlatformFee = newEthFee;

        emit PlatformFeesUpdated(newTokenFee, newEthFee);
    }

    /**
     * @dev Updates treasury wallet
     */
    function updateTreasuryWallet(address newTreasury) external {
        require(msg.sender == treasuryWallet, "Not authorized");
        require(newTreasury != address(0), "Invalid address");

        treasuryWallet = newTreasury;

        emit TreasuryWalletUpdated(newTreasury);
    }

    /**
     * @dev Updates UserAesthetics contract
     */
    function updateUserAesthetics(address newUserAesthetics) external {
        require(msg.sender == treasuryWallet, "Not authorized");
        require(newUserAesthetics != address(0), "Invalid address");

        userAesthetics = UserAesthetics(newUserAesthetics);

        emit UserAestheticsUpdated(newUserAesthetics);
    }

    /**
     * @dev Toggles pause state for contract operations
     */
    function togglePause() external {
        require(msg.sender == treasuryWallet, "Not authorized");
        isPaused = !isPaused;
    }

    /**
     * @dev Emergency function to handle stuck tokens
     */
    function emergencyTokenWithdraw(address token, uint256 amount) external {
        require(msg.sender == treasuryWallet, "Not authorized");
        require(
            IERC20(token).transfer(treasuryWallet, amount),
            "Transfer failed"
        );
    }

    /**
     * @dev Emergency function to handle stuck ETH
     */
    function emergencyEthWithdraw() external {
        require(msg.sender == treasuryWallet, "Not authorized");
        payable(treasuryWallet).transfer(address(this).balance);
    }

    /**
     * @dev Receive and fallback functions
     */
    receive() external payable {}
    fallback() external payable {}
}
