// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./ThriftMarketplaceTypes.sol";
import "./ThriftMarketplaceInterfaces.sol";

/**
 * @title MarketplaceQuery
 * @dev Contract that handles query and search functionality
 */
contract MarketplaceQuery is IMarketplaceQuery, Ownable {
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

    /**
     * @dev Check if a product matches search parameters
     */
    function _productMatchesSearch(
        Product memory product,
        SearchParams memory params
    ) internal pure returns (bool) {
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

        // For a real implementation, you would need to have a way to iterate through all product IDs
        // Here we're using a simple approach assuming products are numbered from 1 to 1000
        // This would need to be improved in a production environment
        uint256 totalProducts = 1000;
        uint256 totalMatches = 0;

        // First pass: count total matches
        for (uint256 i = 1; i <= totalProducts; i++) {
            Product memory product = marketplaceStorage.getProduct(i);

            // Skip invalid products (id == 0 means product doesn't exist)
            if (product.id == 0) continue;

            if (_productMatchesSearch(product, params)) {
                unchecked {
                    ++totalMatches;
                }
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
            i++
        ) {
            Product memory product = marketplaceStorage.getProduct(i);

            // Skip invalid products
            if (product.id == 0) continue;

            if (_productMatchesSearch(product, params)) {
                if (matchesFound >= startIndex) {
                    pageProducts[currentIndex] = marketplaceStorage
                        .getProductWithAvailability(i);
                    unchecked {
                        ++currentIndex;
                    }
                }
                unchecked {
                    ++matchesFound;
                }
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
        IUserAesthetics userAesthetics = IUserAesthetics(
            marketplaceStorage.userAesthetics()
        );
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
     * @dev Gets products by their IDs
     */
    function getProductsById(
        uint256[] calldata productIds
    ) external view returns (ProductWithAvailability[] memory) {
        ProductWithAvailability[] memory result = new ProductWithAvailability[](
            productIds.length
        );

        for (uint256 i = 0; i < productIds.length; i++) {
            result[i] = marketplaceStorage.getProductWithAvailability(
                productIds[i]
            );
        }

        return result;
    }
}
