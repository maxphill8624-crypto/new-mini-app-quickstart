import { PolymarketClient } from './core/api/polymarket-client';
import { SpikeDetector } from './strategies/spike/spike-detector';
import { ArbitrageDetector } from './strategies/arbitrage/arbitrage-detector';
import { AIAnalyzer } from './strategies/ai/ai-analyzer';
import { RiskManager } from './core/execution/risk-manager';
import { WebSocketMonitor } from './core/monitoring/websocket-monitor';
import { Logger } from './utils/logger';
import { config, validateConfig } from './config';
import {
  Market,
  Trade,
  Position,
  BotMetrics,
  StrategyType,
  SpikeSignal,
  ArbitrageOpportunity,
  AIAnalysis
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class PolymarketBot {
  private client: PolymarketClient;
  private spikeDetector: SpikeDetector;
  private arbitrageDetector: ArbitrageDetector;
  private aiAnalyzer?: AIAnalyzer;
  private riskManager: RiskManager;
  private wsMonitor: WebSocketMonitor;
  private logger: Logger;

  private running: boolean = false;
  private markets: Market[] = [];
  private metrics: BotMetrics = {
    totalTrades: 0,
    successfulTrades: 0,
    failedTrades: 0,
    totalVolume: 0,
    totalPnL: 0,
    winRate: 0,
    activePositions: 0,
    uptime: 0,
    lastUpdate: new Date()
  };

  private startTime: Date = new Date();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.logger = new Logger(config.logLevel);
    this.client = new PolymarketClient(config.privateKey, config.chainId);
    this.spikeDetector = new SpikeDetector(this.client);
    this.arbitrageDetector = new ArbitrageDetector();
    this.riskManager = new RiskManager(config);
    this.wsMonitor = new WebSocketMonitor();

    if (config.aiEnabled && config.anthropicApiKey) {
      this.aiAnalyzer = new AIAnalyzer(config.anthropicApiKey);
    }
  }

  async start(): Promise<void> {
    this.logger.info('Starting Polymarket Prediction Bot...');

    // Validate configuration
    if (!validateConfig(config)) {
      throw new Error('Invalid configuration');
    }

    try {
      // Initialize client
      await this.client.initialize();
      this.logger.info('Polymarket client initialized');

      // Try to connect WebSocket (optional - bot can run without it)
      try {
        await this.wsMonitor.connect();
        this.logger.info('WebSocket monitor connected');

        // Set up WebSocket price updates
        this.wsMonitor.onPriceUpdate((tokenId, price, volume) => {
          this.handlePriceUpdate(tokenId, price, volume);
        });
      } catch (wsError) {
        this.logger.warn('WebSocket connection failed, running in polling mode');
      }

      // Load initial markets
      await this.loadMarkets();

      // Subscribe to market updates if WebSocket is connected
      if (this.wsMonitor.isConnected()) {
        this.wsMonitor.subscribeToMarkets(this.markets);
      }

      // Start main loop
      this.running = true;
      this.startTime = new Date();
      this.logger.info('Bot started successfully');

      // Run strategies periodically
      this.updateInterval = setInterval(() => {
        this.runStrategies().catch(error => {
          this.logger.error('Error running strategies:', error);
        });
      }, 10000); // Run every 10 seconds

      // Initial strategy run
      await this.runStrategies();
    } catch (error) {
      this.logger.error('Failed to start bot:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping bot...');
    this.running = false;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.wsMonitor.disconnect();
    this.logger.info('Bot stopped');
  }

  private async loadMarkets(): Promise<void> {
    try {
      this.markets = await this.client.getMarkets(100);
      this.logger.info(`Loaded ${this.markets.length} active markets`);

      // Filter markets by minimum liquidity
      this.markets = this.markets.filter(m => m.liquidity >= config.minLiquidity);
      this.logger.info(`Filtered to ${this.markets.length} markets with sufficient liquidity`);
    } catch (error) {
      this.logger.error('Error loading markets:', error);
    }
  }

  private async runStrategies(): Promise<void> {
    if (!this.running) return;

    this.logger.debug('Running trading strategies...');

    try {
      // Run enabled strategies
      const strategies = config.strategies;

      if (strategies.includes('spike')) {
        await this.runSpikeStrategy();
      }

      if (strategies.includes('arbitrage')) {
        await this.runArbitrageStrategy();
      }

      if (strategies.includes('ai-prediction') && this.aiAnalyzer) {
        await this.runAIStrategy();
      }

      // Update positions
      await this.updatePositions();

      // Update metrics
      this.updateMetrics();
    } catch (error) {
      this.logger.error('Error in strategy execution:', error);
    }
  }

  private async runSpikeStrategy(): Promise<void> {
    const signals = await this.spikeDetector.detectSpikes(this.markets);

    for (const signal of signals) {
      this.logger.signal(signal);

      // Only act on high-confidence signals
      if (signal.confidence >= 0.6) {
        const side = signal.direction === 'up' ? 'BUY' : 'SELL';
        await this.executeTrade({
          marketId: signal.marketId,
          tokenId: signal.tokenId,
          side,
          size: this.calculatePositionSize(signal.currentPrice),
          price: signal.currentPrice,
          strategy: 'spike'
        });
      }
    }
  }

  private async runArbitrageStrategy(): Promise<void> {
    const opportunities = await this.arbitrageDetector.detectArbitrage(this.markets);

    for (const opp of opportunities) {
      this.logger.signal({ type: 'ARBITRAGE', ...opp });

      // Execute both legs of arbitrage simultaneously
      if (opp.profitPercentage >= 2) {
        const size = this.calculatePositionSize(opp.totalCost);

        await Promise.all([
          this.executeTrade({
            marketId: opp.marketId,
            tokenId: opp.yesTokenId,
            side: 'BUY',
            size,
            price: opp.yesPrice,
            strategy: 'arbitrage'
          }),
          this.executeTrade({
            marketId: opp.marketId,
            tokenId: opp.noTokenId,
            side: 'BUY',
            size,
            price: opp.noPrice,
            strategy: 'arbitrage'
          })
        ]);
      }
    }
  }

  private async runAIStrategy(): Promise<void> {
    if (!this.aiAnalyzer) return;

    // Analyze top markets
    const topMarkets = this.markets.slice(0, 5);
    const analyses = await this.aiAnalyzer.analyzeBatch(topMarkets);

    for (const analysis of analyses) {
      this.logger.signal({ type: 'AI_ANALYSIS', ...analysis });

      // Only act on high-confidence predictions
      if (analysis.confidence >= config.aiConfidenceThreshold) {
        const market = this.markets.find(m => m.id === analysis.marketId);
        if (!market) continue;

        const token = market.tokens.find(t =>
          t.outcome.toLowerCase().includes(analysis.prediction.toLowerCase())
        );

        if (token && analysis.recommendedAction === 'BUY') {
          await this.executeTrade({
            marketId: analysis.marketId,
            tokenId: token.tokenId,
            side: 'BUY',
            size: this.calculatePositionSize(analysis.suggestedPrice),
            price: analysis.suggestedPrice,
            strategy: 'ai-prediction'
          });
        }
      }
    }
  }

  private async executeTrade(params: {
    marketId: string;
    tokenId: string;
    side: 'BUY' | 'SELL';
    size: number;
    price: number;
    strategy: StrategyType;
  }): Promise<void> {
    const trade: Trade = {
      tradeId: uuidv4(),
      ...params,
      status: 'pending',
      timestamp: new Date()
    };

    // Risk check
    const balance = await this.client.getBalance();
    const riskCheck = await this.riskManager.evaluateTrade(trade, balance);

    if (!riskCheck.approved) {
      this.logger.warn(`Trade rejected: ${riskCheck.reason}`, trade);
      return;
    }

    this.riskManager.addTrade(trade);
    this.logger.trade(trade);

    try {
      const orderId = await this.client.placeOrder({
        orderId: trade.tradeId,
        marketId: trade.marketId,
        tokenId: trade.tokenId,
        side: trade.side,
        size: trade.size,
        price: trade.price,
        timestamp: trade.timestamp
      });

      if (orderId) {
        this.riskManager.updateTrade(trade.tradeId, 'executed');
        this.metrics.successfulTrades++;
        this.metrics.totalVolume += trade.size * trade.price;

        // Add position
        this.riskManager.addPosition({
          marketId: trade.marketId,
          tokenId: trade.tokenId,
          size: trade.size,
          entryPrice: trade.price,
          currentPrice: trade.price,
          pnl: 0,
          entryTime: new Date()
        });

        this.logger.info(`Trade executed successfully: ${orderId}`);
      } else {
        this.riskManager.updateTrade(trade.tradeId, 'failed', 'Order placement failed');
        this.metrics.failedTrades++;
      }
    } catch (error) {
      this.riskManager.updateTrade(trade.tradeId, 'failed', String(error));
      this.metrics.failedTrades++;
      this.logger.error('Trade execution failed:', error);
    } finally {
      this.riskManager.removeTrade(trade.tradeId);
    }

    this.metrics.totalTrades++;
  }

  private calculatePositionSize(price: number): number {
    // Simple position sizing: use a fraction of max position size
    const targetAmount = config.maxPositionSize * 0.5; // Use 50% of max
    return targetAmount / price;
  }

  private handlePriceUpdate(tokenId: string, price: number, volume: number): void {
    // Find market and update position if exists
    for (const position of this.riskManager.getPositions()) {
      if (position.tokenId === tokenId) {
        const updatedPosition = this.riskManager.updatePosition(
          position.marketId,
          position.tokenId,
          price
        );

        if (updatedPosition) {
          const closeCheck = this.riskManager.shouldClosePosition(updatedPosition);
          if (closeCheck.shouldClose) {
            this.logger.info(`Closing position: ${closeCheck.reason}`);
            this.closePosition(updatedPosition).catch(error => {
              this.logger.error('Error closing position:', error);
            });
          }
        }
      }
    }
  }

  private async closePosition(position: Position): Promise<void> {
    try {
      const side = position.pnl >= 0 ? 'SELL' : 'SELL'; // Always sell to close
      await this.executeTrade({
        marketId: position.marketId,
        tokenId: position.tokenId,
        side,
        size: position.size,
        price: position.currentPrice,
        strategy: 'spike' // Use strategy from position metadata if available
      });

      this.riskManager.removePosition(position.marketId, position.tokenId);
      this.logger.info(`Position closed. PnL: ${position.pnl.toFixed(2)}`);
    } catch (error) {
      this.logger.error('Error closing position:', error);
    }
  }

  private async updatePositions(): Promise<void> {
    // This is called periodically to check position health
    const positions = this.riskManager.getPositions();

    for (const position of positions) {
      const closeCheck = this.riskManager.shouldClosePosition(position);
      if (closeCheck.shouldClose) {
        this.logger.info(`Position needs closing: ${closeCheck.reason}`);
        await this.closePosition(position);
      }
    }
  }

  private updateMetrics(): void {
    const portfolioMetrics = this.riskManager.calculatePortfolioMetrics();

    this.metrics.activePositions = portfolioMetrics.totalPositions;
    this.metrics.totalPnL = portfolioMetrics.totalPnL;
    this.metrics.winRate = this.metrics.totalTrades > 0
      ? (this.metrics.successfulTrades / this.metrics.totalTrades) * 100
      : 0;
    this.metrics.uptime = Date.now() - this.startTime.getTime();
    this.metrics.lastUpdate = new Date();

    this.logger.metrics(this.metrics);
  }

  getMetrics(): BotMetrics {
    return { ...this.metrics };
  }

  getPositions(): Position[] {
    return this.riskManager.getPositions();
  }

  isRunning(): boolean {
    return this.running;
  }
}

// Main entry point
if (require.main === module) {
  const bot = new PolymarketBot();

  bot.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await bot.stop();
    process.exit(0);
  });
}
