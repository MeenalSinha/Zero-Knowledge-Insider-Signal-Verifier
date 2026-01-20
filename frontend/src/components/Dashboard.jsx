import React, { useState, useEffect } from 'react';

// Zero-Knowledge Insider Signal Verifier Dashboard
// Distinctive brutalist/terminal aesthetic with high-contrast design

const ZKInsiderDashboard = () => {
  const [signals, setSignals] = useState([]);
  const [bounties, setBounties] = useState([]);
  const [stats, setStats] = useState({
    totalSignals: 0,
    totalResearchers: 0,
    totalBounties: 0
  });
  const [selectedTab, setSelectedTab] = useState('signals');
  const [connectWallet, setConnectWallet] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    setSignals([
      {
        id: '0x1a2b',
        company: 'TechCorp Inc.',
        symbol: 'TECH',
        type: 'INSIDER_SELLING',
        threshold: 45.2,
        verified: true,
        timestamp: '2025-01-15T10:30:00Z',
        researcher: '0x742d...5e4f',
        confidence: 0.87
      },
      {
        id: '0x2b3c',
        company: 'BioHealth Ltd.',
        symbol: 'BIOH',
        type: 'EXECUTIVE_EXIT',
        threshold: 100,
        verified: true,
        timestamp: '2025-01-14T15:20:00Z',
        researcher: '0x8c3a...9d2b',
        confidence: 0.94
      },
      {
        id: '0x3c4d',
        company: 'FinanceGlobal',
        symbol: 'FING',
        type: 'INSIDER_SELLING',
        threshold: 52.8,
        verified: true,
        timestamp: '2025-01-13T09:45:00Z',
        researcher: '0x4f5e...3a1c',
        confidence: 0.91
      }
    ]);

    setBounties([
      {
        id: 1,
        company: 'CryptoBank Corp',
        symbol: 'CBNK',
        reward: '5.0 ETH',
        status: 'active',
        deadline: '2025-02-01'
      },
      {
        id: 2,
        company: 'AI Robotics Inc',
        symbol: 'AIRO',
        reward: '3.5 ETH',
        status: 'active',
        deadline: '2025-01-28'
      }
    ]);

    setStats({
      totalSignals: 127,
      totalResearchers: 43,
      totalBounties: 18
    });
  }, []);

  const getSignalColor = (type) => {
    const colors = {
      'INSIDER_SELLING': '#ff0055',
      'INSIDER_BUYING': '#00ff88',
      'EXECUTIVE_EXIT': '#ffaa00',
      'RISK_LANGUAGE_SURGE': '#ff5500'
    };
    return colors[type] || '#ffffff';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e0e0e0',
      fontFamily: '"IBM Plex Mono", "Courier New", monospace',
      padding: 0,
      margin: 0
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '3px solid #00ff88',
        padding: '2rem',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                margin: 0,
                fontWeight: 900,
                letterSpacing: '-0.05em',
                background: 'linear-gradient(135deg, #00ff88 0%, #00ffdd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'uppercase'
              }}>
                ZK_INSIDER_VERIFY
              </h1>
              <p style={{
                margin: '0.5rem 0 0 0',
                color: '#888',
                fontSize: '0.9rem',
                letterSpacing: '0.1em'
              }}>
                ZERO-KNOWLEDGE PROOF VERIFICATION SYSTEM
              </p>
            </div>
            <button
              onClick={() => setConnectWallet(!connectWallet)}
              style={{
                padding: '0.75rem 2rem',
                background: connectWallet ? '#00ff88' : 'transparent',
                color: connectWallet ? '#0a0a0a' : '#00ff88',
                border: '2px solid #00ff88',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!connectWallet) {
                  e.target.style.background = '#00ff8810';
                }
              }}
              onMouseLeave={(e) => {
                if (!connectWallet) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {connectWallet ? 'CONNECTED: 0x742d...5e4f' : 'CONNECT_WALLET'}
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{
        background: '#111111',
        borderBottom: '1px solid #222',
        padding: '1.5rem 2rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { label: 'SIGNALS_VERIFIED', value: stats.totalSignals, color: '#00ff88' },
            { label: 'RESEARCHERS', value: stats.totalResearchers, color: '#00ffdd' },
            { label: 'ACTIVE_BOUNTIES', value: stats.totalBounties, color: '#ffaa00' }
          ].map((stat, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: stat.color,
                marginBottom: '0.25rem'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: '#666',
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #222'
        }}>
          {['signals', 'bounties', 'reputation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                color: selectedTab === tab ? '#00ff88' : '#666',
                border: 'none',
                borderBottom: selectedTab === tab ? '2px solid #00ff88' : '2px solid transparent',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '-2px',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Signals Tab */}
        {selectedTab === 'signals' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                margin: 0,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                VERIFIED_SIGNALS
              </h2>
              <div style={{
                padding: '0.5rem 1rem',
                background: '#00ff8810',
                border: '1px solid #00ff88',
                fontSize: '0.8rem',
                color: '#00ff88',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                ✓ ZK_VERIFIED
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {signals.map((signal) => (
                <div
                  key={signal.id}
                  style={{
                    background: '#111111',
                    border: `2px solid ${getSignalColor(signal.type)}`,
                    padding: '1.5rem',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ffffff';
                    e.currentTarget.style.boxShadow = `0 0 20px ${getSignalColor(signal.type)}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = getSignalColor(signal.type);
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Signal Type Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '1rem',
                    padding: '0.5rem 1rem',
                    background: getSignalColor(signal.type),
                    color: '#0a0a0a',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>
                    {signal.type.replace('_', ' ')}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '2rem' }}>
                    <div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        color: '#ffffff'
                      }}>
                        {signal.company} ({signal.symbol})
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#888',
                        fontFamily: 'inherit'
                      }}>
                        Signal ID: {signal.id}
                      </div>
                      {/* Proof Status Badge */}
                      <div style={{
                        marginTop: '0.5rem',
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: '#00ff8810',
                        border: '1px solid #00ff88',
                        fontSize: '0.65rem',
                        color: '#00ff88',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                      }}>
                        ✓ FINALIZED
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#666',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                      }}>
                        Threshold
                      </div>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        color: getSignalColor(signal.type)
                      }}>
                        {signal.threshold.toFixed(1)}%
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#666',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                      }}>
                        Confidence
                      </div>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        color: '#00ff88'
                      }}>
                        {(signal.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #222',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#666'
                  }}>
                    <span>Researcher: {signal.researcher}</span>
                    <span>{new Date(signal.timestamp).toLocaleString()}</span>
                  </div>

                  {/* Proof Verification Section */}
                  <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: 'transparent',
                      color: '#00ff88',
                      border: '1px solid #00ff88',
                      fontSize: '0.7rem',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#00ff8820';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                    }}>
                      📋 View Proof
                    </button>
                    <button style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: 'transparent',
                      color: '#00ffdd',
                      border: '1px solid #00ffdd',
                      fontSize: '0.7rem',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#00ffdd20';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                    }}
                    onClick={() => window.open(`https://sepolia-optimism.etherscan.io/tx/${signal.id}`, '_blank')}>
                      ⛓️ View On-Chain
                    </button>
                    <button style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: 'transparent',
                      color: '#ffaa00',
                      border: '1px solid #ffaa00',
                      fontSize: '0.7rem',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#ffaa0020';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                    }}
                    onClick={() => window.open(`https://ipfs.io/ipfs/${signal.id}`, '_blank')}>
                      📁 View Filing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bounties Tab */}
        {selectedTab === 'bounties' && (
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '2rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              ACTIVE_BOUNTIES
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {bounties.map((bounty) => (
                <div
                  key={bounty.id}
                  style={{
                    background: '#111111',
                    border: '2px solid #ffaa00',
                    padding: '2rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#ffaa00';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: '#ffffff'
                  }}>
                    {bounty.company}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#888',
                    marginBottom: '1.5rem'
                  }}>
                    Symbol: {bounty.symbol}
                  </div>
                  
                  <div style={{
                    padding: '1rem',
                    background: '#ffaa0010',
                    border: '1px solid #ffaa00',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#ffaa00',
                      marginBottom: '0.25rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>
                      Reward
                    </div>
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: 900,
                      color: '#ffaa00'
                    }}>
                      {bounty.reward}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    marginBottom: '1rem'
                  }}>
                    Deadline: {bounty.deadline}
                  </div>

                  <button style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'transparent',
                    color: '#ffaa00',
                    border: '2px solid #ffaa00',
                    fontFamily: 'inherit',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#ffaa00';
                    e.target.style.color = '#0a0a0a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#ffaa00';
                  }}>
                    CLAIM_BOUNTY
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reputation Tab */}
        {selectedTab === 'reputation' && (
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '2rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              RESEARCHER_REPUTATION
            </h2>

            <div style={{
              background: '#111111',
              border: '2px solid #00ffdd',
              padding: '2rem'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  fontSize: '4rem',
                  fontWeight: 900,
                  color: '#00ffdd',
                  marginBottom: '0.5rem'
                }}>
                  847
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  REPUTATION_SCORE
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem',
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid #222'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#00ff88' }}>
                    94%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.25rem' }}>
                    ACCURACY
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#00ffdd' }}>
                    23
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.25rem' }}>
                    SIGNALS
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffaa00' }}>
                    5
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.25rem' }}>
                    BOUNTIES
                  </div>
                </div>
              </div>

              <button style={{
                width: '100%',
                marginTop: '2rem',
                padding: '1rem',
                background: 'transparent',
                color: '#00ffdd',
                border: '2px solid #00ffdd',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#00ffdd';
                e.target.style.color = '#0a0a0a';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#00ffdd';
              }}>
                MINT_REPUTATION_NFT
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #222',
        padding: '2rem',
        marginTop: '4rem',
        textAlign: 'center',
        color: '#666',
        fontSize: '0.8rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1rem' }}>
            ZERO-KNOWLEDGE PROOF VERIFICATION • ETHEREUM L2 • IPFS STORAGE
          </div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
            © 2025 ZK INSIDER VERIFIER • TRUSTLESS • TRANSPARENT • DECENTRALIZED
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ZKInsiderDashboard;
