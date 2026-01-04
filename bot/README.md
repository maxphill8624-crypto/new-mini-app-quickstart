# Polymarket Prediction Bot

An advanced, multi-strategy trading bot for Polymarket prediction markets. This bot combines spike detection, arbitrage opportunities, and AI-powered predictions to trade autonomously on Polymarket.

## Features

### 🎯 Multi-Strategy Trading
- **Spike Detection**: Identifies and trades on sudden price movements with momentum
- **Arbitrage**: Exploits pricing inefficiencies across binary markets
- **AI Predictions**: Uses Claude AI to analyze markets and make informed predictions

### 🛡️ Risk Management
- Position sizing and exposure limits
- Stop-loss and take-profit automation
- Maximum holding time enforcement
- Slippage protection
- Circuit breakers for safety

### 📊 Real-Time Monitoring
- WebSocket connections for live price updates
- Web dashboard for monitoring bot performance
- Comprehensive logging system
- Performance metrics and analytics

### 🤖 AI-Powered Analysis
- Integration with Anthropic's Claude AI
- Market sentiment analysis
- Confidence-based decision making
- Natural language reasoning for trades

## Architecture

```
bot/
├── core/
│   ├── api/              # Polymarket API client
│   ├── execution/        # Risk management & order execution
│   └── monitoring/       # WebSocket monitoring
├── strategies/
│   ├── spike/           # Spike detection strategy
│   ├── arbitrage/       # Arbitrage detection
│   └── ai/              # AI-powered predictions
├── types/               # TypeScript interfaces
├── utils/               # Logging and utilities
├── config.ts            # Configuration management
└── index.ts             # Main bot orchestrator
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

The bot requires the following packages:
- `@polymarket/clob-client` - Polymarket API client
- `@anthropic-ai/sdk` - Claude AI integration
- `ethers` - Ethereum wallet management
- `ws` - WebSocket connections
- `axios` - HTTP requests

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.bot.example .env.local
```

Edit `.env.local` and configure:

```env
# REQUIRED
POLYMARKET_PRIVATE_KEY=your_private_key_here

# OPTIONAL
AI_ENABLED=true
ANTHROPIC_API_KEY=your_anthropic_key_here
```

**⚠️ IMPORTANT**: Never commit your `.env.local` file or share your private key!

### 3. Fund Your Wallet

Ensure your wallet has:
- USDC on Polygon network for trading
- Small amount of MATIC for gas fees

## Usage

### Running the Bot

#### Command Line
```bash
npm run bot
```

Or directly with ts-node:
```bash
npx ts-node bot/index.ts
```

#### Web Dashboard
```bash
npm run dev
```

Then visit `http://localhost:3000/bot` to access the dashboard.

### Configuration Options

Edit `bot/config.ts` or use environment variables:

| Setting | Default | Description |
|---------|---------|-------------|
| `MAX_POSITION_SIZE` | 100 | Maximum USDC per position |
| `MAX_CONCURRENT_TRADES` | 5 | Max simultaneous trades |
| `MIN_LIQUIDITY` | 1000 | Minimum market liquidity |
| `STOP_LOSS_PERCENTAGE` | 10 | Stop loss trigger (%) |
| `TAKE_PROFIT_PERCENTAGE` | 20 | Take profit trigger (%) |
| `MAX_SLIPPAGE` | 5 | Maximum acceptable slippage (%) |
| `MAX_HOLDING_TIME` | 24 | Max position duration (hours) |
| `AI_CONFIDENCE_THRESHOLD` | 0.7 | Minimum AI confidence to trade |

## Strategies

### 1. Spike Detection

Monitors price movements and detects significant changes:
- Tracks price history across all markets
- Calculates percentage changes
- Evaluates volume and trend consistency
- Confidence-based trade execution

**Configuration**:
```typescript
const spikeThreshold = 5; // 5% price change triggers signal
const minConfidence = 0.6; // Only trade on 60%+ confidence
```

### 2. Arbitrage

Identifies risk-free arbitrage opportunities:
- Binary market inefficiencies (YES + NO ≠ $1.00)
- Cross-platform arbitrage (Polymarket vs Kalshi)
- Simultaneous execution of both legs

**How it works**:
- If YES = $0.42 and NO = $0.56
- Total cost = $0.98
- Guaranteed payout = $1.00
- Profit = $0.02 (2%)

### 3. AI Predictions

Uses Claude AI for market analysis:
- Analyzes market questions and context
- Provides probability estimates
- Generates reasoning for predictions
- Recommends BUY/SELL/HOLD actions

