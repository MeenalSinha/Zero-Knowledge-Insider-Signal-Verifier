# Backend API

FastAPI server for SEC filing analysis and ZK proof generation.

## Features

- SEC EDGAR filing download and parsing
- Insider transaction analysis
- AI/NLP signal detection (optional)
- Zero-knowledge proof generation
- IPFS integration
- RESTful API endpoints

## Installation

### Prerequisites
- Python 3.9+
- pip
- IPFS daemon (optional)

### Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Configuration

Create `.env` file in backend directory:

```bash
# API Configuration
API_PORT=8000
API_HOST=0.0.0.0
DEBUG=true

# OpenAI (Optional)
OPENAI_API_KEY=your_key_here

# IPFS
IPFS_HOST=127.0.0.1
IPFS_PORT=5001

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Running

### Development Server

```bash
# Start API
uvicorn api:app --reload

# Or with custom host/port
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

### Production Server

```bash
# With Gunicorn
gunicorn api:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Start IPFS (Optional)

```bash
# In separate terminal
ipfs daemon
```

## API Endpoints

### Health Check
```http
GET /
```

### Analyze SEC Filing
```http
POST /analyze/filing
Content-Type: application/json

{
  "cik": "0001234567",
  "filing_type": "4",
  "threshold": 40.0
}
```

### Upload and Analyze Filing
```http
POST /analyze/upload
Content-Type: multipart/form-data

file: [SEC Filing XML]
threshold: 40.0
```

### Generate ZK Proof
```http
POST /proof/generate
Content-Type: application/json

{
  "filing_hash": "0x1a2b3c...",
  "threshold": 40,
  "total_shares": 350000,
  "shares_sold": 150000
}
```

### Get Recent Signals
```http
GET /signals/recent?limit=10
```

### Get Researcher Reputation
```http
GET /researcher/{address}/reputation
```

### Get Active Bounties
```http
GET /bounties/active
```

### Get Statistics
```http
GET /stats
```

## API Documentation

Once running, visit:
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI schema: http://localhost:8000/openapi.json

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_analyzer.py -v

# Run specific test
pytest tests/test_analyzer.py::test_detect_insider_selling_above_threshold -v
```

## Code Structure

```
backend/
├── analyzer.py          # SEC filing analysis
├── api.py              # FastAPI server
├── requirements.txt    # Dependencies
├── tests/             # Test files
│   ├── test_analyzer.py
│   └── test_api.py
└── README.md          # This file
```

## Usage Examples

### Python

```python
from analyzer import SECFilingAnalyzer

# Create analyzer
analyzer = SECFilingAnalyzer(api_key="your_openai_key")  # API key optional

# Download and analyze filing
filing = analyzer.download_sec_filing(cik="0001234567", filing_type="4")
transactions = analyzer.parse_form4_transactions(filing)

# Detect signal
signal = analyzer.detect_insider_selling_signal(transactions, threshold=40.0)

if signal:
    print(f"Signal detected: {signal.threshold_value}% sold")
    
    # Upload to IPFS
    ipfs_hash = analyzer.upload_to_ipfs(filing)
    
    # Generate ZK proof
    import hashlib
    filing_hash = hashlib.sha256(filing.encode()).hexdigest()
    
    proof = analyzer.generate_zk_proof(
        filing_hash=filing_hash,
        threshold=40,
        total_shares=350000,
        shares_sold=150000
    )
```

### cURL

```bash
# Analyze filing
curl -X POST http://localhost:8000/analyze/filing \
  -H "Content-Type: application/json" \
  -d '{
    "cik": "0001234567",
    "filing_type": "4",
    "threshold": 40.0
  }'

# Upload filing
curl -X POST http://localhost:8000/analyze/upload \
  -F "file=@form4.xml" \
  -F "threshold=40.0"

# Get stats
curl http://localhost:8000/stats
```

## Dependencies

See `requirements.txt` for full list. Key dependencies:

- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **beautifulsoup4** - HTML/XML parsing
- **requests** - HTTP client
- **ipfshttpclient** - IPFS integration
- **openai** - AI analysis (optional)

## Troubleshooting

### IPFS Connection Error
```bash
# Start IPFS daemon
ipfs daemon

# Or disable IPFS in analyzer.py
analyzer = SECFilingAnalyzer()  # Works without IPFS
```

### SEC API Rate Limiting
```python
# Add delay between requests
import time
time.sleep(1)  # 1 second delay
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Proof Generation Fails
```bash
# Ensure circuits are compiled
cd ../circuits && ./setup_circuit.sh

# Check Node.js and snarkjs installed
node --version
snarkjs --version
```

## Development

### Code Style

```bash
# Format code
black .

# Type checking
mypy analyzer.py api.py
```

### Adding New Endpoints

```python
@app.post("/my-endpoint")
async def my_endpoint(data: MyModel):
    # Implementation
    return {"result": "success"}
```

### Adding New Signal Types

1. Update `detect_signal()` method in `analyzer.py`
2. Add corresponding API endpoint
3. Add tests
4. Update documentation

## Performance

- **Filing download**: ~1-2 seconds
- **Parsing**: ~100ms
- **Signal detection**: ~50ms
- **Proof generation**: ~2 seconds
- **IPFS upload**: ~1-5 seconds

## Security

- Input validation on all endpoints
- Rate limiting (configure in production)
- CORS configured for frontend
- No secrets in code (use .env)
- HTTPS in production

## Contributing

1. Write tests for new features
2. Follow PEP 8 style guide
3. Add docstrings
4. Update this README

## License

MIT - See main LICENSE file
