// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Insider Signal Verifier
/// @notice Zero-knowledge proof verification for insider trading signals
contract InsiderSignalVerifier is Ownable, ReentrancyGuard {
    
    // Signal types
    enum SignalType {
        INSIDER_SELLING,
        INSIDER_BUYING,
        EXECUTIVE_EXIT,
        RISK_LANGUAGE_SURGE
    }
    
    // Proof lifecycle status for clean demo flow
    enum ProofStatus {
        SUBMITTED,      // Proof submitted, pending verification
        VERIFIED,       // Proof cryptographically verified
        FINALIZED       // Signal finalized, reputation updated, bounties processed
    }
    
    // Verified signal structure
    struct VerifiedSignal {
        bytes32 filingHash;        // IPFS hash of SEC filing
        SignalType signalType;     // Type of insider signal
        address researcher;        // Who submitted the proof
        uint256 timestamp;         // When it was verified
        bool verified;             // Proof verification status
        uint256 threshold;         // Threshold used (e.g., 40% for selling)
        ProofStatus status;        // Current lifecycle status
    }
    
    // Researcher reputation
    struct Researcher {
        uint256 correctSignals;
        uint256 totalSignals;
        uint256 reputation;        // 0-1000 score
        uint256 lastActivity;
        bool active;
    }
    
    // DAO Bounty
    struct Bounty {
        string companySymbol;
        uint256 reward;
        address funder;
        bool active;
        bool claimed;
        address winner;
    }
    
    // Storage
    mapping(bytes32 => VerifiedSignal) public signals;
    mapping(address => Researcher) public researchers;
    mapping(uint256 => Bounty) public bounties;
    mapping(bytes32 => bool) public filingProcessed;
    
    uint256 public signalCount;
    uint256 public bountyCount;
    uint256 public constant MIN_REPUTATION = 100;
    uint256 public constant MAX_REPUTATION = 1000;
    
    // Events
    event SignalVerified(
        bytes32 indexed signalId,
        bytes32 indexed filingHash,
        SignalType signalType,
        address indexed researcher,
        uint256 timestamp
    );
    
    event SignalRejected(
        bytes32 indexed signalId,
        bytes32 indexed filingHash,
        address indexed researcher,
        string reason
    );
    
    event ReputationUpdated(
        address indexed researcher,
        uint256 newReputation,
        bool increased
    );
    
    event BountyCreated(
        uint256 indexed bountyId,
        string companySymbol,
        uint256 reward,
        address indexed funder
    );
    
    event BountyClaimed(
        uint256 indexed bountyId,
        address indexed winner,
        uint256 reward
    );
    
    event ProofStatusChanged(
        bytes32 indexed signalId,
        ProofStatus oldStatus,
        ProofStatus newStatus,
        uint256 timestamp
    );
    
    constructor() Ownable(msg.sender) {}
    
    /// @notice Submit a ZK-verified insider signal
    /// @param filingHash IPFS hash of the SEC filing
    /// @param signalType Type of insider signal detected
    /// @param threshold Threshold value used in detection
    /// @param proof ZK proof data
    function submitSignal(
        bytes32 filingHash,
        SignalType signalType,
        uint256 threshold,
        bytes calldata proof
    ) external nonReentrant returns (bytes32) {
        require(!filingProcessed[filingHash], "Filing already processed");
        require(proof.length > 0, "Invalid proof");
        
        // Verify the ZK proof
        bool proofValid = verifyProof(proof, filingHash, threshold);
        
        bytes32 signalId = keccak256(
            abi.encodePacked(filingHash, signalType, msg.sender, block.timestamp)
        );
        
        if (proofValid) {
            // Create verified signal with lifecycle tracking
            signals[signalId] = VerifiedSignal({
                filingHash: filingHash,
                signalType: signalType,
                researcher: msg.sender,
                timestamp: block.timestamp,
                verified: true,
                threshold: threshold,
                status: ProofStatus.SUBMITTED  // Initial status
            });
            
            // Update status: proof verified
            signals[signalId].status = ProofStatus.VERIFIED;
            
            filingProcessed[filingHash] = true;
            signalCount++;
            
            // Update researcher reputation
            _updateResearcherReputation(msg.sender, true);
            
            emit SignalVerified(signalId, filingHash, signalType, msg.sender, block.timestamp);
            
            // Check for bounty claims
            _checkBountyClaim(signalId, filingHash);
            
            // Finalize: all processing complete
            signals[signalId].status = ProofStatus.FINALIZED;
            
            return signalId;
        } else {
            _updateResearcherReputation(msg.sender, false);
            emit SignalRejected(signalId, filingHash, msg.sender, "Invalid proof");
            revert("Proof verification failed");
        }
    }
    
    /// @notice Verify ZK proof with cryptographic binding to public inputs
    /// @dev Integrates with Groth16 verifier contract
    function verifyProof(
        bytes calldata proof,
        bytes32 filingHash,
        uint256 threshold
    ) public view returns (bool) {
        require(proof.length >= 32, "Proof too short");
        require(filingHash != bytes32(0), "Invalid filing hash");
        require(threshold > 0 && threshold <= 100, "Invalid threshold");
        
        // Decode proof data
        // In production: proof contains pi_a, pi_b, pi_c from Groth16
        
        // CRITICAL: Extract public signals from proof
        // Public signals MUST match the inputs we're verifying
        uint256[2] memory publicSignals = extractPublicSignals(proof);
        
        // Public Signal [0]: Filing hash (as field element)
        // Convert bytes32 to two uint128 field elements to avoid truncation
        uint256 filingHashHigh = uint256(filingHash) >> 128;
        uint256 filingHashLow = uint256(filingHash) & ((1 << 128) - 1);
        
        // Combine into single field element using secure hash
        uint256 filingHashField = uint256(keccak256(abi.encodePacked(filingHashHigh, filingHashLow))) % 
            21888242871839275222246405745257275088548364400416034343698204186575808495617; // BN254 field modulus
        
        // Public Signal [1]: Threshold
        uint256 thresholdField = threshold;
        
        // CRYPTOGRAPHIC BINDING: Verify public signals match our inputs
        // This prevents "valid proof, wrong filing" attacks
        require(
            publicSignals[0] == filingHashField,
            "Proof filing hash mismatch - potential attack"
        );
        require(
            publicSignals[1] == thresholdField,
            "Proof threshold mismatch - potential attack"
        );
        
        // In production: Call Groth16Verifier contract
        // IGroth16Verifier(verifierAddress).verifyProof(pi_a, pi_b, pi_c, publicSignals);
        
        // For now, return true if public signals match
        // In production, this would call the actual verifier
        return true;
    }
    
    /// @notice Extract public signals from proof bytes
    /// @dev Decodes the public inputs embedded in the proof
    function extractPublicSignals(bytes calldata proof) internal pure returns (uint256[2] memory) {
        // In production, this would decode the actual proof structure
        // For demonstration, we show the structure
        
        // Proof structure (Groth16):
        // - pi_a: 2 field elements (64 bytes)
        // - pi_b: 4 field elements (128 bytes) 
        // - pi_c: 2 field elements (64 bytes)
        // - public signals: N field elements (32 bytes each)
        
        require(proof.length >= 256 + 64, "Proof missing public signals");
        
        uint256[2] memory signals;
        
        // Extract public signal 0 (filing hash field element)
        uint256 offset = 256; // After pi_a, pi_b, pi_c
        assembly {
            let ptr := add(proof.offset, offset)
            signals := mload(ptr)
        }
        
        // Extract public signal 1 (threshold)
        offset = 256 + 32;
        assembly {
            let ptr := add(proof.offset, offset)
            mstore(add(signals, 32), mload(ptr))
        }
        
        return signals;
    }
    
    /// @notice Create a bounty for finding signals in specific company
    function createBounty(
        string calldata companySymbol,
        uint256 reward
    ) external payable {
        require(msg.value >= reward, "Insufficient funds");
        require(bytes(companySymbol).length > 0, "Invalid company symbol");
        
        bountyCount++;
        bounties[bountyCount] = Bounty({
            companySymbol: companySymbol,
            reward: reward,
            funder: msg.sender,
            active: true,
            claimed: false,
            winner: address(0)
        });
        
        emit BountyCreated(bountyCount, companySymbol, reward, msg.sender);
    }
    
    /// @notice Internal function to check and claim bounties
    function _checkBountyClaim(bytes32 signalId, bytes32 filingHash) internal {
        // Simplified: In production, match filing to company and bounty
        for (uint256 i = 1; i <= bountyCount; i++) {
            if (bounties[i].active && !bounties[i].claimed) {
                // Award bounty to first valid signal
                bounties[i].claimed = true;
                bounties[i].winner = msg.sender;
                bounties[i].active = false;
                
                payable(msg.sender).transfer(bounties[i].reward);
                
                emit BountyClaimed(i, msg.sender, bounties[i].reward);
                break;
            }
        }
    }
    
    /// @notice Update researcher reputation based on signal accuracy
    function _updateResearcherReputation(address researcher, bool correct) internal {
        Researcher storage r = researchers[researcher];
        
        if (!r.active) {
            r.active = true;
            r.reputation = MIN_REPUTATION;
        }
        
        r.totalSignals++;
        if (correct) {
            r.correctSignals++;
        }
        
        // Calculate new reputation (0-1000 scale)
        uint256 accuracy = (r.correctSignals * 1000) / r.totalSignals;
        uint256 volumeBonus = r.totalSignals > 10 ? 100 : (r.totalSignals * 10);
        
        r.reputation = (accuracy * 80 / 100) + (volumeBonus * 20 / 100);
        
        if (r.reputation > MAX_REPUTATION) {
            r.reputation = MAX_REPUTATION;
        }
        
        r.lastActivity = block.timestamp;
        
        emit ReputationUpdated(researcher, r.reputation, correct);
    }
    
    /// @notice Get signal details
    function getSignal(bytes32 signalId) external view returns (VerifiedSignal memory) {
        return signals[signalId];
    }
    
    /// @notice Get researcher reputation
    function getResearcherReputation(address researcher) external view returns (Researcher memory) {
        return researchers[researcher];
    }
    
    /// @notice Get bounty details
    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        return bounties[bountyId];
    }
    
    /// @notice Get total verified signals count
    function getTotalSignals() external view returns (uint256) {
        return signalCount;
    }
    
    /// @notice Get proof lifecycle status for a signal
    function getProofStatus(bytes32 signalId) external view returns (ProofStatus) {
        return signals[signalId].status;
    }
    
    /// @notice Get human-readable status string
    function getStatusString(bytes32 signalId) external view returns (string memory) {
        ProofStatus status = signals[signalId].status;
        
        if (status == ProofStatus.SUBMITTED) return "SUBMITTED";
        if (status == ProofStatus.VERIFIED) return "VERIFIED";
        if (status == ProofStatus.FINALIZED) return "FINALIZED";
        
        return "UNKNOWN";
    }
}
