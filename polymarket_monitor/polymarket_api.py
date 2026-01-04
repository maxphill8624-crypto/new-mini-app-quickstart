"""
Polymarket API Client
Handles all interactions with Polymarket and PolygonScan APIs
"""
import requests
import time
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import logging

from config import api_config, monitor_config

logger = logging.getLogger(__name__)


class RateLimiter:
    """Simple rate limiter to avoid hitting API limits"""

    def __init__(self, requests_per_minute: int = 50):
        self.requests_per_minute = requests_per_minute
        self.requests = []

    def wait_if_needed(self):
        """Wait if we're hitting rate limits"""
        now = time.time()
        # Remove requests older than 1 minute
        self.requests = [req_time for req_time in self.requests if now - req_time < 60]

        if len(self.requests) >= self.requests_per_minute:
            sleep_time = 60 - (now - self.requests[0])
            if sleep_time > 0:
                logger.info(f"Rate limit approached, sleeping for {sleep_time:.2f}s")
                time.sleep(sleep_time)

        self.requests.append(now)


class PolymarketAPI:
    """Client for Polymarket APIs"""

    def __init__(self):
        self.gamma_base = api_config.GAMMA_API_BASE
        self.data_base = api_config.DATA_API_BASE
        self.clob_base = api_config.CLOB_API_BASE
        self.rate_limiter = RateLimiter(monitor_config.REQUESTS_PER_MINUTE)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; PolymarketMonitor/1.0)'
        })

    def _make_request(self, url: str, params: Optional[Dict] = None, retry_count: int = 0) -> Optional[Dict]:
        """Make HTTP request with retry logic and rate limiting"""
        self.rate_limiter.wait_if_needed()

        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {url} - {str(e)}")
            if retry_count < monitor_config.RETRY_ATTEMPTS:
                wait_time = monitor_config.RETRY_DELAY * (2 ** retry_count)  # Exponential backoff
                logger.info(f"Retrying in {wait_time}s... (attempt {retry_count + 1})")
                time.sleep(wait_time)
                return self._make_request(url, params, retry_count + 1)
            return None

    def get_markets(self, limit: int = 100, offset: int = 0, active_only: bool = True) -> List[Dict]:
        """
        Fetch markets from Gamma API
        Returns list of market data dictionaries
        """
        url = f"{self.gamma_base}/markets"
        params = {
            'limit': limit,
            'offset': offset,
            'closed': 'false' if active_only else None
        }
        # Remove None values
        params = {k: v for k, v in params.items() if v is not None}

        data = self._make_request(url, params)
        if data and isinstance(data, list):
            return data
        return []

    def get_all_markets(self, active_only: bool = True, max_markets: int = 500) -> List[Dict]:
        """
        Fetch all markets using pagination
        """
        all_markets = []
        offset = 0
        limit = 100

        while len(all_markets) < max_markets:
            markets = self.get_markets(limit=limit, offset=offset, active_only=active_only)
            if not markets:
                break

            all_markets.extend(markets)
            logger.info(f"Fetched {len(all_markets)} markets so far...")

            if len(markets) < limit:
                # Last page
                break

            offset += limit

        logger.info(f"Total markets fetched: {len(all_markets)}")
        return all_markets[:max_markets]

    def get_events(self, limit: int = 100, offset: int = 0, active_only: bool = True) -> List[Dict]:
        """
        Fetch events from Gamma API
        Events contain grouped markets
        """
        url = f"{self.gamma_base}/events"
        params = {
            'limit': limit,
            'offset': offset,
            'closed': 'false' if active_only else None,
            'order': 'id',
            'ascending': 'false'
        }
        params = {k: v for k, v in params.items() if v is not None}

        data = self._make_request(url, params)
        if data and isinstance(data, list):
            return data
        return []

    def get_trades(self, market_id: Optional[str] = None, user_address: Optional[str] = None,
                   limit: int = 100) -> List[Dict]:
        """
        Fetch trades from Data API
        Can filter by market_id or user_address
        """
        url = f"{self.data_base}/trades"
        params = {'limit': limit}

        if market_id:
            params['market'] = market_id
        if user_address:
            params['user'] = user_address

        data = self._make_request(url, params)
        if data and isinstance(data, list):
            return data
        elif data and 'data' in data:
            return data['data']
        return []

    def get_market_trades_by_condition(self, condition_id: str, limit: int = 1000) -> List[Dict]:
        """
        Get all recent trades for a specific market condition
        """
        # The endpoint structure may vary, trying common patterns
        url = f"{self.clob_base}/trades"
        params = {
            'condition_id': condition_id,
            'limit': limit
        }

        data = self._make_request(url, params)
        if data and isinstance(data, list):
            return data
        elif data and 'data' in data:
            return data['data']
        return []

    def get_simplified_markets(self) -> List[Dict]:
        """
        Get simplified market data for easier processing
        Returns: List of dicts with essential market info
        """
        markets = self.get_all_markets()
        simplified = []

        for market in markets:
            try:
                simplified_market = {
                    'condition_id': market.get('condition_id', ''),
                    'question': market.get('question', ''),
                    'slug': market.get('slug', ''),
                    'volume': float(market.get('volume', 0)),
                    'liquidity': float(market.get('liquidity', 0)),
                    'active': market.get('active', True),
                    'closed': market.get('closed', False),
                    'end_date': market.get('end_date_iso', ''),
                    'tokens': market.get('tokens', []),
                    'market_data': market  # Keep full data for reference
                }
                simplified.append(simplified_market)
            except Exception as e:
                logger.error(f"Error parsing market: {e}")
                continue

        return simplified


