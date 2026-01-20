# Examples

This directory contains real-world example files to help you understand the ZK Insider Signal Verifier system.

## Files

### 📄 example_form4.xml
**SEC Form 4 Filing Example**

A real-world example of an SEC Form 4 (Statement of Changes in Beneficial Ownership) filing showing:
- **Insider**: John Doe, CEO of TechCorp Inc.
- **Transaction**: Sale of 150,000 shares
- **Remaining Holdings**: 200,000 shares
- **Percentage Sold**: 42.9% (150k / 350k total)
- **Signal Triggered**: Yes (exceeds 40% threshold)

**Usage:**
```bash
# Analyze this filing
python backend/analyzer.py --file examples/example_form4.xml --threshold 40

# Or via API
curl -X POST http://localhost:8000/analyze/upload \
  -F "file=@examples/example_form4.xml" \
  -F "threshold=40"
```

**Key Details:**
- Filing Date: 2025-01-15
- Transaction Code: S (Sale)
- Price: $125.50 per share
- Total Value: ~$18.8M
- 10b5-1 Plan: Yes (see footnote)

---

### 📊 example_signal.json
**Detected Signal Output**

Shows the complete signal data structure after analysis:

**Signal Information:**
- Type: INSIDER_SELLING
- Threshold: 40%
- Actual: 42.9% sold
- Confidence: 87%

**Enhanced Analysis:**
- Role multiplier: 1.5x (CEO)
- Effective percentage: 64.35% (with role weighting)
- Time clustering: No
- Number of insiders: 1

**Proof Status:**
- Verified: ✅ Yes
- Status: FINALIZED
- Network: Sepolia

**Usage:**
```javascript
// This is what the backend returns
const signal = await fetch('/analyze/filing').then(r => r.json());

// Or what the smart contract stores
const onChainSignal = await verifier.getSignal(signalId);
```

---

### 🔐 example_proof.json
**Zero-Knowledge Proof**

Complete ZK proof structure including:

**Proof Components:**
- `pi_a`, `pi_b`, `pi_c`: Groth16 proof elements
- Protocol: Groth16
- Curve: BN254/BN128

**Public Inputs:**
- Filing hash (as field element): `12345...`
- Threshold: 40

**Private Inputs** (not revealed):
- Total shares: 350,000
- Shares sold: 150,000
- Salt: Random commitment value

**Security Properties:**
- Field modulus: 254 bits
- Security level: 128 bits
- Soundness error: 2^-128
- Zero-knowledge: Yes
- Trusted setup: Hermez Powers of Tau

**Proof Metrics:**
- Size: 192 bytes
- Generation time: ~2.1 seconds
- Verification time: ~5 milliseconds
- Constraints: 1,247

**Usage:**
```javascript
// Generate proof
const proof = await generateProof(filingHash, threshold, totalShares, sharesSold);

// Verify on-chain
const tx = await verifier.submitSignal(filingHash, signalType, threshold, proof);
```

---

## Quick Start Examples

### Example 1: Analyze a Filing
```bash
# Clone the repo
cd zk-insider-verifier

# Use the example filing
curl -X POST http://localhost:8000/analyze/upload \
  -F "file=@examples/example_form4.xml" \
  -F "threshold=40"

# Expected output: Signal detected (42.9% > 40%)
```

### Example 2: Generate a Proof
```bash
# Using the example data
node scripts/generate-proof.js \
  "12345678901234567890123456789012345678901234567890123456789012345" \
  40 \
  350000 \
  150000

# Output: proof.json and public.json
```

### Example 3: Submit to Contract
```javascript
import { ethers } from 'ethers';

// Load example proof
const proof = require('./examples/example_proof.json');

// Submit signal
const tx = await verifierContract.submitSignal(
  filingHash,
  0, // INSIDER_SELLING
  40,
  proof.proof
);

console.log('Signal submitted:', tx.hash);
```

---

## Understanding the Flow

### 1. SEC Filing → Analysis
```
example_form4.xml
    ↓
Backend Analyzer
    ↓
example_signal.json
```

### 2. Analysis → ZK Proof
```
Signal Data (private)
    ↓
Circuit (insider_selling.circom)
    ↓
example_proof.json
```

### 3. Proof → On-Chain Verification
```
example_proof.json
    ↓
Smart Contract
    ↓
Verified Signal ✅
```

---

## Data Flow Diagram

```
┌─────────────────┐
│  SEC Form 4     │  example_form4.xml
│  (Public)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Analyzer       │  Extracts transaction data
│  (Backend)      │  Calculates percentage sold
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Signal         │  example_signal.json
│  (Detected)     │  Shows threshold exceeded
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ZK Circuit     │  Proves threshold without
│  (Private)      │  revealing exact amounts
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Proof          │  example_proof.json
│  (Generated)    │  192 bytes, 128-bit security
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Contract       │  Verifies proof on-chain
│  (Ethereum)     │  Updates reputation, pays bounties
└─────────────────┘
```

---

## Testing with Examples

### Backend Test
```bash
cd backend
pytest tests/test_analyzer.py -v

# Should use example_form4.xml for integration tests
```

### Frontend Test
```bash
cd frontend
npm run dev

# Load example_signal.json to populate dashboard
```

### Contract Test
```bash
npx hardhat test

# Uses example proof structure for testing
```

---

## Modifying Examples

### Create Your Own Form 4
1. Download real Form 4 from SEC EDGAR
2. Save as XML
3. Analyze: `python backend/analyzer.py --file your_form4.xml`

### Generate Real Proof
1. Get actual filing data
2. Run: `node scripts/generate-proof.js <hash> <threshold> <total> <sold>`
3. Verify: `snarkjs groth16 verify ...`

---

## Example Use Cases

### 📈 Investor Alert System
Use `example_form4.xml` to:
- Monitor insider selling patterns
- Trigger alerts when threshold exceeded
- Verify signals with ZK proofs

### 🔬 Research Platform
Use `example_signal.json` to:
- Analyze insider trading patterns
- Build reputation systems
- Reward accurate signals

### 🏆 Bounty Marketplace
Use `example_proof.json` to:
- Claim bounties for detecting signals
- Verify claims cryptographically
- Build researcher credibility

---

## Questions?

- See main README.md for full documentation
- Check docs/ for detailed guides
- Review DEMO_WALKTHROUGH.md for step-by-step demo

---

**These examples are for demonstration purposes. Real filings should be downloaded from SEC EDGAR.**
