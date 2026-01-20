const hre = require("hardhat");

async function main() {
  console.log("🔧 Setting up local development environment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy contracts
  console.log("📝 Deploying contracts...");
  const Verifier = await hre.ethers.getContractFactory("InsiderSignalVerifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  
  const ReputationNFT = await hre.ethers.getContractFactory("ReputationNFT");
  const reputationNFT = await ReputationNFT.deploy(await verifier.getAddress());
  await reputationNFT.waitForDeployment();

  console.log("✅ Contracts deployed");
  console.log("  Verifier:", await verifier.getAddress());
  console.log("  ReputationNFT:", await reputationNFT.getAddress());
  console.log();

  // Create test bounties
  console.log("💰 Creating test bounties...");
  const bounties = [
    { symbol: "AAPL", reward: "1.0" },
    { symbol: "TSLA", reward: "2.0" },
    { symbol: "MSFT", reward: "1.5" }
  ];

  for (const bounty of bounties) {
    const reward = hre.ethers.parseEther(bounty.reward);
    await verifier.createBounty(bounty.symbol, reward, { value: reward });
    console.log(`  ✓ ${bounty.symbol}: ${bounty.reward} ETH`);
  }
  console.log();

  // Submit test signals
  console.log("📊 Submitting test signals...");
  for (let i = 0; i < 3; i++) {
    const filingHash = hre.ethers.id(`test_filing_${i}`);
    const mockProof = hre.ethers.randomBytes(256);
    
    await verifier.submitSignal(filingHash, 0, 40, mockProof);
    console.log(`  ✓ Signal ${i + 1} submitted`);
  }
  console.log();

  // Check stats
  const totalSignals = await verifier.getTotalSignals();
  const reputation = await verifier.getResearcherReputation(deployer.address);
  
  console.log("📈 System Stats:");
  console.log(`  Total Signals: ${totalSignals}`);
  console.log(`  Your Reputation: ${reputation.reputation}`);
  console.log(`  Signals Submitted: ${reputation.totalSignals}`);
  console.log();

  console.log("✨ Local environment ready!");
  console.log("\nNext steps:");
  console.log("  1. Start backend: cd backend && uvicorn api:app --reload");
  console.log("  2. Start frontend: cd frontend && npm run dev");
  console.log("  3. Open browser: http://localhost:3000");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
