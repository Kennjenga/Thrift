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

// Deploying contracts with the account: 0xC63Ee3b2ceF4857ba3EA8256F41d073C88696F99
// ThriftToken deployed to: 0xCD6152307d4b223C00D1beF239F401101e4FBE78
// Marketplace deployed to: 0x3616330653bF9A38EFB5a2DD17E6d9B74739969d
// DonationAndRecycling deployed to:  0x9BfBD2C5af21f9821Bea7018FCA7F1547f8Fa6Ec
// Aesthetics: 0x93864C5a18c10cEca82BC18a12d147Dec0666E2D
// Deployment complete!
