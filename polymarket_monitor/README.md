# 🔍 Polymarket Insider Trading Detector

A Python tool that monitors Polymarket prediction markets for potential insider trading signals by detecting anomalous trading patterns from suspicious wallets.

## 🎯 Overview

This tool helps identify potentially suspicious trading activity on Polymarket by monitoring for:

- **New wallets** (created recently) making large bets
- **Low-activity wallets** suddenly placing significant positions
- **Large bets in niche/low-liquidity markets**
- **Unusual concentration** of market shares by single wallets
- **Activity spikes** from previously dormant wallets

**Example Detection**: A wallet with minimal history places ~$35k on a political event at low odds, then the market resolves favorably for a $442k profit (like the Venezuela Maduro case).

## 📊 Features

- ✅ **100% Free**: Uses Polymarket's public API and free PolygonScan API
- ✅ **No Authentication Required**: Monitor markets without API keys (optional PolygonScan key enhances features)
- ✅ **Real-time Monitoring**: Continuous or scheduled periodic scans
- ✅ **Multi-Channel Alerts**: Console output, log files, and optional email notifications
- ✅ **Blockchain Integration**: Checks wallet age and activity via Polygon blockchain
- ✅ **Configurable Thresholds**: Customize detection parameters
- ✅ **Rate Limit Handling**: Automatic retry logic and rate limiting
- ✅ **Easy Automation**: Cron job and systemd service templates included

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Polymarket Monitor                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────┐      ┌──────────────┐      ┌────────────────┐ │
│  │ Polymarket │      │  PolygonScan │      │    Anomaly     │ │
│  │    API     │─────▶│     API      │─────▶│   Detector     │ │
│  │  Client    │      │   Client     │      │                │ │
│  └────────────┘      └──────────────┘      └────────┬───────┘ │
│        │                    │                        │         │
│        │                    │                        │         │
│        ▼                    ▼                        ▼         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Alert System                                │ │
│  │  • Console Output  • Log Files  • Email Alerts          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Data Flow: Markets → Trades → Wallet Analysis → Anomaly Detection → Alerts
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Internet connection

### Installation

1. **Clone or download this directory**:
   ```bash
   cd polymarket_monitor
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** (optional but recommended):
   ```bash
   cp .env.example .env
   # Edit .env and add your PolygonScan API key
   ```

   Get a free PolygonScan API key at: https://polygonscan.com/apis

### Running the Monitor

#### Single Scan (Monitor Once)

```bash
python main.py --mode single
```

This will scan all active markets once and report any anomalies.

#### Continuous Monitoring

```bash
python main.py --mode continuous --interval 3600
```

This runs continuously, scanning every hour (3600 seconds).

#### Monitor Specific Market

```bash
python main.py --mode single --market "will-maduro-be-out-by-january-31"
```

#### Enable Debug Logging

```bash
python main.py --mode single --debug
```

## ⚙️ Configuration

Edit `config.py` to customize detection parameters:

### Detection Thresholds

```python
# Wallet age thresholds
NEW_WALLET_DAYS = 30  # Flag wallets created within last 30 days
LOW_ACTIVITY_TX_COUNT = 10  # Flag wallets with < 10 transactions

# Bet size thresholds (USD)
LARGE_BET_THRESHOLD = 10000  # Flag bets over $10k
VERY_LARGE_BET_THRESHOLD = 50000  # High priority over $50k

# Market liquidity thresholds (USD)
LOW_LIQUIDITY_VOLUME = 50000  # Markets with < $50k volume
NICHE_MARKET_VOLUME = 10000  # Very niche markets < $10k volume

# Activity spike detection
SPIKE_MULTIPLIER = 5  # Flag if current activity is 5x average

# Position concentration
HIGH_CONCENTRATION_PCT = 10  # Flag if wallet holds >10% of market
```

### Monitoring Settings

```python
# Check interval for continuous mode (seconds)
CHECK_INTERVAL = 3600  # 1 hour

# Monitor all markets or specific ones
MONITOR_ALL_MARKETS = True
SPECIFIC_MARKET_IDS = []  # Add condition IDs if MONITOR_ALL_MARKETS=False

# Trade lookback window (hours)
TRADE_LOOKBACK_HOURS = 24  # Analyze last 24 hours

# Logging
LOG_FILE = "polymarket_alerts.log"
CONSOLE_OUTPUT = True
```

## 🤖 Automation

### Option 1: Cron Job (Linux/Mac)

Run the monitor every hour automatically:

```bash
cd scripts
chmod +x setup_cron.sh run_hourly.sh
./setup_cron.sh
```

To check the cron job:
```bash
crontab -l
```

To remove:
```bash
crontab -e
# Delete the line with run_hourly.sh
```

### Option 2: Systemd Service (Linux)

For always-on monitoring that starts with your system:

1. **Edit the service file**:
   ```bash
   nano scripts/polymarket-monitor.service
   ```

   Update these fields:
   - `User=yourusername` → your Linux username
   - `/path/to/polymarket_monitor` → full path to this directory (appears 3 times)

2. **Install the service**:
   ```bash
   sudo cp scripts/polymarket-monitor.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable polymarket-monitor
   sudo systemctl start polymarket-monitor
   ```

3. **Check status**:
   ```bash
   sudo systemctl status polymarket-monitor
   ```

4. **View logs**:
   ```bash
   journalctl -u polymarket-monitor -f
   ```

### Option 3: Manual Continuous Mode

Simply run in continuous mode in a terminal:

```bash
python main.py --mode continuous
```

Or use `nohup` to run in background:

```bash
nohup python main.py --mode continuous > monitor.out 2>&1 &
```

## 📧 Email Alerts (Optional)

To enable email notifications when anomalies are detected:

1. **Edit `.env` file**:
   ```bash
   EMAIL_FROM=your-email@gmail.com
   EMAIL_TO=recipient@example.com
   EMAIL_PASSWORD=your-app-specific-password
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   ```

2. **For Gmail**: Generate an App Password at https://myaccount.google.com/apppasswords

3. **Enable in config.py**:
   ```python
   EMAIL_ALERTS = True
   ```

## 📋 Example Output

When an anomaly is detected, you'll see output like:

```
================================================================================
🚨 ANOMALY DETECTED - SEVERITY: HIGH
================================================================================

