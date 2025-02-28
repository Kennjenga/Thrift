// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ThriftMarketplaceTypes.sol";
import "./ThriftMarketplaceInterfaces.sol";

/**
 * @title MarketplaceStorage
 * @dev Core storage contract for the entire marketplace
 * Acts as the single source of truth for all marketplace data
 */
contract MarketplaceStorage is IMarketplaceStorage, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // Core state variables
    address public thriftToken;
    address public userAesthetics;
    address public treasuryWallet;

    // Counters for IDs
    Counters.Counter private _productIds;
    Counters.Counter private _escrowIds;

    // Constants
    uint256 public tokenPlatformFee = 35; // 3.5% total platform fee
    uint256 public ethPlatformFee = 35; // 3.5% total platform fee
    uint256 public constant BURN_PERCENTAGE = 60;
    uint256 public constant TREASURY_PERCENTAGE = 40;
    uint256 public constant SPENDING_REWARD_PERCENTAGE = 20;
    uint256 public constant MAX_ESCROW_DURATION = 5 days;
    uint256 public constant MAX_BULK_PURCHASE = 50;

    // Mappings
    mapping(uint256 => Product) private products;
    mapping(uint256 => Escrow) private escrows;
    mapping(address => uint256[]) private userProducts;
    mapping(string => uint256[]) private categoryToProducts;
    mapping(uint256 => ExchangeOffer[]) private exchangeOffers;
    mapping(address => UserEscrowTracking) private userEscrowInfos;
    mapping(address => mapping(uint256 => uint256)) private escrowToActiveIndex;
    mapping(address => bool) private authorizedContracts;

    // Pause state
    bool public isPaused;

    // Events
    event ProductCreated(
        uint256 indexed productId,
        address indexed seller,
        string[] categories,
        uint256 quantity,
        uint256 tokenPrice,
        uint256 ethPrice
    );

    event ProductUpdated(
        uint256 indexed productId,
        address indexed seller,
        string[] categories,
        uint256 quantity,
        uint256 tokenPrice,
        uint256 ethPrice
    );

    event ProductMarkedSold(uint256 indexed productId, address indexed seller);

    event QuantityUpdate(
        uint256 indexed productId,
        uint256 newTotal,
        uint256 newAvailable
    );

    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed productId,
        address indexed buyer,
        address seller,
        uint256 quantity,
        uint256 amount,
        bool isToken
    );

    event BulkEscrowCreated(
        uint256 indexed firstEscrowId,
        uint256 count,
        address indexed buyer,
        uint256 totalAmount,
        bool isToken
    );

    event EscrowConfirmed(
        uint256 indexed escrowId,
        address indexed confirmer,
        bool isBuyer
    );

    event EscrowCompleted(
        uint256 indexed escrowId,
        uint256 indexed productId,
        uint256 quantity,
        uint256 amount
    );

    event EscrowRefunded(
        uint256 indexed escrowId,
        address indexed buyer,
        uint256 amount
    );

    event ExchangeOfferCreated(
        uint256 indexed offeredProductId,
        uint256 indexed wantedProductId,
        address indexed offerer,
        uint256 tokenTopUp,
        uint256 escrowId
    );

    event ExchangeCompleted(
        uint256 indexed offeredProductId,
        uint256 indexed wantedProductId,
        address party1,
        address party2,
        uint256 tokenTopUp
    );

    event EscrowRejected(
        uint256 indexed escrowId,
        address indexed rejector,
        string reason
    );

    event EscrowCancelled(uint256 indexed escrowId, address indexed canceller);

    event PlatformFeesUpdated(uint256 newTokenFee, uint256 newEthFee);
    event TreasuryWalletUpdated(address newTreasury);
    event UserAestheticsUpdated(address newUserAesthetics);
    event ContractAuthorized(address indexed contractAddress, bool authorized);

    /**
     * @dev Contract constructor
     */
    constructor(
        address _thriftToken,
        address _userAesthetics,
        address _treasuryWallet
    ) {
        require(_thriftToken != address(0), "Invalid token address");
        require(_userAesthetics != address(0), "Invalid aesthetics address");
        require(_treasuryWallet != address(0), "Invalid treasury address");

        thriftToken = _thriftToken;
        userAesthetics = _userAesthetics;
        treasuryWallet = _treasuryWallet;
        _transferOwnership(_treasuryWallet);
    }

    // Modifiers
    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    modifier onlyAuthorized() {
        require(
            isAuthorizedContract(msg.sender) || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    // Authorization management
    function setAuthorizedContract(
        address contractAddress,
        bool authorized
    ) external onlyOwner {
        authorizedContracts[contractAddress] = authorized;
        emit ContractAuthorized(contractAddress, authorized);
    }

    function isAuthorizedContract(
        address contractAddress
    ) public view returns (bool) {
        return authorizedContracts[contractAddress];
    }

    /**
     * @dev Get the current product count
     */
    function getProductCount() external view returns (uint256) {
        return _productIds.current();
    }

    // Product-related functions
    function getProduct(
        uint256 productId
    ) external view returns (Product memory) {
        return products[productId];
    }

    function getProductWithAvailability(
        uint256 productId
    ) external view returns (ProductWithAvailability memory) {
        Product storage product = products[productId];
        return _convertToProductWithAvailability(product);
    }

    function getUserProductIds(
        address user
    ) external view returns (uint256[] memory) {
        return userProducts[user];
    }

    function getProductsInCategory(
        string memory category
    ) external view returns (uint256[] memory) {
        return categoryToProducts[category];
    }

    function getAvailableQuantity(
        uint256 productId
    ) public view returns (uint256) {
        Product storage product = products[productId];
        if (product.isDeleted || product.isSold) {
            return 0;
        }
        return product.quantity - product.inEscrowQuantity;
    }

    // Escrow-related functions
    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }

    function getUserEscrowTracking(
        address user
    ) external view returns (UserEscrowTracking memory) {
        return userEscrowInfos[user];
    }

    function getExchangeOffersForProduct(
        uint256 productId
    ) external view returns (ExchangeOffer[] memory) {
        return exchangeOffers[productId];
    }

    // Storage modification functions - only callable by authorized contracts

    function createProduct(
        address seller,
        uint256 tokenPrice,
        uint256 ethPrice,
        uint256 quantity,
        string memory name,
        string memory description,
        string memory size,
        string memory condition,
        string memory brand,
        string[] memory categories,
        string memory gender,
        string memory image,
        bool isAvailableForExchange,
        string memory exchangePreference
    ) external onlyAuthorized returns (uint256) {
        _productIds.increment();
        uint256 productId = _productIds.current();

        products[productId] = Product({
            id: productId,
            seller: seller,
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

        userProducts[seller].push(productId);

        // Index product by categories (aesthetics)
        for (uint256 i = 0; i < categories.length; ) {
            categoryToProducts[categories[i]].push(productId);
            unchecked {
                ++i;
            }
        }

        emit ProductCreated(
            productId,
            seller,
            categories,
            quantity,
            tokenPrice,
            ethPrice
        );

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
    ) external onlyAuthorized {
        Product storage product = products[productId];

        // Remove from old category indices
        string[] memory oldCategories = product.categories;
        for (uint256 i = 0; i < oldCategories.length; ) {
            _removeFromCategoryIndex(oldCategories[i], productId);
            unchecked {
                ++i;
            }
        }

        // Update product details
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
        for (uint256 i = 0; i < categories.length; ) {
            categoryToProducts[categories[i]].push(productId);
            unchecked {
                ++i;
            }
        }

        emit ProductUpdated(
            productId,
            product.seller,
            categories,
            product.quantity,
            tokenPrice,
            ethPrice
        );
    }

    function updateProductQuantity(
        uint256 productId,
        uint256 newQuantity
    ) external onlyAuthorized {
        Product storage product = products[productId];
        require(
            newQuantity >= product.inEscrowQuantity,
            "Cannot set below escrow quantity"
        );

        product.quantity = newQuantity;

        // Check if product is now effectively sold out
        _checkAndMarkProductSold(productId);

        emit QuantityUpdate(
            productId,
            newQuantity,
            newQuantity - product.inEscrowQuantity
        );
    }

    function updateInEscrowQuantity(
        uint256 productId,
        uint256 change,
        bool increase
    ) external onlyAuthorized {
        Product storage product = products[productId];

        if (increase) {
            product.inEscrowQuantity += change;
        } else {
            require(
                product.inEscrowQuantity >= change,
                "Invalid escrow quantity change"
            );
            product.inEscrowQuantity -= change;
        }

        _checkAndMarkProductSold(productId);

        emit QuantityUpdate(
            productId,
            product.quantity,
            product.quantity - product.inEscrowQuantity
        );
    }

    function markProductSold(uint256 productId) external onlyAuthorized {
        Product storage product = products[productId];
        product.isSold = true;
        emit ProductMarkedSold(productId, product.seller);
    }

    function markProductDeleted(uint256 productId) external onlyAuthorized {
        Product storage product = products[productId];
        product.isDeleted = true;
    }

    function createEscrow(
        uint256 productId,
        address buyer,
        address seller,
        uint256 amount,
        uint256 quantity,
        bool isToken,
        bool isExchange,
        uint256 exchangeProductId,
        uint256 tokenTopUp
    ) external onlyAuthorized returns (uint256) {
        _escrowIds.increment();
        uint256 escrowId = _escrowIds.current();

        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            productId: productId,
            buyer: buyer,
            seller: seller,
            amount: amount,
            deadline: block.timestamp + MAX_ESCROW_DURATION,
            quantity: quantity,
            buyerConfirmed: isExchange, // Exchange offers are pre-confirmed by buyer
            sellerConfirmed: false,
            completed: false,
            refunded: false,
            isToken: isToken,
            isExchange: isExchange,
            exchangeProductId: exchangeProductId,
            tokenTopUp: tokenTopUp
        });

        if (!isExchange) {
            emit EscrowCreated(
                escrowId,
                productId,
                buyer,
                seller,
                quantity,
                amount,
                isToken
            );
        }

        return escrowId;
    }

    function updateEscrowStatus(
        uint256 escrowId,
        bool buyerConfirmed,
        bool sellerConfirmed,
        bool completed,
        bool refunded
    ) external onlyAuthorized {
        Escrow storage escrow = escrows[escrowId];
        escrow.buyerConfirmed = buyerConfirmed;
        escrow.sellerConfirmed = sellerConfirmed;
        escrow.completed = completed;
        escrow.refunded = refunded;
    }

    function createExchangeOffer(
        uint256 offeredProductId,
        uint256 wantedProductId,
        address offerer,
        uint256 tokenTopUp,
        uint256 escrowId
    ) external onlyAuthorized {
        exchangeOffers[wantedProductId].push(
            ExchangeOffer({
                offeredProductId: offeredProductId,
                wantedProductId: wantedProductId,
                offerer: offerer,
                isActive: true,
                tokenTopUp: tokenTopUp,
                escrowId: escrowId
            })
        );

        emit ExchangeOfferCreated(
            offeredProductId,
            wantedProductId,
            offerer,
            tokenTopUp,
            escrowId
        );
    }

    function addToUserActiveEscrows(
        address user,
        uint256 escrowId
    ) external onlyAuthorized {
        UserEscrowTracking storage userInfo = userEscrowInfos[user];
        escrowToActiveIndex[user][escrowId] = userInfo.activeEscrows.length;
        userInfo.activeEscrows.push(escrowId);
    }

    function moveEscrowToCompleted(
        uint256 escrowId,
        address buyer,
        address seller
    ) external onlyAuthorized {
        // Handle buyer's escrow tracking
        _removeFromActiveAddToCompleted(buyer, escrowId);
        // Handle seller's escrow tracking
        _removeFromActiveAddToCompleted(seller, escrowId);
    }

    function removeEscrowFromActiveList(
        uint256 escrowId,
        address buyer,
        address seller
    ) external onlyAuthorized {
        // Remove from buyer's active list
        UserEscrowTracking storage buyerInfo = userEscrowInfos[buyer];
        uint256 buyerIndex = escrowToActiveIndex[buyer][escrowId];

        if (
            buyerIndex < buyerInfo.activeEscrows.length &&
            buyerInfo.activeEscrows[buyerIndex] == escrowId
        ) {
            // Remove (swap with last element and pop)
            uint256 lastIndex = buyerInfo.activeEscrows.length - 1;
            if (buyerIndex != lastIndex) {
                buyerInfo.activeEscrows[buyerIndex] = buyerInfo.activeEscrows[
                    lastIndex
                ];
                escrowToActiveIndex[buyer][
                    buyerInfo.activeEscrows[buyerIndex]
                ] = buyerIndex;
            }
            buyerInfo.activeEscrows.pop();
            delete escrowToActiveIndex[buyer][escrowId];
        }

        // Remove from seller's active list
        UserEscrowTracking storage sellerInfo = userEscrowInfos[seller];
        uint256 sellerIndex = escrowToActiveIndex[seller][escrowId];

        if (
            sellerIndex < sellerInfo.activeEscrows.length &&
            sellerInfo.activeEscrows[sellerIndex] == escrowId
        ) {
            // Remove (swap with last element and pop)
            uint256 lastIndex = sellerInfo.activeEscrows.length - 1;
            if (sellerIndex != lastIndex) {
                sellerInfo.activeEscrows[sellerIndex] = sellerInfo
                    .activeEscrows[lastIndex];
                escrowToActiveIndex[seller][
                    sellerInfo.activeEscrows[sellerIndex]
                ] = sellerIndex;
            }
            sellerInfo.activeEscrows.pop();
            delete escrowToActiveIndex[seller][escrowId];
        }
    }

    // Admin functions
    function updatePlatformFees(
        uint256 newTokenFee,
        uint256 newEthFee
    ) external onlyOwner {
        require(newTokenFee <= 100 && newEthFee <= 100, "Fee too high");

        tokenPlatformFee = newTokenFee;
        ethPlatformFee = newEthFee;

        emit PlatformFeesUpdated(newTokenFee, newEthFee);
    }

    function updateTreasuryWallet(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid address");

        treasuryWallet = newTreasury;

        emit TreasuryWalletUpdated(newTreasury);
    }

    function updateUserAesthetics(
        address newUserAesthetics
    ) external onlyOwner {
        require(newUserAesthetics != address(0), "Invalid address");

        userAesthetics = newUserAesthetics;

        emit UserAestheticsUpdated(newUserAesthetics);
    }

    function togglePause() external onlyOwner {
        isPaused = !isPaused;
    }

    function emergencyTokenWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        require(
            IERC20(token).transfer(treasuryWallet, amount),
            "Transfer failed"
        );
    }

    function emergencyEthWithdraw() external onlyOwner {
        payable(treasuryWallet).transfer(address(this).balance);
    }

    // Internal helper functions
    function _removeFromActiveAddToCompleted(
        address user,
        uint256 escrowId
    ) internal {
        UserEscrowTracking storage userInfo = userEscrowInfos[user];
        uint256 index = escrowToActiveIndex[user][escrowId];

        if (
            index < userInfo.activeEscrows.length &&
            userInfo.activeEscrows[index] == escrowId
        ) {
            // Remove from active (swap with last element and pop)
            uint256 lastIndex = userInfo.activeEscrows.length - 1;
            if (index != lastIndex) {
                userInfo.activeEscrows[index] = userInfo.activeEscrows[
                    lastIndex
                ];
                escrowToActiveIndex[user][
                    userInfo.activeEscrows[index]
                ] = index;
            }
            userInfo.activeEscrows.pop();
            delete escrowToActiveIndex[user][escrowId];

            // Add to completed
            userInfo.completedEscrows.push(escrowId);
        }
    }

    function _checkAndMarkProductSold(uint256 productId) internal {
        Product storage product = products[productId];
        if (
            product.quantity - product.inEscrowQuantity == 0 && !product.isSold
        ) {
            product.isSold = true;
            emit ProductMarkedSold(productId, product.seller);
        }
    }

    function _removeFromCategoryIndex(
        string memory category,
        uint256 productId
    ) internal {
        uint256[] storage productsInCategory = categoryToProducts[category];
        uint256 length = productsInCategory.length;

        for (uint256 i = 0; i < length; ) {
            if (productsInCategory[i] == productId) {
                // Move last element to this position and pop
                if (i < length - 1) {
                    productsInCategory[i] = productsInCategory[length - 1];
                }
                productsInCategory.pop();
                break;
            }
            unchecked {
                ++i;
            }
        }
    }

    function _convertToProductWithAvailability(
        Product storage product
    ) internal view returns (ProductWithAvailability memory) {
        return
            ProductWithAvailability({
                id: product.id,
                seller: product.seller,
                tokenPrice: product.tokenPrice,
                ethPrice: product.ethPrice,
                totalQuantity: product.quantity,
                availableQuantity: product.quantity - product.inEscrowQuantity,
                name: product.name,
                description: product.description,
                size: product.size,
                condition: product.condition,
                brand: product.brand,
                categories: product.categories,
                gender: product.gender,
                image: product.image,
                isAvailableForExchange: product.isAvailableForExchange,
                exchangePreference: product.exchangePreference,
                isSold: product.isSold,
                isDeleted: product.isDeleted,
                inEscrowQuantity: product.inEscrowQuantity
            });
    }

    // Receive and fallback functions
    receive() external payable {}
    fallback() external payable {}
}
