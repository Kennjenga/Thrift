// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ThriftMarketplaceTypes.sol";
import "./ThriftMarketplaceInterfaces.sol";

/**
 * @title MarketplaceProduct
 * @dev Contract that handles product management functionality
 */
contract MarketplaceProduct is IMarketplaceProduct, Ownable {
    // Reference to the central storage contract
    IMarketplaceStorage public marketplaceStorage;

    // Events for product tracking
    event ProductCreated(
        uint256 indexed productId,
        address indexed seller,
        string name,
        uint256 quantity
    );
    event ProductUpdated(
        uint256 indexed productId,
        address indexed seller,
        string name,
        uint256 tokenPrice,
        uint256 ethPrice
    );
    event ProductQuantityChanged(
        uint256 indexed productId,
        uint256 oldQuantity,
        uint256 newQuantity
    );

    /**
     * @dev Contract constructor
     */
    constructor(address _marketplaceStorage) {
        require(_marketplaceStorage != address(0), "Invalid storage address");
        marketplaceStorage = IMarketplaceStorage(_marketplaceStorage);
        _transferOwnership(marketplaceStorage.treasuryWallet());
    }

    // Modifier to check if contract is paused
    modifier whenNotPaused() {
        require(!marketplaceStorage.isPaused(), "Contract is paused");
        _;
    }

    /**
     * @dev Updates product quantity
     */
    function updateProductQuantity(
        address originalSender,
        uint256 productId,
        uint256 newQuantity
    ) public whenNotPaused {
        require(productId > 0, "Invalid product ID");

        Product memory product = marketplaceStorage.getProduct(productId);
        require(product.id > 0, "Product does not exist");
        require(product.seller == originalSender, "Not your product");
        require(!product.isDeleted && !product.isSold, "Product not available");
        require(
            newQuantity >= product.inEscrowQuantity,
            "Cannot set below escrow quantity"
        );

        uint256 oldQuantity = product.quantity;
        marketplaceStorage.updateProductQuantity(productId, newQuantity);

        emit ProductQuantityChanged(productId, oldQuantity, newQuantity);
    }

    /**
     * @dev Batch update product quantities
     */
    function batchUpdateQuantities(
        address originalSender,
        uint256[] calldata productIds,
        uint256[] calldata newQuantities
    ) external whenNotPaused {
        require(productIds.length > 0, "Empty product array");
        require(productIds.length == newQuantities.length, "Length mismatch");
        require(productIds.length <= 20, "Too many products");

        for (uint256 i = 0; i < productIds.length; ) {
            // Use this. to explicitly call the function on this contract
            this.updateProductQuantity(
                originalSender,
                productIds[i],
                newQuantities[i]
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Creates a new product listing
     * @return uint256 ID of the created product
     */
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
    ) external whenNotPaused returns (uint256) {
        require(originalSender != address(0), "Invalid sender address");
        require(quantity > 0, "Quantity must be positive");
        require(tokenPrice > 0 || ethPrice > 0, "Must set at least one price");
        require(
            categories.length > 0 && categories.length <= 20,
            "Invalid categories count"
        );
        require(bytes(name).length > 0, "Name required");
        require(bytes(name).length <= 100, "Name too long");
        require(bytes(description).length <= 1000, "Description too long");

        uint256 productId = marketplaceStorage.createProduct(
            originalSender,
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
            exchangePreference
        );

        emit ProductCreated(productId, originalSender, name, quantity);

        return productId;
    }

    /**
     * @dev Updates an existing product
     */
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
    ) external whenNotPaused {
        require(productId > 0, "Invalid product ID");

        // Get product from storage to check ownership
        Product memory product = marketplaceStorage.getProduct(productId);
        require(product.id > 0, "Product does not exist");
        require(product.seller == originalSender, "Not your product");
        require(!product.isDeleted && !product.isSold, "Product not available");
        require(tokenPrice > 0 || ethPrice > 0, "Must set at least one price");
        require(
            categories.length > 0 && categories.length <= 20,
            "Invalid categories count"
        );

        marketplaceStorage.updateProduct(
            productId,
            name,
            description,
            size,
            condition,
            brand,
            categories,
            gender,
            image,
            tokenPrice,
            ethPrice,
            isAvailableForExchange,
            exchangePreference
        );

        emit ProductUpdated(
            productId,
            originalSender,
            name,
            tokenPrice,
            ethPrice
        );
    }

    /**
     * @dev Gets user's products with improved error handling and verification
     */
    function getUserProducts(
        address user
    ) external view returns (ProductWithAvailability[] memory) {
        require(user != address(0), "Invalid user address");

        // Get product IDs owned by the user
        uint256[] memory userProductIds = marketplaceStorage.getUserProductIds(
            user
        );

        // Early return if user has no products
        if (userProductIds.length == 0) {
            return new ProductWithAvailability[](0);
        }

        // Count active products (non-deleted)
        uint256 activeCount = 0;

        for (uint256 i = 0; i < userProductIds.length; i++) {
            // Validate product ID
            if (userProductIds[i] == 0) continue;

            Product memory product = marketplaceStorage.getProduct(
                userProductIds[i]
            );

            // Make sure we have a valid product (ID > 0) before counting it
            if (product.id > 0 && !product.isDeleted) {
                activeCount++;
            }
        }

        // If no active products, return empty array
        if (activeCount == 0) {
            return new ProductWithAvailability[](0);
        }

        // Create array for active products
        ProductWithAvailability[]
            memory userActiveProducts = new ProductWithAvailability[](
                activeCount
            );

        uint256 currentIndex = 0;

        // Fill array with valid products
        for (
            uint256 i = 0;
            i < userProductIds.length && currentIndex < activeCount;
            i++
        ) {
            // Skip invalid product IDs
            if (userProductIds[i] == 0) continue;

            Product memory product = marketplaceStorage.getProduct(
                userProductIds[i]
            );

            if (product.id > 0 && !product.isDeleted) {
                // Get full product with availability info
                userActiveProducts[currentIndex] = marketplaceStorage
                    .getProductWithAvailability(userProductIds[i]);
                currentIndex++;
            }
        }

        return userActiveProducts;
    }

    /**
     * @dev Gets all active products with improved approach
     */
    function getAllActiveProducts()
        external
        view
        returns (ProductWithAvailability[] memory)
    {
        // Get total product count from storage
        uint256 latestProductId = marketplaceStorage.getProductCount();
        uint256 maxResults = 50; // Limit to prevent out of gas errors

        // First pass: count active products
        uint256 activeCount = 0;

        for (
            uint256 i = 1;
            i <= latestProductId && activeCount < maxResults;
            i++
        ) {
            Product memory product = marketplaceStorage.getProduct(i);

            if (
                product.id > 0 &&
                !product.isDeleted &&
                !product.isSold &&
                (product.quantity - product.inEscrowQuantity) > 0
            ) {
                activeCount++;
            }
        }

        // If no active products, return empty array
        if (activeCount == 0) {
            return new ProductWithAvailability[](0);
        }

        // Second pass: fill active products array
        ProductWithAvailability[]
            memory activeProducts = new ProductWithAvailability[](
                activeCount > maxResults ? maxResults : activeCount
            );

        uint256 currentIndex = 0;

        for (
            uint256 i = 1;
            i <= latestProductId && currentIndex < activeProducts.length;
            i++
        ) {
            Product memory product = marketplaceStorage.getProduct(i);

            if (
                product.id > 0 &&
                !product.isDeleted &&
                !product.isSold &&
                (product.quantity - product.inEscrowQuantity) > 0
            ) {
                activeProducts[currentIndex] = marketplaceStorage
                    .getProductWithAvailability(i);
                currentIndex++;
            }
        }

        return activeProducts;
    }

    /**
     * @dev Get a specific product with availability
     */
    function getProductById(
        uint256 productId
    ) external view returns (ProductWithAvailability memory) {
        require(productId > 0, "Invalid product ID");
        Product memory product = marketplaceStorage.getProduct(productId);
        require(product.id > 0, "Product does not exist");

        return marketplaceStorage.getProductWithAvailability(productId);
    }

    /**
     * @dev Debug function to verify a user's products are properly tracked
     */
    function debugUserProducts(
        address user
    )
        external
        view
        returns (
            uint256 totalProductCount,
            uint256 activeProductCount,
            uint256[] memory productIds
        )
    {
        require(user != address(0), "Invalid user address");

        uint256[] memory userProductIds = marketplaceStorage.getUserProductIds(
            user
        );
        totalProductCount = userProductIds.length;

        // Count active products
        activeProductCount = 0;
        for (uint256 i = 0; i < userProductIds.length; i++) {
            // Skip invalid IDs
            if (userProductIds[i] == 0) continue;

            Product memory product = marketplaceStorage.getProduct(
                userProductIds[i]
            );

            if (product.id > 0 && !product.isDeleted) {
                activeProductCount++;
            }
        }

        return (totalProductCount, activeProductCount, userProductIds);
    }
}
