// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Common data structures used across contracts
 */

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
