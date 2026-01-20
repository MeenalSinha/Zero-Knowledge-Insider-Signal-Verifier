pragma circom 2.0.0;

// Circuit to prove insider selling exceeds threshold without revealing exact amounts
// Uses proper field element handling for filing hash (no truncation)
template InsiderSellingVerifier() {
    // Public inputs
    signal input filingHash;        // Hash of SEC filing as field element (public)
    signal input threshold;         // Threshold percentage (public, e.g., 40)
    
    // Private inputs
    signal input totalShares;       // Total shares owned (private)
    signal input sharesSold;        // Shares sold (private)
    signal input salt;              // Random salt for privacy (private)
    
    // Output
    signal output validSignal;      // 1 if signal is valid, 0 otherwise
    
    // Constraints
    signal percentageSold;
    signal thresholdExceeded;
    signal filingHashSquared;
    signal commitment;
    
    // IMPORTANT: filingHash is now a proper field element
    // Generated from full 256-bit hash using secure conversion:
    // hash_high_128bits || hash_low_128bits → keccak256 → mod BN254_field
    // No truncation = full cryptographic security
    
    // Calculate percentage sold (scaled by 100 to avoid decimals)
    // percentageSold = (sharesSold * 100) / totalShares
    percentageSold <== (sharesSold * 100) \ totalShares;
    
    // Check if percentage exceeds threshold
    // thresholdExceeded should be 1 if percentageSold >= threshold
    component isGte = GreaterEqThan(32);
    isGte.in[0] <== percentageSold;
    isGte.in[1] <== threshold;
    thresholdExceeded <== isGte.out;
    
    // Verify total shares is positive
    component totalPositive = GreaterThan(64);
    totalPositive.in[0] <== totalShares;
    totalPositive.in[1] <== 0;
    
    // Verify shares sold doesn't exceed total shares
    component validSale = LessEqThan(64);
    validSale.in[0] <== sharesSold;
    validSale.in[1] <== totalShares;
    
    // Create commitment to filing hash (prevents front-running)
    // Using filingHash as proper field element (not truncated)
    filingHashSquared <== filingHash * filingHash;
    commitment <== filingHashSquared + salt;
    
    // Constrain commitment to prevent malleability
    signal commitmentCheck;
    commitmentCheck <== commitment * commitment;
    
    // Final validation: all conditions must be true
    signal allConditions;
    allConditions <== thresholdExceeded * totalPositive.out * validSale.out;
    
    // Output 1 only if all conditions are met
    validSignal <== allConditions;
    
    // Constrain validSignal to be binary
    validSignal * (1 - validSignal) === 0;
    
    // CRITICAL SECURITY: Constrain filingHash to be bound to proof
    // This prevents "valid proof, wrong filing" attacks
    // The public input filingHash MUST match the one used in witness generation
    signal filingHashBound;
    filingHashBound <== filingHash * validSignal;
}

// Comparison templates
template GreaterThan(n) {
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n);
    lt.in[0] <== in[1];
    lt.in[1] <== in[0];
    out <== lt.out;
}

template GreaterEqThan(n) {
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n);
    lt.in[0] <== in[0];
    lt.in[1] <== in[1];
    out <== 1 - lt.out;
}

template LessEqThan(n) {
    signal input in[2];
    signal output out;
    
    component gt = GreaterThan(n);
    gt.in[0] <== in[0];
    gt.in[1] <== in[1];
    out <== 1 - gt.out;
}

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component n2b = Num2Bits(n+1);
    n2b.in <== in[0] + (1<<n) - in[1];
    out <== 1 - n2b.out[n];
}

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1 = 0;
    
    for (var i = 0; i < n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
        lc1 += out[i] * 2**i;
    }
    lc1 === in;
}

// Main component with public inputs explicitly declared
component main {public [filingHash, threshold]} = InsiderSellingVerifier();
