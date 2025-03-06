const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserAesthetics Contract", function () {
  let userAesthetics;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy UserAesthetics
    const UserAesthetics = await ethers.getContractFactory("UserAesthetics");
    userAesthetics = await UserAesthetics.deploy();
  });

  describe("Aesthetics Management", function () {
    const testAesthetics = ["streetwear", "vintage", "minimalist"];

    it("Should allow setting user aesthetics", async function () {
      await userAesthetics.connect(user1).setUserAesthetics(testAesthetics);

      const [userPrefs, isSet, timestamp] =
        await userAesthetics.getUserAesthetics(user1.address);

      expect(isSet).to.be.true;
      expect(userPrefs).to.deep.equal(testAesthetics);
      expect(timestamp).to.be.gt(0);
    });

    it("Should reject empty aesthetics array", async function () {
      await expect(
        userAesthetics.connect(user1).setUserAesthetics([])
      ).to.be.revertedWith("Empty aesthetics not allowed");
    });

    it("Should limit the number of aesthetics", async function () {
      const tooManyAesthetics = Array(21)
        .fill()
        .map((_, i) => `aesthetic${i}`);

      await expect(
        userAesthetics.connect(user1).setUserAesthetics(tooManyAesthetics)
      ).to.be.revertedWith("Too many aesthetics");
    });

    it("Should allow updating aesthetics", async function () {
      await userAesthetics.connect(user1).setUserAesthetics(testAesthetics);

      const newAesthetics = ["casual", "formal"];
      await userAesthetics.connect(user1).setUserAesthetics(newAesthetics);

      const [userPrefs, isSet] = await userAesthetics.getUserAesthetics(
        user1.address
      );

      expect(isSet).to.be.true;
      expect(userPrefs).to.deep.equal(newAesthetics);
    });

    it("Should allow deleting aesthetics", async function () {
      await userAesthetics.connect(user1).setUserAesthetics(testAesthetics);
      await userAesthetics.connect(user1).deleteUserAesthetics();

      const [userPrefs, isSet] = await userAesthetics.getUserAesthetics(
        user1.address
      );

      expect(isSet).to.be.false;
      expect(userPrefs).to.be.an("array").that.is.empty;
    });

    it("Should return empty array for users with no aesthetics", async function () {
      const [userPrefs, isSet] = await userAesthetics.getUserAesthetics(
        user2.address
      );

      expect(isSet).to.be.false;
      expect(userPrefs).to.be.an("array").that.is.empty;
    });
  });

  describe("Profile Management", function () {
    const testProfile = {
      name: "John Doe",
      phone: "123-456-7890",
      email: "john@example.com",
      location: "New York",
    };

    it("Should allow setting user profile", async function () {
      await userAesthetics
        .connect(user1)
        .setUserProfile(
          testProfile.name,
          testProfile.phone,
          testProfile.email,
          testProfile.location
        );

      const [name, phone, email, location, isProfileSet, timestamp] =
        await userAesthetics.getUserProfile(user1.address);

      expect(isProfileSet).to.be.true;
      expect(name).to.equal(testProfile.name);
      expect(phone).to.equal(testProfile.phone);
      expect(email).to.equal(testProfile.email);
      expect(location).to.equal(testProfile.location);
      expect(timestamp).to.be.gt(0);
    });

    it("Should return empty profile for users with no profile", async function () {
      const [name, phone, email, location, isProfileSet] =
        await userAesthetics.getUserProfile(user2.address);

      expect(isProfileSet).to.be.false;
      expect(name).to.equal("");
      expect(phone).to.equal("");
      expect(email).to.equal("");
      expect(location).to.equal("");
    });

    it("Should allow updating specific profile fields", async function () {
      await userAesthetics
        .connect(user1)
        .setUserProfile(
          testProfile.name,
          testProfile.phone,
          testProfile.email,
          testProfile.location
        );

      const newEmail = "newemail@example.com";
      await userAesthetics.connect(user1).updateProfileField("email", newEmail);

      const [name, phone, email, location, isProfileSet] =
        await userAesthetics.getUserProfile(user1.address);

      expect(isProfileSet).to.be.true;
      expect(name).to.equal(testProfile.name);
      expect(phone).to.equal(testProfile.phone);
      expect(email).to.equal(newEmail);
      expect(location).to.equal(testProfile.location);
    });

    it("Should create profile when updating field for non-existent profile", async function () {
      await userAesthetics
        .connect(user2)
        .updateProfileField("name", "Jane Doe");

      const [name, phone, email, location, isProfileSet] =
        await userAesthetics.getUserProfile(user2.address);

      expect(isProfileSet).to.be.true;
      expect(name).to.equal("Jane Doe");
    });

    it("Should reject updating invalid field name", async function () {
      await expect(
        userAesthetics.connect(user1).updateProfileField("invalid", "value")
      ).to.be.revertedWith("Invalid field name");
    });

    it("Should allow deleting user profile", async function () {
      await userAesthetics
        .connect(user1)
        .setUserProfile(
          testProfile.name,
          testProfile.phone,
          testProfile.email,
          testProfile.location
        );

      await userAesthetics.connect(user1).deleteUserProfile();

      const [, , , , isProfileSet] = await userAesthetics.getUserProfile(
        user1.address
      );
      expect(isProfileSet).to.be.false;
    });
  });

  describe("Events", function () {
    it("Should emit AestheticsUpdated event when setting aesthetics", async function () {
      const testAesthetics = ["casual", "vintage"];

      const tx = await userAesthetics
        .connect(user1)
        .setUserAesthetics(testAesthetics);
      await tx.wait();

      // Verify event was emitted without checking exact timestamp
      const filter = userAesthetics.filters.AestheticsUpdated(user1.address);
      const events = await userAesthetics.queryFilter(filter);

      expect(events.length).to.be.at.least(1);
      const event = events[events.length - 1];
      expect(event.args[0]).to.equal(user1.address);
      expect(event.args[1]).to.deep.equal(testAesthetics);
    });

    it("Should emit ProfileUpdated event when setting profile", async function () {
      const name = "John Doe";
      const phone = "123-456-7890";
      const email = "john@example.com";
      const location = "New York";

      const tx = await userAesthetics
        .connect(user1)
        .setUserProfile(name, phone, email, location);
      await tx.wait();

      // Verify event was emitted without checking exact timestamp
      const filter = userAesthetics.filters.ProfileUpdated(user1.address);
      const events = await userAesthetics.queryFilter(filter);

      expect(events.length).to.be.at.least(1);
      const event = events[events.length - 1];
      expect(event.args[0]).to.equal(user1.address);
      expect(event.args[1]).to.equal(name);
      expect(event.args[2]).to.equal(phone);
      expect(event.args[3]).to.equal(email);
      expect(event.args[4]).to.equal(location);
    });

    it("Should emit ProfileDeleted event when deleting profile", async function () {
      await userAesthetics
        .connect(user1)
        .setUserProfile("Name", "Phone", "Email", "Location");

      const tx = await userAesthetics.connect(user1).deleteUserProfile();
      await tx.wait();

      // Verify event was emitted without checking exact timestamp
      const filter = userAesthetics.filters.ProfileDeleted(user1.address);
      const events = await userAesthetics.queryFilter(filter);

      expect(events.length).to.be.at.least(1);
      const event = events[events.length - 1];
      expect(event.args[0]).to.equal(user1.address);
    });
  });
});
