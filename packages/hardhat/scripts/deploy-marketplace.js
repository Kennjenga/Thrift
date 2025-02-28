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
    const THRIFT_TOKEN_ADDRESS = "0xCD6152307d4b223C00D1beF239F401101e4FBE78";
    const USER_AESTHETICS_ADDRESS =
      "0x784d1f5Bc247aCbC4E42c260Cf710d0828B5F26A";
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

    // After deploying MarketplaceStorage:
    // await marketplaceStorage.transferOwnership(deployer.address);
    console.log("Ownership transferred to deployer");

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

//   fury@Furiosa:~/E/web3/Thrift/packages/hardhat$ npm run deploy:market

// > thrift@1.0.0 deploy:market
// > npx hardhat run ./ignition/modules/deploy-marketplace.js --network sepolia

// Starting Marketplace deployment process...
// Deploying contracts with the account: 0xC63Ee3b2ceF4857ba3EA8256F41d073C88696F99
// Deploying MarketplaceStorage...
// MarketplaceStorage deployed to: 0x4354BFf5271A6306B69dDf7CE63977039e08dAf8
// Deploying MarketplaceProduct...
// MarketplaceProduct deployed to: 0x0614cf6788B184344d881d161dFcB7F8e81d26Db
// Deploying MarketplaceEscrow...
// MarketplaceEscrow deployed to: 0x65b70496FF24d789087444B0330Aa84469509FB4
// Deploying MarketplaceQuery...
// MarketplaceQuery deployed to: 0x0e42ebb4AeD77C1BeF25600Fd6E9d5a59baD7289
// Deploying Marketplace...
// Marketplace deployed to: 0xc8A33DcfcFeDf6e881018049E4A533ab9B2d81f9
// Authorizing contracts...
// Authorized 0x0614cf6788B184344d881d161dFcB7F8e81d26Db
// Authorized 0x65b70496FF24d789087444B0330Aa84469509FB4
// Authorized 0x0e42ebb4AeD77C1BeF25600Fd6E9d5a59baD7289
// Authorized 0xc8A33DcfcFeDf6e881018049E4A533ab9B2d81f9

// Deployment Summary:
// --------------------
// MarketplaceStorage: 0x4354BFf5271A6306B69dDf7CE63977039e08dAf8
// MarketplaceProduct: 0x0614cf6788B184344d881d161dFcB7F8e81d26Db
// MarketplaceEscrow: 0x65b70496FF24d789087444B0330Aa84469509FB4
// MarketplaceQuery: 0x0e42ebb4AeD77C1BeF25600Fd6E9d5a59baD7289
// Marketplace: 0xc8A33DcfcFeDf6e881018049E4A533ab9B2d81f9
// Deployer Address: 0xC63Ee3b2ceF4857ba3EA8256F41d073C88696F99
// Network: sepolia
