// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {ThriftToken} from "./thrift.sol";

contract Marketplace is ReentrancyGuard {
    ThriftToken public thriftToken;
    address public treasuryWallet;

    uint256 public tokenPlatformFee = 35; // 3.5% total platform fee
    uint256 public ethPlatformFee = 35; // 3.5% total platform fee
    uint256 public constant BURN_PERCENTAGE = 60; // 60% of platform fees are burned
    uint256 public constant TREASURY_PERCENTAGE = 40; // 40% to treasury
    uint256 public constant SPENDING_REWARD_PERCENTAGE = 20; // 2% spending reward

    uint256 public productCount;

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
        string categories;
        string gender;
        string image;
        bool isAvailableForExchange;
        string exchangePreference;
        bool isSold;
    }

    // Updated exchange offer struct to include quantity and token top-up
    struct ExchangeOffer {
        uint256 offeredProductId;
        uint256 wantedProductId;
        address offerer;
        bool isActive;
        uint256 offeredQuantity;
        uint256 tokenTopUp;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => ExchangeOffer[]) public exchangeOffers;

    event ProductListed(
        uint256 id,
        address seller,
        uint256 tokenPrice,
        uint256 ethPrice
    );
    event ProductSoldForTokens(
        uint256 id,
        address buyer,
        address seller,
        uint256 amount
    );
    event ProductSoldForEth(
        uint256 id,
        address buyer,
        address seller,
        uint256 amount
    );
    event ListingDeleted(uint256 productId, address seller);
    event EnhancedExchangeOfferCreated(
        uint256 offeredProductId,
        uint256 wantedProductId,
        address offerer,
        uint256 offeredQuantity,
        uint256 tokenTopUp
    );
    event EnhancedExchangeCompleted(
        uint256 product1,
        uint256 product2,
        address party1,
        address party2,
        uint256 exchangedQuantity,
        uint256 tokenTopUp
    );
    event BulkPurchaseCompleted(
        address buyer,
        uint256[] productIds,
        uint256 totalAmount
    );

    constructor(address payable _thriftTokenAddress, address _treasuryWallet) {
        thriftToken = ThriftToken(_thriftTokenAddress);
        treasuryWallet = _treasuryWallet;
    }

    function listProduct(
        string memory name,
        string memory description,
        string memory size,
        string memory condition,
        string memory brand,
        string memory categories,
        string memory gender,
        string memory image,
        uint256 tokenPrice,
        uint256 ethPrice,
        uint256 quantity,
        bool isAvailableForExchange,
        string memory exchangePreference
    ) external {
        require(tokenPrice > 0 || ethPrice > 0, "Must set at least one price");
        require(quantity > 0, "Quantity must be greater than zero");

        productCount++;
        products[productCount] = Product(
            productCount,
            msg.sender,
            tokenPrice,
            ethPrice,
            quantity,
            name,
            description,
            size,
            condition,
            brand,
            categories,
            gender,
            image,
            isAvailableForExchange,
            exchangePreference,
            false
        );

        emit ProductListed(productCount, msg.sender, tokenPrice, ethPrice);
    }

    function deleteListing(uint256 productId) external {
        Product storage product = products[productId];
        require(product.seller == msg.sender, "Only seller can delete listing");
        require(!product.isSold, "Cannot delete sold product");

        // Reset the product to effectively delete it
        delete products[productId];

        // Optional: Emit an event for tracking
        emit ListingDeleted(productId, msg.sender);
    }

    function buyWithTokens(
        uint256 productId,
        uint256 quantity
    ) external nonReentrant {
        Product storage product = products[productId];
        require(!product.isSold, "Product sold out");
        require(product.quantity >= quantity, "Insufficient quantity");
        require(product.tokenPrice > 0, "Token price not set");

        uint256 totalCost = product.tokenPrice * quantity;

        // Calculate fees and rewards
        uint256 platformFeeAmount = (totalCost * tokenPlatformFee) / 1000;
        uint256 burnAmount = (platformFeeAmount * BURN_PERCENTAGE) / 100;
        uint256 treasuryAmount = platformFeeAmount - burnAmount;
        uint256 spendingReward = (totalCost * SPENDING_REWARD_PERCENTAGE) /
            1000;

        // Process platform fees
        require(
            thriftToken.transferFrom(
                msg.sender,
                address(this),
                platformFeeAmount
            ),
            "Platform fee transfer failed"
        );

        // Transfer tokens to seller
        require(
            thriftToken.transferFrom(msg.sender, product.seller, totalCost),
            "Seller transfer failed"
        );

        // Update product state
        product.quantity -= quantity;
        if (product.quantity == 0) {
            product.isSold = true;
        }

        // Process fees and rewards
        thriftToken.burn(burnAmount);
        require(
            thriftToken.transfer(treasuryWallet, treasuryAmount),
            "Treasury transfer failed"
        );
        thriftToken.mintReward(msg.sender, spendingReward);

        emit ProductSoldForTokens(
            productId,
            msg.sender,
            product.seller,
            totalCost
        );
    }

    function buyWithEth(
        uint256 productId,
        uint256 quantity
    ) external payable nonReentrant {
        Product storage product = products[productId];
        require(!product.isSold, "Product sold out");
        require(product.quantity >= quantity, "Insufficient quantity");
        require(product.ethPrice > 0, "ETH price not set");

        uint256 totalCost = product.ethPrice * quantity;
        require(msg.value == totalCost, "Incorrect ETH amount");

        uint256 platformFeeAmount = (totalCost * ethPlatformFee) / 1000;
        // uint256 burnAmount = (platformFeeAmount * BURN_PERCENTAGE) / 100;
        uint256 treasuryAmount = platformFeeAmount;
        uint256 sellerAmount = totalCost - platformFeeAmount;

        // Transfer ETH to seller
        payable(product.seller).transfer(sellerAmount);

        // Update product state
        product.quantity -= quantity;
        if (product.quantity == 0) {
            product.isSold = true;
        }

        // Send treasury amount
        payable(treasuryWallet).transfer(treasuryAmount);

        emit ProductSoldForEth(
            productId,
            msg.sender,
            product.seller,
            totalCost
        );
    }

    function buyWithTokensBulk(
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external nonReentrant {
        require(
            productIds.length == quantities.length,
            "Arrays length mismatch"
        );
        require(productIds.length > 0, "Empty purchase");

        uint256 totalCost = 0;

        // Calculate total cost
        for (uint256 i = 0; i < productIds.length; i++) {
            Product storage product = products[productIds[i]];
            require(!product.isSold, "Product sold out");
            require(product.quantity >= quantities[i], "Insufficient quantity");
            require(product.tokenPrice > 0, "Token price not set");
            totalCost += product.tokenPrice * quantities[i];
        }

        // Calculate fees and rewards
        uint256 platformFeeAmount = (totalCost * tokenPlatformFee) / 1000;
        uint256 burnAmount = (platformFeeAmount * BURN_PERCENTAGE) / 100;
        uint256 treasuryAmount = platformFeeAmount - burnAmount;
        uint256 spendingReward = (totalCost * SPENDING_REWARD_PERCENTAGE) /
            1000;

        // Process platform fees
        require(
            thriftToken.transferFrom(
                msg.sender,
                address(this),
                platformFeeAmount
            ),
            "Platform fee transfer failed"
        );

        // Process each purchase
        for (uint256 i = 0; i < productIds.length; i++) {
            Product storage product = products[productIds[i]];
            uint256 sellerAmount = product.tokenPrice * quantities[i];

            require(
                thriftToken.transferFrom(
                    msg.sender,
                    product.seller,
                    sellerAmount
                ),
                "Seller transfer failed"
            );

            product.quantity -= quantities[i];
            if (product.quantity == 0) {
                product.isSold = true;
            }
        }

        // Process fees and rewards
        thriftToken.burn(burnAmount);
        require(
            thriftToken.transfer(treasuryWallet, treasuryAmount),
            "Treasury transfer failed"
        );
        thriftToken.mintReward(msg.sender, spendingReward);

        emit BulkPurchaseCompleted(msg.sender, productIds, totalCost);
    }

    function buyWithEthBulk(
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external payable nonReentrant {
        require(
            productIds.length == quantities.length,
            "Arrays length mismatch"
        );
        require(productIds.length > 0, "Empty purchase");

        uint256 totalCost = 0;

        // Calculate total cost
        for (uint256 i = 0; i < productIds.length; i++) {
            Product storage product = products[productIds[i]];
            require(!product.isSold, "Product sold out");
            require(product.quantity >= quantities[i], "Insufficient quantity");
            require(product.ethPrice > 0, "ETH price not set");
            totalCost += product.ethPrice * quantities[i];
        }

        require(msg.value == totalCost, "Incorrect ETH amount");

        uint256 platformFeeAmount = (totalCost * ethPlatformFee) / 1000;
        // uint256 burnAmount = (platformFeeAmount * BURN_PERCENTAGE) / 100;
        uint256 treasuryAmount = platformFeeAmount;

        // Process each purchase
        for (uint256 i = 0; i < productIds.length; i++) {
            Product storage product = products[productIds[i]];
            uint256 itemCost = product.ethPrice * quantities[i];
            uint256 itemSellerAmount = itemCost -
                ((itemCost * ethPlatformFee) / 1000);

            payable(product.seller).transfer(itemSellerAmount);

            product.quantity -= quantities[i];
            if (product.quantity == 0) {
                product.isSold = true;
            }
        }

        // Send treasury amount
        payable(treasuryWallet).transfer(treasuryAmount);

        emit BulkPurchaseCompleted(msg.sender, productIds, totalCost);
    }

    function createEnhancedExchangeOffer(
        uint256 offeredProductId,
        uint256 wantedProductId,
        uint256 offeredQuantity,
        uint256 tokenTopUp
    ) external {
        Product storage offeredProduct = products[offeredProductId];
        Product storage wantedProduct = products[wantedProductId];

        require(offeredProduct.seller == msg.sender, "Not your product");
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
        require(
            offeredProduct.quantity >= offeredQuantity,
            "Insufficient product quantity"
        );

        // Optional token top-up
        if (tokenTopUp > 0) {
            require(
                thriftToken.transferFrom(msg.sender, address(this), tokenTopUp),
                "Token transfer failed"
            );
        }

        exchangeOffers[wantedProductId].push(
            ExchangeOffer(
                offeredProductId,
                wantedProductId,
                msg.sender,
                true,
                offeredQuantity,
                tokenTopUp
            )
        );

        emit EnhancedExchangeOfferCreated(
            offeredProductId,
            wantedProductId,
            msg.sender,
            offeredQuantity,
            tokenTopUp
        );
    }

    // Updated accept exchange offer to handle new exchange mechanics
    function acceptEnhancedExchangeOffer(
        uint256 productId,
        uint256 offerIndex
    ) external nonReentrant {
        Product storage receivingProduct = products[productId];
        require(receivingProduct.seller == msg.sender, "Not your product");

        ExchangeOffer storage offer = exchangeOffers[productId][offerIndex];
        require(offer.isActive, "Offer not active");

        Product storage offeringProduct = products[offer.offeredProductId];
        require(
            !offeringProduct.isSold && !receivingProduct.isSold,
            "Product(s) sold"
        );
        require(
            receivingProduct.quantity >= 1,
            "Insufficient receiving product quantity"
        );

        // Transfer ownership and quantity
        address party1 = offeringProduct.seller;
        address party2 = receivingProduct.seller;

        offeringProduct.seller = party2;
        receivingProduct.seller = party1;

        // Adjust quantities
        offeringProduct.quantity -= offer.offeredQuantity;
        receivingProduct.quantity -= 1;

        // Handle token top-up
        if (offer.tokenTopUp > 0) {
            require(
                thriftToken.transfer(receivingProduct.seller, offer.tokenTopUp),
                "Token transfer failed"
            );
        }

        offer.isActive = false;

        emit EnhancedExchangeCompleted(
            offer.offeredProductId,
            productId,
            party1,
            party2,
            offer.offeredQuantity,
            offer.tokenTopUp
        );
    }
}
