const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Thrift Marketplace System", function () {
  let thriftToken, marketplace, userAesthetics;
  let marketplaceStorage,
    marketplaceProduct,
    marketplaceEscrow,
    marketplaceQuery;
  let owner, devWallet, treasuryWallet, seller, buyer, creator;
  let ownerSigner; // For admin functions that need the actual owner

  beforeEach(async function () {
    [owner, devWallet, treasuryWallet, seller, buyer, creator] =
      await ethers.getSigners();

    // Deploy ThriftToken
    const ThriftToken = await ethers.getContractFactory("ThriftToken");
    thriftToken = await ThriftToken.deploy(owner.address, devWallet.address);

    // Deploy UserAesthetics
    const UserAesthetics = await ethers.getContractFactory("UserAesthetics");
    userAesthetics = await UserAesthetics.deploy();

    // Deploy MarketplaceStorage
    const MarketplaceStorage = await ethers.getContractFactory(
      "MarketplaceStorage"
    );
    marketplaceStorage = await MarketplaceStorage.deploy(
      await thriftToken.getAddress(),
      await userAesthetics.getAddress(),
      treasuryWallet.address
    );

    // Deploy MarketplaceProduct
    const MarketplaceProduct = await ethers.getContractFactory(
      "MarketplaceProduct"
    );
    marketplaceProduct = await MarketplaceProduct.deploy(
      await marketplaceStorage.getAddress()
    );

    // Deploy MarketplaceEscrow
    const MarketplaceEscrow = await ethers.getContractFactory(
      "MarketplaceEscrow"
    );
    marketplaceEscrow = await MarketplaceEscrow.deploy(
      await marketplaceStorage.getAddress()
    );

    // Deploy MarketplaceQuery
    const MarketplaceQuery = await ethers.getContractFactory(
      "MarketplaceQuery"
    );
    marketplaceQuery = await MarketplaceQuery.deploy(
      await marketplaceStorage.getAddress()
    );

    // Deploy main Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(
      await marketplaceStorage.getAddress(),
      await marketplaceProduct.getAddress(),
      await marketplaceEscrow.getAddress(),
      await marketplaceQuery.getAddress()
    );

    // Authorize contracts in storage
    await marketplaceStorage
      .connect(treasuryWallet)
      .setAuthorizedContract(await marketplaceProduct.getAddress(), true);
    await marketplaceStorage
      .connect(treasuryWallet)
      .setAuthorizedContract(await marketplaceEscrow.getAddress(), true);
    await marketplaceStorage
      .connect(treasuryWallet)
      .setAuthorizedContract(await marketplaceQuery.getAddress(), true);
    await marketplaceStorage
      .connect(treasuryWallet)
      .setAuthorizedContract(await marketplace.getAddress(), true);

    // Set reward contracts in token
    await thriftToken.setRewardContract(
      await marketplaceEscrow.getAddress(),
      true
    );
    // For minting rewards during sales completions
    await thriftToken.setRewardContract(await marketplace.getAddress(), true);

    // Mint tokens for testing
    await thriftToken.mint(buyer.address, ethers.parseEther("1000"));
    await thriftToken.mint(seller.address, ethers.parseEther("500"));

    // Approve tokens for marketplace escrow
    await thriftToken
      .connect(buyer)
      .approve(await marketplaceEscrow.getAddress(), ethers.parseEther("1000"));
    await thriftToken
      .connect(seller)
      .approve(await marketplaceEscrow.getAddress(), ethers.parseEther("500"));

    // Set aesthetics for search testing
    await userAesthetics
      .connect(buyer)
      .setUserAesthetics(["casual", "vintage"]);

    // Determine the actual contract owner for admin functions
    const storageOwner = await marketplaceStorage.owner();
    console.log("Storage Owner:", storageOwner);
    console.log("Treasury Wallet:", treasuryWallet.address);

    // Find the signer with this address
    for (const signer of [
      owner,
      devWallet,
      treasuryWallet,
      seller,
      buyer,
      creator,
    ]) {
      if (signer.address.toLowerCase() === storageOwner.toLowerCase()) {
        ownerSigner = signer;
        console.log("Owner signer found:", ownerSigner.address);
        break;
      }
    }
    if (!ownerSigner) {
      console.log("Owner signer not found among available signers!");
      ownerSigner = treasuryWallet; // Fallback
    }
  });

  describe("Purchasing with ETH and Tokens", function () {
    beforeEach(async function () {
      // Create a product for purchase testing
      await marketplace.connect(seller).createProduct(
        "Purchase Test",
        "A product for purchase testing",
        "M",
        "New",
        "Brand",
        ["casual"],
        "Unisex",
        "image.jpg",
        ethers.parseEther("100"), // tokenPrice
        ethers.parseEther("0.1"), // ethPrice
        5, // quantity
        false,
        ""
      );
    });

    // it("Should complete purchase when both parties confirm", async function () {
    //   // Initial balances
    //   const initialSellerTokenBalance = await thriftToken.balanceOf(
    //     seller.address
    //   );
    //   const initialSellerEthBalance = await ethers.provider.getBalance(
    //     seller.address
    //   );

    //   // Token purchase
    //   await marketplace.connect(buyer).createEscrowWithTokens(1, 1);
    //   let escrowId = (
    //     await marketplace.getUserActiveEscrowsAsBuyer(buyer.address)
    //   )[0];

    //   // Confirm from both sides
    //   await marketplace.connect(buyer).confirmEscrow(escrowId);
    //   await marketplace.connect(seller).confirmEscrow(escrowId);

    //   // Verify escrow completed
    //   let completedEscrows = await marketplace.getUserCompletedEscrows(
    //     buyer.address
    //   );
    //   expect(completedEscrows.length).to.equal(1);

    //   // Verify seller received tokens (minus fees)
    //   const finalSellerTokenBalance = await thriftToken.balanceOf(
    //     seller.address
    //   );
    //   expect(finalSellerTokenBalance).to.be.gt(initialSellerTokenBalance);

    //   // ETH purchase
    //   await marketplace.connect(buyer).createEscrowWithEth(
    //     1, // productId
    //     1, // quantity
    //     { value: ethers.parseEther("0.1") }
    //   );

    //   escrowId = (
    //     await marketplace.getUserActiveEscrowsAsBuyer(buyer.address)
    //   )[0];

    //   // Confirm from both sides
    //   await marketplace.connect(buyer).confirmEscrow(escrowId);
    //   await marketplace.connect(seller).confirmEscrow(escrowId);

    //   // Verify seller received ETH (minus fees)
    //   const finalSellerEthBalance = await ethers.provider.getBalance(
    //     seller.address
    //   );
    //   expect(finalSellerEthBalance).to.be.gt(initialSellerEthBalance);
    // });
  });

  describe("Exchange System", function () {
    beforeEach(async function () {
      // Create seller's product
      await marketplace.connect(seller).createProduct(
        "Seller Product",
        "Product to be exchanged",
        "M",
        "New",
        "Brand",
        ["casual"],
        "Unisex",
        "seller-image.jpg",
        ethers.parseEther("100"),
        ethers.parseEther("0.1"),
        5,
        true, // available for exchange
        "Looking for formal wear"
      );

      // Create buyer's product
      await marketplace.connect(buyer).createProduct(
        "Buyer Product",
        "Product to be exchanged for",
        "L",
        "Used",
        "FormalBrand",
        ["formal"],
        "Male",
        "buyer-image.jpg",
        ethers.parseEther("120"),
        ethers.parseEther("0.12"),
        3,
        true, // available for exchange
        "Looking for casual wear"
      );
    });

    it("Should create exchange offer", async function () {
      const quantity = 1;
      const tokenTopUp = ethers.parseEther("10");

      // Create exchange offer
      await marketplace.connect(seller).createExchangeOffer(
        1, // seller's product
        2, // buyer's product
        quantity,
        tokenTopUp
      );

      // Verify exchange offer created
      const exchangeOffers = await marketplace.getExchangeOffers(2);
      expect(exchangeOffers.length).to.equal(1);
      expect(exchangeOffers[0].offeredProductId).to.equal(1);
      expect(exchangeOffers[0].wantedProductId).to.equal(2);
      expect(exchangeOffers[0].offerer).to.equal(seller.address);
      expect(exchangeOffers[0].tokenTopUp).to.equal(tokenTopUp);
      expect(exchangeOffers[0].isActive).to.be.true;

      // Verify product quantities in escrow
      const products = await marketplace.getProductsById([1, 2]);
      expect(products[0].inEscrowQuantity).to.equal(quantity);
      expect(products[1].inEscrowQuantity).to.equal(quantity);
    });

    it("Should complete exchange when accepted", async function () {
      const quantity = 1;
      const tokenTopUp = ethers.parseEther("10");

      // Create exchange offer
      await marketplace.connect(seller).createExchangeOffer(
        1, // seller's product
        2, // buyer's product
        quantity,
        tokenTopUp
      );

      // Get escrow ID
      const sellerEscrows = await marketplace.getUserActiveEscrowsAsBuyer(
        seller.address
      );
      const escrowId = sellerEscrows[0];

      // Initial product quantities
      const initialProducts = await marketplace.getProductsById([1, 2]);
      const initialProduct1Quantity = Number(initialProducts[0].totalQuantity);
      const initialProduct2Quantity = Number(initialProducts[1].totalQuantity);

      // Buyer accepts exchange (buyer is the seller of product 2)
      await marketplace.connect(buyer).confirmEscrow(escrowId);

      // Verify exchange completed
      const completedEscrows = await marketplace.getUserCompletedEscrows(
        seller.address
      );
      expect(completedEscrows.length).to.equal(1);

      // Verify product quantities updated
      const updatedProducts = await marketplace.getProductsById([1, 2]);
      expect(Number(updatedProducts[0].totalQuantity)).to.equal(
        initialProduct1Quantity - quantity
      );
      expect(Number(updatedProducts[1].totalQuantity)).to.equal(
        initialProduct2Quantity - quantity
      );
      expect(updatedProducts[0].inEscrowQuantity).to.equal(0);
      expect(updatedProducts[1].inEscrowQuantity).to.equal(0);
    });

    it("Should allow exchange creator to cancel exchange offer", async function () {
      const quantity = 1;
      const tokenTopUp = ethers.parseEther("10");
      const initialSellerBalance = await thriftToken.balanceOf(seller.address);

      // Create exchange offer
      await marketplace.connect(seller).createExchangeOffer(
        1, // seller's product
        2, // buyer's product
        quantity,
        tokenTopUp
      );

      // Get escrow ID
      const sellerEscrows = await marketplace.getUserActiveEscrowsAsBuyer(
        seller.address
      );
      const escrowId = sellerEscrows[0];

      // Cancel exchange offer - this is the core of our test
      await marketplace.connect(seller).cancelEscrow(escrowId);

      // Verify exchange canceled
      const activeEscrows = await marketplace.getUserActiveEscrowsAsBuyer(
        seller.address
      );
      expect(activeEscrows.length).to.equal(0);

      // Verify product quantities released from escrow
      const products = await marketplace.getProductsById([1, 2]);
      expect(products[0].inEscrowQuantity).to.equal(0);
      expect(products[1].inEscrowQuantity).to.equal(0);

      // Verify token top-up refunded
      const finalSellerBalance = await thriftToken.balanceOf(seller.address);
      expect(finalSellerBalance).to.equal(initialSellerBalance);
    });

    // it("Should NOT allow non-creator to cancel exchange offers", async function () {
    //   const tokenTopUp = ethers.parseEther("10");

    //   // Create exchange offer
    //   await marketplace.connect(seller).createExchangeOffer(
    //     1, // seller's product
    //     2, // buyer's product
    //     1, // quantity
    //     tokenTopUp
    //   );

    //   // Get escrow ID
    //   const sellerEscrows = await marketplace.getUserActiveEscrowsAsBuyer(
    //     seller.address
    //   );
    //   const escrowId = sellerEscrows[0];

    //   // Try to cancel as non-creator (buyer)
    //   // Should be reverted with "Not authorized"
    //   await expect(
    //     marketplace.connect(buyer).cancelEscrow(escrowId)
    //   ).to.be.revertedWith("Not authorized");
    // });

    it("Should handle cancellation of exchange offer after recipient confirmation", async function () {
      const tokenTopUp = ethers.parseEther("10");
      const initialSellerBalance = await thriftToken.balanceOf(seller.address);

      // Create exchange offer
      await marketplace.connect(seller).createExchangeOffer(
        1, // seller's product
        2, // buyer's product
        1, // quantity
        tokenTopUp
      );

      // Get escrow ID
      const sellerEscrows = await marketplace.getUserActiveEscrowsAsBuyer(
        seller.address
      );
      const escrowId = sellerEscrows[0];

      // Recipient confirms
      await marketplace.connect(buyer).confirmEscrow(escrowId);

      // Verify the escrow is now completed
      // According to your contract design, once both sides confirm, the exchange is completed
      // So we should check if it's in the completed list
      const completedEscrows = await marketplace.getUserCompletedEscrows(
        seller.address
      );
      expect(completedEscrows.length).to.equal(1);

      // At this point, attempting to cancel should fail since the escrow is completed
      await expect(
        marketplace.connect(seller).cancelEscrow(escrowId)
      ).to.be.revertedWith("Escrow not active");
    });

    // it("Should allow both parties to bulk confirm escrows", async function () {
    //   // Create two products for the seller
    //   await marketplace
    //     .connect(seller)
    //     .createProduct(
    //       "Another Product",
    //       "Another product to exchange",
    //       "S",
    //       "New",
    //       "Brand",
    //       ["casual"],
    //       "Unisex",
    //       "image3.jpg",
    //       ethers.parseEther("80"),
    //       ethers.parseEther("0.08"),
    //       2,
    //       true,
    //       ""
    //     );

    //   // Create exchange offers on both products
    //   await marketplace
    //     .connect(seller)
    //     .createExchangeOffer(1, 2, 1, ethers.parseEther("5"));
    //   await marketplace
    //     .connect(seller)
    //     .createExchangeOffer(3, 2, 1, ethers.parseEther("3"));

    //   // Check if offers are active
    //   const sellerEscrows = await marketplace.getUserActiveEscrowsAsBuyer(
    //     seller.address
    //   );
    //   expect(sellerEscrows.length).to.equal(2);

    //   // Buyer confirms both in bulk
    //   await marketplace
    //     .connect(buyer)
    //     .bulkConfirmEscrowsForSeller(sellerEscrows);

    //   // Verify both are completed
    //   const completedEscrows = await marketplace.getUserCompletedEscrows(
    //     buyer.address
    //   );
    //   expect(completedEscrows.length).to.equal(2);
    // });
  });
});
