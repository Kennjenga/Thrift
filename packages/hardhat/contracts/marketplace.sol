// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {ThriftToken} from "./thrift.sol";
import {UserAesthetics} from "./userAesthetics.sol";

contract Marketplace is ReentrancyGuard {
    using Counters for Counters.Counter;

    ThriftToken public thriftToken;
    UserAesthetics public userAesthetics;
    address public treasuryWallet;

    Counters.Counter private _productIds;
    Counters.Counter private _escrowIds;

    uint256 public tokenPlatformFee = 35; // 3.5% total platform fee
    uint256 public ethPlatformFee = 35; // 3.5% total platform fee
    uint256 public constant BURN_PERCENTAGE = 60;
    uint256 public constant TREASURY_PERCENTAGE = 40;
    uint256 public constant SPENDING_REWARD_PERCENTAGE = 20;
    uint256 public constant MAX_ESCROW_DURATION = 5 days;
    uint256 public constant MAX_BULK_PURCHASE = 50;

    // Aesthetic tracking
    struct AestheticStats {
        uint256 productCount;
        uint256 purchaseCount;
        uint256 lastUpdated;
    }

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
        string[] categories; // Array for better aesthetics matching
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
        uint256 exchangeProductId; // If this is an exchange, the ID of product being exchanged
        uint256 tokenTopUp; // Additional tokens for exchange balancing
    }

    // Enhanced exchange system
    struct ExchangeOffer {
        uint256 offeredProductId;
        uint256 wantedProductId;
        address offerer;
        bool isActive;
        uint256 tokenTopUp;
        uint256 escrowId;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => Escrow) public escrows;
    mapping(address => uint256[]) public userProducts;
    mapping(address => uint256[]) public userEscrows;
    mapping(string => uint256[]) public categoryToProducts;
    mapping(string => AestheticStats) public aestheticsStats;
    mapping(uint256 => ExchangeOffer[]) public exchangeOffers;

    // Track top aesthetics
    string[] private _topAesthetics;
    uint256 private _lastAestheticsUpdate;
    uint256 private constant AESTHETICS_UPDATE_INTERVAL = 1 days;

    event ProductCreated(
        uint256 indexed productId,
        address indexed seller,
        string[] categories
    );
    event ProductUpdated(
        uint256 indexed productId,
        address indexed seller,
        string[] categories
    );
    event ProductQuantityUpdated(
        uint256 indexed productId,
        uint256 newQuantity
    );
    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed productId,
        address indexed buyer,
        address seller,
        uint256 quantity
    );
    event EscrowConfirmed(uint256 indexed escrowId, address indexed confirmer);
    event EscrowCompleted(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId);
    event ExchangeOfferCreated(
        uint256 offeredProductId,
        uint256 wantedProductId,
        address offerer,
        uint256 quantity,
        uint256 tokenTopUp,
        uint256 escrowId
    );
    event ExchangeCompleted(
        uint256 offeredProductId,
        uint256 wantedProductId,
        address party1,
        address party2,
        uint256 quantity,
        uint256 tokenTopUp
    );
    event BulkPurchaseInitiated(
        address buyer,
        uint256[] productIds,
        uint256[] quantities,
        uint256[] escrowIds
    );

    constructor(
        address payable _thriftToken, // Change to address payable
        address _userAesthetics,
        address _treasuryWallet
    ) {
        thriftToken = ThriftToken(_thriftToken);
        userAesthetics = UserAesthetics(_userAesthetics);
        treasuryWallet = _treasuryWallet;

        // Initialize top aesthetics array
        _topAesthetics = new string[](5);
        _lastAestheticsUpdate = block.timestamp;
    }

    // PRODUCT MANAGEMENT FUNCTIONS

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
    ) external returns (uint256) {
        require(quantity > 0, "Quantity must be positive");
        require(tokenPrice > 0 || ethPrice > 0, "Must set at least one price");
        require(categories.length > 0, "At least one category required");
        require(categories.length <= 20, "Too many categories");

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

        // Index product by each category for efficient queries & update stats
        for (uint i = 0; i < categories.length; i++) {
            categoryToProducts[categories[i]].push(productId);
            aestheticsStats[categories[i]].productCount++;
            aestheticsStats[categories[i]].lastUpdated = block.timestamp;
        }

        _updateTopAesthetics();
        emit ProductCreated(productId, msg.sender, categories);
        return productId;
    }

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
        require(!product.isDeleted, "Product deleted");
        require(tokenPrice > 0 || ethPrice > 0, "Must set at least one price");
        require(
            product.quantity > product.inEscrowQuantity,
            "All items in escrow"
        );
        require(categories.length > 0, "At least one category required");
        require(categories.length <= 20, "Too many categories");

        // Remove from old category indices
        for (uint i = 0; i < product.categories.length; i++) {
            removeFromCategoryIndex(product.categories[i], productId);
            aestheticsStats[product.categories[i]].productCount--;
        }

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
        for (uint i = 0; i < categories.length; i++) {
            categoryToProducts[categories[i]].push(productId);
            aestheticsStats[categories[i]].productCount++;
            aestheticsStats[categories[i]].lastUpdated = block.timestamp;
        }

        _updateTopAesthetics();
        emit ProductUpdated(productId, msg.sender, categories);
    }

    // Helper function to remove product from category index
    function removeFromCategoryIndex(
        string memory category,
        uint256 productId
    ) internal {
        uint256[] storage productsInCategory = categoryToProducts[category];
        for (uint i = 0; i < productsInCategory.length; i++) {
            if (productsInCategory[i] == productId) {
                // Move the last element to this position and pop
                if (i < productsInCategory.length - 1) {
                    productsInCategory[i] = productsInCategory[
                        productsInCategory.length - 1
                    ];
                }
                productsInCategory.pop();
                break;
            }
        }
    }

    function updateProductQuantity(
        uint256 productId,
        uint256 newQuantity
    ) external {
        Product storage product = products[productId];
        require(product.seller == msg.sender, "Not your product");
        require(!product.isDeleted, "Product deleted");
        require(
            newQuantity >= product.inEscrowQuantity,
            "Cannot set below escrow quantity"
        );

        product.quantity = newQuantity;
        emit ProductQuantityUpdated(productId, newQuantity);
    }

    // PURCHASING FUNCTIONS WITH ESCROW

    function createEscrowWithEth(
        uint256 productId,
        uint256 quantity
    ) external payable nonReentrant {
        require(quantity > 0, "Quantity must be positive");
        require(quantity <= MAX_BULK_PURCHASE, "Quantity exceeds limit");

        Product storage product = products[productId];
        require(!product.isDeleted, "Product deleted");
        require(product.ethPrice > 0, "ETH price not set");
        require(
            product.quantity - product.inEscrowQuantity >= quantity,
            "Insufficient quantity"
        );

        uint256 totalAmount = product.ethPrice * quantity;
        require(msg.value == totalAmount, "Incorrect ETH amount");

        _escrowIds.increment();
        uint256 escrowId = _escrowIds.current();

        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            productId: productId,
            buyer: msg.sender,
            seller: product.seller,
            amount: totalAmount,
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

        product.inEscrowQuantity += quantity;
        userEscrows[msg.sender].push(escrowId);

        // Update aesthetic stats when purchase initiated
        for (uint i = 0; i < product.categories.length; i++) {
            aestheticsStats[product.categories[i]].purchaseCount++;
            aestheticsStats[product.categories[i]].lastUpdated = block
                .timestamp;
        }

        emit EscrowCreated(
            escrowId,
            productId,
            msg.sender,
            product.seller,
            quantity
        );
    }

    function createEscrowWithTokens(
        uint256 productId,
        uint256 quantity
    ) external nonReentrant {
        require(quantity > 0, "Quantity must be positive");
        require(quantity <= MAX_BULK_PURCHASE, "Quantity exceeds limit");

        Product storage product = products[productId];
        require(!product.isDeleted, "Product deleted");
        require(product.tokenPrice > 0, "Token price not set");
        require(
            product.quantity - product.inEscrowQuantity >= quantity,
            "Insufficient quantity"
        );

        uint256 totalAmount = product.tokenPrice * quantity;
        require(
            thriftToken.transferFrom(msg.sender, address(this), totalAmount),
            "Token transfer failed"
        );

        _escrowIds.increment();
        uint256 escrowId = _escrowIds.current();

        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            productId: productId,
            buyer: msg.sender,
            seller: product.seller,
            amount: totalAmount,
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

        product.inEscrowQuantity += quantity;
        userEscrows[msg.sender].push(escrowId);

        // Update aesthetic stats when purchase initiated
        for (uint i = 0; i < product.categories.length; i++) {
            aestheticsStats[product.categories[i]].purchaseCount++;
            aestheticsStats[product.categories[i]].lastUpdated = block
                .timestamp;
        }

        emit EscrowCreated(
            escrowId,
            productId,
            msg.sender,
            product.seller,
            quantity
        );
    }

    // BULK PURCHASE WITH ESCROW
    function createBulkEscrowWithEth(
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external payable nonReentrant {
        require(
            productIds.length == quantities.length,
            "Arrays length mismatch"
        );
        require(productIds.length > 0, "Empty purchase");

        uint256 totalCost = 0;
        uint256[] memory escrowIds = new uint256[](productIds.length);

        // Create escrow for each product
        for (uint256 i = 0; i < productIds.length; i++) {
            require(
                quantities[i] > 0 && quantities[i] <= MAX_BULK_PURCHASE,
                "Invalid quantity"
            );

            Product storage product = products[productIds[i]];
            require(!product.isDeleted, "Product deleted");
            require(product.ethPrice > 0, "ETH price not set");
            require(
                product.quantity - product.inEscrowQuantity >= quantities[i],
                "Insufficient quantity"
            );

            uint256 itemCost = product.ethPrice * quantities[i];
            totalCost += itemCost;

            _escrowIds.increment();
            uint256 escrowId = _escrowIds.current();
            escrowIds[i] = escrowId;

            escrows[escrowId] = Escrow({
                escrowId: escrowId,
                productId: productIds[i],
                buyer: msg.sender,
                seller: product.seller,
                amount: itemCost,
                deadline: block.timestamp + MAX_ESCROW_DURATION,
                quantity: quantities[i],
                buyerConfirmed: false,
                sellerConfirmed: false,
                completed: false,
                refunded: false,
                isToken: false,
                isExchange: false,
                exchangeProductId: 0,
                tokenTopUp: 0
            });

            product.inEscrowQuantity += quantities[i];
            userEscrows[msg.sender].push(escrowId);

            // Update aesthetic stats
            for (uint j = 0; j < product.categories.length; j++) {
                aestheticsStats[product.categories[j]].purchaseCount++;
                aestheticsStats[product.categories[j]].lastUpdated = block
                    .timestamp;
            }

            emit EscrowCreated(
                escrowId,
                productIds[i],
                msg.sender,
                product.seller,
                quantities[i]
            );
        }

        require(msg.value == totalCost, "Incorrect ETH amount");

        emit BulkPurchaseInitiated(
            msg.sender,
            productIds,
            quantities,
            escrowIds
        );
    }

    function createBulkEscrowWithTokens(
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external nonReentrant {
        require(
            productIds.length == quantities.length,
            "Arrays length mismatch"
        );
        require(productIds.length > 0, "Empty purchase");

        uint256 totalCost = 0;
        uint256[] memory escrowIds = new uint256[](productIds.length);

        // Calculate total cost first
        for (uint256 i = 0; i < productIds.length; i++) {
            require(
                quantities[i] > 0 && quantities[i] <= MAX_BULK_PURCHASE,
                "Invalid quantity"
            );

            Product storage product = products[productIds[i]];
            require(!product.isDeleted, "Product deleted");
            require(product.tokenPrice > 0, "Token price not set");
            require(
                product.quantity - product.inEscrowQuantity >= quantities[i],
                "Insufficient quantity"
            );

            totalCost += product.tokenPrice * quantities[i];
        }

        // Transfer tokens first
        require(
            thriftToken.transferFrom(msg.sender, address(this), totalCost),
            "Token transfer failed"
        );

        // Create escrow for each product
        for (uint256 i = 0; i < productIds.length; i++) {
            Product storage product = products[productIds[i]];
            uint256 itemCost = product.tokenPrice * quantities[i];

            _escrowIds.increment();
            uint256 escrowId = _escrowIds.current();
            escrowIds[i] = escrowId;

            escrows[escrowId] = Escrow({
                escrowId: escrowId,
                productId: productIds[i],
                buyer: msg.sender,
                seller: product.seller,
                amount: itemCost,
                deadline: block.timestamp + MAX_ESCROW_DURATION,
                quantity: quantities[i],
                buyerConfirmed: false,
                sellerConfirmed: false,
                completed: false,
                refunded: false,
                isToken: true,
                isExchange: false,
                exchangeProductId: 0,
                tokenTopUp: 0
            });

            product.inEscrowQuantity += quantities[i];
            userEscrows[msg.sender].push(escrowId);

            // Update aesthetic stats
            for (uint j = 0; j < product.categories.length; j++) {
                aestheticsStats[product.categories[j]].purchaseCount++;
                aestheticsStats[product.categories[j]].lastUpdated = block
                    .timestamp;
            }

            emit EscrowCreated(
                escrowId,
                productIds[i],
                msg.sender,
                product.seller,
                quantities[i]
            );
        }

        emit BulkPurchaseInitiated(
            msg.sender,
            productIds,
            quantities,
            escrowIds
        );
    }

    // ESCROW MANAGEMENT FUNCTIONS
    function confirmEscrow(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(
            !escrow.completed && !escrow.refunded,
            "Escrow already finalized"
        );
        require(block.timestamp <= escrow.deadline, "Escrow expired");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Not authorized"
        );

        if (msg.sender == escrow.buyer) {
            escrow.buyerConfirmed = true;
        } else {
            escrow.sellerConfirmed = true;
        }

        emit EscrowConfirmed(escrowId, msg.sender);

        if (escrow.buyerConfirmed && escrow.sellerConfirmed) {
            _completeEscrow(escrowId);
        }
    }

    function _completeEscrow(uint256 escrowId) internal {
        Escrow storage escrow = escrows[escrowId];
        Product storage product = products[escrow.productId];

        escrow.completed = true;
        product.inEscrowQuantity -= escrow.quantity;
        product.quantity -= escrow.quantity;

        if (product.quantity == 0) {
            product.isSold = true;
        }

        // Handle exchange completion if this is an exchange escrow
        if (escrow.isExchange) {
            if (escrow.exchangeProductId > 0) {
                // Handle the exchange product transfer
                Product storage exchangeProduct = products[
                    escrow.exchangeProductId
                ];
                exchangeProduct.inEscrowQuantity -= 1;
                exchangeProduct.quantity -= 1;

                // Update ownership - since this is an exchange transaction
                // the party1 is the original seller of exchangeProduct
                // the party2 is the original seller of product
                address party1 = exchangeProduct.seller;
                address party2 = product.seller;

                product.seller = party1;
                exchangeProduct.seller = party2;

                // If tokenTopUp was part of the exchange
                if (escrow.tokenTopUp > 0) {
                    // Transfer the token top-up to the party receiving it
                    thriftToken.transfer(party2, escrow.tokenTopUp);
                }

                if (exchangeProduct.quantity == 0) {
                    exchangeProduct.isSold = true;
                }

                // Fire exchange completed event
                emit ExchangeCompleted(
                    escrow.exchangeProductId,
                    escrow.productId,
                    party1,
                    party2,
                    1,
                    escrow.tokenTopUp
                );
            }
        } else {
            // Normal purchase - process fees
            if (escrow.isToken) {
                // Calculate fees for token payment
                uint256 platformFeeAmount = (escrow.amount * tokenPlatformFee) /
                    1000;
                uint256 burnAmount = (platformFeeAmount * BURN_PERCENTAGE) /
                    100;
                uint256 treasuryAmount = (platformFeeAmount *
                    TREASURY_PERCENTAGE) / 100;
                uint256 sellerAmount = escrow.amount - platformFeeAmount;
                uint256 spendingReward = (escrow.amount *
                    SPENDING_REWARD_PERCENTAGE) / 1000;

                // Process payments
                thriftToken.burn(burnAmount);
                thriftToken.transfer(treasuryWallet, treasuryAmount);
                thriftToken.transfer(escrow.seller, sellerAmount);
                thriftToken.mintReward(escrow.buyer, spendingReward);
            } else {
                // Calculate fees for ETH payment
                uint256 platformFeeAmount = (escrow.amount * ethPlatformFee) /
                    1000;
                uint256 treasuryAmount = platformFeeAmount;
                uint256 sellerAmount = escrow.amount - platformFeeAmount;

                // Process payments
                payable(treasuryWallet).transfer(treasuryAmount);
                payable(escrow.seller).transfer(sellerAmount);
            }
        }

        emit EscrowCompleted(escrowId);
    }

    function refundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(
            !escrow.completed && !escrow.refunded,
            "Escrow already finalized"
        );

        // Allow refund if deadline passed or seller approves
        require(
            block.timestamp > escrow.deadline || msg.sender == escrow.seller,
            "Not authorized to refund"
        );

        Product storage product = products[escrow.productId];
        escrow.refunded = true;
        product.inEscrowQuantity -= escrow.quantity;

        // For exchanges, also update the exchanged product
        if (escrow.isExchange && escrow.exchangeProductId > 0) {
            Product storage exchangeProduct = products[
                escrow.exchangeProductId
            ];
            exchangeProduct.inEscrowQuantity -= 1;

            // If token top-up was included, refund that too
            if (escrow.tokenTopUp > 0) {
                thriftToken.transfer(escrow.buyer, escrow.tokenTopUp);
            }
        } else {
            // Regular purchase refund
            if (escrow.isToken) {
                require(
                    thriftToken.transfer(escrow.buyer, escrow.amount),
                    "Token refund failed"
                );
            } else {
                payable(escrow.buyer).transfer(escrow.amount);
            }
        }

        emit EscrowRefunded(escrowId);
    }

    // EXCHANGE FUNCTIONS WITH ESCROW
    function createExchangeOffer(
        uint256 offeredProductId,
        uint256 wantedProductId,
        uint256 tokenTopUp
    ) external nonReentrant {
        Product storage offeredProduct = products[offeredProductId];
        Product storage wantedProduct = products[wantedProductId];

        require(offeredProduct.seller == msg.sender, "Not your product");
        require(
            !offeredProduct.isDeleted && !wantedProduct.isDeleted,
            "Product(s) deleted"
        );
        require(
            offeredProduct.isAvailableForExchange,
            "Not available for exchange"
        );
        require(
            wantedProduct.isAvailableForExchange,
            "Wanted product not for exchange"
        );
        require(
            !offeredProduct.isSold && !wantedProduct.isSold,
            "Product(s) sold"
        );

        // Ensure exactly one item is available for exchange
        require(
            offeredProduct.quantity - offeredProduct.inEscrowQuantity == 1,
            "Must have exactly one item for exchange"
        );
        require(
            wantedProduct.quantity - wantedProduct.inEscrowQuantity == 1,
            "Wanted product must have exactly one item"
        );

        // Handle token top-up if provided
        if (tokenTopUp > 0) {
            require(
                thriftToken.transferFrom(msg.sender, address(this), tokenTopUp),
                "Token transfer failed"
            );
        }

        _escrowIds.increment();
        uint256 escrowId = _escrowIds.current();

        // Setup exchange escrow
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            productId: wantedProductId,
            buyer: msg.sender, // The person offering the exchange
            seller: wantedProduct.seller,
            amount: tokenTopUp,
            deadline: block.timestamp + MAX_ESCROW_DURATION,
            quantity: 1, // Always 1 for exchanges
            buyerConfirmed: true, // Buyer auto-confirms by creating the offer
            sellerConfirmed: false,
            completed: false,
            refunded: false,
            isToken: true,
            isExchange: true,
            exchangeProductId: offeredProductId,
            tokenTopUp: tokenTopUp
        });

        // Update escrow quantity
        offeredProduct.inEscrowQuantity += 1;

        // Record the exchange offer
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

        userEscrows[msg.sender].push(escrowId);

        emit ExchangeOfferCreated(
            offeredProductId,
            wantedProductId,
            msg.sender,
            1,
            tokenTopUp,
            escrowId
        );
    }

    function acceptExchangeOffer(
        uint256 wantedProductId,
        uint256 offerIndex
    ) external nonReentrant {
        Product storage wantedProduct = products[wantedProductId];
        require(wantedProduct.seller == msg.sender, "Not your product");

        ExchangeOffer storage offer = exchangeOffers[wantedProductId][
            offerIndex
        ];
        require(offer.isActive, "Offer not active");

        // Get the escrow for this exchange
        Escrow storage escrow = escrows[offer.escrowId];
        require(
            !escrow.completed && !escrow.refunded,
            "Escrow already finalized"
        );

        // Confirm from seller side
        escrow.sellerConfirmed = true;

        // This will trigger the exchange completion
        _completeEscrow(offer.escrowId);

        // Mark the offer as inactive
        offer.isActive = false;
    }

    // AESTHETIC MANAGEMENT FUNCTIONS
    function _updateTopAesthetics() internal {
        // Only update periodically to save gas
        if (
            block.timestamp - _lastAestheticsUpdate < AESTHETICS_UPDATE_INTERVAL
        ) {
            return;
        }

        _lastAestheticsUpdate = block.timestamp;

        // Simple algorithm to find top 5 aesthetics by product count
        // This is a simplified version - in production would use a more sophisticated algorithm
        string[20] memory candidateAesthetics;
        uint256[20] memory counts;
        uint8 count = 0;

        // Collect candidate aesthetics from recently updated ones
        for (uint256 i = 1; i <= _productIds.current() && count < 20; i++) {
            Product storage product = products[i];
            if (product.isDeleted || product.isSold) continue;

            for (uint j = 0; j < product.categories.length && count < 20; j++) {
                string memory category = product.categories[j];

                // Check if already in candidates
                bool found = false;
                for (uint8 k = 0; k < count; k++) {
                    if (
                        keccak256(bytes(candidateAesthetics[k])) ==
                        keccak256(bytes(category))
                    ) {
                        counts[k]++;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    candidateAesthetics[count] = category;
                    counts[count] = aestheticsStats[category].productCount;
                    count++;
                }
            }
        }

        // Simple sort to find top 5
        for (uint8 i = 0; i < count; i++) {
            for (uint8 j = i + 1; j < count; j++) {
                if (counts[j] > counts[i]) {
                    // Swap counts
                    uint256 tempCount = counts[i];
                    counts[i] = counts[j];
                    counts[j] = tempCount;

                    // Swap aesthetics
                    string memory tempAesthetic = candidateAesthetics[i];
                    candidateAesthetics[i] = candidateAesthetics[j];
                    candidateAesthetics[j] = tempAesthetic;
                }
            }
        }

        // Update top aesthetics array
        for (uint8 i = 0; i < 5 && i < count; i++) {
            _topAesthetics[i] = candidateAesthetics[i];
        }
    }
    // VIEW FUNCTIONS FOR PRODUCT & AESTHETIC QUERIES

    function getProductsByCategory(
        string memory category,
        uint256 limit,
        uint256 offset
    ) external view returns (uint256[] memory) {
        uint256[] storage allProducts = categoryToProducts[category];
        uint256 resultCount = (offset + limit > allProducts.length)
            ? allProducts.length - offset
            : limit;

        if (offset >= allProducts.length || resultCount == 0) {
            return new uint256[](0);
        }

        uint256[] memory result = new uint256[](resultCount);
        for (uint i = 0; i < resultCount; i++) {
            // Filter out deleted and sold products
            uint256 currentProduct = allProducts[offset + i];
            if (
                !products[currentProduct].isDeleted &&
                !products[currentProduct].isSold
            ) {
                result[i] = currentProduct;
            }
        }

        return result;
    }

    function getUserProducts(
        address user
    ) external view returns (uint256[] memory) {
        return userProducts[user];
    }

    function getUserEscrows(
        address user
    ) external view returns (uint256[] memory) {
        return userEscrows[user];
    }

    function getTopAesthetics() external view returns (string[] memory) {
        return _topAesthetics;
    }

    function getExchangeOffersForProduct(
        uint256 productId
    ) external view returns (ExchangeOffer[] memory) {
        ExchangeOffer[] storage offers = exchangeOffers[productId];
        uint256 activeCount = 0;

        // Count active offers
        for (uint i = 0; i < offers.length; i++) {
            if (offers[i].isActive) {
                activeCount++;
            }
        }

        // Create result array with active offers
        ExchangeOffer[] memory result = new ExchangeOffer[](activeCount);
        uint256 resultIndex = 0;

        for (uint i = 0; i < offers.length && resultIndex < activeCount; i++) {
            if (offers[i].isActive) {
                result[resultIndex] = offers[i];
                resultIndex++;
            }
        }

        return result;
    }

    // products by aesthetics
    function getProductsByAestheticPreference(
        address user,
        uint256 limit
    ) external view returns (uint256[] memory) {
        // Get user's aesthetic preferences
        (string[] memory userPrefs, , ) = userAesthetics.getUserAesthetics(
            user
        );
        if (userPrefs.length == 0) {
            return new uint256[](0);
        }

        // Use an array to track included products
        uint256[] memory result = new uint256[](limit);
        uint256 resultCount = 0;

        // Collect products from each preferred aesthetic category
        for (uint i = 0; i < userPrefs.length && resultCount < limit; i++) {
            uint256[] storage productsInCategory = categoryToProducts[
                userPrefs[i]
            ];

            for (
                uint j = 0;
                j < productsInCategory.length && resultCount < limit;
                j++
            ) {
                uint256 productId = productsInCategory[j];
                if (
                    !products[productId].isDeleted &&
                    !products[productId].isSold
                ) {
                    result[resultCount] = productId;
                    resultCount++;
                }
            }
        }

        // If we have fewer results than the limit, resize the array
        if (resultCount < limit) {
            uint256[] memory resizedResult = new uint256[](resultCount);
            for (uint i = 0; i < resultCount; i++) {
                resizedResult[i] = result[i];
            }
            return resizedResult;
        }

        return result;
    }

    // ADMIN FUNCTIONS

    function setTreasuryWallet(address newTreasuryWallet) external {
        require(msg.sender == treasuryWallet, "Not authorized");
        treasuryWallet = newTreasuryWallet;
    }

    function setPlatformFees(uint256 newTokenFee, uint256 newEthFee) external {
        require(msg.sender == treasuryWallet, "Not authorized");
        require(newTokenFee <= 100 && newEthFee <= 100, "Fees too high"); // Max 10%

        tokenPlatformFee = newTokenFee;
        ethPlatformFee = newEthFee;
    }

    // PRODUCT DELETION

    function deleteProduct(uint256 productId) external {
        Product storage product = products[productId];
        require(
            product.seller == msg.sender || msg.sender == treasuryWallet,
            "Not authorized"
        );
        require(!product.isDeleted, "Already deleted");
        require(product.inEscrowQuantity == 0, "Has active escrows");

        product.isDeleted = true;

        // Remove from category indices
        for (uint i = 0; i < product.categories.length; i++) {
            removeFromCategoryIndex(product.categories[i], productId);
            aestheticsStats[product.categories[i]].productCount--;
        }
    }

    // BULK QUERIES

    function getProductsBatch(
        uint256[] calldata productIds
    ) external view returns (Product[] memory) {
        Product[] memory result = new Product[](productIds.length);

        for (uint i = 0; i < productIds.length; i++) {
            result[i] = products[productIds[i]];
        }

        return result;
    }

    function getEscrowsBatch(
        uint256[] calldata escrowIds
    ) external view returns (Escrow[] memory) {
        Escrow[] memory result = new Escrow[](escrowIds.length);

        for (uint i = 0; i < escrowIds.length; i++) {
            result[i] = escrows[escrowIds[i]];
        }

        return result;
    }

    // SEARCH FUNCTIONS

    function searchProducts(
        string memory searchTerm,
        string[] memory categories,
        string memory gender,
        string memory brand,
        uint256 minPrice,
        uint256 maxPrice,
        bool useTokenPrice,
        uint256 limit,
        uint256 offset
    ) external view returns (uint256[] memory) {
        uint256[] memory tempResults = new uint256[](_productIds.current());
        uint256 resultCount = 0;

        for (uint256 i = 1; i <= _productIds.current(); i++) {
            Product storage product = products[i];

            // Skip deleted or sold out products
            if (product.isDeleted || product.isSold || product.quantity == 0) {
                continue;
            }

            // Price filter
            if (useTokenPrice) {
                if (
                    product.tokenPrice < minPrice ||
                    (maxPrice > 0 && product.tokenPrice > maxPrice)
                ) {
                    continue;
                }
            } else {
                if (
                    product.ethPrice < minPrice ||
                    (maxPrice > 0 && product.ethPrice > maxPrice)
                ) {
                    continue;
                }
            }

            // Gender filter
            if (
                bytes(gender).length > 0 &&
                keccak256(bytes(product.gender)) != keccak256(bytes(gender))
            ) {
                continue;
            }

            // Brand filter
            if (
                bytes(brand).length > 0 &&
                keccak256(bytes(product.brand)) != keccak256(bytes(brand))
            ) {
                continue;
            }

            // Category filter
            if (categories.length > 0) {
                bool categoryMatch = false;
                for (uint j = 0; j < categories.length; j++) {
                    for (uint k = 0; k < product.categories.length; k++) {
                        if (
                            keccak256(bytes(categories[j])) ==
                            keccak256(bytes(product.categories[k]))
                        ) {
                            categoryMatch = true;
                            break;
                        }
                    }
                    if (categoryMatch) break;
                }
                if (!categoryMatch) continue;
            }

            // Search term in name or description (simple contains check)
            if (bytes(searchTerm).length > 0) {
                bytes memory nameBytes = bytes(product.name);
                bytes memory descBytes = bytes(product.description);
                bytes memory searchBytes = bytes(searchTerm);

                bool termMatch = false;

                // Simple contains check - not efficient but works for view functions
                if (
                    _contains(nameBytes, searchBytes) ||
                    _contains(descBytes, searchBytes)
                ) {
                    termMatch = true;
                }

                if (!termMatch) continue;
            }

            // Add to results
            tempResults[resultCount] = i;
            resultCount++;
        }

        // Apply pagination
        uint256 startIndex = offset < resultCount ? offset : resultCount;
        uint256 endIndex = (offset + limit) < resultCount
            ? (offset + limit)
            : resultCount;
        uint256 paginatedCount = endIndex - startIndex;

        uint256[] memory results = new uint256[](paginatedCount);
        for (uint256 i = 0; i < paginatedCount; i++) {
            results[i] = tempResults[startIndex + i];
        }

        return results;
    }

    // Simple string contains helper - not gas efficient but usable in view functions
    function _contains(
        bytes memory haystack,
        bytes memory needle
    ) internal pure returns (bool) {
        if (needle.length == 0) return true;
        if (haystack.length < needle.length) return false;

        for (uint i = 0; i <= haystack.length - needle.length; i++) {
            bool isMatch = true;
            for (uint j = 0; j < needle.length; j++) {
                if (haystack[i + j] != needle[j]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) return true;
        }
        return false;
    }

    // EMERGENCY FUNCTIONS

    function emergencyWithdrawEth() external {
        require(msg.sender == treasuryWallet, "Not authorized");
        payable(treasuryWallet).transfer(address(this).balance);
    }

    function emergencyWithdrawTokens(uint256 amount) external {
        require(msg.sender == treasuryWallet, "Not authorized");
        thriftToken.transfer(treasuryWallet, amount);
    }

    // Update UserAesthetics contract if needed
    function updateUserAestheticsContract(address newUserAesthetics) external {
        require(msg.sender == treasuryWallet, "Not authorized");
        userAesthetics = UserAesthetics(newUserAesthetics);
    }

    // ANALYTICS FUNCTIONS

    function getMarketplaceStats()
        external
        view
        returns (
            uint256 totalProducts,
            uint256 activeListings,
            uint256 totalCompletedEscrows,
            uint256 totalVolume
        )
    {
        totalProducts = _productIds.current();
        totalCompletedEscrows = 0;
        totalVolume = 0;
        activeListings = 0;

        // Count active listings
        for (uint256 i = 1; i <= _productIds.current(); i++) {
            if (
                !products[i].isDeleted &&
                !products[i].isSold &&
                products[i].quantity > 0
            ) {
                activeListings++;
            }
        }

        // Count completed escrows and volume
        for (uint256 i = 1; i <= _escrowIds.current(); i++) {
            if (escrows[i].completed) {
                totalCompletedEscrows++;
                totalVolume += escrows[i].amount;
            }
        }
    }

    // Receive function to allow contract to receive ETH
    receive() external payable {}
}
