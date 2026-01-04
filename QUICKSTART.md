# Polymarket Bot - Quick Start Guide

Get your Polymarket prediction bot running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Polygon wallet with USDC
- (Optional) Anthropic API key for AI features

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment

Create your environment file:

```bash
cp .env.bot.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# REQUIRED - Your wallet private key
POLYMARKET_PRIVATE_KEY=0x1234...

# OPTIONAL - For AI predictions
AI_ENABLED=true
ANTHROPIC_API_KEY=sk-ant-...
```

## Step 3: Run the Bot

### Option A: Command Line

```bash
npm run bot
```

### Option B: Web Dashboard

```bash
npm run dev
```

Then open http://localhost:3000/bot in your browser.

## Step 4: Monitor & Manage

The bot will:
- ✅ Connect to Polymarket
- ✅ Load active markets
- ✅ Start monitoring prices via WebSocket
- ✅ Execute trades based on strategies

View logs in `./logs/` directory.

## Configuration

Edit these settings in `.env.local`:

```env
# Trading Limits
MAX_POSITION_SIZE=100          # Max $100 per position
MAX_CONCURRENT_TRADES=5        # Max 5 positions at once
MIN_LIQUIDITY=1000            # Only trade markets with $1000+ liquidity

# Risk Management
STOP_LOSS_PERCENTAGE=10       # Exit at 10% loss
TAKE_PROFIT_PERCENTAGE=20     # Exit at 20% gain
MAX_HOLDING_TIME=24           # Close positions after 24 hours

# AI Settings (if enabled)
AI_CONFIDENCE_THRESHOLD=0.7   # Only trade on 70%+ confidence
```

## Strategies

The bot runs 3 strategies simultaneously:

1. **Spike Detection** - Trades on momentum (5%+ price changes)
2. **Arbitrage** - Exploits YES+NO ≠ $1.00 inefficiencies
3. **AI Predictions** - Uses Claude AI for market analysis

## Safety Tips

⚠️ **Start Small**: Use low `MAX_POSITION_SIZE` initially

⚠️ **Monitor First Hour**: Watch closely during initial run

⚠️ **Check Logs**: Review `./logs/` for any errors

⚠️ **Test Mode**: Consider starting with `MAX_POSITION_SIZE=10` or less

## Next Steps

- Read full documentation: `bot/README.md`
- Customize strategies in `bot/strategies/`
- View dashboard at http://localhost:3000/bot
- Monitor performance metrics

## Troubleshooting

**"Invalid private key"**
- Ensure your private key starts with `0x`
- Check it's for a Polygon address

**"Insufficient balance"**
- Fund your wallet with USDC on Polygon
- Get MATIC for gas fees

**"No trades executing"**
- Check market liquidity requirements
- Review confidence thresholds
- Examine logs for specific errors

## Support

For issues or questions:
- Check logs in `./logs/`
- Review full docs in `bot/README.md`
- Ensure all environment variables are set correctly

Happy trading! 🚀
