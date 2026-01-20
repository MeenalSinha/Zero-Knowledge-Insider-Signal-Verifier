# 🏗️ System Architecture

## Overview

The Zero-Knowledge Insider Signal Verifier is a multi-tier decentralized application that combines AI analysis, zero-knowledge cryptography, and blockchain technology to create verifiable insider trading signals.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                  (Next.js + React Dashboard)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Signals  │  │ Bounties │  │Reputation│  │ Analytics│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│                     (FastAPI Backend)                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  SEC Filing Analyzer                                    │    │
│  │  • Download from EDGAR                                  │    │
│  │  • Parse Form 4, 10-K, 10-Q                            │    │
│  │  • Extract transaction data                            │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Signal Detection Engine                                │    │
│  │  • Rule-based analysis                                  │    │
│  │  • AI/NLP analysis (optional)                          │    │
│  │  • Threshold calculations                              │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ZK Proof Orchestrator                                  │    │
│  │  • Prepare circuit inputs                               │    │
│  │  • Generate witness                                     │    │
│  │  • Create Groth16 proof                                │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRYPTOGRAPHIC LAYER                          │
│                   (Circom + SnarkJS)                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ZK Circuit: insider_selling.circom                     │    │
│  │                                                          │    │
│  │  PUBLIC INPUTS:                                         │    │
│  │  • filingHash: bytes32                                  │    │
│  │  • threshold: uint (e.g., 40)                          │    │
│  │                                                          │    │
│  │  PRIVATE INPUTS:                                        │    │
│  │  • totalShares: uint                                    │    │
│  │  • sharesSold: uint                                     │    │
│  │  • salt: uint (randomness)                             │    │
│  │                                                          │    │
│  │  CONSTRAINTS:                                           │    │
│  │  • percentSold = (sharesSold * 100) / totalShares      │    │
│  │  • percentSold >= threshold                            │    │
│  │  • sharesSold <= totalShares                           │    │
│  │  • totalShares > 0                                     │    │
│  │                                                          │    │
│  │  OUTPUT:                                                │    │
│  │  • validSignal: bool (1 = threshold exceeded)          │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Proof System: Groth16                                  │    │
│  │  • Proving key: ~2MB                                    │    │
│  │  • Verification key: ~1KB                               │    │
│  │  • Proof size: ~256 bytes                              │    │
│  │  • Verification: O(1) on-chain                         │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                           │
│                    (Ethereum / L2)                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  InsiderSignalVerifier.sol                              │    │
│  │  • submitSignal(hash, type, threshold, proof)          │    │
│  │  • verifyProof(proof, public signals)                  │    │
│  │  • Store verified signals                              │    │
│  │  • Update researcher reputation                        │    │
│  │  • Process bounty claims                               │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ReputationNFT.sol                                      │    │
│  │  • Mint soulbound NFTs                                 │    │
│  │  • Store reputation metadata                           │    │
│  │  • Calculate tiers (Bronze/Silver/Gold/Platinum)      │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Groth16Verifier.sol (auto-generated)                  │    │
│  │  • verifyProof(a, b, c, input)                        │    │
│  │  • Gas cost: ~250k gas                                │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                              │
│  ┌──────────────────┐  ┌──────────────────────────────────┐    │
│  │  IPFS            │  │  On-Chain Storage                 │    │
│  │  • SEC filings   │  │  • Filing hashes                  │    │
│  │  • Transcripts   │  │  • Signal metadata                │    │
│  │  • Analysis data │  │  • Researcher reputation          │    │
│  │                  │  │  • Bounty data                    │    │
│  └──────────────────┘  └──────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Layer

**Technology:** Next.js 14, React 18, Tailwind CSS, ethers.js

**Components:**
- `Dashboard.jsx` - Main dashboard with brutalist design
- Signal feed - Real-time verified signals
- Bounty marketplace - Active research bounties
- Reputation tracker - User profile and stats
- Wallet integration - RainbowKit for multi-wallet support

**Key Features:**
- Server-side rendering for SEO
- Client-side wallet connection
- Real-time blockchain event listening
- Responsive design (mobile/desktop)

### 2. Backend API Layer

**Technology:** Python 3.9+, FastAPI, uvicorn

**Modules:**

#### `analyzer.py`
```python
class SECFilingAnalyzer:
    def download_sec_filing(cik, filing_type)
    def parse_form4_transactions(filing_content)
    def detect_insider_selling_signal(transactions, threshold)
    def analyze_with_ai(filing_content, signal_type)
    def upload_to_ipfs(content)
    def generate_zk_proof(filing_hash, threshold, total_shares, shares_sold)
```

