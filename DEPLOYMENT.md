# Deployment Guide - Polymarket Prediction Bot

This guide will help you run the bot in your local environment or deploy it to production.

## 🏠 Running Locally (Recommended for Testing)

### Prerequisites
- Node.js 18+ installed
- Git installed
- A Polygon wallet with USDC
- (Optional) Anthropic API key for AI features

### Step 1: Clone the Repository

```bash
# Clone your repository
git clone https://github.com/maxphill8624-crypto/new-mini-app-quickstart.git
cd new-mini-app-quickstart

# Or if you already have it, just navigate to the directory
cd path/to/new-mini-app-quickstart
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
cp .env.bot.example .env.local
```

Then edit `.env.local`:

```env
# REQUIRED - Your wallet private key (starts with 0x)
POLYMARKET_PRIVATE_KEY=0xyour_private_key_here

# OPTIONAL - For AI predictions
AI_ENABLED=true
ANTHROPIC_API_KEY=sk-ant-your_key_here

# Trading Configuration (adjust as needed)
MAX_POSITION_SIZE=10
MAX_CONCURRENT_TRADES=3
MIN_LIQUIDITY=1000

# Risk Management
STOP_LOSS_PERCENTAGE=10
TAKE_PROFIT_PERCENTAGE=20
MAX_SLIPPAGE=5
MAX_HOLDING_TIME=24
```

**⚠️ SECURITY: Never commit `.env.local` to git!**

### Step 4A: Run the Bot (Command Line)

```bash
npm run bot
```

This will start the trading bot in your terminal.

### Step 4B: Run with Dashboard (Recommended)

```bash
npm run dev
```

Then open your browser and go to:
**http://localhost:3000/bot**

You'll see:
- Real-time metrics
- Active positions
- Start/Stop controls
- Strategy status
- Auto-updates every 5 seconds

## 🚀 Deploying to Production

### Option 1: Deploy to Vercel (Dashboard Only)

The dashboard can be deployed to Vercel for remote monitoring:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Go to: vercel.com -> Your Project -> Settings -> Environment Variables
# Add: POLYMARKET_PRIVATE_KEY, ANTHROPIC_API_KEY, etc.
```

**Note:** The bot itself (command-line trading) should run on a server, not Vercel.

### Option 2: Deploy Bot to VPS/Cloud Server

For 24/7 trading, deploy to a VPS (DigitalOcean, AWS, etc.):

#### On your server:

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/maxphill8624-crypto/new-mini-app-quickstart.git
cd new-mini-app-quickstart

# Install dependencies
npm install

# Create .env.local with your keys
nano .env.local
# (paste your configuration)

# Run with PM2 (keeps bot running)
npm install -g pm2
pm2 start npm --name "polymarket-bot" -- run bot
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

#### Monitor your bot:

```bash
pm2 logs polymarket-bot    # View logs
pm2 status                 # Check status
pm2 restart polymarket-bot # Restart bot
```

### Option 3: Deploy with Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "bot"]
```

Build and run:

```bash
docker build -t polymarket-bot .
docker run -d --env-file .env.local --name bot polymarket-bot
```

## 💰 Funding Your Wallet

Before the bot can trade, fund the wallet with USDC on Polygon:

1. **Get your wallet address:**
   - Run `npm run create-wallet` to see your address
   - Or check `.env.local` for the private key, then derive the address

2. **Send USDC on Polygon Network:**
   - Use MetaMask or another wallet
   - Send USDC to your bot's address
   - Also send ~0.1 MATIC for gas fees

3. **Start with small amounts:**
   - Test with $50-100 USDC initially
   - Increase once you're comfortable

## 📊 Monitoring

### View Logs

```bash
# If running with npm
tail -f logs/bot-*.log

# If running with PM2
pm2 logs polymarket-bot
```

### Dashboard Metrics

Access the dashboard at `http://your-server-ip:3000/bot` or your Vercel URL to see:
- Total trades & win rate
- Profit/Loss
- Active positions
- Strategy performance

## 🔧 Configuration

Edit these in `.env.local`:

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_POSITION_SIZE` | 100 | Max USDC per position |
| `MAX_CONCURRENT_TRADES` | 5 | Max simultaneous positions |
| `STOP_LOSS_PERCENTAGE` | 10 | Auto-exit at 10% loss |
| `TAKE_PROFIT_PERCENTAGE` | 20 | Auto-exit at 20% gain |
| `AI_ENABLED` | false | Enable AI predictions |
| `AI_CONFIDENCE_THRESHOLD` | 0.7 | Min AI confidence to trade |

## 🛡️ Safety & Best Practices

### Before Running:

- ✅ Test with small amounts first
- ✅ Use a dedicated wallet (not your main wallet)
- ✅ Set conservative position sizes
- ✅ Monitor the first hour closely
- ✅ Review the code and understand what it does

### While Running:

- ✅ Check logs regularly for errors
- ✅ Monitor P&L and adjust settings if needed
- ✅ Keep MATIC balance topped up for gas
- ✅ Watch for API rate limits
- ✅ Have a kill switch ready (PM2 stop or Ctrl+C)

### Security:

- ❌ Never share your private keys
- ❌ Never commit `.env.local` to git
- ❌ Never run untrusted code with your keys
- ✅ Use environment variables only
- ✅ Review all code changes before deploying
- ✅ Keep dependencies updated

## 🆘 Troubleshooting

### Bot won't start

```bash
# Check Node.js version (need 18+)
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check environment file
cat .env.local
```

### No trades executing

- Check logs: `tail -f logs/bot-*.log`
- Verify wallet has USDC balance
- Check if markets meet liquidity requirements
- Review confidence thresholds in config

### Dashboard not loading

```bash
# Rebuild Next.js
npm run build
npm run dev
```

### TypeScript errors

```bash
# Rebuild with proper config
npm run bot
```

## 📈 Expected Performance

This bot is in **DRY-RUN MODE** by default for safety. To enable real trading:

1. Uncomment the CLOB client initialization in `bot/core/api/polymarket-client.ts:22`
2. Remove the dry-run logging in `placeOrder()` method
3. Test thoroughly before using real funds

## 🎯 Next Steps

1. **Test Locally:** Run `npm run dev` and visit http://localhost:3000/bot
2. **Fund Wallet:** Send test USDC on Polygon
3. **Start Bot:** Run `npm run bot` and monitor for 1 hour
4. **Adjust Config:** Tune settings based on performance
5. **Deploy:** Move to VPS for 24/7 operation

## 📚 Additional Resources

- [Polymarket API Docs](https://docs.polymarket.com/)
- [CLOB Client Docs](https://github.com/Polymarket/clob-client)
- [Bot README](./bot/README.md) - Detailed technical documentation
- [Quick Start Guide](./QUICKSTART.md) - 5-minute setup

## ⚠️ Disclaimer

This bot is for educational purposes. Trading involves risk. Only trade with funds you can afford to lose. The authors are not responsible for any financial losses. Always comply with Polymarket's terms of service and applicable regulations.

---

**Ready to start?** Follow the steps above and happy trading! 🚀
