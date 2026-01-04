import { Position, Trade, BotConfig } from '../../types';

export class RiskManager {
  private positions: Map<string, Position> = new Map();
  private activeTrades: Map<string, Trade> = new Map();

  constructor(private config: BotConfig) {}

  async evaluateTrade(trade: Trade, currentBalance: number): Promise<{
    approved: boolean;
    reason?: string;
  }> {
    // Check 1: Sufficient balance
    const requiredAmount = trade.size * trade.price;
    if (requiredAmount > currentBalance) {
      return {
        approved: false,
        reason: `Insufficient balance. Required: ${requiredAmount}, Available: ${currentBalance}`
      };
    }

    // Check 2: Position size limit
    if (requiredAmount > this.config.maxPositionSize) {
      return {
        approved: false,
        reason: `Trade size ${requiredAmount} exceeds max position size ${this.config.maxPositionSize}`
      };
    }

    // Check 3: Maximum concurrent trades
    if (this.activeTrades.size >= this.config.maxConcurrentTrades) {
      return {
        approved: false,
        reason: `Maximum concurrent trades (${this.config.maxConcurrentTrades}) reached`
      };
    }

    // Check 4: Validate price slippage
    // This would need real-time order book data
    // For now, we'll do a basic sanity check
    if (trade.price <= 0 || trade.price > 1) {
      return {
        approved: false,
        reason: `Invalid price: ${trade.price}. Must be between 0 and 1`
      };
    }

    // Check 5: Minimum trade size
    const MIN_TRADE_SIZE = 1; // Minimum $1 USDC
    if (requiredAmount < MIN_TRADE_SIZE) {
      return {
        approved: false,
        reason: `Trade size ${requiredAmount} below minimum ${MIN_TRADE_SIZE}`
      };
    }

    return { approved: true };
  }

  addPosition(position: Position): void {
    const key = `${position.marketId}:${position.tokenId}`;
    this.positions.set(key, position);
  }

  updatePosition(marketId: string, tokenId: string, currentPrice: number): Position | null {
    const key = `${marketId}:${tokenId}`;
    const position = this.positions.get(key);

    if (!position) {
      return null;
    }

    position.currentPrice = currentPrice;
    position.pnl = (currentPrice - position.entryPrice) * position.size;

    return position;
  }

  shouldClosePosition(position: Position): {
    shouldClose: boolean;
    reason?: string;
  } {
    // Check 1: Stop loss
    const lossPercentage = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;
    if (lossPercentage <= -this.config.stopLossPercentage) {
      return {
        shouldClose: true,
        reason: `Stop loss triggered: ${lossPercentage.toFixed(2)}%`
      };
    }

    // Check 2: Take profit
    const profitPercentage = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;
    if (profitPercentage >= this.config.takeProfitPercentage) {
      return {
        shouldClose: true,
        reason: `Take profit triggered: ${profitPercentage.toFixed(2)}%`
      };
    }

    // Check 3: Maximum holding time
    const holdingTime = (Date.now() - position.entryTime.getTime()) / (1000 * 60 * 60); // hours
    if (holdingTime >= this.config.maxHoldingTime) {
      return {
        shouldClose: true,
        reason: `Max holding time reached: ${holdingTime.toFixed(1)} hours`
      };
    }

    return { shouldClose: false };
  }

  removePosition(marketId: string, tokenId: string): void {
    const key = `${marketId}:${tokenId}`;
    this.positions.delete(key);
  }

  addTrade(trade: Trade): void {
    this.activeTrades.set(trade.tradeId, trade);
  }

  updateTrade(tradeId: string, status: Trade['status'], error?: string): void {
    const trade = this.activeTrades.get(tradeId);
    if (trade) {
      trade.status = status;
      if (error) {
        trade.error = error;
      }
      if (status === 'executed' || status === 'failed' || status === 'cancelled') {
        trade.executionTime = new Date();
      }
    }
  }

  removeTrade(tradeId: string): void {
    this.activeTrades.delete(tradeId);
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  getActiveTrades(): Trade[] {
    return Array.from(this.activeTrades.values());
  }

  getTotalExposure(): number {
    let total = 0;
    for (const position of this.positions.values()) {
      total += position.size * position.currentPrice;
    }
    return total;
  }

  calculatePortfolioMetrics(): {
    totalPositions: number;
    totalExposure: number;
    totalPnL: number;
    winningPositions: number;
    losingPositions: number;
  } {
    let totalPnL = 0;
    let winningPositions = 0;
    let losingPositions = 0;

    for (const position of this.positions.values()) {
      totalPnL += position.pnl;
      if (position.pnl > 0) {
        winningPositions++;
      } else if (position.pnl < 0) {
        losingPositions++;
      }
    }

    return {
      totalPositions: this.positions.size,
      totalExposure: this.getTotalExposure(),
      totalPnL,
      winningPositions,
      losingPositions
    };
  }
}
