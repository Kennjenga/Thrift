// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ThriftMarketplaceTypes.sol";
import "./ThriftMarketplaceInterfaces.sol";

/**
 * @title MarketplaceEscrow
 * @dev Contract that handles escrow and exchange functionality
 */
 contract MarketplaceEscrow is
    IMarketplaceEscrow,
    Ownable,
    ReentrancyGuard
{
    // Reference to the central storage contract
    IMarketplaceStorage public marketplaceStorage;

    // Events with minimal parameters to save gas and code size
    event EscrowCreated(uint256 id, address buyer, address seller);
    event EscrowAction(uint256 id, string action);
    event EscrowRefunded(uint256 id, string reason);

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
     * @dev Creates an exchange offer
     */
    function createExchangeOffer(
        address originalSender,
        uint256 offeredProductId,
        uint256 wantedProductId,
        uint256 quantity,
        uint256 tokenTopUp
    ) external whenNotPaused nonReentrant {
        Product memory offeredProduct = marketplaceStorage.getProduct(
            offeredProductId
        );
        Product memory wantedProduct = marketplaceStorage.getProduct(
            wantedProductId
        );

        require(offeredProduct.seller == originalSender, "Not your product");
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
            quantity > 0 && quantity <= marketplaceStorage.MAX_BULK_PURCHASE(),
            "Invalid quantity"
        );

        uint256 availableQuantity = marketplaceStorage.getAvailableQuantity(
            offeredProductId
        );
        require(availableQuantity >= quantity, "Insufficient quantity");

        // Handle token top-up if needed
        if (tokenTopUp > 0) {
            IThriftToken token = IThriftToken(marketplaceStorage.thriftToken());
            require(
                token.transferFrom(originalSender, address(this), tokenTopUp),
                "Token top-up transfer failed"
            );
        }

        // Update product quantities in escrow
        marketplaceStorage.updateInEscrowQuantity(
            offeredProductId,
            quantity,
            true
        );
        marketplaceStorage.updateInEscrowQuantity(
            wantedProductId,
            quantity,
            true
        );

        // Create escrow for the exchange
        uint256 escrowId = marketplaceStorage.createEscrow(
            offeredProductId,
            originalSender,
            wantedProduct.seller,
            0, // no direct payment amount
            quantity,
            false, // not token
            true, // is exchange
            wantedProductId,
            tokenTopUp
        );

        // Create exchange offer
        marketplaceStorage.createExchangeOffer(
            offeredProductId,
            wantedProductId,
            originalSender,
            tokenTopUp,
            escrowId
        );

        // Add to user escrow tracking
        marketplaceStorage.addToUserActiveEscrows(originalSender, escrowId);
        marketplaceStorage.addToUserActiveEscrows(
            wantedProduct.seller,
            escrowId
        );
    }

    /**
     * @dev Creates multiple escrows with ETH payment in a single transaction
     */
    function createBulkEscrowWithEth(
        address originalSender,
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external payable whenNotPaused nonReentrant returns (uint256[] memory) {
        require(productIds.length > 0, "Empty product array");
        require(
            productIds.length == quantities.length,
            "Array length mismatch"
        );
        require(
            productIds.length <= marketplaceStorage.MAX_BULK_PURCHASE(),
            "Too many products"
        );

        uint256 totalCost = 0;
        uint256[] memory escrowIds = new uint256[](productIds.length);

        // First pass: validate products and calculate total cost
        for (uint256 i = 0; i < productIds.length; i++) {
            Product memory product = marketplaceStorage.getProduct(
                productIds[i]
            );

            // Validation checks
            require(
                !product.isDeleted && !product.isSold,
                "Product not available"
            );
            require(
                quantities[i] > 0 &&
                    quantities[i] <= marketplaceStorage.MAX_BULK_PURCHASE(),
                "Invalid quantity"
            );
            uint256 availableQuantity = marketplaceStorage.getAvailableQuantity(
                productIds[i]
            );
            require(
                availableQuantity >= quantities[i],
                "Insufficient quantity"
            );

            // Price check and calculation
            require(product.ethPrice > 0, "ETH price not set");
            totalCost += product.ethPrice * quantities[i];
        }

        // Verify payment
        require(msg.value == totalCost, "Incorrect ETH amount");

        // Second pass: create escrows
        for (uint256 i = 0; i < productIds.length; i++) {
            Product memory product = marketplaceStorage.getProduct(
                productIds[i]
            );
            uint256 productCost = product.ethPrice * quantities[i];

            // Reserve quantity
            marketplaceStorage.updateInEscrowQuantity(
                productIds[i],
                quantities[i],
                true
            );

            // Create escrow
            uint256 escrowId = marketplaceStorage.createEscrow(
                productIds[i],
                originalSender,
                product.seller,
                productCost,
                quantities[i],
                false, // not token
                false, // not exchange
                0, // no exchange product
                0 // no token top-up
            );

            escrowIds[i] = escrowId;

            // Add to tracking
            marketplaceStorage.addToUserActiveEscrows(originalSender, escrowId);
            marketplaceStorage.addToUserActiveEscrows(product.seller, escrowId);
        }

        return escrowIds;
    }

    /**
     * @dev Creates multiple escrows with token payment in a single transaction
     */
    function createBulkEscrowWithTokens(
        address originalSender,
        uint256[] calldata productIds,
        uint256[] calldata quantities
    ) external whenNotPaused nonReentrant returns (uint256[] memory) {
        require(productIds.length > 0, "Empty product array");
        require(
            productIds.length == quantities.length,
            "Array length mismatch"
        );
        require(
            productIds.length <= marketplaceStorage.MAX_BULK_PURCHASE(),
            "Too many products"
        );

        uint256 totalCost = 0;
        uint256[] memory escrowIds = new uint256[](productIds.length);

        // First pass: validate products and calculate total cost
        for (uint256 i = 0; i < productIds.length; i++) {
            Product memory product = marketplaceStorage.getProduct(
                productIds[i]
            );

            // Validation checks
            require(
                !product.isDeleted && !product.isSold,
                "Product not available"
            );
            require(
                quantities[i] > 0 &&
                    quantities[i] <= marketplaceStorage.MAX_BULK_PURCHASE(),
                "Invalid quantity"
            );
            uint256 availableQuantity = marketplaceStorage.getAvailableQuantity(
                productIds[i]
            );
            require(
                availableQuantity >= quantities[i],
                "Insufficient quantity"
            );

            // Price check and calculation
            require(product.tokenPrice > 0, "Token price not set");
            totalCost += product.tokenPrice * quantities[i];
        }

        // Transfer tokens for all products at once
        IThriftToken token = IThriftToken(marketplaceStorage.thriftToken());
        require(
            token.transferFrom(originalSender, address(this), totalCost),
            "Token transfer failed"
        );

        // Second pass: create escrows
        for (uint256 i = 0; i < productIds.length; i++) {
            Product memory product = marketplaceStorage.getProduct(
                productIds[i]
            );
            uint256 productCost = product.tokenPrice * quantities[i];

            // Reserve quantity
            marketplaceStorage.updateInEscrowQuantity(
                productIds[i],
                quantities[i],
                true
            );

            // Create escrow
            uint256 escrowId = marketplaceStorage.createEscrow(
                productIds[i],
                originalSender,
                product.seller,
                productCost,
                quantities[i],
                true, // is token
                false, // not exchange
                0, // no exchange product
                0 // no token top-up
            );

            escrowIds[i] = escrowId;

            // Add to tracking
            marketplaceStorage.addToUserActiveEscrows(originalSender, escrowId);
            marketplaceStorage.addToUserActiveEscrows(product.seller, escrowId);
        }

        return escrowIds;
    }

    /**
     * @dev Confirms an escrow
     */
    function confirmEscrow(
        address originalSender,
        uint256 escrowId
    ) external nonReentrant {
        Escrow memory escrow = marketplaceStorage.getEscrow(escrowId);
        require(!escrow.completed && !escrow.refunded, "Escrow not active");
        require(block.timestamp <= escrow.deadline, "Escrow expired");

        bool isBuyer = originalSender == escrow.buyer;
        bool isSeller = originalSender == escrow.seller;
        require(isBuyer || isSeller, "Not authorized");

        bool buyerConfirmed = escrow.buyerConfirmed;
        bool sellerConfirmed = escrow.sellerConfirmed;

        if (isBuyer) {
            require(!buyerConfirmed, "Already confirmed");
            buyerConfirmed = true;
        } else {
            require(!sellerConfirmed, "Already confirmed");
            sellerConfirmed = true;
        }

        // Update escrow status
        marketplaceStorage.updateEscrowStatus(
            escrowId,
            buyerConfirmed,
            sellerConfirmed,
            false, // not completed yet
            false // not refunded
        );

        // Check if both parties have confirmed
        if (buyerConfirmed && sellerConfirmed) {
            _completeEscrow(escrowId);
        }
    }

    /**
     * @dev Internal function to complete an escrow
     */
    function _completeEscrow(uint256 escrowId) internal {
        Escrow memory escrow = marketplaceStorage.getEscrow(escrowId);
        require(!escrow.completed && !escrow.refunded, "Invalid escrow state");
        require(
            escrow.buyerConfirmed && escrow.sellerConfirmed,
            "Not confirmed"
        );

        // Mark escrow as completed
        marketplaceStorage.updateEscrowStatus(
            escrowId,
            true, // buyer confirmed
            true, // seller confirmed
            true, // completed
            false // not refunded
        );

        if (escrow.isExchange) {
            _completeExchange(escrow);
        } else {
            _completeSale(escrow);
        }

        // Remove escrow from active lists and move to completed lists
        marketplaceStorage.moveEscrowToCompleted(
            escrowId,
            escrow.buyer,
            escrow.seller
        );
    }

    /**
     * @dev Completes a regular sale
     */
    function _completeSale(Escrow memory escrow) internal {
        uint256 platformFee = escrow.isToken
            ? marketplaceStorage.tokenPlatformFee()
            : marketplaceStorage.ethPlatformFee();
        uint256 feeAmount = (escrow.amount * platformFee) / 1000;
        uint256 sellerAmount = escrow.amount - feeAmount;

        // Process platform fee
        if (escrow.isToken) {
            // Get token contract
            IThriftToken token = IThriftToken(marketplaceStorage.thriftToken());

            // Calculate burn and treasury amounts
            uint256 burnAmount = (feeAmount *
                marketplaceStorage.BURN_PERCENTAGE()) / 100;
            uint256 treasuryAmount = feeAmount - burnAmount;

            // Transfer tokens
            require(
                token.transfer(escrow.seller, sellerAmount),
                "Seller transfer failed"
            );
            require(
                token.transfer(
                    marketplaceStorage.treasuryWallet(),
                    treasuryAmount
                ),
                "Treasury transfer failed"
            );
            token.burn(burnAmount);

            // Process spending rewards
            uint256 rewardAmount = (escrow.amount *
                marketplaceStorage.SPENDING_REWARD_PERCENTAGE()) / 1000;
            token.mint(escrow.buyer, rewardAmount);
        } else {
            // Transfer ETH
            payable(escrow.seller).transfer(sellerAmount);
            payable(marketplaceStorage.treasuryWallet()).transfer(feeAmount);
        }

        // Update product quantity
        _completeQuantitySale(escrow.productId, escrow.quantity);
    }

    /**
     * @dev Completes an exchange
     */
    function _completeExchange(Escrow memory escrow) internal {
        // Process token top-up if any
        if (escrow.tokenTopUp > 0) {
            IThriftToken token = IThriftToken(marketplaceStorage.thriftToken());
            uint256 platformFee = (escrow.tokenTopUp *
                marketplaceStorage.tokenPlatformFee()) / 1000;
            uint256 sellerAmount = escrow.tokenTopUp - platformFee;

            uint256 burnAmount = (platformFee *
                marketplaceStorage.BURN_PERCENTAGE()) / 100;
            uint256 treasuryAmount = platformFee - burnAmount;

            require(
                token.transfer(escrow.seller, sellerAmount),
                "Top-up transfer failed"
            );
            require(
                token.transfer(
                    marketplaceStorage.treasuryWallet(),
                    treasuryAmount
                ),
                "Treasury transfer failed"
            );
            token.burn(burnAmount);
        }

        // Update product states
        _completeQuantitySale(escrow.productId, escrow.quantity);
        _completeQuantitySale(escrow.exchangeProductId, escrow.quantity);
    }

    /**
     * @dev Updates product quantities after sale completion
     */
    function _completeQuantitySale(
        uint256 productId,
        uint256 quantity
    ) internal {
        Product memory product = marketplaceStorage.getProduct(productId);
        require(product.quantity >= quantity, "Invalid quantity");

        // Update the product quantity in storage
        // This will reduce both the total quantity and in-escrow quantity
        marketplaceStorage.updateInEscrowQuantity(productId, quantity, false);

        uint256 newQuantity = product.quantity - quantity;
        marketplaceStorage.updateProductQuantity(productId, newQuantity);

        // If product is now sold out, mark it as sold
        if (newQuantity == 0) {
            marketplaceStorage.markProductSold(productId);
        }
    }

    /**
     * @dev Common escrow rejection/cancellation logic
     */
    function _rejectOrCancelEscrow(
        address originalSender,
        uint256 escrowId,
        bool isSeller,
        string memory reason
    ) internal {
        Escrow memory escrow = marketplaceStorage.getEscrow(escrowId);

        // Validate permissions
        if (isSeller) {
            require(escrow.seller == originalSender, "Not authorized");
        } else {
            require(escrow.buyer == originalSender, "Not authorized");
            require(!escrow.sellerConfirmed, "Seller already confirmed");
        }

        require(!escrow.completed && !escrow.refunded, "Escrow not active");

        // Mark escrow as refunded
        marketplaceStorage.updateEscrowStatus(
            escrowId,
            escrow.buyerConfirmed,
            escrow.sellerConfirmed,
            false, // not completed
            true // refunded
        );

        // Refund buyer
        if (escrow.isToken) {
            IThriftToken token = IThriftToken(marketplaceStorage.thriftToken());
            require(
                token.transfer(escrow.buyer, escrow.amount),
                "Token refund failed"
            );
        } else if (!escrow.isExchange) {
            payable(escrow.buyer).transfer(escrow.amount);
        }

        // Release quantities
        marketplaceStorage.updateInEscrowQuantity(
            escrow.productId,
            escrow.quantity,
            false
        );

        if (escrow.isExchange) {
            marketplaceStorage.updateInEscrowQuantity(
                escrow.exchangeProductId,
                escrow.quantity,
                false
            );

            if (escrow.tokenTopUp > 0) {
                IThriftToken token = IThriftToken(
                    marketplaceStorage.thriftToken()
                );
                require(
                    token.transfer(escrow.buyer, escrow.tokenTopUp),
                    "Token top-up refund failed"
                );
            }
        }

        // Remove escrow from active lists
        marketplaceStorage.removeEscrowFromActiveList(
            escrowId,
            escrow.buyer,
            escrow.seller
        );
    }

    /**
     * @dev Rejects an escrow (seller only)
     */
    function rejectEscrow(
        address originalSender,
        uint256 escrowId,
        string memory reason
    ) external nonReentrant {
        _rejectOrCancelEscrow(originalSender, escrowId, true, reason);
    }

    /**
     * @dev Cancels an escrow (buyer only)
     */
    function cancelEscrow(
        address originalSender,
        uint256 escrowId
    ) external nonReentrant {
        _rejectOrCancelEscrow(originalSender, escrowId, false, "");
    }

    /**
     * @dev Confirms multiple escrows
     */
    function _bulkConfirmEscrows(
        address originalSender,
        uint256[] calldata escrowIds,
        bool isBuyer
    ) internal {
        require(escrowIds.length > 0, "Empty escrow array");
        require(
            escrowIds.length <= marketplaceStorage.MAX_BULK_PURCHASE(),
            "Too many escrows"
        );

        for (uint256 i = 0; i < escrowIds.length; ) {
            Escrow memory escrow = marketplaceStorage.getEscrow(escrowIds[i]);

            // Validate permissions and status
            if (isBuyer) {
                require(escrow.buyer == originalSender, "Not buyer's escrow");
                require(!escrow.buyerConfirmed, "Already confirmed");

                // Update escrow status
                marketplaceStorage.updateEscrowStatus(
                    escrowIds[i],
                    true, // buyer confirmed
                    escrow.sellerConfirmed,
                    false, // not completed yet
                    false // not refunded
                );
            } else {
                require(escrow.seller == originalSender, "Not seller's escrow");
                require(!escrow.sellerConfirmed, "Already confirmed");

                // Update escrow status
                marketplaceStorage.updateEscrowStatus(
                    escrowIds[i],
                    escrow.buyerConfirmed,
                    true, // seller confirmed
                    false, // not completed yet
                    false // not refunded
                );
            }

            require(!escrow.completed && !escrow.refunded, "Escrow not active");
            require(block.timestamp <= escrow.deadline, "Escrow expired");

            // Get updated escrow after status change
            escrow = marketplaceStorage.getEscrow(escrowIds[i]);

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
        address originalSender,
        uint256[] calldata escrowIds
    ) external nonReentrant {
        _bulkConfirmEscrows(originalSender, escrowIds, true);
    }

    /**
     * @dev Bulk confirm multiple escrows from the same seller
     */
    function bulkConfirmEscrowsForSeller(
        address originalSender,
        uint256[] calldata escrowIds
    ) external nonReentrant {
        _bulkConfirmEscrows(originalSender, escrowIds, false);
    }

    /**
     * @dev Creates an escrow with ETH payment
     */
    function createEscrowWithEth(
        address originalSender,
        uint256 productId,
        uint256 quantity
    ) external payable whenNotPaused nonReentrant {
        // Validate product
        Product memory product = marketplaceStorage.getProduct(productId);
        require(
            product.id > 0 && !product.isDeleted && !product.isSold,
            "Unavailable"
        );
        require(product.ethPrice > 0, "No ETH price");

        // Check available quantity
        uint256 availableQty = marketplaceStorage.getAvailableQuantity(
            productId
        );
        require(
            quantity > 0 &&
                quantity <= marketplaceStorage.MAX_BULK_PURCHASE() &&
                availableQty >= quantity,
            "Invalid qty"
        );

        // Validate payment
        uint256 totalCost = product.ethPrice * quantity;
        require(msg.value == totalCost, "Incorrect ETH");

        // Update product's in-escrow quantity
        marketplaceStorage.updateInEscrowQuantity(productId, quantity, true);

        // Create escrow record
        uint256 escrowId = marketplaceStorage.createEscrow(
            productId,
            originalSender, // Use originalSender instead of msg.sender
            product.seller,
            totalCost,
            quantity,
            false, // not token
            false, // not exchange
            0, // no exchange product
            0 // no token top-up
        );

        // Add to user escrow lists
        marketplaceStorage.addToUserActiveEscrows(originalSender, escrowId);
        marketplaceStorage.addToUserActiveEscrows(product.seller, escrowId);

        // Emit event
        emit EscrowCreated(escrowId, originalSender, product.seller);
    }

    /**
     * @dev Creates an escrow with token payment
     */
    function createEscrowWithTokens(
        address originalSender,
        uint256 productId,
        uint256 quantity
    ) external whenNotPaused nonReentrant {
        // Validate product
        Product memory product = marketplaceStorage.getProduct(productId);
        require(
            product.id > 0 && !product.isDeleted && !product.isSold,
            "Unavailable"
        );
        require(product.tokenPrice > 0, "No token price");

        // Check available quantity
        uint256 availableQty = marketplaceStorage.getAvailableQuantity(
            productId
        );
        require(
            quantity > 0 &&
                quantity <= marketplaceStorage.MAX_BULK_PURCHASE() &&
                availableQty >= quantity,
            "Invalid qty"
        );

        // Calculate and process token payment
        uint256 totalCost = product.tokenPrice * quantity;

        // Get token contract and process transfer
        IThriftToken token = IThriftToken(marketplaceStorage.thriftToken());
        require(
            token.transferFrom(originalSender, address(this), totalCost),
            "Transfer failed"
        );

        // Update product's in-escrow quantity
        marketplaceStorage.updateInEscrowQuantity(productId, quantity, true);

        // Create escrow record
        uint256 escrowId = marketplaceStorage.createEscrow(
            productId,
            originalSender, // Use originalSender instead of msg.sender
            product.seller,
            totalCost,
            quantity,
            true, // is token
            false, // not exchange
            0, // no exchange product
            0 // no token top-up
        );

        // Add to user escrow lists
        marketplaceStorage.addToUserActiveEscrows(originalSender, escrowId);
        marketplaceStorage.addToUserActiveEscrows(product.seller, escrowId);

        // Emit event
        emit EscrowCreated(escrowId, originalSender, product.seller);
    }

    /**
     * @dev Get user's active escrows where user is buyer - improved implementation
     */
    function getUserActiveEscrowsAsBuyer(
        address user
    ) external view returns (uint256[] memory) {
        require(user != address(0), "Invalid address");

        // Get all user escrows from storage
        UserEscrowTracking memory tracking = marketplaceStorage
            .getUserEscrowTracking(user);
        uint256[] memory escrowIds = tracking.activeEscrows;

        // Early return for empty escrows
        if (escrowIds.length == 0) {
            return new uint256[](0);
        }

        // First pass: count valid escrows where user is buyer
        uint256 buyerEscrowCount = 0;

        for (uint256 i = 0; i < escrowIds.length; i++) {
            Escrow memory escrow = marketplaceStorage.getEscrow(escrowIds[i]);

            if (
                escrow.escrowId > 0 &&
                escrow.buyer == user &&
                !escrow.completed &&
                !escrow.refunded
            ) {
                buyerEscrowCount++;
            }
        }

        // Early return if no valid buyer escrows
        if (buyerEscrowCount == 0) {
            return new uint256[](0);
        }

        // Second pass: collect buyer escrows
        uint256[] memory buyerEscrows = new uint256[](buyerEscrowCount);
        uint256 resultIndex = 0;

        for (
            uint256 i = 0;
            i < escrowIds.length && resultIndex < buyerEscrowCount;
            i++
        ) {
            Escrow memory escrow = marketplaceStorage.getEscrow(escrowIds[i]);

            if (
                escrow.escrowId > 0 &&
                escrow.buyer == user &&
                !escrow.completed &&
                !escrow.refunded
            ) {
                buyerEscrows[resultIndex] = escrowIds[i];
                resultIndex++;
            }
        }

        return buyerEscrows;
    }

    /**
     * @dev Get user's active escrows where user is seller - improved implementation
     */
    function getUserActiveEscrowsAsSeller(
        address user
    ) external view returns (uint256[] memory) {
        require(user != address(0), "Invalid address");

        // Get all user escrows from storage
        UserEscrowTracking memory tracking = marketplaceStorage
            .getUserEscrowTracking(user);
        uint256[] memory escrowIds = tracking.activeEscrows;

        // Early return for empty escrows
        if (escrowIds.length == 0) {
            return new uint256[](0);
        }

        // First pass: count valid escrows where user is seller
        uint256 sellerEscrowCount = 0;

        for (uint256 i = 0; i < escrowIds.length; i++) {
            Escrow memory escrow = marketplaceStorage.getEscrow(escrowIds[i]);

            if (
                escrow.escrowId > 0 &&
                escrow.seller == user &&
                !escrow.completed &&
                !escrow.refunded
            ) {
                sellerEscrowCount++;
            }
        }

        // Early return if no valid seller escrows
        if (sellerEscrowCount == 0) {
            return new uint256[](0);
        }

        // Second pass: collect seller escrows
        uint256[] memory sellerEscrows = new uint256[](sellerEscrowCount);
        uint256 resultIndex = 0;

        for (
            uint256 i = 0;
            i < escrowIds.length && resultIndex < sellerEscrowCount;
            i++
        ) {
            Escrow memory escrow = marketplaceStorage.getEscrow(escrowIds[i]);

            if (
                escrow.escrowId > 0 &&
                escrow.seller == user &&
                !escrow.completed &&
                !escrow.refunded
            ) {
                sellerEscrows[resultIndex] = escrowIds[i];
                resultIndex++;
            }
        }

        return sellerEscrows;
    }

    /**
     * @dev Get user's completed escrows - improved implementation
     */
    function getUserCompletedEscrows(
        address user
    ) external view returns (uint256[] memory) {
        require(user != address(0), "Invalid address");

        // Get all user completed escrows from storage
        UserEscrowTracking memory tracking = marketplaceStorage
            .getUserEscrowTracking(user);
        uint256[] memory escrowIds = tracking.completedEscrows;

        // Early return for empty escrows
        if (escrowIds.length == 0) {
            return new uint256[](0);
        }

        // First pass: count valid completed escrows
        uint256 validCompletedCount = 0;

        for (uint256 i = 0; i < escrowIds.length; i++) {
            Escrow memory escrow = marketplaceStorage.getEscrow(escrowIds[i]);

            if (
                escrow.escrowId > 0 &&
                (escrow.buyer == user || escrow.seller == user) &&
                escrow.completed
            ) {
                validCompletedCount++;
            }
        }

        // Early return if no valid completed escrows
        if (validCompletedCount == 0) {
            return new uint256[](0);
        }

        // Second pass: collect completed escrows
        uint256[] memory completedEscrows = new uint256[](validCompletedCount);
        uint256 resultIndex = 0;

        for (
            uint256 i = 0;
            i < escrowIds.length && resultIndex < validCompletedCount;
            i++
        ) {
            Escrow memory escrow = marketplaceStorage.getEscrow(escrowIds[i]);

            if (
                escrow.escrowId > 0 &&
                (escrow.buyer == user || escrow.seller == user) &&
                escrow.completed
            ) {
                completedEscrows[resultIndex] = escrowIds[i];
                resultIndex++;
            }
        }

        return completedEscrows;
    }

    /**
     * @dev Gets all exchange offers for a product
     */
    function getExchangeOffers(
        uint256 productId
    ) external view returns (ExchangeOffer[] memory) {
        ExchangeOffer[] memory offers = marketplaceStorage
            .getExchangeOffersForProduct(productId);

        // Count active offers
        uint256 activeCount = 0;
        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].isActive) {
                activeCount++;
            }
        }

        // Create array of active offers
        ExchangeOffer[] memory activeOffers = new ExchangeOffer[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].isActive) {
                activeOffers[index++] = offers[i];
            }
        }

        return activeOffers;
    }
}