#### `api.py`
```python
Endpoints:
- POST /analyze/filing
- POST /analyze/upload
- POST /proof/generate
- GET /signals/recent
- GET /researcher/{address}/reputation
- GET /bounties/active
- GET /stats
```

**Data Flow:**
1. Receive filing (CIK or upload)
2. Parse transactions
3. Detect signals
4. Upload to IPFS
5. Generate ZK proof
6. Return proof + metadata

### 3. ZK Cryptography Layer

**Technology:** Circom 2.0, SnarkJS, Groth16

**Circuit Design:**

```circom
Input signals:
- Public: filingHash (bytes32), threshold (uint)
- Private: totalShares, sharesSold, salt

Constraints:
1. Range checks: totalShares > 0, sharesSold <= totalShares
2. Percentage calculation: percentSold = (sharesSold * 100) / totalShares
3. Threshold check: percentSold >= threshold
4. Commitment: hash(filingHash, salt) for anti-front-running

Output:
- validSignal: 1 if all constraints satisfied, 0 otherwise
```

**Proof Generation Pipeline:**
```
Input JSON → Generate Witness → Create Proof → Export Proof
   (1 ms)        (~500 ms)         (~2 sec)      (~10 ms)
```

**Verification:**
- On-chain gas cost: ~250k gas (~$5-10 at 50 gwei)
- Verification time: <1 second
- Proof size: 256 bytes

### 4. Smart Contract Layer

**Technology:** Solidity 0.8.20, Hardhat, OpenZeppelin

#### InsiderSignalVerifier.sol

**State Variables:**
```solidity
mapping(bytes32 => VerifiedSignal) public signals;
mapping(address => Researcher) public researchers;
mapping(uint256 => Bounty) public bounties;
uint256 public signalCount;
uint256 public bountyCount;
```

**Key Functions:**
```solidity
submitSignal(filingHash, signalType, threshold, proof)
  → Verify ZK proof
  → Store signal
  → Update reputation
  → Check bounty claims

createBounty(companySymbol, reward) payable
  → Create research bounty
  → Lock ETH reward

_updateResearcherReputation(researcher, correct)
  → Calculate accuracy
  → Award reputation points
```

**Events:**
```solidity
event SignalVerified(signalId, filingHash, signalType, researcher, timestamp)
event ReputationUpdated(researcher, newReputation, increased)
event BountyClaimed(bountyId, winner, reward)
```

#### ReputationNFT.sol

**Features:**
- Soulbound tokens (non-transferable)
- Dynamic metadata based on reputation
- Tier system (Bronze/Silver/Gold/Platinum)
- On-chain reputation storage

**Functions:**
```solidity
mintReputation(researcher, reputationScore, signalsVerified)
updateReputation(researcher, newScore, newSignals)
getReputationByAddress(researcher)
```

### 5. Storage Layer

#### IPFS
- **Purpose:** Decentralized storage for large files
- **Stored Data:**
  - SEC filings (can be 1-10MB)
  - Earnings call transcripts
  - Analysis metadata
- **Integration:** ipfshttpclient library
- **Retrieval:** Via CID stored on-chain

#### On-Chain Storage
- **Purpose:** Immutable, verifiable records
- **Stored Data:**
  - Filing hashes (bytes32)
  - Signal metadata (type, threshold, timestamp)
  - Researcher reputation scores
  - Bounty information
- **Gas Optimization:**
  - Use events for historical data
  - Store only essential data on-chain
  - Aggregate data off-chain via The Graph

## Data Flow: End-to-End

### Signal Submission Flow

```
1. User Request
   │
   ▼
2. Backend: Download SEC Filing (EDGAR API)
   │
   ▼
3. Backend: Parse Transactions
   │
   ▼
4. Backend: Detect Signal
   │
   ├─> If no signal: Return "No anomaly"
   │
   └─> If signal detected:
       │
       ▼
5. Backend: Upload filing to IPFS
   │   Returns: IPFS hash (Qm...)
   │
   ▼
6. Backend: Calculate filing hash
   │   SHA-256(filing content) → 0x1a2b3c...
   │
   ▼
7. Backend: Prepare ZK circuit inputs
   │   {
   │     filingHash: 0x1a2b3c...,
   │     threshold: 40,
   │     totalShares: 120000,  // private
   │     sharesSold: 80000,    // private
   │     salt: random()        // private
   │   }
   │
   ▼
8. ZK Layer: Generate witness
   │   Circom evaluates constraints
   │
   ▼
9. ZK Layer: Create Groth16 proof
   │   Uses proving key
   │   Returns: {proof, publicSignals}
   │
   ▼
10. Frontend: User signs transaction
    │
    ▼
11. Smart Contract: Verify proof
    │   Groth16Verifier.verifyProof(proof, publicSignals)
    │   ├─> If invalid: Revert
    │   └─> If valid: Continue
    │
    ▼
12. Smart Contract: Store signal
    │   signals[signalId] = VerifiedSignal({...})
    │
    ▼
13. Smart Contract: Update reputation
    │   researchers[msg.sender].correctSignals++
    │
    ▼
14. Smart Contract: Check bounties
    │   If matching bounty: Transfer reward
    │
    ▼
15. Event Emission
    │   emit SignalVerified(signalId, filingHash, ...)
    │
    ▼
16. Frontend: Update UI
    │   Show verified signal
    │   Update reputation score
```

