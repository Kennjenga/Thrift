const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ThriftToken Contract", function () {
  let thriftToken;
  let owner, devWallet, user1, user2;

  beforeEach(async function () {
    [owner, devWallet, user1, user2] = await ethers.getSigners();

    // Deploy ThriftToken
    const ThriftToken = await ethers.getContractFactory("ThriftToken");
    thriftToken = await ThriftToken.deploy(owner.address, devWallet.address);
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await thriftToken.name()).to.equal("ThriftToken");
      expect(await thriftToken.symbol()).to.equal("THRIFT");
    });

    it("Should assign the initial dev allocation", async function () {
      const devBalance = await thriftToken.balanceOf(devWallet.address);
      const initialCap = await thriftToken.INITIAL_CAP();
      const devPercentage = await thriftToken.DEV_PERCENTAGE();

      // Dev should have DEV_PERCENTAGE% of INITIAL_CAP
      const expectedDevBalance =
        (BigInt(initialCap) * BigInt(devPercentage)) / BigInt(100);
      expect(devBalance).to.equal(expectedDevBalance);
    });

    it("Should set the current cap to the initial cap", async function () {
      const currentCap = await thriftToken.currentCap();
      const initialCap = await thriftToken.INITIAL_CAP();
      expect(currentCap).to.equal(initialCap);
    });

    it("Should have the correct owner", async function () {
      expect(await thriftToken.owner()).to.equal(owner.address);
    });
  });

  describe("Token Purchase", function () {
    it("Should allow buying tokens with ETH", async function () {
      const tokenPrice = await thriftToken.tokenPrice();
      const ethAmount = ethers.parseEther("1");
      const expectedTokens = (ethAmount * ethers.parseEther("1")) / tokenPrice;

      await user1.sendTransaction({
        to: await thriftToken.getAddress(),
        value: ethAmount,
      });

      expect(await thriftToken.balanceOf(user1.address)).to.equal(
        expectedTokens
      );
    });

    it("Should reject purchases with zero ETH", async function () {
      await expect(
        user1.sendTransaction({
          to: await thriftToken.getAddress(),
          value: 0,
        })
      ).to.be.revertedWith("Must send ETH");
    });
  });

  describe("Token Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("100");
      await thriftToken.mint(user1.address, mintAmount);
      expect(await thriftToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should prevent non-owners from minting", async function () {
      const mintAmount = ethers.parseEther("100");
      await expect(
        thriftToken.connect(user1).mint(user1.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent minting above the cap", async function () {
      const cap = await thriftToken.currentCap();
      await expect(thriftToken.mint(user1.address, cap)).to.be.revertedWith(
        "Cap exceeded"
      );
    });

    it("Should allow reward contracts to mint rewards", async function () {
      // Set user1 as a reward contract
      await thriftToken.setRewardContract(user1.address, true);

      const rewardAmount = ethers.parseEther("10");
      await thriftToken.connect(user1).mintReward(user2.address, rewardAmount);

      expect(await thriftToken.balanceOf(user2.address)).to.equal(rewardAmount);
    });

    it("Should prevent unauthorized contracts from minting rewards", async function () {
      const rewardAmount = ethers.parseEther("10");
      await expect(
        thriftToken.connect(user1).mintReward(user2.address, rewardAmount)
      ).to.be.revertedWith("Unauthorized");
    });
  });

  describe("Token Burning", function () {
    it("Should allow users to burn their tokens", async function () {
      const mintAmount = ethers.parseEther("100");
      const burnAmount = ethers.parseEther("30");

      await thriftToken.mint(user1.address, mintAmount);
      await thriftToken.connect(user1).burn(burnAmount);

      const expectedBalance = mintAmount - burnAmount;
      expect(await thriftToken.balanceOf(user1.address)).to.equal(
        expectedBalance
      );
    });

    it("Should prevent burning more tokens than owned", async function () {
      const mintAmount = ethers.parseEther("100");
      const burnAmount = ethers.parseEther("150");

      await thriftToken.mint(user1.address, mintAmount);
      await expect(
        thriftToken.connect(user1).burn(burnAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Cap Management", function () {
    it("Should allow owner to increase the cap", async function () {
      const initialCap = await thriftToken.currentCap();
      const newCap = initialCap * BigInt(2);

      await thriftToken.setCap(newCap);
      expect(await thriftToken.currentCap()).to.equal(newCap);
    });

    it("Should mint additional dev and reward allocations when cap increases", async function () {
      const initialCap = await thriftToken.currentCap();
      const initialDevBalance = await thriftToken.balanceOf(devWallet.address);
      const newCap = initialCap * BigInt(2);
      const increase = newCap - initialCap;

      await thriftToken.setCap(newCap);

      const devIncreasePercentage = await thriftToken.DEV_INCREASE_PERCENTAGE();
      const expectedDevIncrease =
        (increase * BigInt(devIncreasePercentage)) / BigInt(100);

      const finalDevBalance = await thriftToken.balanceOf(devWallet.address);
      expect(finalDevBalance).to.equal(initialDevBalance + expectedDevIncrease);
    });

    it("Should prevent setting cap below current supply", async function () {
      const mintAmount = ethers.parseEther("100000");
      await thriftToken.mint(user1.address, mintAmount);

      const totalSupply = await thriftToken.totalSupply();
      const lowerCap = totalSupply - ethers.parseEther("1");

      await expect(thriftToken.setCap(lowerCap)).to.be.revertedWith(
        "Cap cannot be less than supply"
      );
    });
  });

  describe("Token Price Management", function () {
    it("Should allow owner to update token price", async function () {
      const newPrice = ethers.parseEther("0.002");
      await thriftToken.setTokenPrice(newPrice);
      expect(await thriftToken.tokenPrice()).to.equal(newPrice);
    });

    it("Should prevent setting zero token price", async function () {
      await expect(thriftToken.setTokenPrice(0)).to.be.revertedWith(
        "Invalid price"
      );
    });
  });

  describe("Reward Contract Management", function () {
    it("Should allow owner to set reward contracts", async function () {
      await thriftToken.setRewardContract(user1.address, true);
      expect(await thriftToken.isRewardContract(user1.address)).to.be.true;

      await thriftToken.setRewardContract(user1.address, false);
      expect(await thriftToken.isRewardContract(user1.address)).to.be.false;
    });
  });
});
