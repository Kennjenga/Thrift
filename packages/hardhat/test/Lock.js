const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Thrift Ecosystem Tests", function () {
  let thriftToken, marketplace, donationCenter, userAesthetics;
  let owner, devWallet, treasuryWallet, creator, donor, buyer, seller;

  beforeEach(async function () {
    [owner, devWallet, treasuryWallet, creator, donor, buyer, seller] =
      await ethers.getSigners();

    // Deploy ThriftToken
    const ThriftToken = await ethers.getContractFactory("ThriftToken");
    thriftToken = await ThriftToken.deploy(owner.address, devWallet.address);

    // Deploy UserAesthetics
    const UserAesthetics = await ethers.getContractFactory("UserAesthetics");
    userAesthetics = await UserAesthetics.deploy();

    // Deploy DonationAndRecycling
    const DonationCenter = await ethers.getContractFactory(
      "DonationAndRecycling"
    );
    donationCenter = await DonationCenter.deploy(
      await thriftToken.getAddress()
    );

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(
      await thriftToken.getAddress(),
      await userAesthetics.getAddress(),
      treasuryWallet.address
    );

    // Set up reward contracts
    await thriftToken.setRewardContract(await marketplace.getAddress(), true);
    await thriftToken.setRewardContract(
      await donationCenter.getAddress(),
      true
    );

    // Mint tokens for testing
    await thriftToken.mint(buyer.address, ethers.parseEther("1000"));
    await thriftToken.mint(seller.address, ethers.parseEther("500"));

    // Approve tokens
    await thriftToken
      .connect(buyer)
      .approve(await marketplace.getAddress(), ethers.parseEther("1000"));

    await thriftToken
      .connect(seller)
      .approve(await marketplace.getAddress(), ethers.parseEther("500"));

    // Set buyer aesthetics for later tests
    const buyerAesthetics = ["casual", "vintage"];
    await userAesthetics.connect(buyer).setUserAesthetics(buyerAesthetics);
  });

  describe("ThriftToken Contract", function () {
    it("Should initialize with correct parameters", async function () {
      expect(await thriftToken.name()).to.equal("ThriftToken");
      expect(await thriftToken.symbol()).to.equal("THRIFT");
      expect(await thriftToken.devWallet()).to.equal(devWallet.address);
      expect(await thriftToken.owner()).to.equal(owner.address);
    });

    it("Should allow buying tokens with ETH", async function () {
      const ethAmount = ethers.parseEther("1");
      await buyer.sendTransaction({
        to: await thriftToken.getAddress(),
        value: ethAmount,
      });

      const balance = await thriftToken.balanceOf(buyer.address);
      expect(balance).to.be.gt(0);
    });

    it("Should respect token cap", async function () {
      const cap = await thriftToken.currentCap();
      const largeAmount = cap;
      await expect(
        thriftToken.mint(buyer.address, largeAmount)
      ).to.be.revertedWith("Cap exceeded");
    });

    it("Should handle token burning", async function () {
      const mintAmount = ethers.parseEther("100");
      await thriftToken.mint(buyer.address, mintAmount);
      await thriftToken.connect(buyer).burn(mintAmount);
      expect(await thriftToken.balanceOf(buyer.address)).to.equal(
        ethers.parseEther("1000")
      ); // Initial 1000 + 100 - 100
    });
  });

  describe("UserAesthetics Contract", function () {
    const testAesthetics = ["streetwear", "vintage", "minimalist"];

    it("Should set user aesthetics", async function () {
      await userAesthetics.connect(seller).setUserAesthetics(testAesthetics);
      const [userPrefs, isSet] = await userAesthetics.getUserAesthetics(
        seller.address
      );
      expect(userPrefs).to.deep.equal(testAesthetics);
      expect(isSet).to.be.true;
    });

    it("Should reject empty aesthetics array", async function () {
      await expect(
        userAesthetics.connect(seller).setUserAesthetics([])
      ).to.be.revertedWith("Empty aesthetics not allowed");
    });

    it("Should delete user aesthetics", async function () {
      await userAesthetics.connect(seller).setUserAesthetics(testAesthetics);
      await userAesthetics.connect(seller).deleteUserAesthetics();

      // Check if aesthetics were deleted
      try {
        await userAesthetics.getUserAesthetics(seller.address);
        assert.fail("The transaction should have thrown an error");
      } catch (err) {
        expect(err.message).to.include("Aesthetics not set");
      }
    });
  });

  describe("DonationCenter Contract", function () {
    beforeEach(async function () {
      await donationCenter.approveCreator(creator.address);
    });

    it("Should add donation center", async function () {
      await donationCenter
        .connect(creator)
        .addDonationCenter(
          "Test Center",
          "Description",
          "Location",
          true,
          true
        );

      const center = await donationCenter.donationCenters(1);
      expect(center.name).to.equal("Test Center");
      expect(center.isActive).to.be.true;
    });

    it("Should process donation", async function () {
      // Create center
      await donationCenter
        .connect(creator)
        .addDonationCenter(
          "Test Center",
          "Description",
          "Location",
          true,
          true
        );

      // Submit donation
      await donationCenter
        .connect(donor)
        .submitDonation(1, 5, "Clothes", "Test donation", 10);

      // Approve donation
      await donationCenter.connect(creator).approveDonation(1, 5, 10);

      const donation = await donationCenter.approvedDonations(1);
      expect(donation.isApproved).to.be.true;
    });
  });

  describe("Marketplace Contract", function () {
    describe("Basic Product Management", function () {
      it("Should create and list product", async function () {
        await marketplace
          .connect(seller)
          .createProduct(
            "Test Product",
            "Description",
            "M",
            "New",
            "Brand",
            ["casual"],
            "Unisex",
            "image.jpg",
            ethers.parseEther("100"),
            ethers.parseEther("0.1"),
            1,
            false,
            ""
          );

        const product = (await marketplace.getProductsById([1]))[0];
        expect(product.name).to.equal("Test Product");
        expect(product.seller).to.equal(seller.address);
      });

      it("Should handle ETH purchases", async function () {
        // Create product
        await marketplace
          .connect(seller)
          .createProduct(
            "Test Product",
            "Description",
            "M",
            "New",
            "Brand",
            ["casual"],
            "Unisex",
            "image.jpg",
            ethers.parseEther("100"),
            ethers.parseEther("0.1"),
            1,
            false,
            ""
          );

        // Purchase with ETH
        await marketplace
          .connect(buyer)
          .createEscrowWithEth(1, 1, { value: ethers.parseEther("0.1") });

        // Confirm escrow
        await marketplace.connect(buyer).confirmEscrow(1);
        await marketplace.connect(seller).confirmEscrow(1);

        const escrow = await marketplace.escrows(1);
        expect(escrow.completed).to.be.true;
      });

      it("Should handle token purchases", async function () {
        // Create product
        await marketplace
          .connect(seller)
          .createProduct(
            "Test Product",
            "Description",
            "M",
            "New",
            "Brand",
            ["casual"],
            "Unisex",
            "image.jpg",
            ethers.parseEther("100"),
            ethers.parseEther("0.1"),
            1,
            false,
            ""
          );

        // Purchase with tokens
        await marketplace.connect(buyer).createEscrowWithTokens(1, 1);

        // Confirm escrow
        await marketplace.connect(buyer).confirmEscrow(1);
        await marketplace.connect(seller).confirmEscrow(1);

        const escrow = await marketplace.escrows(1);
        expect(escrow.completed).to.be.true;
      });

      it("Should update product details", async function () {
        // Create product
        await marketplace
          .connect(seller)
          .createProduct(
            "Test Product",
            "Description",
            "M",
            "New",
            "Brand",
            ["casual"],
            "Unisex",
            "image.jpg",
            ethers.parseEther("100"),
            ethers.parseEther("0.1"),
            1,
            false,
            ""
          );

        // Update product
        await marketplace
          .connect(seller)
          .updateProduct(
            1,
            "Updated Product",
            "Updated Description",
            "L",
            "Used",
            "Premium Brand",
            ["formal", "luxury"],
            "Male",
            "new-image.jpg",
            ethers.parseEther("150"),
            ethers.parseEther("0.15"),
            true,
            "Looking for vintage items"
          );

        const updatedProduct = (await marketplace.getProductsById([1]))[0];
        expect(updatedProduct.name).to.equal("Updated Product");
        expect(updatedProduct.description).to.equal("Updated Description");
        expect(updatedProduct.size).to.equal("L");
        expect(updatedProduct.condition).to.equal("Used");
        expect(updatedProduct.brand).to.equal("Premium Brand");
        expect(updatedProduct.categories).to.deep.equal(["formal", "luxury"]);
        expect(updatedProduct.gender).to.equal("Male");
        expect(updatedProduct.tokenPrice).to.equal(ethers.parseEther("150"));
        expect(updatedProduct.ethPrice).to.equal(ethers.parseEther("0.15"));
        expect(updatedProduct.isAvailableForExchange).to.be.true;
        expect(updatedProduct.exchangePreference).to.equal(
          "Looking for vintage items"
        );
      });

      it("Should update product quantity", async function () {
        // Create product
        await marketplace
          .connect(seller)
          .createProduct(
            "Test Product",
            "Description",
            "M",
            "New",
            "Brand",
            ["casual"],
            "Unisex",
            "image.jpg",
            ethers.parseEther("100"),
            ethers.parseEther("0.1"),
            5,
            false,
            ""
          );

        // Update quantity
        await marketplace.connect(seller).updateProductQuantity(1, 10);

        const product = (await marketplace.getProductsById([1]))[0];
        expect(product.totalQuantity).to.equal(10);
      });

      it("Should batch update quantities", async function () {
        // Create multiple products
        await marketplace
          .connect(seller)
          .createProduct(
            "Product 1",
            "Description",
            "M",
            "New",
            "Brand",
            ["casual"],
            "Unisex",
            "image1.jpg",
            ethers.parseEther("100"),
            ethers.parseEther("0.1"),
            5,
            false,
            ""
          );

        await marketplace
          .connect(seller)
          .createProduct(
            "Product 2",
            "Description",
            "L",
            "Used",
            "Brand",
            ["formal"],
            "Male",
            "image2.jpg",
            ethers.parseEther("150"),
            ethers.parseEther("0.15"),
            3,
            false,
            ""
          );

        // Batch update
        await marketplace
          .connect(seller)
          .batchUpdateQuantities([1, 2], [10, 8]);

        const products = await marketplace.getProductsById([1, 2]);
        expect(products[0].totalQuantity).to.equal(10);
        expect(products[1].totalQuantity).to.equal(8);
      });
    });

    describe("Advanced Escrow System", function () {
      beforeEach(async function () {
        // Create a product for testing escrow
        await marketplace
          .connect(seller)
          .createProduct(
            "Test Product",
            "A test product for escrow",
            "M",
            "New",
            "TestBrand",
            ["casual"],
            "Unisex",
            "product.jpg",
            ethers.parseEther("100"),
            ethers.parseEther("0.1"),
            5,
            true,
            "Open to similar items"
          );
      });

      it("Should handle escrow cancellation by buyer", async function () {
        const tokenPrice = ethers.parseEther("100");
        const quantity = 1;

        // Create escrow with tokens
        await marketplace.connect(buyer).createEscrowWithTokens(1, quantity);

        // Get balances before cancellation
        const buyerBalanceBeforeCancel = await thriftToken.balanceOf(
          buyer.address
        );

        // Cancel escrow
        await marketplace.connect(buyer).cancelEscrow(1);

        // Verify escrow state
        const escrow = await marketplace.escrows(1);
        expect(escrow.refunded).to.be.true;
        expect(escrow.completed).to.be.false;

        // Check product quantity after cancellation
        const productAfterCancel = (await marketplace.getProductsById([1]))[0];
        expect(productAfterCancel.inEscrowQuantity).to.equal(0);

        // Check buyer got tokens back
        const buyerBalanceAfterCancel = await thriftToken.balanceOf(
          buyer.address
        );
        expect(buyerBalanceAfterCancel).to.equal(
          buyerBalanceBeforeCancel.add(tokenPrice)
        );
      });

      it("Should handle escrow rejection by seller", async function () {
        const productPrice = ethers.parseEther("0.1");
        const quantity = 1;

        // Create escrow with ETH
        await marketplace
          .connect(buyer)
          .createEscrowWithEth(1, quantity, { value: productPrice });

        // Get balances before rejection
        const buyerBalanceBeforeReject = await ethers.provider.getBalance(
          buyer.address
        );

        // Reject escrow
        await marketplace.connect(seller).rejectEscrow(1, "Item not available");

        // Verify escrow state
        const escrow = await marketplace.escrows(1);
        expect(escrow.refunded).to.be.true;
        expect(escrow.completed).to.be.false;

        // Check buyer got ETH back (approximately)
        const buyerBalanceAfterReject = await ethers.provider.getBalance(
          buyer.address
        );
        // Allow for gas costs with a reasonable margin
        expect(buyerBalanceAfterReject).to.be.gt(
          buyerBalanceBeforeReject.sub(ethers.parseEther("0.01"))
        );
      });

      it("Should handle bulk escrow creation with tokens", async function () {
        // Create a second product
        await marketplace
          .connect(seller)
          .createProduct(
            "Another Product",
            "Another test product",
            "L",
            "Used",
            "TestBrand",
            ["casual"],
            "Unisex",
            "product2.jpg",
            ethers.parseEther("120"),
            ethers.parseEther("0.12"),
            3,
            false,
            ""
          );

        const product1Quantity = 1;
        const product2Quantity = 2;

        // Create bulk escrow with tokens
        await marketplace
          .connect(buyer)
          .createBulkEscrowWithTokens(
            [1, 2],
            [product1Quantity, product2Quantity]
          );

        // Check product quantities in escrow
        const products = await marketplace.getProductsById([1, 2]);
        expect(products[0].inEscrowQuantity).to.equal(product1Quantity);
        expect(products[1].inEscrowQuantity).to.equal(product2Quantity);
      });

      it("Should allow confirming multiple escrows at once", async function () {
        // Create a second product
        await marketplace
          .connect(seller)
          .createProduct(
            "Another Product",
            "Another test product",
            "L",
            "Used",
            "TestBrand",
            ["casual"],
            "Unisex",
            "product2.jpg",
            ethers.parseEther("120"),
            ethers.parseEther("0.12"),
            3,
            false,
            ""
          );

        // Create escrows
        await marketplace.connect(buyer).createEscrowWithTokens(1, 1);
        await marketplace.connect(buyer).createEscrowWithTokens(2, 1);

        // Bulk confirm as buyer
        await marketplace.connect(buyer).bulkConfirmEscrowsAsBuyer([1, 2]);

        // Verify buyer confirmations
        const escrow1 = await marketplace.escrows(1);
        const escrow2 = await marketplace.escrows(2);
        expect(escrow1.buyerConfirmed).to.be.true;
        expect(escrow2.buyerConfirmed).to.be.true;

        // Bulk confirm as seller
        await marketplace.connect(seller).bulkConfirmEscrowsForSeller([1, 2]);

        // Verify escrows completed
        const updatedEscrow1 = await marketplace.escrows(1);
        const updatedEscrow2 = await marketplace.escrows(2);
        expect(updatedEscrow1.completed).to.be.true;
        expect(updatedEscrow2.completed).to.be.true;
      });
    });

    describe("Exchange System", function () {
      beforeEach(async function () {
        // Create product by seller
        await marketplace
          .connect(seller)
          .createProduct(
            "Seller Product",
            "Description",
            "M",
            "New",
            "Brand",
            ["casual"],
            "Unisex",
            "seller-image.jpg",
            ethers.parseEther("100"),
            ethers.parseEther("0.1"),
            1,
            true,
            ""
          );

        // Create product by buyer
        await marketplace
          .connect(buyer)
          .createProduct(
            "Buyer Product",
            "Description",
            "L",
            "New",
            "Brand",
            ["formal"],
            "Unisex",
            "buyer-image.jpg",
            ethers.parseEther("100"),
            ethers.parseEther("0.1"),
            1,
            true,
            ""
          );
      });

      it("Should create and process exchange offer", async function () {
        const topUpAmount = ethers.parseEther("10");

        // Create exchange offer
        await marketplace
          .connect(seller)
          .createExchangeOffer(1, 2, 1, topUpAmount);

        // Verify exchange offer was created
        const exchangeOffers = await marketplace.getExchangeOffers(2);
        expect(exchangeOffers.length).to.equal(1);
        expect(exchangeOffers[0].offeredProductId).to.equal(1);
        expect(exchangeOffers[0].wantedProductId).to.equal(2);
        expect(exchangeOffers[0].tokenTopUp).to.equal(topUpAmount);

        // Accept and confirm the exchange
        await marketplace.connect(buyer).confirmEscrow(1);

        // Verify exchange completed
        const escrow = await marketplace.escrows(1);
        expect(escrow.completed).to.be.true;

        // Verify products were transferred
        const products = await marketplace.getProductsById([1, 2]);
        expect(products[0].totalQuantity).to.equal(0); // Transferred to buyer
        expect(products[1].totalQuantity).to.equal(0); // Transferred to seller
      });

      it("Should allow cancelling exchange offers", async function () {
        const topUpAmount = ethers.parseEther("10");

        // Initial token balance
        const initialSellerBalance = await thriftToken.balanceOf(
          seller.address
        );

        // Create exchange offer
        await marketplace
          .connect(seller)
          .createExchangeOffer(1, 2, 1, topUpAmount);

        // Cancel exchange offer
        await marketplace.connect(seller).cancelEscrow(1);

        // Verify escrow refunded
        const escrow = await marketplace.escrows(1);
        expect(escrow.refunded).to.be.true;

        // Verify token top-up was refunded
        const finalSellerBalance = await thriftToken.balanceOf(seller.address);
        expect(finalSellerBalance).to.equal(initialSellerBalance);

        // Verify products are no longer in escrow
        const products = await marketplace.getProductsById([1, 2]);
        expect(products[0].inEscrowQuantity).to.equal(0);
        expect(products[1].inEscrowQuantity).to.equal(0);
      });
    });

    describe("Search and Query Functions", function () {
      beforeEach(async function () {
        // Create multiple products with different parameters
        await marketplace
          .connect(seller)
          .createProduct(
            "Vintage Jacket",
            "A beautiful vintage jacket",
            "M",
            "Good",
            "RetroWear",
            ["vintage", "casual"],
            "Unisex",
            "image1.jpg",
            ethers.parseEther("100"),
            ethers.parseEther("0.1"),
            2,
            true,
            ""
          );

        await marketplace
          .connect(seller)
          .createProduct(
            "Formal Shoes",
            "Elegant formal shoes",
            "42",
            "New",
            "LuxBrand",
            ["formal"],
            "Male",
            "image2.jpg",
            ethers.parseEther("200"),
            ethers.parseEther("0.2"),
            1,
            false,
            ""
          );

        await marketplace
          .connect(seller)
          .createProduct(
            "Casual T-shirt",
            "Comfortable casual t-shirt",
            "L",
            "New",
            "BasicWear",
            ["casual"],
            "Unisex",
            "image3.jpg",
            ethers.parseEther("50"),
            ethers.parseEther("0.05"),
            5,
            true,
            ""
          );
      });

      it("Should get all active products", async function () {
        const activeProducts = await marketplace.getAllActiveProducts();
        expect(activeProducts.length).to.equal(3);
      });

      it("Should search products by name", async function () {
        const searchParams = {
          nameQuery: "Vintage",
          categories: [],
          brand: "",
          condition: "",
          gender: "",
          size: "",
          minPrice: 0,
          maxPrice: 0,
          onlyAvailable: true,
          exchangeOnly: false,
          page: 1,
          pageSize: 10,
        };

        const searchResult = await marketplace.searchProducts(searchParams);

        expect(searchResult.products.length).to.equal(1);
        expect(searchResult.products[0].name).to.equal("Vintage Jacket");
      });

      it("Should search products by category", async function () {
        const searchParams = {
          nameQuery: "",
          categories: ["casual"],
          brand: "",
          condition: "",
          gender: "",
          size: "",
          minPrice: 0,
          maxPrice: 0,
          onlyAvailable: true,
          exchangeOnly: false,
          page: 1,
          pageSize: 10,
        };

        const searchResult = await marketplace.searchProducts(searchParams);

        expect(searchResult.products.length).to.equal(2); // Vintage Jacket and Casual T-shirt
      });

      it("Should get products by user aesthetics", async function () {
        // Buyer already has "casual" and "vintage" aesthetics set
        const result = await marketplace.getProductsByUserAesthetics(
          buyer.address,
          1,
          10
        );

        expect(result.products.length).to.equal(2); // Vintage Jacket and Casual T-shirt
      });
    });

    describe("Admin Functions", function () {
      it("Should update platform fees", async function () {
        const newTokenFee = 40;
        const newEthFee = 45;

        await marketplace
          .connect(treasuryWallet)
          .updatePlatformFees(newTokenFee, newEthFee);

        expect(await marketplace.tokenPlatformFee()).to.equal(newTokenFee);
        expect(await marketplace.ethPlatformFee()).to.equal(newEthFee);
      });

      it("Should toggle pause state", async function () {
        const initialPauseState = await marketplace.isPaused();

        await marketplace.connect(treasuryWallet).togglePause();

        const newPauseState = await marketplace.isPaused();
        expect(newPauseState).to.equal(!initialPauseState);
      });

      it("Should update treasury wallet", async function () {
        const newTreasury = buyer.address;

        await marketplace
          .connect(treasuryWallet)
          .updateTreasuryWallet(newTreasury);

        expect(await marketplace.treasuryWallet()).to.equal(newTreasury);
      });
    });
  });
});
