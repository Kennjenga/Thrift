const hre = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment process...");
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Get the contract factory
    const donationFactory = await hre.ethers.getContractFactory("Marketplace");
    console.log("Contract factory created successfully");

    // Deploy the contract
    console.log("Deploying contract...");
    // const donationContract = await donationFactory.deploy();
    const donationContract = await donationFactory.deploy(
      "0xCD6152307d4b223C00D1beF239F401101e4FBE78",
      "0xea8c7b7E831BADe33C1E563CC178fe4cBEd5B925",
      deployer.address
    );
    console.log("Contract deployment initiated");

    // Wait for the deployment to be mined
    console.log("Waiting for deployment to be mined...");
    await donationContract.waitForDeployment();

    const deployedAddress = await donationContract.getAddress();
    console.log("donation Contract Deployed to:", deployedAddress);

    // Get the deployer's address - Fixed this line
    const [signer] = await hre.ethers.getSigners();
    const deployerAddress = await signer.address; // Changed from getAddress() to .address
    console.log("Deployer address:", deployerAddress);

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
