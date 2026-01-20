# 🚀 Complete Setup Guide

## Step-by-Step Installation & Deployment

### 1️⃣ Prerequisites Installation

#### Install Node.js & npm
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node@18

# Verify
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

#### Install Python
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install python3.9 python3-pip

# macOS
brew install python@3.9

# Verify
python3 --version  # Should be >= 3.9
```

#### Install Circom & SnarkJS
```bash
# Install Circom
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
cd ..

# Install SnarkJS
npm install -g snarkjs

# Verify
circom --version
snarkjs --version
```

#### Install IPFS (Optional but Recommended)
```bash
# Ubuntu/Debian
wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.24.0_linux-amd64.tar.gz
cd kubo
sudo bash install.sh

# macOS
brew install ipfs

# Initialize IPFS
ipfs init

# Start daemon (in separate terminal)
ipfs daemon
```

### 2️⃣ Project Setup

```bash
# Clone repository
git clone https://github.com/yourusername/zk-insider-verifier.git
cd zk-insider-verifier

# Install contract dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts dotenv

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3️⃣ Environment Configuration

Create `.env` file in project root:

```bash
# .env

# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
OPTIMISM_ETHERSCAN_API_KEY=your_optimism_etherscan_key
ARBISCAN_API_KEY=your_arbiscan_key

# AI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key

# IPFS Configuration
IPFS_HOST=127.0.0.1
IPFS_PORT=5001

# Backend Configuration
API_PORT=8000
DEBUG=true
```

**⚠️ Security Note**: Never commit `.env` file to git!

### 4️⃣ ZK Circuit Setup

```bash
cd circuits

# Make setup script executable
chmod +x setup_circuit.sh

# Run setup (downloads ~200MB Powers of Tau file)
./setup_circuit.sh

# Expected output:
# ✅ Circuit compiled
# ✅ Verification key generated
# ✅ Solidity verifier created
```

**What this does:**
1. Compiles `insider_selling.circom` to R1CS constraints
2. Downloads trusted setup (Powers of Tau ceremony)
3. Generates proving and verification keys
4. Exports Solidity verifier contract

**Troubleshooting:**
- If download fails: Manually download from https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau
- If compilation fails: Check circom installation with `circom --version`

### 5️⃣ Smart Contract Deployment

#### Local Network Testing

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Expected output:
# 🚀 Deploying ZK Insider Signal Verifier...
# ✅ InsiderSignalVerifier deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
# ✅ ReputationNFT deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

#### Testnet Deployment

```bash
# Get testnet ETH from faucets:
# Sepolia: https://sepoliafaucet.com/
# Optimism Sepolia: https://app.optimism.io/faucet
# Arbitrum Sepolia: https://faucet.quicknode.com/arbitrum/sepolia

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Optimism Sepolia (recommended for lower fees)
npx hardhat run scripts/deploy.js --network optimismSepolia

# Save the contract addresses from output!
```

**Contract Verification:**
```bash
# Automatically verified during deployment if API keys are set
# Manual verification:
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### 6️⃣ Backend API Setup

```bash
cd backend

# Test SEC filing download
python3 -c "from analyzer import SECFilingAnalyzer; a = SECFilingAnalyzer(); print('✅ Backend OK')"

# Start API server
uvicorn api:app --reload --host 0.0.0.0 --port 8000

# Test API
curl http://localhost:8000
# Should return: {"status":"online","service":"ZK Insider Signal Verifier",...}
```

**API Endpoints:**
- `GET /` - Health check
- `POST /analyze/filing` - Analyze SEC filing
- `POST /analyze/upload` - Upload & analyze filing
- `POST /proof/generate` - Generate ZK proof
- `GET /signals/recent` - Get recent signals
- `GET /researcher/{address}/reputation` - Get reputation

### 7️⃣ Frontend Dashboard Setup

```bash
cd frontend

# Update contract addresses in config
# Create src/config.js:
cat > src/config.js << 'EOF'
export const CONTRACT_ADDRESSES = {
  verifier: "YOUR_VERIFIER_ADDRESS",
  reputationNFT: "YOUR_NFT_ADDRESS"
};

export const API_URL = "http://localhost:8000";
EOF

# Start development server
npm run dev

# Open browser: http://localhost:3000
```

### 8️⃣ End-to-End Test

```bash
# Terminal 1: Backend API
cd backend && uvicorn api:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: IPFS (optional)
ipfs daemon