**Example AI Analysis**:
```json
{
  "prediction": "YES",
  "confidence": 0.85,
  "reasoning": "Strong economic indicators support this outcome",
  "recommendedAction": "BUY",
  "suggestedPrice": 0.65
}
```

## Risk Management

The bot includes comprehensive risk controls:

### Position Management
- Maximum position size limits
- Concurrent trade restrictions
- Exposure monitoring

### Automatic Exit Rules
- **Stop Loss**: Closes position at 10% loss
- **Take Profit**: Closes position at 20% gain
- **Time-Based**: Closes positions after 24 hours

### Safety Features
- Balance verification before trades
- Slippage protection
- Trade approval system
- Error handling and recovery

## Monitoring & Logging

### Logs
All activity is logged to `./logs/` directory:
- Trade executions
- Strategy signals
- Position updates
- Error messages
- Performance metrics

### Dashboard
Access the web dashboard at `/bot`:
- Real-time metrics
- Active positions
- Trade history
- Strategy status
- Start/stop controls

### Metrics Tracked
- Total trades & success rate
- Win rate percentage
- Total profit/loss
- Active positions
- Trading volume
- Bot uptime

## API Integration

### Polymarket CLOB API

The bot uses Polymarket's Central Limit Order Book (CLOB):
- REST API for market data
- WebSocket for real-time updates
- Order placement and management
- Balance and position tracking

### Anthropic Claude API

AI analysis powered by Claude:
- Market sentiment analysis
- Probability estimation
- Natural language reasoning
- Confidence scoring

## Development

### Adding a New Strategy

1. Create strategy file:
```typescript
// bot/strategies/custom/my-strategy.ts
export class MyStrategy {
  async analyze(markets: Market[]): Promise<Signal[]> {
    // Your strategy logic
  }
}
```

2. Register in main bot:
```typescript
// bot/index.ts
private myStrategy: MyStrategy;

constructor() {
  this.myStrategy = new MyStrategy();
}

private async runStrategies() {
  if (config.strategies.includes('my-strategy')) {
    await this.runMyStrategy();
  }
}
```

3. Add to config:
```typescript
strategies: ['spike', 'arbitrage', 'ai-prediction', 'my-strategy']
```

### Testing

Run tests (when implemented):
```bash
npm test
```

## Safety & Best Practices

### ⚠️ Important Warnings

1. **Start Small**: Begin with small position sizes to test
2. **Monitor Closely**: Watch the bot especially during first runs
3. **Use Testnet**: Test on Polygon Mumbai testnet first if possible
4. **Private Keys**: NEVER share or commit your private keys
5. **API Limits**: Be aware of rate limits on APIs
6. **Market Risk**: Prediction markets are risky, only trade what you can afford to lose

### Security Checklist

- [ ] Private key stored securely in `.env.local`
- [ ] `.env.local` added to `.gitignore`
- [ ] API keys rotated regularly
- [ ] Logs don't contain sensitive data
- [ ] Position limits configured appropriately
- [ ] Stop-loss enabled

## Troubleshooting

### Bot won't start
- Check `.env.local` configuration
- Verify private key is valid
- Ensure sufficient USDC balance
- Check API connectivity

### No trades executing
- Verify strategies are enabled in config
- Check minimum liquidity settings
- Review confidence thresholds
- Examine logs for errors

### WebSocket disconnecting
- Check network connection
- Verify Polymarket API status
- Review reconnection logs

## Contributing

This bot was built by combining best practices from:
- [Polymarket/agents](https://github.com/Polymarket/agents) - Official AI agent framework
- [Trust412/Polymarket-spike-bot](https://github.com/Trust412/Polymarket-spike-bot-v1) - Spike detection
- [terauss/Polymarket-Kalshi-Arbitrage-bot](https://github.com/terauss/Polymarket-Kalshi-Arbitrage-bot) - Arbitrage
- [warproxxx/poly-maker](https://github.com/warproxxx/poly-maker) - Market making

Enhancements include:
- TypeScript/Node.js implementation
- Multi-strategy orchestration
- Enhanced risk management
- Web dashboard UI
- Comprehensive logging
- AI integration

## License

MIT

## Disclaimer

This bot is for educational purposes. Trading prediction markets involves risk. Only trade with funds you can afford to lose. The authors are not responsible for any financial losses incurred using this software.

Always comply with Polymarket's terms of service and applicable regulations in your jurisdiction.
