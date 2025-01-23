const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
// const { constants } = ethers;

describe("Thrift Ecosystem Contracts", function () {
  let thriftToken, marketplace, donationAndRecycling;
  let owner, seller, buyer, treasury, dev;

  beforeEach(async function () {
    [owner, seller, buyer, treasury, dev] = await ethers.getSigners();

    // Deploy ThriftToken
    const ThriftTokenContract = await ethers.getContractFactory("ThriftToken");
    thriftToken = await ThriftTokenContract.deploy(owner.address, dev.address);
    await thriftToken.waitForDeployment();

    // Deploy Marketplace
    const MarketplaceContract = await ethers.getContractFactory("Marketplace");
    marketplace = await MarketplaceContract.deploy(
      thriftToken.getAddress(),
      treasury.address
    );
    await marketplace.waitForDeployment();

    // Deploy DonationAndRecycling
    const DonationContract = await ethers.getContractFactory(
      "DonationAndRecycling"
    );
    donationAndRecycling = await DonationContract.deploy(
      thriftToken.getAddress()
    );
    await donationAndRecycling.waitForDeployment();

    // Authorize contracts for rewards
    await thriftToken.setRewardContract(marketplace.getAddress(), true);
    await thriftToken.setRewardContract(
      donationAndRecycling.getAddress(),
      true
    );
  });

  describe("ThriftToken", function () {
    it("Should have correct initial parameters", async function () {
      expect(await thriftToken.name()).to.equal("ThriftToken");
      expect(await thriftToken.symbol()).to.equal("THRIFT");
    });

    it("Should allow token purchase", async function () {
      const tokenPrice = await thriftToken.tokenPrice();
      await thriftToken
        .connect(buyer)
        .buyTokens({ value: ethers.parseEther("1") });
      const balance = await thriftToken.balanceOf(buyer.address);
      expect(balance).to.be.gt(0);
    });
  });

  describe("Marketplace", function () {
    let productId;

    beforeEach(async function () {
      // List a product
      await marketplace
        .connect(seller)
        .listProduct(
          "Test Product",
          "Description",
          "M",
          "Good",
          "Brand",
          "Clothing",
          "Unisex",
          "imageUrl",
          ethers.parseUnits("10", 18),
          ethers.parseUnits("0.01", 18),
          5,
          true,
          "Any"
        );
      productId = 1;
    });

    it("Should list a product", async function () {
      const product = await marketplace.products(productId);
      expect(product.name).to.equal("Test Product");
    });

    it("Should allow token purchase", async function () {
      // Mint tokens to buyer and approve marketplace
      const purchaseAmount = ethers.parseUnits("100", 18);
      await thriftToken.connect(owner).mint(buyer.address, purchaseAmount);
      await thriftToken
        .connect(buyer)
        .approve(marketplace.getAddress(), purchaseAmount);

      // Mint tokens to marketplace for platform fees
      await thriftToken
        .connect(owner)
        .mint(marketplace.getAddress(), purchaseAmount);

      await marketplace.connect(buyer).buyWithTokens(productId, 1);
      const product = await marketplace.products(productId);
      expect(product.quantity).to.equal(4);
    });

    it("Should allow product deletion", async function () {
      await marketplace.connect(seller).deleteListing(productId);
      const product = await marketplace.products(productId);
      expect(product.seller).to.equal(ethers.ZeroAddress);
    });
  });

  describe("DonationAndRecycling", function () {
    let centerId;

    beforeEach(async function () {
      // Add a donation center
      await donationAndRecycling
        .connect(owner)
        .addDonationCenter(
          "Test Center",
          "Description",
          "Location",
          true,
          true
        );
      centerId = 1;
    });

    it("Should add a donation center", async function () {
      const center = await donationAndRecycling.donationCenters(centerId);
      expect(center.name).to.equal("Test Center");
    });

    it("Should register a donation", async function () {
      await donationAndRecycling
        .connect(buyer)
        .registerDonation(centerId, 10, "Clothing", "Donation Description", 5);

      const donationCount = await donationAndRecycling.donationCount();
      expect(donationCount).to.equal(1);
    });
  });
});
