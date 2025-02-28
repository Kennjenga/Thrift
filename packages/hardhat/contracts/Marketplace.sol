// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ThriftMarketplaceInterfaces.sol";

/**
 * @title Marketplace
 * @dev Main marketplace contract that serves as an entry point and delegate for all functionality
 */
contract Marketplace is Ownable {
    // Contract references
    IMarketplaceStorage public marketplaceStorage;
    IMarketplaceProduct public marketplaceProduct;
    IMarketplaceEscrow public marketplaceEscrow;
    IMarketplaceQuery public marketplaceQuery;

    /**
     * @dev Contract constructor
     */
    constructor(
        address _marketplaceStorage,
        address _marketplaceProduct,
        address _marketplaceEscrow,
        address _marketplaceQuery
    ) {
        require(_marketplaceStorage != address(0), "Invalid storage address");
        require(_marketplaceProduct != address(0), "Invalid product address");
        require(_marketplaceEscrow != address(0), "Invalid escrow address");
        require(_marketplaceQuery != address(0), "Invalid query address");

        marketplaceStorage = IMarketplaceStorage(_marketplaceStorage);
        marketplaceProduct = IMarketplaceProduct(_marketplaceProduct);
        marketplaceEscrow = IMarketplaceEscrow(_marketplaceEscrow);
        marketplaceQuery = IMarketplaceQuery(_marketplaceQuery);

        _transferOwnership(marketplaceStorage.treasuryWallet());
    }

    /**
     * @dev Update the addresses of the component contracts
     * This allows for upgrading individual components without replacing the entire system
     */
    function updateContractAddresses(
        address _marketplaceStorage,
        address _marketplaceProduct,
        address _marketplaceEscrow,
        address _marketplaceQuery
    ) external onlyOwner {
        if (_marketplaceStorage != address(0)) {
            marketplaceStorage = IMarketplaceStorage(_marketplaceStorage);
        }

        if (_marketplaceProduct != address(0)) {
            marketplaceProduct = IMarketplaceProduct(_marketplaceProduct);
        }

        if (_marketplaceEscrow != address(0)) {
            marketplaceEscrow = IMarketplaceEscrow(_marketplaceEscrow);
        }

        if (_marketplaceQuery != address(0)) {
            marketplaceQuery = IMarketplaceQuery(_marketplaceQuery);
        }
    }

    // Product functions
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
        return
            marketplaceProduct.createProduct(
                msg.sender, // Pass original sender
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
                quantity,
                isAvailableForExchange,
                exchangePreference
            );
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
        marketplaceProduct.updateProduct(
            msg.sender, // Pass original sender
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

    function updateProductQuantity(
        uint256 productId,
        uint256 newQuantity
    ) external {
        marketplaceProduct.updateProductQuantity(
            msg.sender, // Pass original sender
            productId,
            newQuantity
        );
    }

    function batchUpdateQuantities(
        uint256[] calldata productIds,
        uint256[] calldata newQuantities
    ) external {
        marketplaceProduct.batchUpdateQuantities(
            msg.sender, // Pass original sender
            productIds,
            newQuantities
        );
    }

    function getUserProducts(
        address user
    ) external view returns (ProductWithAvailability[] memory) {
        return marketplaceProduct.getUserProducts(user);
    }

    function getAllActiveProducts()
        external
        view
        returns (ProductWithAvailability[] memory)
    {
        return marketplaceProduct.getAllActiveProducts();
    }

    // Escrow functions
    function createEscrowWithEth(
        uint256 productId,
        uint256 quantity
    ) external payable {
        marketplaceEscrow.createEscrowWithEth{value: msg.value}(
            msg.sender, // Pass original sender
            productId,
            quantity
        );
    }

    function createEscrowWithTokens(
        uint256 productId,
        uint256 quantity
    ) external {
        marketplaceEscrow.createEscrowWithTokens(
            msg.sender, // Pass original sender
            productId,
            quantity
        );
    }

    function createExchangeOffer(
        uint256 offeredProductId,
        uint256 wantedProductId,
        uint256 quantity,
        uint256 tokenTopUp
    ) external {
        marketplaceEscrow.createExchangeOffer(
            msg.sender, // Pass original sender
            offeredProductId,
            wantedProductId,
            quantity,
            tokenTopUp
        );
    }

    function createBulkEscrowWithEth(
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external payable returns (uint256[] memory) {
        return
            marketplaceEscrow.createBulkEscrowWithEth{value: msg.value}(
                msg.sender, // Pass original sender
                productIds,
                quantities
            );
    }

    function createBulkEscrowWithTokens(
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external returns (uint256[] memory) {
        return
            marketplaceEscrow.createBulkEscrowWithTokens(
                msg.sender, // Pass original sender
                productIds,
                quantities
            );
    }

    function confirmEscrow(uint256 escrowId) external {
        marketplaceEscrow.confirmEscrow(msg.sender, escrowId);
    }

    function rejectEscrow(uint256 escrowId, string memory reason) external {
        marketplaceEscrow.rejectEscrow(msg.sender, escrowId, reason);
    }

    function cancelEscrow(uint256 escrowId) external {
        marketplaceEscrow.cancelEscrow(msg.sender, escrowId);
    }

    function bulkConfirmEscrowsAsBuyer(uint256[] calldata escrowIds) external {
        marketplaceEscrow.bulkConfirmEscrowsAsBuyer(msg.sender, escrowIds);
    }

    function bulkConfirmEscrowsForSeller(
        uint256[] calldata escrowIds
    ) external {
        marketplaceEscrow.bulkConfirmEscrowsForSeller(msg.sender, escrowIds);
    }

    function getUserActiveEscrowsAsBuyer(
        address user
    ) external view returns (uint256[] memory) {
        return marketplaceEscrow.getUserActiveEscrowsAsBuyer(user);
    }

    function getUserActiveEscrowsAsSeller(
        address user
    ) external view returns (uint256[] memory) {
        return marketplaceEscrow.getUserActiveEscrowsAsSeller(user);
    }

    function getUserCompletedEscrows(
        address user
    ) external view returns (uint256[] memory) {
        return marketplaceEscrow.getUserCompletedEscrows(user);
    }

    function getExchangeOffers(
        uint256 productId
    ) external view returns (ExchangeOffer[] memory) {
        return marketplaceEscrow.getExchangeOffers(productId);
    }

    // Query functions
    function searchProducts(
        SearchParams memory params
    ) external view returns (SearchResult memory) {
        return marketplaceQuery.searchProducts(params);
    }

    function getProductsByUserAesthetics(
        address user,
        uint256 page,
        uint256 pageSize
    ) external view returns (SearchResult memory) {
        return
            marketplaceQuery.getProductsByUserAesthetics(user, page, pageSize);
    }

    function getProductsById(
        uint256[] calldata productIds
    ) external view returns (ProductWithAvailability[] memory) {
        return marketplaceQuery.getProductsById(productIds);
    }

    // Admin functions (delegated to storage contract)
    function updatePlatformFees(
        uint256 newTokenFee,
        uint256 newEthFee
    ) external {
        marketplaceStorage.updatePlatformFees(newTokenFee, newEthFee);
    }

    function updateTreasuryWallet(address newTreasury) external {
        marketplaceStorage.updateTreasuryWallet(newTreasury);
    }

    function updateUserAesthetics(address newUserAesthetics) external {
        marketplaceStorage.updateUserAesthetics(newUserAesthetics);
    }

    function togglePause() external {
        marketplaceStorage.togglePause();
    }

    // Receive and fallback functions (forwarded to storage contract)
    receive() external payable {
        (bool success, ) = address(marketplaceStorage).call{value: msg.value}(
            ""
        );
        require(success, "ETH transfer failed");
    }

    fallback() external payable {
        (bool success, ) = address(marketplaceStorage).call{value: msg.value}(
            msg.data
        );
        require(success, "Fallback call failed");
    }
}
