// scripts/deploy-marketplace.js
const hre = require("hardhat");

async function deployContract(name, factory, ...args) {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`Deploying ${name}...`);
      const contract = await factory.deploy(...args);
      await contract.waitForDeployment();
      const address = await contract.getAddress();
      console.log(`${name} deployed to:`, address);
      return contract;
    } catch (error) {
      console.error(
        `Deployment of ${name} failed (attempt ${retries + 1}):`,
        error
      );
      retries++;

      if (retries >= maxRetries) {
        console.error(`Failed to deploy ${name} after ${maxRetries} attempts`);
        throw error;
      }

      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function main() {
  try {
    console.log("Starting Marketplace deployment process...");

    // Get signers
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Predefined addresses
    const THRIFT_TOKEN_ADDRESS = "0x5f260ceb6bD6937CD3CFf10FbdA4357C9B4C3D53";
    const USER_AESTHETICS_ADDRESS =
      "0x51e676cE5B1a404981321B8726A9DdC36D7Ee4c8";
    const TREASURY_WALLET_ADDRESS =
      "0xC63Ee3b2ceF4857ba3EA8256F41d073C88696F99";

    // Deploy MarketplaceStorage
    const MarketplaceStorageFactory = await hre.ethers.getContractFactory(
      "MarketplaceStorage"
    );
    const marketplaceStorage = await deployContract(
      "MarketplaceStorage",
      MarketplaceStorageFactory,
      THRIFT_TOKEN_ADDRESS,
      USER_AESTHETICS_ADDRESS,
      TREASURY_WALLET_ADDRESS
    );
    const storageAddress = await marketplaceStorage.getAddress();

    // Deploy MarketplaceProduct
    const MarketplaceProductFactory = await hre.ethers.getContractFactory(
      "MarketplaceProduct"
    );
    const marketplaceProduct = await deployContract(
      "MarketplaceProduct",
      MarketplaceProductFactory,
      storageAddress
    );
    const productAddress = await marketplaceProduct.getAddress();

    // Deploy MarketplaceEscrow
    const MarketplaceEscrowFactory = await hre.ethers.getContractFactory(
      "MarketplaceEscrow"
    );
    const marketplaceEscrow = await deployContract(
      "MarketplaceEscrow",
      MarketplaceEscrowFactory,
      storageAddress
    );
    const escrowAddress = await marketplaceEscrow.getAddress();

    // Deploy MarketplaceQuery
    const MarketplaceQueryFactory = await hre.ethers.getContractFactory(
      "MarketplaceQuery"
    );
    const marketplaceQuery = await deployContract(
      "MarketplaceQuery",
      MarketplaceQueryFactory,
      storageAddress
    );
    const queryAddress = await marketplaceQuery.getAddress();

    // Deploy Marketplace (main contract)
    const MarketplaceFactory = await hre.ethers.getContractFactory(
      "Marketplace"
    );
    const marketplace = await deployContract(
      "Marketplace",
      MarketplaceFactory,
      storageAddress,
      productAddress,
      escrowAddress,
      queryAddress
    );
    const marketplaceAddress = await marketplace.getAddress();

    // Authorize contracts in MarketplaceStorage
    console.log("Authorizing contracts...");
    const authorizeContracts = async (storage, contractAddress) => {
      try {
        const tx = await storage.setAuthorizedContract(contractAddress, true);
        await tx.wait();
        console.log(`Authorized ${contractAddress}`);
      } catch (error) {
        console.error(`Failed to authorize ${contractAddress}:`, error);
      }
    };

    await authorizeContracts(marketplaceStorage, productAddress);
    await authorizeContracts(marketplaceStorage, escrowAddress);
    await authorizeContracts(marketplaceStorage, queryAddress);
    await authorizeContracts(marketplaceStorage, marketplaceAddress);

    // Deployment Summary
    console.log("\nDeployment Summary:");
    console.log("--------------------");
    console.log("MarketplaceStorage:", storageAddress);
    console.log("MarketplaceProduct:", productAddress);
    console.log("MarketplaceEscrow:", escrowAddress);
    console.log("MarketplaceQuery:", queryAddress);
    console.log("Marketplace:", marketplaceAddress);
    console.log("Deployer Address:", deployer.address);
    console.log("Network:", hre.network.name);
  } catch (error) {
    console.error("\nFinal Deployment Error:");
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

// Deployment Summary:
// --------------------
// MarketplaceStorage: 0xD3063fc5b4880ABF3F7327454e97f45DfbcdE8F0
// MarketplaceProduct: 0x27074dF1dF0061FaDa3a10d226f8dff22AB0a246
// MarketplaceEscrow: 0x13EfffDB3b1999Df9d08b72d8f34eA5438C319f9
// MarketplaceQuery: 0x99105A334B2F2EDfc200E4cd5c56FB68f72AE7F3
// Marketplace: 0x296DFf9366C0bc9BC433D49A5193475D0B1485ca
// Deployer Address: 0xC63Ee3b2ceF4857ba3EA8256F41d073C88696F99