# Test complete workflow:
# 1. Open http://localhost:3000
# 2. Connect wallet
# 3. Upload a Form 4 filing or use test CIK
# 4. View detected signals
# 5. Generate ZK proof
# 6. Submit to blockchain
# 7. View verified signal on dashboard
```

## 🧪 Testing

### Contract Tests
```bash
npx hardhat test

# With gas reporting
REPORT_GAS=true npx hardhat test

# Coverage
npx hardhat coverage
```

### Backend Tests
```bash
cd backend
pytest -v

# With coverage
pytest --cov=. --cov-report=html
```

### Generate Test Data
```bash
cd backend
python3 << 'EOF'
from analyzer import SECFilingAnalyzer, InsiderTransaction

# Create mock transactions
transactions = [
    InsiderTransaction(
        insider_name="Test CEO",
        title="Chief Executive Officer",
        transaction_date="2025-01-15",
        shares_sold=60000,
        shares_bought=0,
        shares_owned_after=80000,
        transaction_type="Sale"
    )
]

analyzer = SECFilingAnalyzer()
signal = analyzer.detect_insider_selling_signal(transactions, 40.0)
print(f"Signal detected: {signal}")
EOF
```

## 🐛 Troubleshooting

### Circuit Compilation Errors
```bash
# Clear build artifacts
rm -rf circuits/build

# Reinstall circom
cargo install --path circom --force

# Retry setup
cd circuits && ./setup_circuit.sh
```

### IPFS Connection Issues
```bash
# Check IPFS daemon
ipfs id

# Restart daemon
killall ipfs
ipfs daemon

# Test connection
ipfs swarm peers
```

### Contract Deployment Failures
```bash
# Check RPC connection
curl -X POST YOUR_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check account balance
npx hardhat run scripts/check-balance.js --network sepolia

# Increase gas limit in hardhat.config.js
networks: {
  sepolia: {
    gas: 5000000,
    gasPrice: 20000000000
  }
}
```

### Frontend Build Issues
```bash
# Clear cache
cd frontend
rm -rf node_modules .next
npm install
npm run build
```

## 📊 Monitoring & Logs

### Backend Logs
```bash
# View API logs
tail -f backend/logs/api.log

# Enable debug mode
export DEBUG=true
python backend/api.py
```

### Contract Events
```bash
# Listen to events
npx hardhat run scripts/listen-events.js --network sepolia
```

### IPFS Stats
```bash
ipfs stats bw
ipfs stats repo
```

## 🚀 Production Deployment

### Backend (AWS/GCP/Heroku)
```bash
# Create Dockerfile
# Deploy to cloud provider
# Set environment variables
# Configure HTTPS/SSL
```

### Frontend (Vercel/Netlify)
```bash
# Connect GitHub repository
# Configure build settings:
#   Build command: npm run build
#   Output directory: .next
# Add environment variables
```

### Smart Contracts (Mainnet)
```bash
# ONLY after thorough testing and auditing
npx hardhat run scripts/deploy.js --network mainnet

# Verify contracts
npx hardhat verify --network mainnet CONTRACT_ADDRESS
```

## ✅ Verification Checklist

Before submission:
- [ ] All contracts deploy successfully
- [ ] ZK circuits compile and generate proofs
- [ ] Backend API responds to all endpoints
- [ ] Frontend dashboard loads and displays data
- [ ] Wallet connection works
- [ ] Signal submission to blockchain succeeds
- [ ] IPFS uploads functional
- [ ] Tests pass (contract + backend)
- [ ] Documentation complete
- [ ] Demo video recorded

## 🎓 Winter of Code Specific

### Required Deliverables
1. ✅ GitHub repository with all code
2. ✅ Deployed smart contracts (testnet)
3. ✅ Working demo (video or live)
4. ✅ Comprehensive README
5. ✅ Technical documentation

### Judging Criteria Alignment
- **Innovation**: ZK proofs for SEC filing verification ✅
- **Technical Complexity**: Multi-layer architecture ✅
- **Completeness**: MVP + advanced features ✅
- **Code Quality**: Well-structured, documented ✅
- **Practical Application**: Real-world problem solved ✅

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review logs in each component
3. Search GitHub issues
4. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

**Good luck with your Winter of Code submission! 🎉**
