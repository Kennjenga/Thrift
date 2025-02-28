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
        // Skip invalid products (deleted or ID == 0)
        if (product.id == 0 || product.isDeleted) {
            return false;
        }

        // Check if product is available
        if (
            params.onlyAvailable &&
            (product.isSold ||
                (product.quantity - product.inEscrowQuantity) == 0)
        ) {
            return false;
        }

        // Check if product is for exchange
        if (params.exchangeOnly && !product.isAvailableForExchange) {
            return false;
        }

        // Name query match (case insensitive)
        if (bytes(params.nameQuery).length > 0) {
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
                        // Convert to lowercase for case-insensitive comparison
                        bytes1 nameChar = nameBytes[i + j];
                        bytes1 queryChar = queryBytes[j];

                        // Convert uppercase to lowercase for both strings
                        if (nameChar >= 0x41 && nameChar <= 0x5A) {
                            nameChar = bytes1(uint8(nameChar) + 32);
                        }
                        if (queryChar >= 0x41 && queryChar <= 0x5A) {
                            queryChar = bytes1(uint8(queryChar) + 32);
                        }

                        if (nameChar != queryChar) {
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
     * @dev Search products with filters and pagination - improved to use actual product count
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

        // Get the actual product count from storage
        // Get the actual product count from storage
        uint256 latestProductId = marketplaceStorage.getProductCount();

        // Two-pass approach to handle pagination properly
        // First pass: count matching products
        uint256 totalMatches = 0;

        for (uint256 i = 1; i <= latestProductId; i++) {
            Product memory product = marketplaceStorage.getProduct(i);

            if (_productMatchesSearch(product, params)) {
                totalMatches++;
            }
        }

        // Calculate pagination values
        uint256 totalPages = totalMatches > 0
            ? (totalMatches + params.pageSize - 1) / params.pageSize
            : 1;

        uint256 startIndex = (params.page - 1) * params.pageSize;

        // Ensure valid page number
        require(params.page <= totalPages, "Page number exceeds total pages");

        // Create array for current page results
        uint256 resultsSize = Math.min(params.pageSize, totalMatches);
        ProductWithAvailability[]
            memory pageProducts = new ProductWithAvailability[](
                resultsSize > 0 ? resultsSize : 0
            );

        // Early return if no matches
        if (totalMatches == 0) {
            return
                SearchResult({
                    products: pageProducts,
                    totalResults: 0,
                    totalPages: 1,
                    currentPage: params.page
                });
        }

        // Second pass: collect matching products for current page
        uint256 matchCount = 0;
        uint256 resultIndex = 0;

        for (
            uint256 i = 1;
            i <= latestProductId && resultIndex < resultsSize;
            i++
        ) {
            Product memory product = marketplaceStorage.getProduct(i);

            if (_productMatchesSearch(product, params)) {
                if (matchCount >= startIndex) {
                    pageProducts[resultIndex] = marketplaceStorage
                        .getProductWithAvailability(i);
                    resultIndex++;
                }
                matchCount++;
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
     * @dev Gets products by their IDs with better error handling
     */
    function getProductsById(
        uint256[] calldata productIds
    ) external view returns (ProductWithAvailability[] memory) {
        ProductWithAvailability[] memory result = new ProductWithAvailability[](
            productIds.length
        );

        for (uint256 i = 0; i < productIds.length; i++) {
            // Skip invalid IDs
            if (productIds[i] == 0) {
                continue;
            }

            Product memory product = marketplaceStorage.getProduct(
                productIds[i]
            );

            // Only get availability for valid products
            if (product.id > 0) {
                result[i] = marketplaceStorage.getProductWithAvailability(
                    productIds[i]
                );
            }
        }

        return result;
    }
}
