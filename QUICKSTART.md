# ⚡ Quick Start Cheat Sheet

## 🚀 Installation (5 minutes)

```bash
# Clone repo
git clone https://github.com/yourusername/zk-insider-verifier.git
cd zk-insider-verifier

# Install dependencies
npm install
cd backend && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..

# Setup environment
cp .env.example .env
# Edit .env with your keys

# Setup ZK circuits
cd circuits && chmod +x setup_circuit.sh && ./setup_circuit.sh && cd ..
```

## 📝 Common Commands

### Smart Contracts
```bash
# Compile
npx hardhat compile

# Test
npx hardhat test

# Deploy local
npx hardhat node                    # Terminal 1
npx hardhat run scripts/deploy.js --network localhost  # Terminal 2

# Deploy testnet
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/deploy.js --network optimismSepolia

# Verify
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Backend
```bash
# Start API
cd backend
uvicorn api:app --reload

# Test endpoint
curl http://localhost:8000

# Run analyzer
python analyzer.py
```

### Frontend
```bash
cd frontend
npm run dev          # Development
npm run build        # Production build
npm run start        # Production server
```

### ZK Circuits
```bash
cd circuits

# Compile circuit
circom insider_selling.circom --r1cs --wasm --sym

# Generate proof (manual)
node build/insider_selling_js/generate_witness.js \
  build/insider_selling_js/insider_selling.wasm \
  input.json witness.wtns

snarkjs groth16 prove \
  build/insider_selling_final.zkey \
  witness.wtns proof.json public.json
```

## 🔧 Configuration

### Network RPC URLs
```bash
# Testnets (Free)
Sepolia:           https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
Optimism Sepolia:  https://sepolia.optimism.io
Arbitrum Sepolia:  https://sepolia-rollup.arbitrum.io/rpc

# Mainnets (Production)
Ethereum:          https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
Optimism:          https://mainnet.optimism.io
Arbitrum:          https://arb1.arbitrum.io/rpc
```

### Testnet Faucets
```bash
Sepolia ETH:       https://sepoliafaucet.com/
Optimism Sepolia:  https://app.optimism.io/faucet
Arbitrum Sepolia:  https://faucet.quicknode.com/arbitrum/sepolia
```

## 📊 Key Addresses (Save after deployment)

```bash
# Update these after deployment
VERIFIER_ADDRESS=0x...
REPUTATION_NFT_ADDRESS=0x...
GROTH16_VERIFIER_ADDRESS=0x...
```

## 🐛 Troubleshooting

### Circuit compilation fails
```bash
# Install Rust (required for Circom)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install circom
```

### IPFS not connecting
```bash
# Start IPFS daemon
ipfs daemon

# Check connection
ipfs id
```

### Contract deployment fails
```bash
# Check gas price
npx hardhat run scripts/check-gas.js

# Increase gas limit in hardhat.config.js
gas: 5000000
```

### Backend API errors
```bash
# Check Python version
python3 --version  # Should be >= 3.9

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## 📚 Important Files

```
📁 Project Structure
├── contracts/
│   ├── InsiderSignalVerifier.sol    ← Main contract
│   ├── ReputationNFT.sol            ← NFT contract
│   └── Groth16Verifier.sol          ← Auto-generated
├── circuits/
│   ├── insider_selling.circom       ← ZK circuit
│   └── setup_circuit.sh             ← Setup script
├── backend/
│   ├── analyzer.py                  ← SEC analysis
│   └── api.py                       ← FastAPI server
├── frontend/
│   └── Dashboard.jsx                ← Main UI
├── scripts/
│   └── deploy.js                    ← Deployment
└── docs/
    ├── SETUP.md                     ← Full setup guide
    ├── ARCHITECTURE.md              ← Technical docs
    └── WOC_SUBMISSION.md            ← Submission guide
```

## 🎯 Testing Checklist

```bash
✅ Contracts compile:     npx hardhat compile
✅ Tests pass:            npx hardhat test
✅ Circuits compile:      cd circuits && ./setup_circuit.sh
✅ Backend runs:          cd backend && python api.py
✅ Frontend loads:        cd frontend && npm run dev
✅ Wallet connects:       Test on localhost:3000
✅ Deploy works:          npx hardhat run scripts/deploy.js
```

## 🔐 Security Checklist

```bash
✅ .env not committed
✅ Private keys secure
✅ API keys rotated
✅ Smart contracts audited (for mainnet)
✅ Rate limiting enabled
✅ Input validation everywhere
```

## 📈 Performance Tips

```bash
# Use L2 for lower gas
Deploy to Optimism/Arbitrum instead of mainnet

# Cache SEC filings
Store frequently accessed filings

# Batch requests
Combine multiple operations

# Use The Graph
Index blockchain events off-chain
```

## 🎬 Demo Sequence

```bash
1. Start all services
   - Terminal 1: npx hardhat node
   - Terminal 2: cd backend && uvicorn api:app
   - Terminal 3: cd frontend && npm run dev
   - Terminal 4: ipfs daemon

2. Deploy contracts
   npx hardhat run scripts/deploy.js --network localhost

3. Update frontend config with addresses

4. Open dashboard: http://localhost:3000

5. Connect wallet (use Hardhat account #0)

6. Upload test Form 4 or use CIK

7. View detected signal

8. Generate proof

9. Submit to blockchain

10. Verify on dashboard
```

## 🏆 Winter of Code Tips

```bash
# Make sure you have:
✅ Clear README
✅ Working demo
✅ Deployed contracts (testnet)
✅ Demo video
✅ Clean code with comments
✅ All features implemented
✅ Tests passing
✅ Documentation complete
```

## 📞 Quick Links

```bash
GitHub:        github.com/yourusername/zk-insider-verifier
Docs:          /docs/SETUP.md
API Docs:      http://localhost:8000/docs
Frontend:      http://localhost:3000
Etherscan:     https://sepolia.etherscan.io/
```

## ⚡ One-Line Commands

```bash
# Full setup
npm install && cd backend && pip install -r requirements.txt && cd .. && cd circuits && ./setup_circuit.sh && cd ..

# Deploy everything
npx hardhat run scripts/deploy.js --network sepolia && cd backend && uvicorn api:app & cd frontend && npm run dev

# Clean all
rm -rf node_modules cache artifacts build .next && npm install
```

---

**🎉 You're ready to go! Start with `npm install` and follow the setup guide.**