class PolygonScanAPI:
    """Client for PolygonScan API to check wallet age and activity"""

    def __init__(self):
        self.base_url = api_config.POLYGONSCAN_API_BASE
        self.api_key = api_config.POLYGONSCAN_API_KEY
        self.rate_limiter = RateLimiter(requests_per_minute=5)  # PolygonScan has stricter limits
        self.session = requests.Session()

    def _make_request(self, params: Dict) -> Optional[Dict]:
        """Make request to PolygonScan API"""
        self.rate_limiter.wait_if_needed()

        params['apikey'] = self.api_key
        try:
            response = self.session.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"PolygonScan request failed: {str(e)}")
            return None

    def get_wallet_transactions(self, address: str, limit: int = 10000) -> List[Dict]:
        """
        Get transaction history for a wallet address
        """
        params = {
            'module': 'account',
            'action': 'txlist',
            'address': address,
            'startblock': 0,
            'endblock': 99999999,
            'page': 1,
            'offset': limit,
            'sort': 'asc'
        }

        data = self._make_request(params)
        if data and data.get('status') == '1' and 'result' in data:
            return data['result']
        return []

    def get_wallet_age_days(self, address: str) -> Optional[int]:
        """
        Get the age of a wallet in days (time since first transaction)
        """
        try:
            txs = self.get_wallet_transactions(address, limit=1)
            if txs and len(txs) > 0:
                first_tx_timestamp = int(txs[0]['timeStamp'])
                first_tx_date = datetime.fromtimestamp(first_tx_timestamp)
                age_days = (datetime.now() - first_tx_date).days
                return age_days
            return None
        except Exception as e:
            logger.error(f"Error getting wallet age for {address}: {e}")
            return None

    def get_wallet_tx_count(self, address: str) -> int:
        """
        Get total transaction count for a wallet
        """
        params = {
            'module': 'proxy',
            'action': 'eth_getTransactionCount',
            'address': address,
            'tag': 'latest'
        }

        data = self._make_request(params)
        if data and 'result' in data:
            try:
                # Result is in hex
                return int(data['result'], 16)
            except:
                return 0
        return 0

    def get_wallet_info(self, address: str) -> Dict[str, Any]:
        """
        Get comprehensive wallet information
        Returns: Dict with age_days, tx_count, is_new, is_low_activity
        """
        age_days = self.get_wallet_age_days(address)
        tx_count = self.get_wallet_tx_count(address)

        return {
            'address': address,
            'age_days': age_days,
            'tx_count': tx_count,
            'is_new': age_days is not None and age_days <= 30,
            'is_low_activity': tx_count <= 10,
            'is_suspicious': (age_days is not None and age_days <= 30) or tx_count <= 10
        }
