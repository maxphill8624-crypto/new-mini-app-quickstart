# 🚀 Quick Start Guide

## Installation (2 minutes)

```bash
# 1. Navigate to the project directory
cd polymarket_monitor

# 2. Create virtual environment
python3 -m venv venv

# 3. Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. (Optional) Get free PolygonScan API key
# Visit: https://polygonscan.com/apis
# Then create .env file:
cp .env.example .env
# Edit .env and add your key
```

## Run Your First Scan (1 minute)

```bash
# Single scan of all markets
python main.py --mode single

# Or monitor a specific market
python main.py --mode single --market "presidential-election-winner-2024"
```

## Expected Output

If anomalies are found, you'll see colorful alerts like:

```
================================================================================
🚨 ANOMALY DETECTED - SEVERITY: HIGH
================================================================================

Timestamp: 2026-01-03T15:30:45
Market: Will Maduro be out of office by January 31?
Wallet: 0x1234...5678
  - Age: 5 days
  - Transactions: 3

Trade Details:
  - Value: $35,420.00

Anomaly Reasons:
  1. NEW WALLET (age: 5 days) placing LARGE BET ($35,420.00)
  2. LARGE BET in NICHE market (market volume: $12,340.00)
```

## Set Up Automation (Optional)

### Hourly Monitoring via Cron

```bash
cd scripts
./setup_cron.sh
```

Done! Now it runs every hour automatically.

## Customization

Edit `config.py` to adjust detection thresholds:

```python
# Example: Make it more sensitive
LARGE_BET_THRESHOLD = 5000  # Flag bets over $5k instead of $10k
NEW_WALLET_DAYS = 60  # Flag wallets under 60 days instead of 30
```

## What's Next?

- **Continuous monitoring**: `python main.py --mode continuous`
- **Enable email alerts**: Edit `.env` with your email settings
- **Review logs**: Check `polymarket_alerts.log` for details

## Troubleshooting

**No markets found?**
- Check your internet connection
- The script needs outbound HTTPS access

**Want more/fewer alerts?**
- Adjust thresholds in `config.py`
- Lower numbers = more sensitive = more alerts

**Need help?**
- See full README.md for detailed documentation
- Check log files for error details

---

That's it! You're monitoring Polymarket for insider trading signals. 🎯
