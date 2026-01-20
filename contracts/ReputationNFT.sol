// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Reputation NFT
/// @notice NFTs representing researcher reputation and achievements
contract ReputationNFT is ERC721, Ownable {
    
    struct ReputationData {
        uint256 reputationScore;
        uint256 signalsVerified;
        uint256 bountiesWon;
        uint256 mintedAt;
        string tier; // "Bronze", "Silver", "Gold", "Platinum"
    }
    
    mapping(uint256 => ReputationData) public reputations;
    mapping(address => uint256) public researcherToToken;
    
    uint256 private _nextTokenId;
    address public verifierContract;
    
    event ReputationNFTMinted(address indexed researcher, uint256 indexed tokenId, string tier);
    event ReputationUpdated(uint256 indexed tokenId, uint256 newScore);
    
    constructor(address _verifierContract) ERC721("InsiderSignal Researcher", "ISR") Ownable(msg.sender) {
        verifierContract = _verifierContract;
    }
    
    /// @notice Mint a reputation NFT for a researcher
    function mintReputation(
        address researcher,
        uint256 reputationScore,
        uint256 signalsVerified
    ) external returns (uint256) {
        require(msg.sender == verifierContract, "Only verifier can mint");
        require(researcherToToken[researcher] == 0, "NFT already minted");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(researcher, tokenId);
        
        string memory tier = _calculateTier(reputationScore);
        
        reputations[tokenId] = ReputationData({
            reputationScore: reputationScore,
            signalsVerified: signalsVerified,
            bountiesWon: 0,
            mintedAt: block.timestamp,
            tier: tier
        });
        
        researcherToToken[researcher] = tokenId;
        
        emit ReputationNFTMinted(researcher, tokenId, tier);
        return tokenId;
    }
    
    /// @notice Update reputation data
    function updateReputation(
        address researcher,
        uint256 newScore,
        uint256 newSignals
    ) external {
        require(msg.sender == verifierContract, "Only verifier can update");
        
        uint256 tokenId = researcherToToken[researcher];
        require(tokenId > 0, "No NFT found");
        
        ReputationData storage data = reputations[tokenId];
        data.reputationScore = newScore;
        data.signalsVerified = newSignals;
        data.tier = _calculateTier(newScore);
        
        emit ReputationUpdated(tokenId, newScore);
    }
    
    /// @notice Calculate reputation tier
    function _calculateTier(uint256 score) internal pure returns (string memory) {
        if (score >= 900) return "Platinum";
        if (score >= 750) return "Gold";
        if (score >= 500) return "Silver";
        return "Bronze";
    }
    
    /// @notice Override transfer to make NFTs soulbound (optional)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Reputation NFTs are soulbound");
        }
        return super._update(to, tokenId, auth);
    }
    
    /// @notice Get reputation data for a researcher
    function getReputationByAddress(address researcher) external view returns (ReputationData memory) {
        uint256 tokenId = researcherToToken[researcher];
        require(tokenId > 0, "No reputation found");
        return reputations[tokenId];
    }
}