Timestamp: 2026-01-03T15:30:45
Market: Will Maduro be out of office by January 31?
Market URL: https://polymarket.com/event/will-maduro-be-out-by-january-31

Wallet: 0x1234...5678
  - Age: 5 days
  - Transactions: 3
  - Is New: True
  - Low Activity: True

Trade Details:
  - Value: $35,420.00
  - Side: BUY
  - Price: 0.08
  - Size: 442750

Market Stats:
  - Volume: $12,340.00
  - Liquidity: $8,500.00

Anomaly Reasons:
  1. NEW WALLET (age: 5 days) placing LARGE BET ($35,420.00)
  2. LOW ACTIVITY WALLET (3 txs) placing LARGE BET ($35,420.00)
  3. LARGE BET in NICHE market (market volume: $12,340.00)

================================================================================
```

## 📁 Project Structure

```
polymarket_monitor/
├── main.py                 # Main orchestrator and entry point
├── config.py               # Configuration settings
├── polymarket_api.py       # API clients for Polymarket and PolygonScan
├── anomaly_detector.py     # Anomaly detection logic
├── alerting.py             # Alert system (console, file, email)
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variable template
├── README.md               # This file
├── scripts/
│   ├── run_hourly.sh       # Hourly cron script
│   ├── setup_cron.sh       # Cron installation script
│   └── polymarket-monitor.service  # Systemd service file
└── __init__.py
```

## 🔍 How It Works

1. **Market Fetching**: Retrieves active markets from Polymarket's Gamma API
2. **Trade Analysis**: Gets recent trades for each market via Data API
3. **Wallet Profiling**: Queries PolygonScan to determine wallet age and transaction count
4. **Anomaly Detection**: Applies multiple detection algorithms:
   - New wallet + large bet
   - Low activity wallet + large bet
   - Large bet in low-liquidity market
   - Sudden activity spikes
   - High market concentration
5. **Alert Generation**: Creates detailed alerts with severity levels (CRITICAL, HIGH, MEDIUM, LOW)
6. **Multi-Channel Output**: Displays in console, logs to file, optionally emails

## 🛠️ API Endpoints Used

### Polymarket APIs (Free, No Auth)
- **Gamma API**: `https://gamma-api.polymarket.com/markets` - Market data
- **Data API**: `https://data-api.polymarket.com/trades` - Trade history
- **CLOB API**: `https://clob.polymarket.com/trades` - Order book trades

### PolygonScan API (Free tier available)
- `https://api.polygonscan.com/api` - Wallet transaction history and age

## 📊 Rate Limits

- **Polymarket**: 1,000 requests/hour (free tier) - script stays well under this
- **PolygonScan**: 5 requests/second (free tier) - script includes rate limiting

## ⚠️ Limitations & Considerations

1. **API Rate Limits**: Script includes automatic rate limiting, but heavy usage may hit limits
2. **Historical Data**: Only analyzes recent trades (configurable lookback window)
3. **Wallet Privacy**: Only analyzes publicly visible on-chain data
4. **False Positives**: Anomalies don't guarantee insider trading - use as screening tool
5. **Market Coverage**: Monitors active markets; closed markets are excluded by default

## 🧪 Testing

To test with a specific market:

```bash
# Test with a known market
python main.py --mode single --market "presidential-election-winner-2024" --debug
```

## 🐛 Troubleshooting

### No trades found
- Check that markets are active and have recent trading activity
- Increase `TRADE_LOOKBACK_HOURS` in config

### PolygonScan API errors
- Verify your API key is correctly set in `.env`
- Check rate limits haven't been exceeded
- Ensure wallet addresses are valid Polygon addresses

### Import errors
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

### No anomalies detected
- Lower detection thresholds in `config.py`
- Enable debug mode: `--debug`
- Check log files for details

## 📝 Logs

- **Alert Log**: `polymarket_alerts.log` - Detailed anomaly alerts
- **System Log**: `polymarket_monitor.log` - System operations and errors
- **Cron Log**: `polymarket_cron.log` - Cron job execution (if using cron)

## 🔐 Security & Privacy

- All data analyzed is publicly available on Polymarket and Polygon blockchain
- No private keys or wallet signatures required
- Script is read-only and does not execute any trades
- Email credentials (if used) stored locally in `.env`

## 📚 Resources

- **Polymarket Documentation**: https://docs.polymarket.com/
- **PolygonScan API Docs**: https://docs.polygonscan.com/
- **Polymarket CLOB API**: https://docs.polymarket.com/developers/CLOB/introduction
- **Gamma Markets API**: https://docs.polymarket.com/developers/gamma-markets-api/fetch-markets-guide

## 🤝 Contributing

Feel free to:
- Report issues or bugs
- Suggest improvements
- Add new detection algorithms
- Enhance alert formats

## ⚖️ Legal Disclaimer

This tool is for educational and research purposes only. Detection of anomalous trading patterns does not constitute proof of insider trading or any illegal activity. Always conduct your own research and due diligence. The authors are not responsible for any trading decisions made based on this tool's output.

## 📜 License

MIT License - Free to use, modify, and distribute.

---

**Built with ❤️ for transparent prediction markets**

For questions or support, please open an issue on GitHub.
