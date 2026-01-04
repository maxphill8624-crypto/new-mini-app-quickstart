#!/usr/bin/env python3
"""
Polymarket Insider Trading Detector
Main orchestrator for monitoring and detecting anomalies
"""
import logging
import time
import argparse
from datetime import datetime, timedelta
from typing import List, Dict, Set
import sys

from polymarket_api import PolymarketAPI, PolygonScanAPI
from anomaly_detector import AnomalyDetector
from alerting import AlertSystem
from config import monitor_config, detection_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('polymarket_monitor.log')
    ]
)
logger = logging.getLogger(__name__)


class PolymarketMonitor:
    """Main monitoring orchestrator"""

    def __init__(self):
        self.polymarket_api = PolymarketAPI()
        self.polygon_api = PolygonScanAPI()
        self.detector = AnomalyDetector()
        self.alert_system = AlertSystem()
        self.processed_trades = set()  # Track processed trade IDs to avoid duplicates

    def run_single_scan(self, specific_market_slug: str = None):
        """
        Run a single scan of markets
        """
        logger.info("="*80)
        logger.info("Starting Polymarket insider trading scan...")
        logger.info(f"Timestamp: {datetime.now()}")
        logger.info("="*80)

        try:
            # Step 1: Fetch markets
            markets = self._fetch_markets(specific_market_slug)
            logger.info(f"Monitoring {len(markets)} markets")

            # Step 2: Analyze each market
            for i, market in enumerate(markets, 1):
                try:
                    logger.info(f"[{i}/{len(markets)}] Analyzing: {market['question'][:80]}...")
                    self._analyze_market(market)
                except Exception as e:
                    logger.error(f"Error analyzing market {market.get('slug', 'unknown')}: {e}")
                    continue

            # Step 3: Print summary
            self.alert_system.print_summary()

            logger.info("Scan complete!")

        except Exception as e:
            logger.error(f"Error during scan: {e}", exc_info=True)

    def run_continuous(self, interval_seconds: int = None):
        """
        Run continuous monitoring with periodic scans
        """
        interval = interval_seconds or monitor_config.CHECK_INTERVAL

        logger.info("Starting continuous monitoring mode")
        logger.info(f"Scan interval: {interval} seconds ({interval/3600:.1f} hours)")
        logger.info("Press Ctrl+C to stop")

        scan_count = 0
        try:
            while True:
                scan_count += 1
                logger.info(f"\n{'='*80}")
                logger.info(f"SCAN #{scan_count}")
                logger.info(f"{'='*80}")

                self.run_single_scan()

                logger.info(f"\nSleeping for {interval} seconds until next scan...")
                logger.info(f"Next scan at: {datetime.now() + timedelta(seconds=interval)}")

                time.sleep(interval)

        except KeyboardInterrupt:
            logger.info("\nMonitoring stopped by user")
            self.alert_system.print_summary()

    def _fetch_markets(self, specific_slug: str = None) -> List[Dict]:
        """Fetch markets to monitor"""
        if specific_slug:
            # Fetch specific market by slug
            all_markets = self.polymarket_api.get_simplified_markets()
            markets = [m for m in all_markets if m['slug'] == specific_slug]
            if not markets:
                logger.warning(f"Market with slug '{specific_slug}' not found")
            return markets

        if monitor_config.MONITOR_ALL_MARKETS:
            return self.polymarket_api.get_simplified_markets()
        else:
            # Monitor specific market IDs from config
            all_markets = self.polymarket_api.get_simplified_markets()
            return [m for m in all_markets if m['condition_id'] in monitor_config.SPECIFIC_MARKET_IDS]

    def _analyze_market(self, market: Dict):
        """Analyze a single market for anomalies"""
        condition_id = market.get('condition_id')
        if not condition_id:
            logger.warning("Market missing condition_id, skipping")
            return

        # Fetch recent trades for this market
        trades = self.polymarket_api.get_market_trades_by_condition(condition_id)

        if not trades:
            logger.debug(f"No trades found for market {market['question'][:50]}")
            return

        logger.info(f"  Found {len(trades)} trades to analyze")

        # Analyze each trade
        for trade in trades:
            try:
                self._analyze_trade(trade, market, trades)
            except Exception as e:
                logger.debug(f"Error analyzing trade: {e}")
                continue

    def _analyze_trade(self, trade: Dict, market: Dict, all_market_trades: List[Dict]):
        """Analyze a single trade for anomalies"""

        # Generate unique trade ID to avoid duplicates
        trade_id = self._generate_trade_id(trade)
        if trade_id in self.processed_trades:
            return
        self.processed_trades.add(trade_id)

        # Get wallet address
        wallet_address = self._get_wallet_address(trade)
        if not wallet_address:
            return

        # Check if trade is recent (within lookback window)
        if not self._is_recent_trade(trade):
            return

        # Get wallet information from blockchain
        logger.debug(f"  Checking wallet: {wallet_address[:10]}...")
        wallet_info = self.polygon_api.get_wallet_info(wallet_address)

        # Run anomaly detection
        is_anomalous, reasons = self.detector.analyze_trade(trade, market, wallet_info)

        # Check for concentration
        is_concentrated, concentration_reasons = self.detector.analyze_market_concentration(
            wallet_address, trade, market, all_market_trades
        )

        if is_concentrated:
            is_anomalous = True
            reasons.extend(concentration_reasons)

        # Generate alert if anomalous
        if is_anomalous and reasons:
            alert = self.detector.generate_alert(trade, market, wallet_info, reasons)
            self.alert_system.send_alert(alert)

    def _generate_trade_id(self, trade: Dict) -> str:
        """Generate unique ID for a trade"""
        # Use available fields to create unique identifier
        return f"{trade.get('id', '')}{trade.get('timestamp', '')}{trade.get('maker_address', '')}{trade.get('taker_address', '')}"

    def _get_wallet_address(self, trade: Dict) -> str:
        """Extract wallet address from trade"""
        # Try different possible field names
        return (trade.get('maker_address') or
                trade.get('taker_address') or
                trade.get('user_address') or
                trade.get('wallet_address', ''))

    def _is_recent_trade(self, trade: Dict) -> bool:
        """Check if trade is within the lookback window"""
        try:
            trade_date = self._parse_trade_date(trade)
            if not trade_date:
                return True  # If we can't parse, include it

            cutoff = datetime.now() - timedelta(hours=monitor_config.TRADE_LOOKBACK_HOURS)
            return trade_date >= cutoff
        except:
            return True

    def _parse_trade_date(self, trade: Dict) -> datetime:
        """Parse trade timestamp"""
        try:
            timestamp = trade.get('timestamp') or trade.get('created_at') or trade.get('time')
            if isinstance(timestamp, (int, float)):
                return datetime.fromtimestamp(timestamp)
            elif isinstance(timestamp, str):
                return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return None
        except:
            return None


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Polymarket Insider Trading Detector - Monitor for suspicious trading patterns'
    )
    parser.add_argument(
        '--mode',
        choices=['single', 'continuous'],
        default='single',
        help='Run mode: single scan or continuous monitoring (default: single)'
    )
    parser.add_argument(
        '--interval',
        type=int,
        help=f'Interval between scans in seconds (default: {monitor_config.CHECK_INTERVAL})'
    )
    parser.add_argument(
        '--market',
        type=str,
        help='Monitor specific market by slug (e.g., "will-maduro-be-out-by-january-31")'
    )
    parser.add_argument(
        '--debug',
        action='store_true',
        help='Enable debug logging'
    )

    args = parser.parse_args()

    # Set debug level if requested
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)

    # Create monitor
    monitor = PolymarketMonitor()

    # Run in selected mode
    if args.mode == 'continuous':
        monitor.run_continuous(interval_seconds=args.interval)
    else:
        monitor.run_single_scan(specific_market_slug=args.market)


if __name__ == '__main__':
    main()
