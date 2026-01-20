const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

async function generateProof(filingHash, threshold, totalShares, sharesSold) {
  console.log("🔐 Generating ZK Proof...\n");

  // Create input file
  const input = {
    filingHash: filingHash,
    threshold: threshold,
    totalShares: totalShares,
    sharesSold: sharesSold,
    salt: Math.floor(Math.random() * 1000000000000).toString()
  };

  const inputPath = path.join(__dirname, "../circuits/build/input.json");
  fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));
  
  console.log("Input created:");
  console.log(JSON.stringify(input, null, 2));
  console.log();

  // Generate witness
  console.log("⏳ Generating witness...");
  await execPromise(
    `node circuits/build/insider_selling_js/generate_witness.js \
     circuits/build/insider_selling_js/insider_selling.wasm \
     circuits/build/input.json \
     circuits/build/witness.wtns`
  );
  console.log("✅ Witness generated\n");

  // Generate proof
  console.log("⏳ Generating proof...");
  await execPromise(
    `snarkjs groth16 prove \
     circuits/build/insider_selling_final.zkey \
     circuits/build/witness.wtns \
     circuits/build/proof.json \
     circuits/build/public.json`
  );
  console.log("✅ Proof generated\n");

  // Verify proof
  console.log("🔍 Verifying proof...");
  const verifyOutput = await execPromise(
    `snarkjs groth16 verify \
     circuits/build/verification_key.json \
     circuits/build/public.json \
     circuits/build/proof.json`
  );
  
  if (verifyOutput.includes("OK")) {
    console.log("✅ Proof verified successfully!\n");
  } else {
    console.log("❌ Proof verification failed\n");
  }

  // Read proof
  const proof = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../circuits/build/proof.json"), "utf8")
  );
  const publicSignals = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../circuits/build/public.json"), "utf8")
  );

  console.log("📄 Proof Summary:");
  console.log(`  Size: ${JSON.stringify(proof).length} bytes`);
  console.log(`  Public Signals: ${publicSignals.length}`);
  console.log();

  return { proof, publicSignals };
}

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

// Example usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log("Usage: node generate-proof.js <filingHash> <threshold> <totalShares> <sharesSold>");
    console.log("Example: node generate-proof.js 12345 40 350000 150000");
    process.exit(1);
  }

  const [filingHash, threshold, totalShares, sharesSold] = args;

  generateProof(filingHash, parseInt(threshold), parseInt(totalShares), parseInt(sharesSold))
    .then(() => {
      console.log("✨ Done! Proof files saved in circuits/build/");
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

module.exports = { generateProof };
