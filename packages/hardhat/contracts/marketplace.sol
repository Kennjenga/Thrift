// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {ThriftToken} from "./thrift.sol";

contract Marketplace is ReentrancyGuard {
    ThriftToken public thriftToken;

    uint256 public tokenPlatformFee = 25; // 2.5% for token purchases
    uint256 public ethPlatformFee = 35; // 3.5% for ETH purchases
    uint256 public productCount;

    struct Product {
        uint256 id;
        address seller;
        uint256 tokenPrice;
        uint256 quantity; // Quantity of the product
        string name;
        string description;
        string size;
        string condition;
        string aesthetics;
        string brand;
        string categories;
        string gender;
        string image;
        bool isAvailableForExchange;
        string exchangePreference;
        bool isSold; // Indicates if the product is completely sold out
    }

    struct ExchangeOffer {
        uint256 productOffered;
        uint256 productWanted;
        address offerer;
        bool isActive;
    }

    // Mappings for product and exchange management
    mapping(uint256 => Product) public products;
    mapping(uint256 => ExchangeOffer[]) public exchangeOffers;

    // Events
    event ProductListed(
        uint256 id,
        address seller,
        uint256 tokenPrice,
        uint256 quantity,
        string name,
        string brand,
        string categories
    );
    event ProductSoldForTokens(
        uint256 id,
        address buyer,
        address seller,
        uint256 tokenAmount,
        uint256 quantity
    );
    event ProductSoldForEth(
        uint256 id,
        address buyer,
        address seller,
        uint256 ethAmount,
        uint256 quantity
    );
    event BulkPurchaseCompleted(
        address buyer,
        uint256[] productIds,
        uint256 totalAmount
    );
    event ExchangeOfferCreated(
        uint256 offeredProduct,
        uint256 wantedProduct,
        address offerer
    );
    event ExchangeCompleted(
        uint256 product1,
        uint256 product2,
        address party1,
        address party2
    );

    constructor(address payable _thriftTokenAddress) {
        thriftToken = ThriftToken(_thriftTokenAddress);
    }

    // Function to list a product
    function listProduct(
        string memory name,
        string memory description,
        string memory size,
        string memory condition,
        string memory aesthetics,
        string memory brand,
        string memory categories,
        string memory gender,
        string memory image,
        uint256 tokenPrice,
        uint256 quantity, // Quantity of the product
        bool isAvailableForExchange,
        string memory exchangePreference
    ) external {
        require(tokenPrice > 0, "Price must be greater than zero");
        require(quantity > 0, "Quantity must be greater than zero");

        productCount++;

        products[productCount] = Product(
            productCount,
            msg.sender,
            tokenPrice,
            quantity,
            name,
            description,
            size,
            condition,
            aesthetics,
            brand,
            categories,
            gender,
            image,
            isAvailableForExchange,
            exchangePreference,
            false
        );

        emit ProductListed(
            productCount,
            msg.sender,
            tokenPrice,
            quantity,
            name,
            brand,
            categories
        );
    }

    // Function to buy a single product with tokens
    function buyWithTokens(
        uint256 productId,
        uint256 purchaseQuantity
    ) external nonReentrant {
        Product storage product = products[productId];
        require(!product.isSold, "Product already sold");
        require(
            purchaseQuantity > 0,
            "Purchase quantity must be greater than zero"
        );
        require(
            product.quantity >= purchaseQuantity,
            "Not enough quantity available"
        );

        uint256 totalPrice = product.tokenPrice * purchaseQuantity;
        uint256 platformFeeAmount = (totalPrice * tokenPlatformFee) / 1000;
        uint256 sellerAmount = totalPrice - platformFeeAmount;

        // Transfer tokens to the seller
        require(
            thriftToken.transferFrom(msg.sender, product.seller, sellerAmount),
            "Transfer to seller failed"
        );

        // Collect platform fee
        require(
            thriftToken.transferFrom(
                msg.sender,
                address(this),
                platformFeeAmount
            ),
            "Platform fee transfer failed"
        );

        product.quantity -= purchaseQuantity; // Reduce the quantity
        if (product.quantity == 0) {
            product.isSold = true; // Mark as sold if quantity is zero
        }

        emit ProductSoldForTokens(
            productId,
            msg.sender,
            product.seller,
            totalPrice,
            purchaseQuantity
        );
    }

    // Function to buy a single product with ETH
    function buyWithEth(
        uint256 productId,
        uint256 purchaseQuantity
    ) external payable nonReentrant {
        Product storage product = products[productId];
        require(!product.isSold, "Product already sold");
        require(
            purchaseQuantity > 0,
            "Purchase quantity must be greater than zero"
        );
        require(
            product.quantity >= purchaseQuantity,
            "Not enough quantity available"
        );

        uint256 totalEthPrice = thriftToken.getEthAmount(
            product.tokenPrice * purchaseQuantity
        );
        require(msg.value >= totalEthPrice, "Insufficient ETH sent");

        uint256 platformFeeAmount = (msg.value * ethPlatformFee) / 1000;
        uint256 sellerAmount = msg.value - platformFeeAmount;

        // Transfer ETH to the seller
        (bool success, ) = product.seller.call{value: sellerAmount}("");
        require(success, "Transfer to seller failed");

        product.quantity -= purchaseQuantity; // Reduce the quantity
        if (product.quantity == 0) {
            product.isSold = true; // Mark as sold if quantity is zero
        }

        emit ProductSoldForEth(
            productId,
            msg.sender,
            product.seller,
            msg.value,
            purchaseQuantity
        );
    }

    // Bulk purchase with tokens
    function bulkPurchaseWithTokens(
        uint256[] memory productIds,
        uint256[] memory quantities
    ) external nonReentrant {
        require(productIds.length > 0, "No products selected");
        require(
            productIds.length == quantities.length,
            "Mismatched productIds and quantities"
        );

        uint256 totalAmount = 0;

        for (uint i = 0; i < productIds.length; i++) {
            uint256 productId = productIds[i];
            uint256 purchaseQuantity = quantities[i];
            Product storage product = products[productId];
            require(!product.isSold, "Product already sold");
            require(
                purchaseQuantity > 0,
                "Purchase quantity must be greater than zero"
            );
            require(
                product.quantity >= purchaseQuantity,
                "Not enough quantity available"
            );

            uint256 productTotalPrice = product.tokenPrice * purchaseQuantity;
            totalAmount += productTotalPrice;

            product.quantity -= purchaseQuantity; // Reduce the quantity
            if (product.quantity == 0) {
                product.isSold = true; // Mark as sold if quantity is zero
            }

            // Transfer tokens to the seller
            require(
                thriftToken.transferFrom(
                    msg.sender,
                    product.seller,
                    productTotalPrice
                ),
                "Transfer to seller failed"
            );
        }

        // Calculate and collect platform fee
        uint256 platformFeeAmount = (totalAmount * tokenPlatformFee) / 1000;
        require(
            thriftToken.transferFrom(
                msg.sender,
                address(this),
                platformFeeAmount
            ),
            "Platform fee transfer failed"
        );

        emit BulkPurchaseCompleted(
            msg.sender,
            productIds,
            totalAmount + platformFeeAmount
        );
    }

    // Exchange functionality
    function createExchangeOffer(
        uint256 offeredProductId,
        uint256 wantedProductId
    ) external {
        Product storage offeredProduct = products[offeredProductId];
        Product storage wantedProduct = products[wantedProductId];

        require(
            offeredProduct.seller == msg.sender,
            "Not the owner of offered product"
        );
        require(!offeredProduct.isSold, "Offered product already sold");
        require(!wantedProduct.isSold, "Wanted product already sold");
        require(
            wantedProduct.isAvailableForExchange,
            "Product not available for exchange"
        );

        exchangeOffers[wantedProductId].push(
            ExchangeOffer(offeredProductId, wantedProductId, msg.sender, true)
        );

        emit ExchangeOfferCreated(
            offeredProductId,
            wantedProductId,
            msg.sender
        );
    }

    function acceptExchangeOffer(
        uint256 productId,
        uint256 offerIndex
    ) external nonReentrant {
        ExchangeOffer storage offer = exchangeOffers[productId][offerIndex];
        require(offer.isActive, "Offer is not active");

        Product storage product1 = products[offer.productOffered];
        Product storage product2 = products[offer.productWanted];

        require(
            msg.sender == product2.seller,
            "Not the owner of wanted product"
        );
        require(
            !product1.isSold && !product2.isSold,
            "One of the products is sold"
        );

        product1.isSold = true;
        product2.isSold = true;
        offer.isActive = false;

        emit ExchangeCompleted(
            offer.productOffered,
            offer.productWanted,
            offer.offerer,
            msg.sender
        );
    }

    receive() external payable {}
}
