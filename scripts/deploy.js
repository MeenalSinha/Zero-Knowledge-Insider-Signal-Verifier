const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ZK Insider Signal Verifier...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  console.log();

  // Deploy InsiderSignalVerifier
  console.log("📝 Deploying InsiderSignalVerifier...");
  const InsiderSignalVerifier = await hre.ethers.getContractFactory("InsiderSignalVerifier");
  const verifier = await InsiderSignalVerifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ InsiderSignalVerifier deployed to:", verifierAddress);
  console.log();

  // Deploy ReputationNFT
  console.log("📝 Deploying ReputationNFT...");
  const ReputationNFT = await hre.ethers.getContractFactory("ReputationNFT");
  const reputationNFT = await ReputationNFT.deploy(verifierAddress);
  await reputationNFT.waitForDeployment();
  const reputationNFTAddress = await reputationNFT.getAddress();
  console.log("✅ ReputationNFT deployed to:", reputationNFTAddress);
  console.log();

  // Create a test bounty
  console.log("💰 Creating test bounty...");
  const bountyAmount = hre.ethers.parseEther("1.0");
  const createBountyTx = await verifier.createBounty("AAPL", bountyAmount, {
    value: bountyAmount
  });
  await createBountyTx.wait();
  console.log("✅ Test bounty created for AAPL");
  console.log();

  // Summary
  console.log("📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Network:              ${hre.network.name}`);
  console.log(`Deployer:             ${deployer.address}`);
  console.log(`InsiderSignalVerifier: ${verifierAddress}`);
  console.log(`ReputationNFT:        ${reputationNFTAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log();

  // Save deployment addresses
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      InsiderSignalVerifier: verifierAddress,
      ReputationNFT: reputationNFTAddress,
    },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to deployment-info.json");

  // Verify contracts (if not on localhost)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log("🔍 Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: verifierAddress,
        constructorArguments: [],
      });
      console.log("✅ InsiderSignalVerifier verified");

      await hre.run("verify:verify", {
        address: reputationNFTAddress,
        constructorArguments: [verifierAddress],
      });
      console.log("✅ ReputationNFT verified");
    } catch (error) {
      console.log("⚠️  Verification error:", error.message);
    }
  }

  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
