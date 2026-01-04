import { Market, ArbitrageOpportunity } from '../../types';

export class ArbitrageDetector {
  private MIN_PROFIT_PERCENTAGE: number; // Minimum 2% profit to consider

  constructor(private minProfitPercentage: number = 2) {
    this.MIN_PROFIT_PERCENTAGE = minProfitPercentage;
  }

  async detectArbitrage(markets: Market[]): Promise<ArbitrageOpportunity[]> {
    const opportunities: ArbitrageOpportunity[] = [];

    for (const market of markets) {
      // Polymarket binary markets have YES and NO tokens
      if (market.tokens.length === 2) {
        const opportunity = this.checkBinaryArbitrage(market);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      }
    }

    return opportunities;
  }

  private checkBinaryArbitrage(market: Market): ArbitrageOpportunity | null {
    // In a binary market, YES + NO should equal $1.00
    // If YES_ask + NO_ask < $1.00, there's an arbitrage opportunity

    const yesToken = market.tokens.find(t => t.outcome.toLowerCase().includes('yes'));
    const noToken = market.tokens.find(t => t.outcome.toLowerCase().includes('no'));

    if (!yesToken || !noToken) {
      return null;
    }

    const yesPrice = yesToken.price;
    const noPrice = noToken.price;
    const totalCost = yesPrice + noPrice;

    // Expected payout is always $1.00 in binary markets
    const expectedPayout = 1.0;
    const expectedProfit = expectedPayout - totalCost;
    const profitPercentage = (expectedProfit / totalCost) * 100;

    // Check if arbitrage opportunity exists
    if (totalCost < expectedPayout && profitPercentage >= this.MIN_PROFIT_PERCENTAGE) {
      return {
        marketId: market.id,
        yesTokenId: yesToken.tokenId,
        noTokenId: noToken.tokenId,
        yesPrice,
        noPrice,
        totalCost,
        expectedProfit,
        profitPercentage
      };
    }

    return null;
  }

  // For cross-platform arbitrage (e.g., Polymarket vs Kalshi)
  async detectCrossPlatformArbitrage(
    polymarketMarket: Market,
    externalPrice: { yes: number; no: number }
  ): Promise<ArbitrageOpportunity | null> {
    const yesToken = polymarketMarket.tokens.find(t => t.outcome.toLowerCase().includes('yes'));
    const noToken = polymarketMarket.tokens.find(t => t.outcome.toLowerCase().includes('no'));

    if (!yesToken || !noToken) {
      return null;
    }

    // Check if buying on one platform and selling on another is profitable
    const polyYes = yesToken.price;
    const polyNo = noToken.price;
    const extYes = externalPrice.yes;
    const extNo = externalPrice.no;

    // Scenario 1: Buy YES on Poly, Buy NO on External
    const cost1 = polyYes + extNo;
    const profit1 = 1.0 - cost1;
    const profitPct1 = (profit1 / cost1) * 100;

    // Scenario 2: Buy NO on Poly, Buy YES on External
    const cost2 = polyNo + extYes;
    const profit2 = 1.0 - cost2;
    const profitPct2 = (profit2 / cost2) * 100;

    // Return the best opportunity
    if (profitPct1 >= this.MIN_PROFIT_PERCENTAGE && profitPct1 >= profitPct2) {
      return {
        marketId: polymarketMarket.id,
        yesTokenId: yesToken.tokenId,
        noTokenId: noToken.tokenId,
        yesPrice: polyYes,
        noPrice: extNo,
        totalCost: cost1,
        expectedProfit: profit1,
        profitPercentage: profitPct1
      };
    } else if (profitPct2 >= this.MIN_PROFIT_PERCENTAGE) {
      return {
        marketId: polymarketMarket.id,
        yesTokenId: yesToken.tokenId,
        noTokenId: noToken.tokenId,
        yesPrice: extYes,
        noPrice: polyNo,
        totalCost: cost2,
        expectedProfit: profit2,
        profitPercentage: profitPct2
      };
    }

    return null;
  }
}
