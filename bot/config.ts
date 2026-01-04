import { BotConfig } from './types';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

export const config: BotConfig = {
  // API Configuration - Load from environment variables
  privateKey: process.env.POLYMARKET_PRIVATE_KEY || '',
  rpcUrl: process.env.RPC_URL || 'https://polygon-rpc.com',
  chainId: 137, // Polygon mainnet

  // Trading Configuration
  strategies: ['spike', 'arbitrage', 'ai-prediction'],
  maxPositionSize: parseFloat(process.env.MAX_POSITION_SIZE || '100'), // in USDC
  maxConcurrentTrades: parseInt(process.env.MAX_CONCURRENT_TRADES || '5'),
  minLiquidity: parseFloat(process.env.MIN_LIQUIDITY || '1000'), // minimum market liquidity

  // Risk Management
  stopLossPercentage: parseFloat(process.env.STOP_LOSS_PERCENTAGE || '10'), // 10% stop loss
  takeProfitPercentage: parseFloat(process.env.TAKE_PROFIT_PERCENTAGE || '20'), // 20% take profit
  maxSlippage: parseFloat(process.env.MAX_SLIPPAGE || '5'), // 5% max slippage
  maxHoldingTime: parseFloat(process.env.MAX_HOLDING_TIME || '24'), // 24 hours

  // AI Configuration
  aiEnabled: process.env.AI_ENABLED === 'true',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  aiConfidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.7'), // 70% confidence

  // Monitoring
  enableDashboard: process.env.ENABLE_DASHBOARD !== 'false',
  logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
};

// Validate configuration
export function validateConfig(cfg: BotConfig): boolean {
  if (!cfg.privateKey) {
    console.error('Error: POLYMARKET_PRIVATE_KEY is required');
    return false;
  }

  if (cfg.aiEnabled && !cfg.anthropicApiKey) {
    console.error('Error: ANTHROPIC_API_KEY is required when AI is enabled');
    return false;
  }

  if (cfg.maxPositionSize <= 0) {
    console.error('Error: MAX_POSITION_SIZE must be positive');
    return false;
  }

  return true;
}
