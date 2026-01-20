// Contract Addresses Configuration
// Update these after deployment

export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet
  sepolia: {
    verifier: process.env.NEXT_PUBLIC_VERIFIER_ADDRESS || "0x0000000000000000000000000000000000000000",
    reputationNFT: process.env.NEXT_PUBLIC_REPUTATION_NFT_ADDRESS || "0x0000000000000000000000000000000000000000",
    chainId: 11155111
  },
  
  // Optimism Sepolia
  optimismSepolia: {
    verifier: process.env.NEXT_PUBLIC_OP_VERIFIER_ADDRESS || "0x0000000000000000000000000000000000000000",
    reputationNFT: process.env.NEXT_PUBLIC_OP_REPUTATION_NFT_ADDRESS || "0x0000000000000000000000000000000000000000",
    chainId: 11155420
  },
  
  // Localhost
  localhost: {
    verifier: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    reputationNFT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    chainId: 31337
  }
};

// Backend API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Current network (change based on deployment)
export const CURRENT_NETWORK = process.env.NEXT_PUBLIC_NETWORK || "localhost";

// Get current contract addresses
export const getContractAddresses = () => {
  return CONTRACT_ADDRESSES[CURRENT_NETWORK];
};

// ABIs (simplified - import from artifacts in production)
export const VERIFIER_ABI = [
  "function submitSignal(bytes32 filingHash, uint8 signalType, uint256 threshold, bytes calldata proof) external returns (bytes32)",
  "function getSignal(bytes32 signalId) external view returns (tuple(bytes32 filingHash, uint8 signalType, address researcher, uint256 timestamp, bool verified, uint256 threshold, uint8 status))",
  "function getResearcherReputation(address researcher) external view returns (tuple(uint256 correctSignals, uint256 totalSignals, uint256 reputation, uint256 lastActivity, bool active))",
  "function getTotalSignals() external view returns (uint256)",
  "function getProofStatus(bytes32 signalId) external view returns (uint8)",
  "function getStatusString(bytes32 signalId) external view returns (string memory)"
];

export const REPUTATION_NFT_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function getReputationByAddress(address researcher) external view returns (tuple(uint256 reputationScore, uint256 signalsVerified, uint256 bountiesWon, uint256 mintedAt, string tier))"
];
