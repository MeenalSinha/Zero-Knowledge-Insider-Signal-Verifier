const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integration Tests", function () {
  let verifier, reputationNFT;
  let owner, researcher1, researcher2, bountyFunder;
  
  beforeEach(async function () {
    [owner, researcher1, researcher2, bountyFunder] = await ethers.getSigners();
    
    // Deploy full system
    const Verifier = await ethers.getContractFactory("InsiderSignalVerifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
    
    const ReputationNFT = await ethers.getContractFactory("ReputationNFT");
    reputationNFT = await ReputationNFT.deploy(await verifier.getAddress());
    await reputationNFT.waitForDeployment();
  });
  
  describe("End-to-End Signal Verification Flow", function () {
    it("Should complete full workflow from signal to NFT", async function () {
      // 1. Create bounty
      const reward = ethers.parseEther("2.0");
      await verifier.connect(bountyFunder).createBounty("TSLA", reward, { value: reward });
      
      // 2. Researcher submits signals
      for (let i = 0; i < 10; i++) {
        const filingHash = ethers.id(`filing_${i}`);
        const mockProof = ethers.randomBytes(256);
        
        await verifier.connect(researcher1).submitSignal(
          filingHash,
          0,  // INSIDER_SELLING
          40,
          mockProof
        );
      }
      
      // 3. Check reputation
      const reputation = await verifier.getResearcherReputation(researcher1.address);
      expect(reputation.totalSignals).to.equal(10);
      expect(reputation.correctSignals).to.equal(10);
      expect(reputation.reputation).to.be.gt(700);
      
      // 4. Mint NFT
      const nftTx = await reputationNFT.mintReputation(
        researcher1.address,
        reputation.reputation,
        reputation.totalSignals
      );
      await nftTx.wait();
      
      // 5. Verify NFT data
      const nftData = await reputationNFT.getReputationByAddress(researcher1.address);
      expect(nftData.signalsVerified).to.equal(10);
      expect(nftData.tier).to.be.oneOf(["Gold", "Platinum"]);
    });
  });
  
  describe("Multi-Researcher Competition", function () {
    it("Should track multiple researchers independently", async function () {
      // Researcher 1: Submit 5 signals
      for (let i = 0; i < 5; i++) {
        const filingHash = ethers.id(`researcher1_filing_${i}`);
        await verifier.connect(researcher1).submitSignal(
          filingHash,
          0,
          40,
          ethers.randomBytes(256)
        );
      }
      
      // Researcher 2: Submit 3 signals
      for (let i = 0; i < 3; i++) {
        const filingHash = ethers.id(`researcher2_filing_${i}`);
        await verifier.connect(researcher2).submitSignal(
          filingHash,
          0,
          40,
          ethers.randomBytes(256)
        );
      }
      
      const rep1 = await verifier.getResearcherReputation(researcher1.address);
      const rep2 = await verifier.getResearcherReputation(researcher2.address);
      
      expect(rep1.totalSignals).to.equal(5);
      expect(rep2.totalSignals).to.equal(3);
    });
  });
  
  describe("Bounty Claiming Flow", function () {
    it("Should award bounty to first valid signal", async function () {
      const reward = ethers.parseEther("1.5");
      
      // Create bounty
      await verifier.connect(bountyFunder).createBounty("NVDA", reward, { value: reward });
      
      const initialBalance = await ethers.provider.getBalance(researcher1.address);
      
      // Submit signal
      const filingHash = ethers.id("nvda_filing");
      await verifier.connect(researcher1).submitSignal(
        filingHash,
        0,
        40,
        ethers.randomBytes(256)
      );
      
      const finalBalance = await ethers.provider.getBalance(researcher1.address);
      
      // Researcher should have received bounty (minus gas)
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
  
  describe("Reputation Accumulation", function () {
    it("Should increase reputation with more correct signals", async function () {
      // Submit 1 signal
      await verifier.connect(researcher1).submitSignal(
        ethers.id("filing_1"),
        0,
        40,
        ethers.randomBytes(256)
      );
      
      const rep1 = await verifier.getResearcherReputation(researcher1.address);
      
      // Submit 4 more signals
      for (let i = 2; i <= 5; i++) {
        await verifier.connect(researcher1).submitSignal(
          ethers.id(`filing_${i}`),
          0,
          40,
          ethers.randomBytes(256)
        );
      }
      
      const rep5 = await verifier.getResearcherReputation(researcher1.address);
      
      // Reputation should increase
      expect(rep5.reputation).to.be.gt(rep1.reputation);
    });
  });
  
  describe("System Statistics", function () {
    it("Should accurately track total signals", async function () {
      const initialTotal = await verifier.getTotalSignals();
      
      // Multiple researchers submit signals
      await verifier.connect(researcher1).submitSignal(
        ethers.id("filing_1"),
        0,
        40,
        ethers.randomBytes(256)
      );
      
      await verifier.connect(researcher2).submitSignal(
        ethers.id("filing_2"),
        0,
        40,
        ethers.randomBytes(256)
      );
      
      const finalTotal = await verifier.getTotalSignals();
      
      expect(finalTotal).to.equal(initialTotal + BigInt(2));
    });
  });
  
  describe("Proof Status Lifecycle", function () {
    it("Should transition through all lifecycle states", async function () {
      const tx = await verifier.connect(researcher1).submitSignal(
        ethers.id("lifecycle_filing"),
        0,
        40,
        ethers.randomBytes(256)
      );
      
      const receipt = await tx.wait();
      
      // Find SignalVerified event
      const event = receipt.logs.find(log => {
        try {
          return verifier.interface.parseLog(log).name === "SignalVerified";
        } catch {
          return false;
        }
      });
      
      const signalId = verifier.interface.parseLog(event).args.signalId;
      
      // Final status should be FINALIZED
      const status = await verifier.getProofStatus(signalId);
      expect(status).to.equal(2); // FINALIZED
    });
  });
});
