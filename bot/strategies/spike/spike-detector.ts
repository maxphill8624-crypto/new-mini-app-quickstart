import { Market, SpikeSignal } from '../../types';
import { PolymarketClient } from '../../core/api/polymarket-client';

export class SpikeDetector {
  private priceHistory: Map<string, number[]> = new Map();
  private readonly HISTORY_SIZE = 10;
  private readonly SPIKE_THRESHOLD = 5; // 5% price change

  constructor(
    private client: PolymarketClient,
    private spikeThreshold: number = 5
  ) {
    this.SPIKE_THRESHOLD = spikeThreshold;
  }

  async detectSpikes(markets: Market[]): Promise<SpikeSignal[]> {
    const signals: SpikeSignal[] = [];

    for (const market of markets) {
      for (const token of market.tokens) {
        const signal = await this.checkTokenForSpike(market.id, token.tokenId, token.price, token.volume);
        if (signal) {
          signals.push(signal);
        }
      }
    }

    return signals;
  }

  private async checkTokenForSpike(
    marketId: string,
    tokenId: string,
    currentPrice: number,
    volume: number
  ): Promise<SpikeSignal | null> {
    const key = `${marketId}:${tokenId}`;

    // Initialize price history if not exists
    if (!this.priceHistory.has(key)) {
      this.priceHistory.set(key, []);
    }

    const history = this.priceHistory.get(key)!;

    // Need at least one previous price
    if (history.length === 0) {
      history.push(currentPrice);
      return null;
    }

    const previousPrice = history[history.length - 1];
    const percentageChange = ((currentPrice - previousPrice) / previousPrice) * 100;

    // Update history
    history.push(currentPrice);
    if (history.length > this.HISTORY_SIZE) {
      history.shift();
    }

    // Check for spike
    if (Math.abs(percentageChange) >= this.SPIKE_THRESHOLD) {
      const direction = percentageChange > 0 ? 'up' : 'down';
      const confidence = this.calculateConfidence(percentageChange, volume, history);

      return {
        marketId,
        tokenId,
        currentPrice,
        previousPrice,
        percentageChange,
        direction,
        volume,
        confidence
      };
    }

    return null;
  }

  private calculateConfidence(
    percentageChange: number,
    volume: number,
    priceHistory: number[]
  ): number {
    // Base confidence on spike magnitude
    let confidence = Math.min(Math.abs(percentageChange) / 20, 1); // Max at 20% change

    // Increase confidence with higher volume
    if (volume > 10000) confidence += 0.1;
    if (volume > 50000) confidence += 0.1;

    // Increase confidence if trend is consistent
    if (priceHistory.length >= 3) {
      const recentTrend = this.detectTrend(priceHistory.slice(-3));
      if (recentTrend === 'consistent') {
        confidence += 0.1;
      }
    }

    return Math.min(confidence, 1);
  }

  private detectTrend(prices: number[]): 'consistent' | 'volatile' {
    if (prices.length < 3) return 'volatile';

    const isIncreasing = prices.every((price, i) => i === 0 || price >= prices[i - 1]);
    const isDecreasing = prices.every((price, i) => i === 0 || price <= prices[i - 1]);

    return isIncreasing || isDecreasing ? 'consistent' : 'volatile';
  }

  clearHistory(): void {
    this.priceHistory.clear();
  }
}