## Security Architecture

### Threat Model

**Threats:**
1. Fake signals (solved by ZK proof verification)
2. Front-running (solved by commitment scheme)
3. Sybil attacks (mitigated by reputation system)
4. Data manipulation (prevented by IPFS + on-chain hashes)
5. Smart contract exploits (mitigated by OpenZeppelin, audits)

### Security Measures

**ZK Proof Layer:**
- Groth16 provides soundness (cannot forge proofs)
- Trusted setup from Hermez ceremony (audited)
- Circuit constraints prevent invalid inputs

**Smart Contract Layer:**
- ReentrancyGuard on state-changing functions
- Ownable for admin functions
- Input validation on all public functions
- Events for transparency

**Backend Layer:**
- Rate limiting on API endpoints
- Input sanitization
- HTTPS/TLS for data in transit
- API authentication (optional)

**Storage Layer:**
- IPFS provides content-addressed storage
- On-chain hashes ensure data integrity
- Private keys stored securely (never in code)

## Scalability Considerations

### Current Limits
- **Proof Generation:** ~2 seconds per proof
- **On-chain Verification:** ~250k gas per proof
- **IPFS Upload:** ~1-5 seconds per filing
- **Backend Throughput:** ~100 requests/second

### Scaling Solutions

**Layer 2:**
- Deploy to Optimism/Arbitrum for 10-100x cheaper gas
- Batch multiple signals in single transaction

**Backend:**
- Horizontal scaling with multiple API servers
- Queue system for proof generation
- Caching for frequently accessed filings

**IPFS:**
- Pin important files to multiple nodes
- Use IPFS cluster for redundancy
- Consider Filecoin for permanent storage

**Database:**
- Use The Graph for indexing blockchain events
- PostgreSQL for off-chain metadata
- Redis for caching

## Deployment Architecture

### Development
```
Local Machine:
- Hardhat node (port 8545)
- Backend API (port 8000)
- Frontend dev server (port 3000)
- IPFS daemon (port 5001)
```

### Staging (Testnet)
```
Cloud Infrastructure:
- Backend: AWS EC2 / Google Cloud Run
- Frontend: Vercel / Netlify
- IPFS: Pinata / Infura
- Blockchain: Sepolia / Optimism Sepolia
- Database: PostgreSQL (RDS)
- Monitoring: DataDog / Sentry
```

### Production (Mainnet)
```
Cloud Infrastructure:
- Backend: Multi-region deployment
- Frontend: CDN + edge deployment
- IPFS: Dedicated nodes + pinning service
- Blockchain: Ethereum Mainnet / Optimism / Arbitrum
- Database: Replicated PostgreSQL
- Monitoring: Full observability stack
- Security: WAF, DDoS protection
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js, React, ethers.js | User interface |
| Backend | Python, FastAPI | API server, analysis |
| ZK Proofs | Circom, SnarkJS | Zero-knowledge circuits |
| Smart Contracts | Solidity, Hardhat | On-chain logic |
| Storage | IPFS, On-chain | Decentralized storage |
| Indexing | The Graph (optional) | Query blockchain data |
| AI/ML | OpenAI API / spaCy | NLP analysis |
| Infrastructure | AWS/GCP, Docker | Deployment |

## Future Architecture Improvements

1. **Knowledge Graph Integration**
   - Neo4j database for company relationships
   - GraphQL API for complex queries

2. **Real-time Updates**
   - WebSocket connections
   - Server-sent events for signal feed

3. **Advanced Analytics**
   - Machine learning models
   - Predictive signal detection

4. **Multi-chain Support**
   - Cross-chain messaging
   - Unified reputation across chains

5. **Decentralized Backend**
   - Run analysis on decentralized compute
   - IPFS-based API routing

---

This architecture provides a solid foundation for a production-ready ZK verification system while maintaining flexibility for future enhancements.
