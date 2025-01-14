const hre = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment process...");

    // Get the contract factory
    const ThriftTokenFactory = await hre.ethers.getContractFactory(
      "ThriftToken"
    );
    console.log("Contract factory created successfully");

    // Deploy the contract
    console.log("Deploying contract...");
    const ThriftTokenContract = await ThriftTokenFactory.deploy();
    console.log("Contract deployment initiated");

    // Wait for the deployment to be mined
    console.log("Waiting for deployment to be mined...");
    await ThriftTokenContract.waitForDeployment();

    const deployedAddress = await ThriftTokenContract.getAddress();
    console.log("ThriftToken Contract Deployed to:", deployedAddress);

    // Get the deployer's address - Fixed this line
    const [signer] = await hre.ethers.getSigners();
    const deployerAddress = await signer.address; // Changed from getAddress() to .address
    console.log("Deployer address:", deployerAddress);

    // Grant the CAMPAIGN_CREATOR_ROLE
    console.log("Granting CAMPAIGN_CREATOR_ROLE...");
    await ThriftTokenContract.grantCampaignCreatorRole(deployerAddress);
    console.log("Granted CAMPAIGN_CREATOR_ROLE to:", deployerAddress);

    // Verify the deployment
    console.log("\nDeployment Summary:");
    console.log("--------------------");
    console.log("Contract Address:", deployedAddress);
    console.log("Deployer Address:", deployerAddress);
    console.log("Network:", hre.network.name);
  } catch (error) {
    console.error("\nDeployment Error:");
    console.error("------------------");
    console.error(error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
