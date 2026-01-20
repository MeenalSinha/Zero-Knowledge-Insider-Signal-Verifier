const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Verifying contracts on block explorer...\n");

  // Load deployment info
  const deploymentInfo = JSON.parse(
    fs.readFileSync("./deployment-info.json", "utf8")
  );

  const { contracts } = deploymentInfo;

  // Verify InsiderSignalVerifier
  console.log("Verifying InsiderSignalVerifier...");
  try {
    await hre.run("verify:verify", {
      address: contracts.InsiderSignalVerifier,
      constructorArguments: [],
    });
    console.log("✅ InsiderSignalVerifier verified");
  } catch (error) {
    console.log("⚠️  Error:", error.message);
  }

  // Verify ReputationNFT
  console.log("\nVerifying ReputationNFT...");
  try {
    await hre.run("verify:verify", {
      address: contracts.ReputationNFT,
      constructorArguments: [contracts.InsiderSignalVerifier],
    });
    console.log("✅ ReputationNFT verified");
  } catch (error) {
    console.log("⚠️  Error:", error.message);
  }

  console.log("\n✨ Verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
