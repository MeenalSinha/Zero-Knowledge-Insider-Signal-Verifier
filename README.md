# 🔐 Zero-Knowledge Insider Signal Verifier

> Cryptographically prove insider trading signals exist in SEC filings without revealing private analysis using zero-knowledge proofs.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-orange.svg)
![Python](https://img.shields.io/badge/Python-3.9+-green.svg)
![Circom](https://img.shields.io/badge/Circom-2.0-purple.svg)

## 🎯 Overview

**The Problem:**
- SEC filings are massive, complex, and hard to analyze
- AI summaries are centralized and unverifiable
- Retail investors don't know whom to trust

**Our Solution:**
Reduce reliance on trust using cryptographic proof. Researchers can prove a red flag exists (like insider selling > 40%) without revealing:
- The exact document
- Their proprietary analysis methods
- Sensitive trading data

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND DASHBOARD                    │
│              (Next.js + Brutalist Design)                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND API (FastAPI)                  │
│   • SEC Filing Download & Parsing                        │
│   • AI/NLP Analysis (OpenAI/Rule-based)                  │
│   • IPFS Upload                                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              ZK PROOF GENERATION (Circom)                │
│   • Circuit: Prove threshold exceeded                    │
│   • Groth16 Proof System                                │
│   • Private: shares owned, shares sold                   │
│   • Public: filing hash, threshold                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│            SMART CONTRACTS (Ethereum/L2)                 │
│   • InsiderSignalVerifier.sol - Main verification        │
│   • ReputationNFT.sol - Researcher credentials           │
│   • Groth16Verifier.sol - ZK proof verification          │
└─────────────────────────────────────────────────────────┘
```

## ✨ Features

### ✅ Phase 1: MVP (Core Features)
- [x] **Insider Signal Detection** - Detect abnormal insider selling (>40% threshold)
- [x] **ZK Proof Generation** - Circom circuits for threshold verification
- [x] **On-Chain Verification** - Smart contract verifies proofs
- [x] **IPFS Storage** - Decentralized filing storage
- [x] **Filing Hash Anchoring** - Permanent record of analyzed filings

### ⭐ Phase 2: Advanced Features
- [x] **Researcher Reputation System** - On-chain reputation scoring
- [x] **DAO Bounty Mechanism** - Incentivize signal discovery
- [x] **Public Signal Dashboard** - Beautiful brutalist UI
- [x] **Signal Framework** - Extensible architecture for multiple signal types (insider selling implemented)

### 🔥 Phase 3: Elite Features
- [x] **Reputation NFTs** - Non-transferable soulbound tokens proving researcher credentials
- [ ] **Knowledge Graph** - Company ↔ Executive ↔ Crypto exposure mapping
- [ ] **Advanced Analytics** - Historical signal patterns

## 🚀 Quick Start

### Prerequisites

```bash
# Required tools
node >= 18.0.0
npm >= 9.0.0
python >= 3.9
circom >= 2.0.0
snarkjs >= 0.7.0
hardhat >= 2.19.0
```

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/zk-insider-verifier.git
cd zk-insider-verifier

# Install contract dependencies (root package.json is for Hardhat + smart contracts only)
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Setup ZK Circuits

```bash
cd circuits
chmod +x setup_circuit.sh
./setup_circuit.sh

# This will:
# - Compile the Circom circuit
# - Download Powers of Tau
# - Generate verification keys
# - Export Solidity verifier
```

### 3. Deploy Smart Contracts

```bash
# Create .env file
cp .env.example .env
# Add your private key and RPC URLs

# Deploy to local network
npx hardhat node  # In terminal 1

npx hardhat run scripts/deploy.js --network localhost  # In terminal 2

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia
# or
npx hardhat run scripts/deploy.js --network optimismSepolia
```

### 4. Start Backend API

```bash
cd backend

# Optional: Start IPFS daemon
ipfs daemon  # In separate terminal

# Start API server
python api.py
# or
uvicorn api:app --reload

# API will be available at http://localhost:8000
```

### 5. Launch Frontend

```bash
cd frontend
npm run dev

# Dashboard available at http://localhost:3000
```

## 🔧 Usage Examples

### Analyze a SEC Filing

```python
from backend.analyzer import SECFilingAnalyzer

analyzer = SECFilingAnalyzer()

# Download and analyze Form 4
filing = analyzer.download_sec_filing(cik="0000320193", filing_type="4")
transactions = analyzer.parse_form4_transactions(filing)

# Detect insider selling signal
signal = analyzer.detect_insider_selling_signal(transactions, threshold=40.0)

if signal:
    print(f"🚨 Signal detected: {signal.threshold_value}% sold")
    
    # Upload to IPFS
    ipfs_hash = analyzer.upload_to_ipfs(filing)
    
    # Generate ZK proof
    proof = analyzer.generate_zk_proof(
        filing_hash=hashlib.sha256(filing.encode()).hexdigest(),
        threshold=40,
        total_shares=120000,
        shares_sold=80000
    )
```

### Submit Signal to Blockchain

```javascript
// Using ethers.js
const InsiderSignalVerifier = await ethers.getContractAt(
  "InsiderSignalVerifier",
  verifierAddress
);

const tx = await InsiderSignalVerifier.submitSignal(
  filingHash,        // bytes32
  0,                 // SignalType.INSIDER_SELLING
  40,                // threshold percentage
  proof              // ZK proof bytes
);

const receipt = await tx.wait();
console.log("Signal verified:", receipt.transactionHash);
```

### Create a Bounty

```javascript
const bountyTx = await InsiderSignalVerifier.createBounty(
  "AAPL",                           // Company symbol
  ethers.parseEther("5.0"),         // 5 ETH reward
  { value: ethers.parseEther("5.0") }
);
```

## 📊 Signal Types

| Signal Type | Description | Threshold |
|------------|-------------|-----------|
| `INSIDER_SELLING` | Abnormal share sales by insiders | >40% of holdings |
| `INSIDER_BUYING` | Unusual insider purchasing | Configurable |
| `EXECUTIVE_EXIT` | Sudden executive departures | N/A (boolean) |
| `RISK_LANGUAGE_SURGE` | Unusual risk disclosure changes | % increase in risk words |

## 🔐 ZK Circuit Design

### What We Prove

```circom
// Public inputs
signal input filingHash;     // Hash of SEC filing
signal input threshold;      // Threshold (e.g., 40%)

// Private inputs (hidden)
signal input totalShares;    // Total shares owned
signal input sharesSold;     // Shares sold
signal input salt;           // Random entropy

// Output
signal output validSignal;   // 1 if threshold exceeded, 0 otherwise
```

### Security Properties

✅ **Zero-Knowledge**: Verifier learns only that threshold was exceeded
✅ **Soundness**: Cannot create fake proofs
✅ **Completeness**: Valid signals always verify
✅ **Privacy**: Private data (share amounts) never revealed

## 🏆 Reputation System

Researchers earn reputation based on:
- **Accuracy**: Percentage of correct signals
- **Volume**: Total signals submitted
- **Timeliness**: Early detection bonuses
- **Bounties**: Successfully claimed bounties

### Reputation Tiers

| Tier | Score | Benefits |
|------|-------|----------|
| Bronze | 100-500 | Basic access |
| Silver | 500-750 | Priority bounties |
| Gold | 750-900 | Higher rewards |
| Platinum | 900-1000 | Reputation NFT eligible |

## 🎨 Dashboard Features

- **Real-time Signal Feed**: Live verified signals
- **Bounty Marketplace**: Active research bounties
- **Reputation Tracker**: Your researcher profile
- **Analytics**: Signal history and trends
- **Wallet Integration**: Connect via RainbowKit

## 🧪 Testing

```bash
# Run contract tests
npx hardhat test

# Run backend tests
cd backend
pytest

# Generate coverage report
npx hardhat coverage
```

## 📁 Project Structure

```
zk-insider-verifier/
├── contracts/              # Solidity smart contracts
│   ├── InsiderSignalVerifier.sol
│   ├── ReputationNFT.sol
│   └── Groth16Verifier.sol (generated)
├── circuits/              # Circom ZK circuits
│   ├── insider_selling.circom
│   └── setup_circuit.sh
├── backend/               # Python analysis engine
│   ├── analyzer.py       # SEC filing analyzer
│   ├── api.py            # FastAPI server
│   └── requirements.txt
├── frontend/             # Next.js dashboard
│   ├── Dashboard.jsx
│   └── package.json
├── scripts/              # Deployment & utilities
│   └── deploy.js
├── test/                 # Contract tests
├── docs/                 # Documentation
└── README.md
```

## 🔒 Security Considerations

1. **ZK Proof Verification**: All proofs verified on-chain via Groth16 verifier
2. **IPFS Integrity**: Filing hashes stored on-chain for verification
3. **Reputation Anti-Gaming**: Penalties for false signals
4. **Smart Contract Audits**: Recommended before mainnet deployment
5. **Rate Limiting**: API endpoints protected against abuse

## 🌐 Deployment Networks

### Testnets (Recommended for WoC)
- **Sepolia** - Ethereum testnet
- **Optimism Sepolia** - L2 with lower gas
- **Arbitrum Sepolia** - L2 alternative

### Mainnet (Production)
- **Ethereum** - Maximum security
- **Optimism** - Lower fees, faster
- **Arbitrum** - Lower fees, faster

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Areas for Contribution
- [ ] Additional signal types
- [ ] ML-based analysis improvements
- [ ] Knowledge graph implementation
- [ ] Mobile app
- [ ] Advanced visualizations

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🎓 Winter of Code Submission

This project demonstrates:

✅ **Blockchain Integration**: Smart contracts on Ethereum/L2
✅ **Zero-Knowledge Proofs**: Circom circuits with Groth16
✅ **AI/ML**: SEC filing analysis with NLP
✅ **Web3 Stack**: IPFS, The Graph, ethers.js
✅ **Full-Stack Development**: Backend API + Frontend dashboard
✅ **Practical Application**: Solves real problem for retail investors

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs](https://github.com/yourusername/zk-insider-verifier/issues)
- **Documentation**: See `/docs` directory for comprehensive guides
- **Examples**: See `/examples` directory for sample data and usage

## 🙏 Acknowledgments

- **Circom** - ZK circuit framework
- **SnarkJS** - Proof generation
- **OpenZeppelin** - Smart contract standards
- **SEC EDGAR** - Public company filings
- **Anthropic Claude** - Development assistance

---

Built with ❤️ for Winter of Code 2025

**Remember**: This is a research project. Not financial advice. Always verify signals independently.
