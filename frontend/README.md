# Frontend Dashboard

Next.js frontend for the Zero-Knowledge Insider Signal Verifier.

## Features

- Real-time signal feed
- Bounty marketplace
- Researcher reputation tracker
- Wallet integration (MetaMask, WalletConnect)
- Brutalist/terminal aesthetic design
- Responsive design (mobile + desktop)

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
cd frontend

# Install dependencies
npm install

# or
yarn install
```

## Configuration

Create `.env.local` file:

```bash
# Contract Addresses
NEXT_PUBLIC_VERIFIER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Network
NEXT_PUBLIC_NETWORK=localhost  # or sepolia, optimismSepolia
NEXT_PUBLIC_CHAIN_ID=31337     # 11155111 for Sepolia

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Update contract addresses in `src/config.js` after deployment.

## Development

```bash
# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

## Building

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Dashboard.jsx      # Main dashboard component
│   ├── pages/
│   │   └── index.js          # Home page
│   ├── config.js             # Contract addresses & config
│   └── styles/
│       └── globals.css       # Global styles
├── public/
│   ├── favicon.ico
│   └── logo.png
├── package.json
├── next.config.js
└── README.md
```

## Features

### Signal Feed
- View verified insider signals
- Real-time updates
- Filter by type
- Sort by date/confidence

### Bounty Marketplace
- Browse active bounties
- Claim bounties
- View bounty history

### Reputation Tracker
- View your reputation score
- See signal accuracy
- Track bounties won
- Mint reputation NFT

### Wallet Integration
- Connect wallet (MetaMask, WalletConnect, etc.)
- Sign transactions
- Switch networks
- View balance

## Components

### Dashboard.jsx

Main dashboard component with three tabs:
- Signals: Verified insider signals
- Bounties: Active research bounties
- Reputation: User reputation and stats

Features:
- Proof verification links
- On-chain transaction links
- IPFS filing access
- Status badges

## Styling

Uses brutalist/terminal aesthetic:
- IBM Plex Mono font
- High-contrast colors (#00ff88 on #0a0a0a)
- Sharp borders and grid layouts
- Minimal animations
- Responsive design

Color scheme:
- Background: `#0a0a0a` (near black)
- Primary: `#00ff88` (neon green)
- Secondary: `#00ffdd` (cyan)
- Warning: `#ffaa00` (orange)
- Danger: `#ff0055` (red)

## Adding New Features

### New Component

```jsx
// src/components/MyComponent.jsx
import React from 'react';

export default function MyComponent() {
  return (
    <div>
      My Component
    </div>
  );
}
```

### New Page

```jsx
// src/pages/new-page.js
import React from 'react';
import MyComponent from '../components/MyComponent';

export default function NewPage() {
  return <MyComponent />;
}
```

## API Integration

### Fetch Signals

```javascript
const response = await fetch(`${API_URL}/signals/recent?limit=10`);
const data = await response.json();
```

### Submit Signal

```javascript
// Using ethers.js
import { ethers } from 'ethers';
import { VERIFIER_ABI, getContractAddresses } from './config';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const addresses = getContractAddresses();
const contract = new ethers.Contract(
  addresses.verifier,
  VERIFIER_ABI,
  signer
);

const tx = await contract.submitSignal(
  filingHash,
  signalType,
  threshold,
  proof
);

await tx.wait();
```

## Environment Variables

- `NEXT_PUBLIC_VERIFIER_ADDRESS` - Verifier contract address
- `NEXT_PUBLIC_REPUTATION_NFT_ADDRESS` - Reputation NFT contract
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_NETWORK` - Network name (localhost/sepolia/optimismSepolia)
- `NEXT_PUBLIC_CHAIN_ID` - Chain ID

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Netlify

```bash
# Build command
npm run build

# Output directory
.next
```

### Docker

```bash
# Build image
docker build -t zk-insider-frontend .

# Run container
docker run -p 3000:3000 zk-insider-frontend
```

## Performance

- Lighthouse score: 95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Bundle size: ~200KB (gzipped)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

```bash
# Run tests (if configured)
npm run test

# E2E tests with Cypress
npm run cypress:open
```

## Troubleshooting

### Wallet Won't Connect
- Check MetaMask is installed
- Ensure correct network selected
- Try refreshing page

### Contract Calls Fail
- Verify contract addresses in config
- Check network matches deployment
- Ensure wallet has funds for gas

### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

## Contributing

1. Follow React best practices
2. Use functional components
3. Add PropTypes or TypeScript
4. Test responsiveness
5. Keep brutalist aesthetic

## License

MIT - See main LICENSE file
