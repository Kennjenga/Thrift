const hre = require("hardhat");

// Deployment Script
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy ThriftToken
  const ThriftTokenFactory = await ethers.getContractFactory("ThriftToken");
  const thriftToken = await ThriftTokenFactory.deploy(
    deployer.address,
    deployer.address
  );
  await thriftToken.waitForDeployment();
  console.log("ThriftToken deployed to:", await thriftToken.getAddress());

  // Deploy Marketplace
  const MarketplaceFactory = await ethers.getContractFactory("Marketplace");
  const marketplace = await MarketplaceFactory.deploy(
    await thriftToken.getAddress(),
    deployer.address
  );
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());

  // Deploy DonationAndRecycling
  const DonationFactory = await ethers.getContractFactory(
    "DonationAndRecycling"
  );
  const donationAndRecycling = await DonationFactory.deploy(
    await thriftToken.getAddress()
  );
  await donationAndRecycling.waitForDeployment();
  console.log(
    "DonationAndRecycling deployed to:",
    await donationAndRecycling.getAddress()
  );

  // Authorize contracts for rewards
  await thriftToken.setRewardContract(await marketplace.getAddress(), true);
  await thriftToken.setRewardContract(
    await donationAndRecycling.getAddress(),
    true
  );

  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { main };
