const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationNFT", function () {
  let verifier, reputationNFT;
  let owner, researcher1, researcher2;
  
  beforeEach(async function () {
    [owner, researcher1, researcher2] = await ethers.getSigners();
    
    const Verifier = await ethers.getContractFactory("InsiderSignalVerifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
    
    const ReputationNFT = await ethers.getContractFactory("ReputationNFT");
    reputationNFT = await ReputationNFT.deploy(await verifier.getAddress());
    await reputationNFT.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set correct verifier contract", async function () {
      expect(await reputationNFT.verifierContract()).to.equal(await verifier.getAddress());
    });
    
    it("Should have correct name and symbol", async function () {
      expect(await reputationNFT.name()).to.equal("InsiderSignal Researcher");
      expect(await reputationNFT.symbol()).to.equal("ISR");
    });
  });
  
  describe("Minting", function () {
    it("Should mint reputation NFT", async function () {
      await expect(
        reputationNFT.connect(owner).mintReputation(researcher1.address, 750, 10)
      ).to.emit(reputationNFT, "ReputationNFTMinted");
      
      expect(await reputationNFT.balanceOf(researcher1.address)).to.equal(1);
    });
    
    it("Should only allow verifier to mint", async function () {
      await expect(
        reputationNFT.connect(researcher1).mintReputation(researcher1.address, 750, 10)
      ).to.be.revertedWith("Only verifier can mint");
    });
    
    it("Should prevent duplicate minting", async function () {
      // First mint
      await reputationNFT.connect(owner).mintReputation(researcher1.address, 750, 10);
      
      // Second mint should fail
      await expect(
        reputationNFT.connect(owner).mintReputation(researcher1.address, 800, 15)
      ).to.be.revertedWith("NFT already minted");
    });
    
    it("Should calculate correct tier", async function () {
      // Bronze
      await reputationNFT.connect(owner).mintReputation(researcher1.address, 400, 5);
      let rep = await reputationNFT.getReputationByAddress(researcher1.address);
      expect(rep.tier).to.equal("Bronze");
      
      // Silver
      await reputationNFT.connect(owner).mintReputation(researcher2.address, 600, 10);
      rep = await reputationNFT.getReputationByAddress(researcher2.address);
      expect(rep.tier).to.equal("Silver");
    });
  });
  
  describe("Soulbound Property", function () {
    it("Should prevent transfers", async function () {
      await reputationNFT.connect(owner).mintReputation(researcher1.address, 750, 10);
      
      const tokenId = await reputationNFT.researcherToToken(researcher1.address);
      
      await expect(
        reputationNFT.connect(researcher1).transferFrom(
          researcher1.address,
          researcher2.address,
          tokenId
        )
      ).to.be.revertedWith("Reputation NFTs are soulbound");
    });
  });
  
  describe("Reputation Update", function () {
    it("Should update reputation data", async function () {
      await reputationNFT.connect(owner).mintReputation(researcher1.address, 500, 10);
      
      await expect(
        reputationNFT.connect(owner).updateReputation(researcher1.address, 750, 15)
      ).to.emit(reputationNFT, "ReputationUpdated");
      
      const rep = await reputationNFT.getReputationByAddress(researcher1.address);
      expect(rep.reputationScore).to.equal(750);
      expect(rep.signalsVerified).to.equal(15);
      expect(rep.tier).to.equal("Gold");
    });
    
    it("Should only allow verifier to update", async function () {
      await reputationNFT.connect(owner).mintReputation(researcher1.address, 500, 10);
      
      await expect(
        reputationNFT.connect(researcher1).updateReputation(researcher1.address, 750, 15)
      ).to.be.revertedWith("Only verifier can update");
    });
  });
  
  describe("Tier Calculation", function () {
    it("Should calculate Bronze tier", async function () {
      await reputationNFT.connect(owner).mintReputation(researcher1.address, 400, 5);
      const rep = await reputationNFT.getReputationByAddress(researcher1.address);
      expect(rep.tier).to.equal("Bronze");
    });
    
    it("Should calculate Silver tier", async function () {
      await reputationNFT.connect(owner).mintReputation(researcher1.address, 600, 10);
      const rep = await reputationNFT.getReputationByAddress(researcher1.address);
      expect(rep.tier).to.equal("Silver");
    });
    
    it("Should calculate Gold tier", async function () {
      await reputationNFT.connect(owner).mintReputation(researcher1.address, 800, 15);
      const rep = await reputationNFT.getReputationByAddress(researcher1.address);
      expect(rep.tier).to.equal("Gold");
    });
    
    it("Should calculate Platinum tier", async function () {
      await reputationNFT.connect(owner).mintReputation(researcher1.address, 950, 20);
      const rep = await reputationNFT.getReputationByAddress(researcher1.address);
      expect(rep.tier).to.equal("Platinum");
    });
  });
});
