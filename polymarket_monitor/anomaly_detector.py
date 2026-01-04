"""
Anomaly Detection Logic
Detects suspicious trading patterns that may indicate insider trading
"""
import logging
from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import statistics

from config import detection_config

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """Detects anomalous trading patterns"""

    def __init__(self):
        self.detection_config = detection_config

    def analyze_trade(self, trade: Dict, market: Dict, wallet_info: Dict) -> Tuple[bool, List[str]]:
        """
        Analyze a single trade for anomalies
        Returns: (is_anomalous, list_of_reasons)
        """
        reasons = []
        is_anomalous = False

        # Calculate trade value in USD
        trade_value = self._calculate_trade_value(trade)

        # Check 1: Large bet from new wallet
        if wallet_info.get('is_new') and trade_value > self.detection_config.LARGE_BET_THRESHOLD:
            reasons.append(f"NEW WALLET (age: {wallet_info.get('age_days', 'unknown')} days) placing LARGE BET (${trade_value:,.2f})")
            is_anomalous = True

        # Check 2: Large bet from low-activity wallet
        if wallet_info.get('is_low_activity') and trade_value > self.detection_config.LARGE_BET_THRESHOLD:
            reasons.append(f"LOW ACTIVITY WALLET ({wallet_info.get('tx_count', 0)} txs) placing LARGE BET (${trade_value:,.2f})")
            is_anomalous = True

        # Check 3: Very large bet (always flag)
        if trade_value > self.detection_config.VERY_LARGE_BET_THRESHOLD:
            reasons.append(f"VERY LARGE BET: ${trade_value:,.2f}")
            is_anomalous = True

        # Check 4: Large bet in low-liquidity market
        market_volume = market.get('volume', 0)
        if trade_value > self.detection_config.LARGE_BET_THRESHOLD and market_volume < self.detection_config.LOW_LIQUIDITY_VOLUME:
            reasons.append(f"LARGE BET in LOW LIQUIDITY market (market volume: ${market_volume:,.2f})")
            is_anomalous = True

        # Check 5: Large bet in niche market
        if trade_value > self.detection_config.LARGE_BET_THRESHOLD and market_volume < self.detection_config.NICHE_MARKET_VOLUME:
            reasons.append(f"LARGE BET in NICHE market (market volume: ${market_volume:,.2f})")
            is_anomalous = True

        return is_anomalous, reasons

    def analyze_wallet_activity(self, wallet_address: str, trades: List[Dict]) -> Tuple[bool, List[str]]:
        """
        Analyze wallet's trading pattern for sudden spikes
        Returns: (is_anomalous, list_of_reasons)
        """
        if len(trades) < self.detection_config.MIN_TRADES_FOR_SPIKE:
            return False, []

        reasons = []
        is_anomalous = False

        # Group trades by time period (e.g., daily)
        daily_trade_counts = defaultdict(int)
        daily_trade_values = defaultdict(float)

        for trade in trades:
            try:
                trade_date = self._parse_trade_date(trade)
                if trade_date:
                    day = trade_date.date()
                    daily_trade_counts[day] += 1
                    daily_trade_values[day] += self._calculate_trade_value(trade)
            except Exception as e:
                logger.debug(f"Error parsing trade date: {e}")
                continue

        if not daily_trade_counts:
            return False, []

        # Calculate average and recent activity
        counts = list(daily_trade_counts.values())
        values = list(daily_trade_values.values())

        if len(counts) > 1:
            avg_daily_trades = statistics.mean(counts[:-1]) if len(counts) > 1 else counts[0]
            recent_trades = counts[-1]

            # Check for spike in trade count
            if avg_daily_trades > 0 and recent_trades > avg_daily_trades * self.detection_config.SPIKE_MULTIPLIER:
                reasons.append(f"ACTIVITY SPIKE: {recent_trades} trades vs avg {avg_daily_trades:.1f} trades/day")
                is_anomalous = True

            # Check for spike in trade value
            if len(values) > 1:
                avg_daily_value = statistics.mean(values[:-1]) if len(values) > 1 else values[0]
                recent_value = values[-1]
                if avg_daily_value > 0 and recent_value > avg_daily_value * self.detection_config.SPIKE_MULTIPLIER:
                    reasons.append(f"VALUE SPIKE: ${recent_value:,.2f} vs avg ${avg_daily_value:,.2f}/day")
                    is_anomalous = True

        return is_anomalous, reasons

    def analyze_market_concentration(self, wallet_address: str, trade: Dict, market: Dict,
                                      all_market_trades: List[Dict]) -> Tuple[bool, List[str]]:
        """
        Check if a wallet is accumulating a large percentage of a market
        Returns: (is_anomalous, list_of_reasons)
        """
        reasons = []
        is_anomalous = False

        try:
            # Calculate wallet's total position in this market
            wallet_shares = 0
            total_shares = 0

            for t in all_market_trades:
                shares = float(t.get('size', 0)) if t.get('size') else float(t.get('shares', 0))
                total_shares += abs(shares)

                if t.get('maker_address') == wallet_address or t.get('taker_address') == wallet_address:
                    # Positive if buying, negative if selling
                    if t.get('side') == 'BUY' or t.get('maker_address') == wallet_address:
                        wallet_shares += shares
                    else:
                        wallet_shares -= shares

            if total_shares > 0:
                concentration_pct = (abs(wallet_shares) / total_shares) * 100
                if concentration_pct > self.detection_config.HIGH_CONCENTRATION_PCT:
                    reasons.append(f"HIGH MARKET CONCENTRATION: Wallet holds {concentration_pct:.1f}% of market")
                    is_anomalous = True

        except Exception as e:
            logger.debug(f"Error calculating market concentration: {e}")

        return is_anomalous, reasons

    def _calculate_trade_value(self, trade: Dict) -> float:
        """
        Calculate USD value of a trade
        """
        try:
            # Try different possible field names
            price = float(trade.get('price', 0))
            size = float(trade.get('size', 0)) if trade.get('size') else float(trade.get('shares', 0))

            # If price is in cents (0.01 to 0.99 range), it's the probability
            # Multiply by size to get USD value
            if 0 < price < 1:
                value = price * size
            else:
                value = size

            return value
        except (ValueError, TypeError) as e:
            logger.debug(f"Error calculating trade value: {e}")
            return 0

    def _parse_trade_date(self, trade: Dict) -> datetime:
        """
        Parse trade timestamp into datetime object
        """
        try:
            # Try different timestamp formats
            timestamp = trade.get('timestamp') or trade.get('created_at') or trade.get('time')

            if isinstance(timestamp, (int, float)):
                # Unix timestamp
                return datetime.fromtimestamp(timestamp)
            elif isinstance(timestamp, str):
                # ISO format
                return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return None
        except Exception as e:
            logger.debug(f"Error parsing date: {e}")
            return None

    def generate_alert(self, trade: Dict, market: Dict, wallet_info: Dict,
                       anomaly_reasons: List[str]) -> Dict[str, Any]:
        """
        Generate a structured alert for an anomalous trade
        """
        trade_value = self._calculate_trade_value(trade)
        wallet_address = trade.get('maker_address') or trade.get('taker_address') or trade.get('user_address', 'unknown')

        alert = {
            'timestamp': datetime.now().isoformat(),
            'severity': self._calculate_severity(anomaly_reasons, trade_value),
            'wallet_address': wallet_address,
            'wallet_info': wallet_info,
            'market_question': market.get('question', 'Unknown'),
            'market_slug': market.get('slug', ''),
            'market_volume': market.get('volume', 0),
            'market_liquidity': market.get('liquidity', 0),
            'trade_value': trade_value,
            'trade_side': trade.get('side', 'unknown'),
            'trade_price': trade.get('price', 0),
            'trade_size': trade.get('size') or trade.get('shares', 0),
            'anomaly_reasons': anomaly_reasons,
            'polymarket_url': f"https://polymarket.com/event/{market.get('slug', '')}" if market.get('slug') else None,
            'raw_trade': trade,
        }

        return alert

    def _calculate_severity(self, reasons: List[str], trade_value: float) -> str:
        """
        Calculate alert severity based on reasons and trade value
        """
        if trade_value > self.detection_config.VERY_LARGE_BET_THRESHOLD:
            return 'CRITICAL'
        elif len(reasons) >= 3:
            return 'HIGH'
        elif len(reasons) >= 2:
            return 'MEDIUM'
        else:
            return 'LOW'


def create_detector() -> AnomalyDetector:
    """Factory function to create detector instance"""
    return AnomalyDetector()
