const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InsiderSignalVerifier", function () {
  let verifier, reputationNFT;
  let owner, researcher1, researcher2;
  
  beforeEach(async function () {
    [owner, researcher1, researcher2] = await ethers.getSigners();
    
    // Deploy contracts
    const Verifier = await ethers.getContractFactory("InsiderSignalVerifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
    
    const ReputationNFT = await ethers.getContractFactory("ReputationNFT");
    reputationNFT = await ReputationNFT.deploy(await verifier.getAddress());
    await reputationNFT.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should deploy with correct owner", async function () {
      expect(await verifier.owner()).to.equal(owner.address);
    });
    
    it("Should start with zero signals", async function () {
      expect(await verifier.getTotalSignals()).to.equal(0);
    });
  });
  
  describe("Signal Submission", function () {
    it("Should submit valid signal", async function () {
      const filingHash = ethers.id("test_filing");
      const signalType = 0; // INSIDER_SELLING
      const threshold = 40;
      const mockProof = ethers.randomBytes(256);
      
      await expect(
        verifier.connect(researcher1).submitSignal(
          filingHash,
          signalType,
          threshold,
          mockProof
        )
      ).to.emit(verifier, "SignalVerified");
      
      expect(await verifier.getTotalSignals()).to.equal(1);
    });
    
    it("Should reject duplicate filing", async function () {
      const filingHash = ethers.id("test_filing");
      const signalType = 0;
      const threshold = 40;
      const mockProof = ethers.randomBytes(256);
      
      // First submission
      await verifier.connect(researcher1).submitSignal(
        filingHash,
        signalType,
        threshold,
        mockProof
      );
      
      // Second submission should fail
      await expect(
        verifier.connect(researcher1).submitSignal(
          filingHash,
          signalType,
          threshold,
          mockProof
        )
      ).to.be.revertedWith("Filing already processed");
    });
    
    it("Should update researcher reputation", async function () {
      const filingHash = ethers.id("test_filing");
      const signalType = 0;
      const threshold = 40;
      const mockProof = ethers.randomBytes(256);
      
      await verifier.connect(researcher1).submitSignal(
        filingHash,
        signalType,
        threshold,
        mockProof
      );
      
      const reputation = await verifier.getResearcherReputation(researcher1.address);
      expect(reputation.correctSignals).to.equal(1);
      expect(reputation.totalSignals).to.equal(1);
      expect(reputation.reputation).to.be.gt(0);
    });
  });
  
  describe("Bounties", function () {
    it("Should create bounty", async function () {
      const reward = ethers.parseEther("1.0");
      
      await expect(
        verifier.createBounty("AAPL", reward, { value: reward })
      ).to.emit(verifier, "BountyCreated");
      
      const bounty = await verifier.getBounty(1);
      expect(bounty.companySymbol).to.equal("AAPL");
      expect(bounty.reward).to.equal(reward);
      expect(bounty.active).to.be.true;
    });
    
    it("Should require sufficient funds for bounty", async function () {
      const reward = ethers.parseEther("1.0");
      const insufficientValue = ethers.parseEther("0.5");
      
      await expect(
        verifier.createBounty("AAPL", reward, { value: insufficientValue })
      ).to.be.revertedWith("Insufficient funds");
    });
  });
  
  describe("Proof Lifecycle", function () {
    it("Should track proof status correctly", async function () {
      const filingHash = ethers.id("test_filing");
      const signalType = 0;
      const threshold = 40;
      const mockProof = ethers.randomBytes(256);
      
      const tx = await verifier.connect(researcher1).submitSignal(
        filingHash,
        signalType,
        threshold,
        mockProof
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return verifier.interface.parseLog(log).name === "SignalVerified";
        } catch {
          return false;
        }
      });
      
      const signalId = verifier.interface.parseLog(event).args.signalId;
      
      // Status should be FINALIZED (2)
      const status = await verifier.getProofStatus(signalId);
      expect(status).to.equal(2);
      
      const statusString = await verifier.getStatusString(signalId);
      expect(statusString).to.equal("FINALIZED");
    });
  });
  
  describe("Reputation Calculation", function () {
    it("Should calculate reputation based on accuracy", async function () {
      // Submit multiple signals
      for (let i = 0; i < 5; i++) {
        const filingHash = ethers.id(`filing_${i}`);
        const mockProof = ethers.randomBytes(256);
        
        await verifier.connect(researcher1).submitSignal(
          filingHash,
          0,
          40,
          mockProof
        );
      }
      
      const reputation = await verifier.getResearcherReputation(researcher1.address);
      expect(reputation.totalSignals).to.equal(5);
      expect(reputation.correctSignals).to.equal(5); // All valid
      expect(reputation.reputation).to.be.gt(500); // Should be high
    });
  });
  
  describe("Edge Cases", function () {
    it("Should handle empty proof gracefully", async function () {
      const filingHash = ethers.id("test_filing");
      const emptyProof = "0x";
      
      await expect(
        verifier.submitSignal(filingHash, 0, 40, emptyProof)
      ).to.be.revertedWith("Proof too short");
    });
    
    it("Should handle invalid threshold", async function () {
      const filingHash = ethers.id("test_filing");
      const mockProof = ethers.randomBytes(256);
      
      await expect(
        verifier.submitSignal(filingHash, 0, 0, mockProof)
      ).to.be.revertedWith("Invalid threshold");
      
      await expect(
        verifier.submitSignal(filingHash, 0, 101, mockProof)
      ).to.be.revertedWith("Invalid threshold");
    });
  });
});
