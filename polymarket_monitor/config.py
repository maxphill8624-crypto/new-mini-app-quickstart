"""
Configuration for Polymarket Insider Trading Detector
"""
import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class APIConfig:
    """API endpoint configuration"""
    GAMMA_API_BASE = "https://gamma-api.polymarket.com"
    DATA_API_BASE = "https://data-api.polymarket.com"
    CLOB_API_BASE = "https://clob.polymarket.com"
    POLYGONSCAN_API_BASE = "https://api.polygonscan.com/api"
    POLYGONSCAN_API_KEY: Optional[str] = os.getenv("POLYGONSCAN_API_KEY", "YourApiKeyToken")  # Free key from polygonscan.com


@dataclass
class DetectionConfig:
    """Anomaly detection thresholds"""

    # Wallet age thresholds
    NEW_WALLET_DAYS = 30  # Wallet created within last 30 days
    LOW_ACTIVITY_TX_COUNT = 10  # Less than 10 transactions = low activity

    # Bet size thresholds (in USD)
    LARGE_BET_THRESHOLD = 10000  # Flag bets over $10k
    VERY_LARGE_BET_THRESHOLD = 50000  # High priority over $50k

    # Market liquidity thresholds
    LOW_LIQUIDITY_VOLUME = 50000  # Markets with < $50k volume
    NICHE_MARKET_VOLUME = 10000  # Very niche markets < $10k volume

    # Activity spike detection
    SPIKE_MULTIPLIER = 5  # Flag if current activity is 5x average
    MIN_TRADES_FOR_SPIKE = 3  # Need at least 3 trades to detect spike

    # Position concentration (what % of market they bought)
    HIGH_CONCENTRATION_PCT = 10  # Flag if wallet holds >10% of market


@dataclass
class MonitorConfig:
    """Monitoring configuration"""

    # How often to check (in seconds)
    CHECK_INTERVAL = 3600  # 1 hour

    # Markets to monitor
    MONITOR_ALL_MARKETS = True  # Set to False to monitor specific markets
    SPECIFIC_MARKET_IDS = []  # Add market condition IDs here if MONITOR_ALL_MARKETS=False

    # Only monitor active markets
    ONLY_ACTIVE_MARKETS = True

    # Time window for trade analysis (in hours)
    TRADE_LOOKBACK_HOURS = 24  # Analyze last 24 hours of trades

    # API rate limiting
    REQUESTS_PER_MINUTE = 50  # Stay under free tier limit
    RETRY_ATTEMPTS = 3
    RETRY_DELAY = 2  # seconds

    # Logging
    LOG_FILE = "polymarket_alerts.log"
    CONSOLE_OUTPUT = True

    # Email alerts (optional - requires SMTP setup)
    EMAIL_ALERTS = False
    EMAIL_FROM = os.getenv("EMAIL_FROM", "")
    EMAIL_TO = os.getenv("EMAIL_TO", "")
    EMAIL_SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    EMAIL_SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")


# Global instances
api_config = APIConfig()
detection_config = DetectionConfig()
monitor_config = MonitorConfig()
