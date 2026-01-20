"""
FastAPI Server for Zero-Knowledge Insider Signal Verifier
Provides REST API for signal detection and verification
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import hashlib
import json
from datetime import datetime

from analyzer import SECFilingAnalyzer, InsiderSignal, InsiderTransaction

app = FastAPI(
    title="ZK Insider Signal Verifier API",
    description="Zero-knowledge proof verification for insider trading signals",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize analyzer
analyzer = SECFilingAnalyzer()

# Request/Response Models
class AnalyzeFilingRequest(BaseModel):
    cik: str
    filing_type: str = "4"
    threshold: float = 40.0

class GenerateProofRequest(BaseModel):
    filing_hash: str
    threshold: int
    total_shares: int
    shares_sold: int

class SignalResponse(BaseModel):
    signal_type: str
    company_symbol: str
    filing_type: str
    confidence: float
    threshold_exceeded: bool
    threshold_value: float
    details: Dict
    filing_url: str
    detected_at: str
    filing_hash: Optional[str] = None
    ipfs_hash: Optional[str] = None

class ProofResponse(BaseModel):
    proof: str
    filing_hash: str
    public_signals: Dict
    timestamp: str

# Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "ZK Insider Signal Verifier",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze/filing", response_model=SignalResponse)
async def analyze_filing(request: AnalyzeFilingRequest):
    """
    Analyze SEC filing for insider signals
    
    Args:
        request: Filing analysis request
    
    Returns:
        Detected signal or error
    """
    try:
        # Download filing
        filing_content = analyzer.download_sec_filing(
            request.cik,
            request.filing_type
        )
        
        if not filing_content:
            raise HTTPException(status_code=404, detail="Filing not found")
        
        # Parse transactions
        transactions = analyzer.parse_form4_transactions(filing_content)
        
        if not transactions:
            raise HTTPException(status_code=400, detail="No transactions found in filing")
        
        # Detect signal
        signal = analyzer.detect_insider_selling_signal(
            transactions,
            request.threshold
        )
        
        if not signal:
            raise HTTPException(status_code=200, detail="No signal detected")
        
        # Upload to IPFS
        ipfs_hash = analyzer.upload_to_ipfs(filing_content)
        
        # Generate filing hash
        filing_hash = hashlib.sha256(filing_content.encode()).hexdigest()
        
        response = SignalResponse(
            **signal.__dict__,
            filing_hash=filing_hash,
            ipfs_hash=ipfs_hash
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/upload")
async def analyze_uploaded_filing(
    file: UploadFile = File(...),
    threshold: float = 40.0
):
    """
    Analyze uploaded SEC filing
    
    Args:
        file: Uploaded filing file
        threshold: Detection threshold
    
    Returns:
        Analysis results
    """
    try:
        # Read file content
        content = await file.read()
        filing_content = content.decode('utf-8')
        
        # Parse transactions
        transactions = analyzer.parse_form4_transactions(filing_content)
        
        # Detect signal
        signal = analyzer.detect_insider_selling_signal(transactions, threshold)
        
        if not signal:
            return {"status": "no_signal", "message": "No abnormal activity detected"}
        
        # Upload to IPFS
        ipfs_hash = analyzer.upload_to_ipfs(filing_content)
        filing_hash = hashlib.sha256(content).hexdigest()
        
        return {
            "status": "signal_detected",
            "signal": signal.__dict__,
            "filing_hash": filing_hash,
            "ipfs_hash": ipfs_hash
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/proof/generate", response_model=ProofResponse)
async def generate_proof(request: GenerateProofRequest):
    """
    Generate ZK proof for insider signal
    
    Args:
        request: Proof generation request
    
    Returns:
        ZK proof data
    """
    try:
        proof = analyzer.generate_zk_proof(
            request.filing_hash,
            request.threshold,
            request.total_shares,
            request.shares_sold
        )
        
        if not proof:
            raise HTTPException(
                status_code=500,
                detail="Proof generation failed. Ensure circom/snarkjs are set up."
            )
        
        return ProofResponse(
            proof=proof.hex(),
            filing_hash=request.filing_hash,
            public_signals={
                "filingHash": request.filing_hash[:16],
                "threshold": request.threshold
            },
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/signals/recent")
async def get_recent_signals(limit: int = 10):
    """
    Get recently detected signals
    
    Args:
        limit: Number of signals to return
    
    Returns:
        List of recent signals
    """
    # In production, this would query a database
    # For now, return mock data
    return {
        "signals": [],
        "count": 0,
        "message": "Connect to blockchain for historical signals"
    }

@app.get("/researcher/{address}/reputation")
async def get_researcher_reputation(address: str):
    """
    Get researcher reputation data
    
    Args:
        address: Ethereum address
    
    Returns:
        Reputation data
    """
    # In production, query the smart contract
    return {
        "address": address,
        "reputation_score": 0,
        "signals_verified": 0,
        "accuracy": 0,
        "message": "Connect to blockchain for on-chain reputation"
    }

@app.get("/bounties/active")
async def get_active_bounties():
    """Get list of active research bounties"""
    # In production, query the smart contract
    return {
        "bounties": [],
        "count": 0,
        "message": "Connect to blockchain for active bounties"
    }

@app.get("/stats")
async def get_stats():
    """Get platform statistics"""
    return {
        "total_signals_verified": 0,
        "total_researchers": 0,
        "total_bounties_claimed": 0,
        "avg_detection_time": "N/A",
        "message": "Connect to blockchain for real-time stats"
    }

# Run with: uvicorn api:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
