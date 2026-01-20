# Zero-Knowledge Circuits

## Overview

This directory contains the Circom circuits for zero-knowledge proof generation in the Insider Signal Verifier.

## Files

- `insider_selling.circom` - Main circuit for verifying insider selling signals
- `setup_circuit.sh` - Automated setup script for circuit compilation
- `build/` - Generated files (gitignored, created during setup)

## Circuit: insider_selling.circom

### Purpose
Proves that insider selling exceeds a threshold without revealing exact share amounts.

### Public Inputs
- `filingHash` - Cryptographic hash of the SEC filing (as field element)
- `threshold` - Percentage threshold (e.g., 40 for 40%)

### Private Inputs
- `totalShares` - Total shares owned before sale
- `sharesSold` - Number of shares sold
- `salt` - Random salt for commitment security

### Output
- `validSignal` - 1 if threshold exceeded, 0 otherwise

### Constraints
The circuit enforces:
1. `percentageSold = (sharesSold * 100) / totalShares`
2. `percentageSold >= threshold`
3. `sharesSold <= totalShares` (validity check)
4. `totalShares > 0` (prevent division by zero)
5. Commitment scheme for front-running protection

## Setup

### Prerequisites
- Circom 2.0+
- Node.js 18+
- SnarkJS

### Installation

```bash
# Install Circom
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install circom

# Install SnarkJS
npm install -g snarkjs
```

### Compile Circuit

```bash
# Run automated setup
./setup_circuit.sh

# Or manually:
circom insider_selling.circom --r1cs --wasm --sym -o build
```

### Generate Proving and Verification Keys

The setup script automatically:
1. Downloads Powers of Tau ceremony file (~200MB)
2. Generates proving key (~2MB)
3. Generates verification key (~1KB)
4. Exports Solidity verifier contract

## Usage

### Generate Proof

```bash
# 1. Create input.json
cat > input.json << EOF
{
  "filingHash": "12345...",
  "threshold": 40,
  "totalShares": 350000,
  "sharesSold": 150000,
  "salt": "98765..."
}
EOF

# 2. Generate witness
node build/insider_selling_js/generate_witness.js \
  build/insider_selling_js/insider_selling.wasm \
  input.json \
  witness.wtns

# 3. Generate proof
snarkjs groth16 prove \
  build/insider_selling_final.zkey \
  witness.wtns \
  proof.json \
  public.json

# 4. Verify proof
snarkjs groth16 verify \
  build/verification_key.json \
  public.json \
  proof.json
```

### Integration with Backend

The Python backend (`backend/analyzer.py`) handles proof generation:

```python
from analyzer import SECFilingAnalyzer

analyzer = SECFilingAnalyzer()
proof = analyzer.generate_zk_proof(
    filing_hash="0x1a2b3c...",
    threshold=40,
    total_shares=350000,
    shares_sold=150000
)
```

## Circuit Security

### Field Arithmetic
- Uses BN254 elliptic curve
- Field modulus: ~254 bits
- Security level: 128 bits

### Proof System
- Groth16 (optimal proof size)
- Proof size: ~192 bytes
- Verification: O(1) complexity

### Trusted Setup
- Uses Hermez Powers of Tau ceremony
- 300+ participants
- Publicly verifiable

## File Structure

```
circuits/
├── insider_selling.circom       # Main circuit
├── setup_circuit.sh             # Setup script
├── build/                       # Generated (gitignored)
│   ├── insider_selling.r1cs    # Constraint system
│   ├── insider_selling.sym     # Symbols
│   ├── insider_selling_js/     # WASM witness generator
│   ├── insider_selling_final.zkey  # Proving key
│   └── verification_key.json   # Verification key
└── README.md                    # This file
```

## Troubleshooting

### Circuit compilation fails
```bash
# Check Circom version
circom --version  # Should be >= 2.0.0

# Clear build directory
rm -rf build && mkdir build
```

### Powers of Tau download fails
```bash
# Manual download
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau
mv powersOfTau28_hez_final_14.ptau build/
```

### Witness generation fails
- Verify input.json format
- Check field element bounds (must be < BN254 modulus)
- Ensure totalShares > 0

## Performance

- **Circuit size**: ~1,000 constraints
- **Witness generation**: ~100ms
- **Proof generation**: ~2 seconds
- **Proof verification**: ~5ms on-chain

## Testing

```bash
# Run circuit tests
cd build
snarkjs groth16 fullprove ../test_input.json insider_selling_js/insider_selling.wasm insider_selling_final.zkey proof.json public.json
snarkjs groth16 verify verification_key.json public.json proof.json
```

## References

- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS Guide](https://github.com/iden3/snarkjs)
- [Groth16 Paper](https://eprint.iacr.org/2016/260.pdf)
- [Hermez Ceremony](https://github.com/iden3/snarkjs#7-prepare-phase-2)

## Contributing

To add new circuits:
1. Create new `.circom` file
2. Update `setup_circuit.sh` to compile it
3. Add tests
4. Document constraints and usage
