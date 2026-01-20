"""
Zero-Knowledge Insider Signal Verifier - Backend
Analyzes SEC filings and generates ZK proofs for insider signals
"""

import os
import json
import hashlib
import subprocess
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import re

# AI/NLP imports
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️  OpenAI not installed. Using rule-based analysis.")

# IPFS integration
import ipfshttpclient

@dataclass
class InsiderTransaction:
    """Represents an insider trading transaction"""
    insider_name: str
    title: str
    transaction_date: str
    shares_sold: int
    shares_bought: int
    shares_owned_after: int
    transaction_type: str  # "Sale" or "Purchase"

@dataclass
class InsiderSignal:
    """Represents a detected insider signal"""
    signal_type: str  # "INSIDER_SELLING", "INSIDER_BUYING", etc.
    company_symbol: str
    filing_type: str  # "Form 4", "10-K", etc.
    confidence: float
    threshold_exceeded: bool
    threshold_value: float
    details: Dict
    filing_url: str
    detected_at: str

class SECFilingAnalyzer:
    """Analyzes SEC filings for insider signals"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        if api_key and OPENAI_AVAILABLE:
            self.client = OpenAI(api_key=api_key)
        else:
            self.client = None
        
        # Connect to IPFS
        try:
            self.ipfs = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
            print("✅ Connected to IPFS")
        except Exception as e:
            print(f"⚠️  IPFS connection failed: {e}")
            self.ipfs = None
    
    def download_sec_filing(self, cik: str, filing_type: str = "4") -> Optional[str]:
        """
        Download SEC filing from EDGAR
        
        Args:
            cik: Company CIK number
            filing_type: Type of filing (4, 10-K, 10-Q, etc.)
        
        Returns:
            Filing content as string
        """
        # SEC EDGAR API
        base_url = "https://www.sec.gov/cgi-bin/browse-edgar"
        
        headers = {
            "User-Agent": "InsiderSignalVerifier/1.0 (research@example.com)"
        }
        
        params = {
            "action": "getcompany",
            "CIK": cik,
            "type": filing_type,
            "dateb": "",
            "owner": "include",
            "count": "1",
            "output": "atom"
        }
        
        try:
            response = requests.get(base_url, params=params, headers=headers)
            response.raise_for_status()
            
            # Parse XML to get filing URL
            soup = BeautifulSoup(response.content, 'xml')
            filing_url = soup.find('filing-href')
            
            if filing_url:
                filing_response = requests.get(filing_url.text, headers=headers)
                return filing_response.text
            
        except Exception as e:
            print(f"Error downloading filing: {e}")
        
        return None
    
    def parse_form4_transactions(self, filing_content: str) -> List[InsiderTransaction]:
        """
        Parse Form 4 insider transactions
        
        Args:
            filing_content: Raw Form 4 XML/HTML content
        
        Returns:
            List of InsiderTransaction objects
        """
        transactions = []
        
        try:
            soup = BeautifulSoup(filing_content, 'xml')
            
            # Extract insider information
            insider_name = soup.find('reportingOwnerName')
            insider_title = soup.find('reportingOwnerTitle')
            
            # Find all transactions
            for transaction in soup.find_all('nonDerivativeTransaction'):
                trans_date = transaction.find('transactionDate')
                trans_code = transaction.find('transactionCode')
                shares = transaction.find('transactionShares')
                shares_owned = transaction.find('sharesOwnedFollowingTransaction')
                
                if all([trans_date, trans_code, shares, shares_owned]):
                    # Determine if sale or purchase
                    code = trans_code.find('value').text.strip()
                    is_sale = code in ['S', 'F']  # S=Sale, F=Payment of exercise price
                    
                    trans = InsiderTransaction(
                        insider_name=insider_name.text.strip() if insider_name else "Unknown",
                        title=insider_title.text.strip() if insider_title else "Unknown",
                        transaction_date=trans_date.find('value').text.strip(),
                        shares_sold=int(shares.find('value').text) if is_sale else 0,
                        shares_bought=int(shares.find('value').text) if not is_sale else 0,
                        shares_owned_after=int(shares_owned.find('value').text),
                        transaction_type="Sale" if is_sale else "Purchase"
                    )
                    transactions.append(trans)
            
        except Exception as e:
            print(f"Error parsing Form 4: {e}")
        
        return transactions
    
    def detect_insider_selling_signal(
        self,
        transactions: List[InsiderTransaction],
        threshold: float = 40.0
    ) -> Optional[InsiderSignal]:
        """
        Detect abnormal insider selling with role-weighted analysis
        
        Args:
            transactions: List of insider transactions
            threshold: Percentage threshold (default 40%)
        
        Returns:
            InsiderSignal if detected, None otherwise
        """
        if not transactions:
            return None
        
        # Role importance weights (based on academic research)
        # CEO/CFO sales are more predictive than Director sales
        ROLE_WEIGHTS = {
            'ceo': 1.5,
            'chief executive officer': 1.5,
            'cfo': 1.4,
            'chief financial officer': 1.4,
            'coo': 1.3,
            'chief operating officer': 1.3,
            'president': 1.3,
            'cto': 1.2,
            'chief technology officer': 1.2,
            'director': 1.0,
            'officer': 0.9,
            'insider': 0.8,
            '10% owner': 0.7  # Large shareholders, less predictive
        }
        
        # Calculate total selling activity with role weighting
        total_sold = 0
        total_bought = 0
        weighted_sold = 0
        role_multiplier = 1.0
        
        for t in transactions:
            # Get role weight
            title_lower = t.title.lower()
            weight = 1.0
            for role, w in ROLE_WEIGHTS.items():
                if role in title_lower:
                    weight = max(weight, w)  # Use highest matching weight
            
            total_sold += t.shares_sold
            total_bought += t.shares_bought
            weighted_sold += t.shares_sold * weight
            role_multiplier = max(role_multiplier, weight)
        
        # Get most recent ownership
        recent_ownership = transactions[-1].shares_owned_after
        
        # Calculate percentage sold (unweighted)
        if recent_ownership > 0:
            percentage_sold = (total_sold / (recent_ownership + total_sold)) * 100
        else:
            percentage_sold = 0
        
        # Apply role multiplier to effective percentage
        # High-ranking executives selling = higher effective signal
        effective_percentage = percentage_sold * role_multiplier
        
        # Check if threshold exceeded
        threshold_exceeded = effective_percentage >= threshold
        
        if threshold_exceeded:
            # Count unique insiders
            unique_insiders = len(set(t.insider_name for t in transactions))
            
            # Detect time clustering (all within 30 days = suspicious)
            dates = [datetime.fromisoformat(t.transaction_date) for t in transactions]
            if len(dates) > 1:
                date_range_days = (max(dates) - min(dates)).days
                is_clustered = date_range_days <= 30
            else:
                is_clustered = False
            
            # Calculate enhanced confidence score
            confidence = self._calculate_confidence(
                percentage_sold=percentage_sold,
                threshold=threshold,
                num_insiders=unique_insiders,
                is_clustered=is_clustered,
                role_multiplier=role_multiplier
            )
            
            return InsiderSignal(
                signal_type="INSIDER_SELLING",
                company_symbol="",  # Would be filled from filing
                filing_type="Form 4",
                confidence=confidence,
                threshold_exceeded=True,
                threshold_value=percentage_sold,  # Report actual, not effective
                details={
                    "total_shares_sold": total_sold,
                    "total_shares_bought": total_bought,
                    "percentage_sold": round(percentage_sold, 2),
                    "effective_percentage": round(effective_percentage, 2),
                    "threshold": threshold,
                    "num_transactions": len(transactions),
                    "num_unique_insiders": unique_insiders,
                    "insiders": list(set(t.insider_name for t in transactions)),
                    "roles": list(set(t.title for t in transactions)),
                    "role_multiplier": round(role_multiplier, 2),
                    "time_clustered": is_clustered if len(dates) > 1 else None,
                    "date_range_days": date_range_days if len(dates) > 1 else 0
                },
                filing_url="",
                detected_at=datetime.now().isoformat()
            )
        
        return None
    
    def _calculate_confidence(
        self,
        percentage_sold: float,
        threshold: float,
        num_insiders: int,
        is_clustered: bool,
        role_multiplier: float
    ) -> float:
        """
        Calculate research-grade confidence score
        
        Factors:
        - How far above threshold (40%)
        - Number of insiders selling (30%)
        - Time clustering (15%)
        - Role importance (15%)
        
        Returns:
            Confidence score (0.0 to 1.0)
        """
        # Base confidence: how far above threshold
        threshold_factor = min((percentage_sold / threshold) - 1.0, 1.0)  # 0-1 scale
        threshold_weight = 0.40
        
        # Insider count factor: more insiders = higher confidence
        # 1 insider = 0.3, 2 = 0.6, 3+ = 1.0
        insider_factor = min(num_insiders / 3.0, 1.0)
        insider_weight = 0.30
        
        # Time clustering factor: sales within 30 days = suspicious
        cluster_factor = 1.0 if is_clustered else 0.5
        cluster_weight = 0.15
        
        # Role importance factor: CEO/CFO = high, Director = medium
        # role_multiplier ranges from 0.7 to 1.5, normalize to 0-1
        role_factor = min((role_multiplier - 0.7) / 0.8, 1.0)
        role_weight = 0.15
        
        # Weighted combination
        confidence = (
            threshold_factor * threshold_weight +
            insider_factor * insider_weight +
            cluster_factor * cluster_weight +
            role_factor * role_weight
        )
        
        # Cap at 0.99 (never claim 100% certainty)
        return min(confidence, 0.99)
    
    def analyze_with_ai(self, filing_content: str, signal_type: str) -> Dict:
        """
        Use AI to analyze filing for specific signals
        
        Args:
            filing_content: Filing text content
            signal_type: Type of signal to detect
        
        Returns:
            Analysis results
        """
        if not self.client:
            return {"error": "AI analysis not available"}
        
        prompts = {
            "INSIDER_SELLING": """
                Analyze this SEC filing for abnormal insider selling activity.
                Look for:
                - Large percentage of shares sold by executives
                - Multiple insiders selling simultaneously
                - Unusual timing of sales
                
                Respond with JSON containing:
                - detected: boolean
                - confidence: 0-1
                - summary: brief explanation
                - red_flags: list of specific concerns
            """,
            "EXECUTIVE_EXIT": """
                Analyze this SEC filing for sudden executive departures.
                Look for:
                - Unexpected resignations
                - Multiple executives leaving
                - Lack of succession planning
                
                Respond with JSON.
            """,
            "RISK_LANGUAGE_SURGE": """
                Analyze the risk factors section for unusual changes.
                Compare to typical risk disclosures and identify:
                - New risk categories
                - Significantly expanded warnings
                - Vague or unusual language
                
                Respond with JSON.
            """
        }
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert SEC filing analyzer."},
                    {"role": "user", "content": prompts.get(signal_type, "") + "\n\n" + filing_content[:8000]}
                ],
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            return {"error": str(e)}
    
    def upload_to_ipfs(self, content: str) -> Optional[str]:
        """
        Upload filing to IPFS
        
        Args:
            content: Filing content
        
        Returns:
            IPFS hash
        """
        if not self.ipfs:
            print("⚠️  IPFS not available")
            return None
        
        try:
            result = self.ipfs.add_str(content)
            return result
        except Exception as e:
            print(f"Error uploading to IPFS: {e}")
            return None
    
    def generate_zk_proof(
        self,
        filing_hash: str,
        threshold: int,
        total_shares: int,
        shares_sold: int
    ) -> Optional[bytes]:
        """
        Generate ZK proof using snarkjs with proper field element handling
        
        Args:
            filing_hash: Hash of the filing (64-char hex string)
            threshold: Threshold percentage
            total_shares: Total shares owned (private)
            shares_sold: Shares sold (private)
        
        Returns:
            Proof bytes
        """
        # IMPORTANT: Convert filing hash to field elements properly
        # BN254 field modulus: 21888242871839275222246405745257275088548364400416034343698204186575808495617
        # We split the 256-bit hash into two 128-bit values and combine securely
        
        filing_hash_int = int(filing_hash, 16) if filing_hash.startswith('0x') else int(filing_hash, 16)
        
        # Split into high and low 128 bits (no truncation!)
        filing_hash_high = filing_hash_int >> 128
        filing_hash_low = filing_hash_int & ((1 << 128) - 1)
        
        # Combine using keccak256 (same as Solidity) and reduce modulo field size
        from web3 import Web3
        combined_bytes = filing_hash_high.to_bytes(16, 'big') + filing_hash_low.to_bytes(16, 'big')
        combined_hash = Web3.keccak(combined_bytes)  # ✅ FIXED: Use keccak256 to match contract
        
        # Convert to field element (mod BN254 field)
        BN254_FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617
        filing_hash_field = int.from_bytes(combined_hash, 'big') % BN254_FIELD_MODULUS
        
        # Create input JSON
        input_data = {
            "filingHash": str(filing_hash_field),  # No truncation - full security
            "threshold": threshold,
            "totalShares": total_shares,
            "sharesSold": shares_sold,
            "salt": str(int.from_bytes(os.urandom(32), 'big') % BN254_FIELD_MODULUS)
        }
        
        # Write input to file
        input_file = "/tmp/input.json"
        with open(input_file, 'w') as f:
            json.dump(input_data, f)
        
        try:
            # Generate witness
            witness_cmd = [
                "node",
                "circuits/build/insider_selling_js/generate_witness.js",
                "circuits/build/insider_selling_js/insider_selling.wasm",
                input_file,
                "/tmp/witness.wtns"
            ]
            subprocess.run(witness_cmd, check=True, capture_output=True)
            
            # Generate proof
            proof_cmd = [
                "snarkjs", "groth16", "prove",
                "circuits/build/insider_selling_final.zkey",
                "/tmp/witness.wtns",
                "/tmp/proof.json",
                "/tmp/public.json"
            ]
            subprocess.run(proof_cmd, check=True, capture_output=True)
            
            # Read proof and public signals
            with open("/tmp/proof.json", 'r') as f:
                proof_data = json.load(f)
            
            with open("/tmp/public.json", 'r') as f:
                public_signals = json.load(f)
            
            # Verify public signals match our inputs (critical security check)
            assert public_signals[0] == str(filing_hash_field), "Filing hash mismatch in proof"
            assert public_signals[1] == str(threshold), "Threshold mismatch in proof"
            
            # Convert proof to bytes (simplified)
            proof_bytes = json.dumps(proof_data).encode()
            return proof_bytes
            
        except subprocess.CalledProcessError as e:
            print(f"Error generating proof: {e.stderr.decode()}")
            return None
        except Exception as e:
            print(f"Error: {e}")
            return None

def main():
    """Example usage"""
    analyzer = SECFilingAnalyzer()
    
    # Example: Analyze a Form 4 filing
    print("🔍 Analyzing SEC filings...")
    
    # Mock data for demonstration
    mock_transactions = [
        InsiderTransaction(
            insider_name="John Doe",
            title="CEO",
            transaction_date="2025-01-15",
            shares_sold=50000,
            shares_bought=0,
            shares_owned_after=70000,
            transaction_type="Sale"
        ),
        InsiderTransaction(
            insider_name="Jane Smith",
            title="CFO",
            transaction_date="2025-01-16",
            shares_sold=30000,
            shares_bought=0,
            shares_owned_after=40000,
            transaction_type="Sale"
        )
    ]
    
    # Detect signal
    signal = analyzer.detect_insider_selling_signal(mock_transactions, threshold=40.0)
    
    if signal:
        print(f"\n🚨 SIGNAL DETECTED!")
        print(f"Type: {signal.signal_type}")
        print(f"Confidence: {signal.confidence:.2%}")
        print(f"Threshold Value: {signal.threshold_value:.2f}%")
        print(f"Details: {json.dumps(signal.details, indent=2)}")
        
        # Generate ZK proof
        filing_hash = hashlib.sha256("mock_filing_content".encode()).hexdigest()
        total_shares = 120000
        shares_sold = 80000
        
        print(f"\n🔐 Generating ZK proof...")
        proof = analyzer.generate_zk_proof(filing_hash, 40, total_shares, shares_sold)
        
        if proof:
            print(f"✅ Proof generated: {len(proof)} bytes")
        else:
            print("❌ Proof generation failed (requires circom/snarkjs setup)")
    else:
        print("No signal detected")

if __name__ == "__main__":
    main()
