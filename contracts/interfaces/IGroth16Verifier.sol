// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IGroth16Verifier
/// @notice Interface for Groth16 ZK proof verifier
/// @dev This interface is for the auto-generated verifier from snarkjs
interface IGroth16Verifier {
    /// @notice Verify a Groth16 proof
    /// @param _pA First part of the proof (G1 point)
    /// @param _pB Second part of the proof (G2 point)
    /// @param _pC Third part of the proof (G1 point)
    /// @param _pubSignals Public signals/inputs to the circuit
    /// @return bool True if proof is valid, false otherwise
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[2] calldata _pubSignals
    ) external view returns (bool);
}
