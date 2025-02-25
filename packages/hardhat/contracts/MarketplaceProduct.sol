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
        uint256 productId,
        uint256 newQuantity
    ) public whenNotPaused {
        Product memory product = marketplaceStorage.getProduct(productId);
        require(product.seller == msg.sender, "Not your product");
        require(!product.isDeleted && !product.isSold, "Product not available");
        require(
            newQuantity >= product.inEscrowQuantity,
            "Cannot set below escrow quantity"
        );

        marketplaceStorage.updateProductQuantity(productId, newQuantity);
    }

    /**
     * @dev Batch update product quantities
     */
    function batchUpdateQuantities(
        uint256[] calldata productIds,
        uint256[] calldata newQuantities
    ) external whenNotPaused {
        require(productIds.length == newQuantities.length, "Length mismatch");
        for (uint256 i = 0; i < productIds.length; ) {
            // Use this. to explicitly call the function on this contract
            this.updateProductQuantity(productIds[i], newQuantities[i]);
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

        return
            marketplaceStorage.createProduct(
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
                exchangePreference
            );
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
    ) external whenNotPaused {
        // Get product from storage to check ownership
        Product memory product = marketplaceStorage.getProduct(productId);
        require(product.seller == msg.sender, "Not your product");
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
    }

    /**
     * @dev Gets user's products
     */
    function getUserProducts(
        address user
    ) external view returns (ProductWithAvailability[] memory) {
        uint256[] memory userProductIds = marketplaceStorage.getUserProductIds(
            user
        );
        uint256 activeCount = 0;

        // Count active products
        for (uint256 i = 0; i < userProductIds.length; ) {
            Product memory product = marketplaceStorage.getProduct(
                userProductIds[i]
            );
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
            Product memory product = marketplaceStorage.getProduct(
                userProductIds[i]
            );
            if (!product.isDeleted) {
                userActiveProducts[currentIndex] = marketplaceStorage
                    .getProductWithAvailability(userProductIds[i]);
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
     * @dev Gets all active products
     */
    function getAllActiveProducts()
        external
        view
        returns (ProductWithAvailability[] memory)
    {
        // This is a simplified implementation
        // In a real implementation, you would need to iterate through all product IDs
        // from 1 to the current product ID, which could be gas intensive for large numbers
        // Consider implementing pagination or other optimization techniques

        // Get the current product ID (assuming products are numbered sequentially from 1)
        uint256 totalProducts = 1000; // This should be replaced with a way to get the actual count
        uint256 activeCount = 0;

        // First pass: count active products
        for (uint256 i = 1; i <= totalProducts; ) {
            Product memory product = marketplaceStorage.getProduct(i);
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

        // Second pass: fill active products array
        for (uint256 i = 1; i <= totalProducts; ) {
            Product memory product = marketplaceStorage.getProduct(i);
            if (
                !product.isDeleted &&
                !product.isSold &&
                (product.quantity - product.inEscrowQuantity) > 0
            ) {
                activeProducts[currentIndex] = marketplaceStorage
                    .getProductWithAvailability(i);
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
     * @dev Get a specific product with availability
     */
    function getProductById(
        uint256 productId
    ) external view returns (ProductWithAvailability memory) {
        return marketplaceStorage.getProductWithAvailability(productId);
    }
}
