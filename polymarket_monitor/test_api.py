#!/usr/bin/env python3
"""
Quick test script to verify API connectivity
"""
import sys
import logging

logging.basicConfig(level=logging.INFO)

# Test imports
print("Testing imports...")
try:
    from polymarket_api import PolymarketAPI, PolygonScanAPI
    from anomaly_detector import AnomalyDetector
    from alerting import AlertSystem
    from config import api_config
    print("✓ All imports successful!")
except ImportError as e:
    print(f"✗ Import failed: {e}")
    sys.exit(1)

# Test API connectivity
print("\nTesting Polymarket API connectivity...")
try:
    api = PolymarketAPI()
    markets = api.get_markets(limit=5)
    print(f"✓ Successfully fetched {len(markets)} markets")
    if markets:
        print(f"  Example market: {markets[0].get('question', 'N/A')[:80]}")
except Exception as e:
    print(f"✗ API test failed: {e}")
    sys.exit(1)

print("\n✓ All tests passed! System is ready to run.")
print("\nTo start monitoring, run:")
print("  python main.py --mode single")
