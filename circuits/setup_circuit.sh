#!/bin/bash

# ZK Circuit Setup and Proof Generation Script
# Requires: circom, snarkjs

set -e

CIRCUIT_NAME="insider_selling"
BUILD_DIR="build"
PTAU_FILE="powersOfTau28_hez_final_14.ptau"

echo "🔧 Setting up ZK circuit: $CIRCUIT_NAME"

# Create build directory
mkdir -p $BUILD_DIR

# Step 1: Compile the circuit
echo "📝 Compiling circuit..."
circom circuits/${CIRCUIT_NAME}.circom \
    --r1cs \
    --wasm \
    --sym \
    --c \
    -o $BUILD_DIR

# Step 2: Download Powers of Tau (if not exists)
if [ ! -f "$BUILD_DIR/$PTAU_FILE" ]; then
    echo "📥 Downloading Powers of Tau ceremony file..."
    wget -P $BUILD_DIR https://hermez.s3-eu-west-1.amazonaws.com/$PTAU_FILE
fi

# Step 3: Generate verification key
echo "🔑 Generating verification key..."
snarkjs groth16 setup \
    $BUILD_DIR/${CIRCUIT_NAME}.r1cs \
    $BUILD_DIR/$PTAU_FILE \
    $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey

# Step 4: Contribute to Phase 2 ceremony
echo "🎲 Contributing to Phase 2 ceremony..."
snarkjs zkey contribute \
    $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey \
    $BUILD_DIR/${CIRCUIT_NAME}_final.zkey \
    --name="First contribution" \
    -v \
    -e="random entropy"

# Step 5: Export verification key
echo "📤 Exporting verification key..."
snarkjs zkey export verificationkey \
    $BUILD_DIR/${CIRCUIT_NAME}_final.zkey \
    $BUILD_DIR/verification_key.json

# Step 6: Generate Solidity verifier
echo "⚡ Generating Solidity verifier contract..."
snarkjs zkey export solidityverifier \
    $BUILD_DIR/${CIRCUIT_NAME}_final.zkey \
    contracts/Groth16Verifier.sol

echo "✅ Circuit setup complete!"
echo ""
echo "📁 Generated files:"
echo "  - $BUILD_DIR/${CIRCUIT_NAME}.r1cs"
echo "  - $BUILD_DIR/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm"
echo "  - $BUILD_DIR/${CIRCUIT_NAME}_final.zkey"
echo "  - $BUILD_DIR/verification_key.json"
echo "  - contracts/Groth16Verifier.sol"
echo ""
echo "🚀 Ready to generate proofs!"
