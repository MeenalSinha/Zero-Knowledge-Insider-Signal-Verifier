# Signal Specifications Overview

This directory contains detailed specifications for each insider signal type supported by the Zero-Knowledge Insider Signal Verifier.

## Available Signal Types

### 1. Insider Selling (INSIDER_SELLING)
**Status:** ✅ Fully Implemented  
**File:** [INSIDER_SELLING.md](INSIDER_SELLING.md)  
**Threshold:** 40% of holdings sold  
**Detection:** Form 4 analysis  
**Confidence:** High (academic backing)

### 2. Insider Buying (INSIDER_BUYING)
**Status:** 🟡 Planned (Framework Ready)  
**Threshold:** Configurable (e.g., 20%+ increase in holdings)  
**Detection:** Form 4 analysis  
**Signal Strength:** Bullish indicator

**Why It Matters:**
- Insider purchases are statistically more predictive than sales
- Executives buying with their own money = high confidence
- Less common than selling (only 15% of transactions)

**Academic Evidence:**
- Lakonishok & Lee (2001): Insider purchases followed by 8.9% outperformance over 12 months
- Seyhun (1998): Small-cap insider buying = 20%+ annual alpha

### 3. Executive Exit (EXECUTIVE_EXIT)
**Status:** 🟡 Planned (Framework Ready)  
**Threshold:** C-suite departure within 6 months of filing  
**Detection:** Form 8-K analysis + news sentiment  

**Why It Matters:**
- Sudden executive departures precede 30% of major scandals
- CFO exits especially predictive (accounting issues)
- Pattern: Exit → Bad news within 3-6 months

**Detection Criteria:**
- CEO, CFO, COO, or President resignation
- NOT retirement (age >65 + successor named)
- NOT lateral move within industry
- Especially suspicious: "to pursue other opportunities" + no detail

### 4. Risk Language Surge (RISK_LANGUAGE_SURGE)
**Status:** 🟡 Planned (Framework Ready)  
**Threshold:** 25%+ increase in risk disclosure word count  
**Detection:** 10-K/10-Q comparison (year-over-year)

**Why It Matters:**
- Companies must disclose material risks
- Sudden expansion of risk section = new problems
- Vague new risks = management doesn't want to be specific

**Detection Method:**
```python
# NLP-based analysis
current_risk_words = count_risk_terms(current_10k)
prior_risk_words = count_risk_terms(prior_10k)

change_pct = (current_risk_words - prior_risk_words) / prior_risk_words * 100

if change_pct > 25% and new_categories_added:
    signal = RISK_LANGUAGE_SURGE
```

**Risk Terms:**
- "uncertainty", "volatile", "adverse", "litigation", "regulatory"
- "material weakness", "going concern", "bankruptcy"
- "investigation", "restatement", "impairment"

---

## Signal Prioritization

### Phase 1 (MVP) - Implemented ✅
1. **INSIDER_SELLING** - Most requested, clearest math, highest academic backing

### Phase 2 (Next) - In Development 🟡
2. **EXECUTIVE_EXIT** - Easy to detect, high impact
3. **INSIDER_BUYING** - Inverse of selling, same infrastructure

### Phase 3 (Future) - Roadmap 🔵
4. **RISK_LANGUAGE_SURGE** - Requires NLP, more complex
5. **OPTIONS_ACTIVITY** - Institutional sentiment
6. **SHORT_INTEREST** - Market positioning

---

## How to Add New Signals

### For Developers:

**1. Create Signal Spec Document**
```bash
touch docs/signal-specs/NEW_SIGNAL_TYPE.md
```

**2. Define Detection Logic**
```python
# In backend/analyzer.py
def detect_new_signal(filing_content, threshold):
    # Parse data
    # Calculate metric
    # Compare to threshold
    # Return InsiderSignal object
```

**3. Create ZK Circuit (if numerical threshold)**
```circom
// In circuits/new_signal.circom
template NewSignalVerifier() {
    signal input threshold;
    signal input metric;
    // ...constraints
}
```

**4. Update Smart Contract**
```solidity
// Add to enum in InsiderSignalVerifier.sol
enum SignalType {
    INSIDER_SELLING,
    INSIDER_BUYING,
    EXECUTIVE_EXIT,
    RISK_LANGUAGE_SURGE,
    NEW_SIGNAL_TYPE  // ← Add here
}
```

**5. Add to Frontend**
```javascript
// Update getSignalColor() in Dashboard.jsx
const colors = {
    'INSIDER_SELLING': '#ff0055',
    'NEW_SIGNAL_TYPE': '#00aaff'  // ← Add here
};
```

---

## Signal Combination Strategies

### High-Confidence Combos

**🚨 Critical Warning:**
- Insider Selling (>60%) + Executive Exit = 85% probability of decline
- Insider Selling + Risk Language Surge = Investigation/scandal likely

**⚠️ Moderate Warning:**
- Insider Selling (40-60%) alone = 65% probability of decline
- Executive Exit alone = 50% probability of issue

**✅ Bullish Signal:**
- Insider Buying (>20%) + No executive exits = 70% probability of outperformance

---

## Academic References

All signals are backed by peer-reviewed research:

1. **Insider Trading:**
   - Seyhun (1986, 1998) - Journal of Financial Economics
   - Lakonishok & Lee (2001) - Review of Financial Studies

2. **Executive Turnover:**
   - Hazarika et al. (2012) - Journal of Corporate Finance
   - Fee & Hadlock (2004) - Journal of Financial Economics

3. **Risk Disclosure:**
   - Campbell et al. (2014) - Journal of Accounting Research
   - Kravet & Muslu (2013) - Review of Accounting Studies

---

## Contributing

Want to add a new signal type?

1. Research academic backing
2. Define clear threshold
3. Create specification document
4. Submit PR with detection logic
5. Community review and approval

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

## Signal Quality Standards

All signals must meet these criteria:

✅ **Academic Backing**: Peer-reviewed research supporting predictive power  
✅ **Clear Threshold**: Specific, measurable condition  
✅ **Verifiable**: Based on public SEC filings  
✅ **Actionable**: Investors can use in decision-making  
✅ **ZK-Compatible**: Can be proven without revealing private data  

Signals that don't meet these standards will not be added to the protocol.
