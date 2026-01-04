# 📚 Usage Examples

## Example 1: Basic Single Scan

**Command:**
```bash
python main.py --mode single
```

**What it does:**
- Scans all active Polymarket markets
- Analyzes recent trades (last 24 hours by default)
- Reports any anomalous patterns
- Saves alerts to `polymarket_alerts.log`

**Use case:** Quick check for suspicious activity

---

## Example 2: Monitor Specific Market

**Command:**
```bash
python main.py --mode single --market "will-maduro-be-out-by-january-31"
```

**What it does:**
- Focuses on one specific market only
- Deeper analysis with more context
- Useful when you know which market to watch

**Use case:** Following up on a specific event or tip

---

## Example 3: Continuous Monitoring

**Command:**
```bash
python main.py --mode continuous --interval 3600
```

**What it does:**
- Runs forever, scanning every hour (3600 seconds)
- Automatically handles errors and retries
- Perfect for long-term monitoring

**Use case:** Always-on surveillance for your machine

---

## Example 4: High-Frequency Monitoring

**Command:**
```bash
python main.py --mode continuous --interval 900
```

**What it does:**
- Scans every 15 minutes (900 seconds)
- More likely to catch early signals
- Uses more API quota

**Use case:** Important events or high-value markets

---

## Example 5: Debug Mode

**Command:**
```bash
python main.py --mode single --debug
```

**What it does:**
- Shows detailed logging
- Helps troubleshoot issues
- See exactly what the script is doing

**Use case:** Testing, troubleshooting, or learning

---

## Example 6: Background Running

**Command:**
```bash
nohup python main.py --mode continuous > monitor.out 2>&1 &
```

**What it does:**
- Runs in background even if you logout
- Output goes to `monitor.out`
- Won't stop if terminal closes

**Use case:** Running on a server or VPS

---

## Example 7: Automated Hourly via Cron

**Setup:**
```bash
cd scripts
./setup_cron.sh
```

**What it does:**
- Runs automatically every hour at :00 minutes
- Survives reboots
- Logs to `polymarket_cron.log`

**Use case:** Set-and-forget automated monitoring

---

## Example 8: Custom Configuration

**Edit config.py:**
```python
# Make it VERY sensitive
LARGE_BET_THRESHOLD = 1000  # Flag $1k+ bets
NEW_WALLET_DAYS = 90  # Flag wallets under 3 months
SPIKE_MULTIPLIER = 2  # Flag 2x activity increases
```

**Command:**
```bash
python main.py --mode single
```

**Use case:** Research mode - catch everything

---

## Example 9: Email Alerts

**Edit .env:**
```bash
EMAIL_ALERTS=true
EMAIL_FROM=alerts@yourdomain.com
EMAIL_TO=you@example.com
EMAIL_PASSWORD=your-app-password
```

**Edit config.py:**
```python
EMAIL_ALERTS = True
```

**Command:**
```bash
python main.py --mode continuous
```

**Use case:** Get notified immediately on your phone

---

## Example 10: Research Mode (Conservative)

**Edit config.py:**
```python
# Only flag VERY suspicious activity
LARGE_BET_THRESHOLD = 100000  # Only $100k+ bets
VERY_LARGE_BET_THRESHOLD = 500000  # Critical at $500k+
NEW_WALLET_DAYS = 7  # Only brand new wallets
```

**Use case:** Reduce false positives, only critical alerts

---

## Combining Options

You can combine multiple flags:

```bash
python main.py --mode continuous --interval 1800 --debug
```

This runs continuously, every 30 minutes, with debug output.

---

## Real-World Scenario: Presidential Election

**Goal:** Monitor election prediction markets for insider trading

**Steps:**

1. **Find the market slug** (from Polymarket URL)
   - URL: `https://polymarket.com/event/presidential-election-winner-2024`
   - Slug: `presidential-election-winner-2024`

2. **Run focused monitoring:**
   ```bash
   python main.py --mode single --market "presidential-election-winner-2024"
   ```

3. **Set up hourly monitoring:**
   ```bash
   # Edit scripts/run_hourly.sh and add the --market flag
   nano scripts/run_hourly.sh

   # Change the line to:
   python main.py --mode single --market "presidential-election-winner-2024"

   # Install cron job
   cd scripts && ./setup_cron.sh
   ```

4. **Check results:**
   ```bash
   tail -f polymarket_alerts.log
   ```

---

## Viewing Results

### Console Output
Color-coded alerts displayed in terminal

### Log Files
```bash
# View all alerts
cat polymarket_alerts.log

# Watch in real-time
tail -f polymarket_alerts.log

# Count alerts by severity
grep "CRITICAL" polymarket_alerts.log | wc -l
grep "HIGH" polymarket_alerts.log | wc -l
```

### Email
Delivered to your inbox when enabled

---

## Tips

1. **Start conservatively**: Use default settings first, then adjust
2. **Monitor logs**: Check logs regularly to tune thresholds
3. **Specific markets**: Focus on high-value markets for better signal/noise
4. **PolygonScan API key**: Get one! It's free and enhances wallet analysis
5. **Rate limits**: Don't set interval below 300 seconds (5 min) to stay under limits
6. **Test first**: Run `--mode single` before setting up automation

---

## Next Steps

- Read the full README.md for advanced configuration
- Join the discussion: share interesting findings
- Contribute: improve detection algorithms
