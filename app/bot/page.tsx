'use client';

import { useState, useEffect } from 'react';

interface BotMetrics {
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

interface Position {
  marketId: string;
  tokenId: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  entryTime: Date;
}

export default function BotDashboard() {
  const [metrics, setMetrics] = useState<BotMetrics | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Fetch bot status and metrics
    const fetchData = async () => {
      try {
        const metricsRes = await fetch('/api/bot/metrics');
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);

        const positionsRes = await fetch('/api/bot/positions');
        const positionsData = await positionsRes.json();
        setPositions(positionsData);

        const statusRes = await fetch('/api/bot/status');
        const statusData = await statusRes.json();
        setIsRunning(statusData.running);
      } catch (error) {
        console.error('Error fetching bot data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const startBot = async () => {
    try {
      await fetch('/api/bot/start', { method: 'POST' });
      setIsRunning(true);
    } catch (error) {
      console.error('Error starting bot:', error);
    }
  };

  const stopBot = async () => {
    try {
      await fetch('/api/bot/stop', { method: 'POST' });
      setIsRunning(false);
    } catch (error) {
      console.error('Error stopping bot:', error);
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Polymarket Prediction Bot</h1>
          <div className="flex gap-4">
            <button
              onClick={startBot}
              disabled={isRunning}
              className={`px-6 py-2 rounded-lg font-semibold ${
                isRunning
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Start Bot
            </button>
            <button
              onClick={stopBot}
              disabled={!isRunning}
              className={`px-6 py-2 rounded-lg font-semibold ${
                !isRunning
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Stop Bot
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full ${
                isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-xl">
              Status: {isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Trades"
              value={metrics.totalTrades}
              subtitle={`${metrics.successfulTrades} successful, ${metrics.failedTrades} failed`}
            />
            <MetricCard
              title="Win Rate"
              value={`${metrics.winRate.toFixed(1)}%`}
              subtitle="Success percentage"
            />
            <MetricCard
              title="Total P&L"
              value={`$${metrics.totalPnL.toFixed(2)}`}
              valueColor={metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}
              subtitle={`Volume: $${metrics.totalVolume.toFixed(2)}`}
            />
            <MetricCard
              title="Active Positions"
              value={metrics.activePositions}
              subtitle={`Uptime: ${formatUptime(metrics.uptime)}`}
            />
          </div>
        )}

        {/* Active Positions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Active Positions</h2>
          {positions.length === 0 ? (
            <p className="text-gray-400">No active positions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-3">Market ID</th>
                    <th className="pb-3">Size</th>
                    <th className="pb-3">Entry Price</th>
                    <th className="pb-3">Current Price</th>
                    <th className="pb-3">P&L</th>
                    <th className="pb-3">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position, idx) => {
                    const duration = Date.now() - new Date(position.entryTime).getTime();
                    const pnlColor = position.pnl >= 0 ? 'text-green-400' : 'text-red-400';

                    return (
                      <tr key={idx} className="border-b border-gray-700">
                        <td className="py-3 font-mono text-sm">
                          {position.marketId.substring(0, 12)}...
                        </td>
                        <td className="py-3">{position.size.toFixed(2)}</td>
                        <td className="py-3">${position.entryPrice.toFixed(3)}</td>
                        <td className="py-3">${position.currentPrice.toFixed(3)}</td>
                        <td className={`py-3 font-semibold ${pnlColor}`}>
                          ${position.pnl.toFixed(2)}
                        </td>
                        <td className="py-3">{formatUptime(duration)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Strategy Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StrategyCard
            title="Spike Detection"
            description="Detects sudden price movements and trades on momentum"
            status="Active"
          />
          <StrategyCard
            title="Arbitrage"
            description="Exploits price discrepancies across markets"
            status="Active"
          />
          <StrategyCard
            title="AI Predictions"
            description="Uses Claude AI to analyze and predict market outcomes"
            status="Active"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  valueColor = 'text-white'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
      <p className={`text-3xl font-bold mb-1 ${valueColor}`}>{value}</p>
      {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
    </div>
  );
}

function StrategyCard({
  title,
  description,
  status
}: {
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="px-3 py-1 bg-green-600 text-xs rounded-full">{status}</span>
      </div>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
