// Core types for the Polymarket prediction bot

export interface BotConfig {
  // API Configuration
  privateKey: string;
  rpcUrl: string;
  chainId: number;

  // Trading Configuration
  strategies: StrategyType[];
  maxPositionSize: number;
  maxConcurrentTrades: number;
  minLiquidity: number;

  // Risk Management
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxSlippage: number;
  maxHoldingTime: number; // in hours

  // AI Configuration
  aiEnabled: boolean;
  anthropicApiKey?: string;
  aiConfidenceThreshold: number;

  // Monitoring
  enableDashboard: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export type StrategyType = 'spike' | 'arbitrage' | 'ai-prediction' | 'market-making';

export interface Market {
  id: string;
  question: string;
  tokens: Token[];
  volume: number;
  liquidity: number;
  endDate: Date;
  active: boolean;
}

export interface Token {
  tokenId: string;
  outcome: string;
  price: number;
  volume: number;
}

export interface Order {
  orderId?: string;
  marketId: string;
  tokenId: string;
  side: 'BUY' | 'SELL';
  size: number;
  price: number;
  timestamp: Date;
}

export interface Position {
  marketId: string;
  tokenId: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  entryTime: Date;
}

export interface Trade {
  tradeId: string;
  marketId: string;
  tokenId: string;
  strategy: StrategyType;
  side: 'BUY' | 'SELL';
  size: number;
  price: number;
  status: 'pending' | 'executed' | 'failed' | 'cancelled';
  timestamp: Date;
  executionTime?: Date;
  error?: string;
}

export interface SpikeSignal {
  marketId: string;
  tokenId: string;
  currentPrice: number;
  previousPrice: number;
  percentageChange: number;
  direction: 'up' | 'down';
  volume: number;
  confidence: number;
}

export interface ArbitrageOpportunity {
  marketId: string;
  yesTokenId: string;
  noTokenId: string;
  yesPrice: number;
  noPrice: number;
  totalCost: number;
  expectedProfit: number;
  profitPercentage: number;
}

export interface AIAnalysis {
  marketId: string;
  question: string;
  prediction: 'YES' | 'NO';
  confidence: number;
  reasoning: string;
  recommendedAction: 'BUY' | 'SELL' | 'HOLD';
  suggestedPrice: number;
}

export interface BotMetrics {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalVolume: number;
  totalPnL: number;
  winRate: number;
  activePositions: number;
  uptime: number;
  lastUpdate: Date;
}
