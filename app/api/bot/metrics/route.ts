import { NextResponse } from 'next/server';

// This would connect to your actual bot instance
// For now, returning mock data
export async function GET() {
  // In production, this would fetch from the bot instance
  const metrics = {
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

  return NextResponse.json(metrics);
}
