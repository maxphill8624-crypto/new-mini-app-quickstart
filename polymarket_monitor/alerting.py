"""
Alert System
Handles console output, file logging, and email notifications
"""
import logging
import json
from datetime import datetime
from typing import Dict, Any, List
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import monitor_config

logger = logging.getLogger(__name__)


class AlertSystem:
    """Manages alert output through various channels"""

    def __init__(self):
        self.log_file = monitor_config.LOG_FILE
        self.console_output = monitor_config.CONSOLE_OUTPUT
        self.email_alerts = monitor_config.EMAIL_ALERTS
        self.alerts_sent = []

        # Set up file logging
        self._setup_file_logging()

    def _setup_file_logging(self):
        """Configure file logging for alerts"""
        file_handler = logging.FileHandler(self.log_file, mode='a')
        file_handler.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)

        alert_logger = logging.getLogger('alerts')
        alert_logger.setLevel(logging.INFO)
        alert_logger.addHandler(file_handler)

    def send_alert(self, alert: Dict[str, Any]):
        """
        Send an alert through configured channels
        """
        self.alerts_sent.append(alert)

        # Console output
        if self.console_output:
            self._print_alert(alert)

        # File logging
        self._log_alert(alert)

        # Email (if configured)
        if self.email_alerts:
            try:
                self._send_email_alert(alert)
            except Exception as e:
                logger.error(f"Failed to send email alert: {e}")

    def _print_alert(self, alert: Dict[str, Any]):
        """Print formatted alert to console"""
        severity = alert['severity']
        severity_colors = {
            'CRITICAL': '\033[91m',  # Red
            'HIGH': '\033[93m',      # Yellow
            'MEDIUM': '\033[94m',    # Blue
            'LOW': '\033[92m'        # Green
        }
        reset_color = '\033[0m'

        color = severity_colors.get(severity, '')

        print(f"\n{color}{'='*80}")
        print(f"🚨 ANOMALY DETECTED - SEVERITY: {severity}")
        print(f"{'='*80}{reset_color}\n")

        print(f"Timestamp: {alert['timestamp']}")
        print(f"Market: {alert['market_question']}")
        print(f"Market URL: {alert.get('polymarket_url', 'N/A')}")
        print(f"\nWallet: {alert['wallet_address']}")
        print(f"  - Age: {alert['wallet_info'].get('age_days', 'unknown')} days")
        print(f"  - Transactions: {alert['wallet_info'].get('tx_count', 'unknown')}")
        print(f"  - Is New: {alert['wallet_info'].get('is_new', 'unknown')}")
        print(f"  - Low Activity: {alert['wallet_info'].get('is_low_activity', 'unknown')}")

        print(f"\nTrade Details:")
        print(f"  - Value: ${alert['trade_value']:,.2f}")
        print(f"  - Side: {alert['trade_side']}")
        print(f"  - Price: {alert['trade_price']}")
        print(f"  - Size: {alert['trade_size']}")

        print(f"\nMarket Stats:")
        print(f"  - Volume: ${alert['market_volume']:,.2f}")
        print(f"  - Liquidity: ${alert['market_liquidity']:,.2f}")

        print(f"\n{color}Anomaly Reasons:{reset_color}")
        for i, reason in enumerate(alert['anomaly_reasons'], 1):
            print(f"  {i}. {reason}")

        print(f"\n{color}{'='*80}{reset_color}\n")

    def _log_alert(self, alert: Dict[str, Any]):
        """Log alert to file"""
        alert_logger = logging.getLogger('alerts')

        # Create a clean version without raw trade data for logging
        clean_alert = {k: v for k, v in alert.items() if k != 'raw_trade'}

        alert_logger.info(f"ANOMALY - {alert['severity']} - {json.dumps(clean_alert, indent=2)}")

    def _send_email_alert(self, alert: Dict[str, Any]):
        """Send alert via email"""
        if not all([monitor_config.EMAIL_FROM, monitor_config.EMAIL_TO,
                    monitor_config.EMAIL_SMTP_SERVER, monitor_config.EMAIL_PASSWORD]):
            logger.warning("Email configuration incomplete, skipping email alert")
            return

        subject = f"🚨 Polymarket Insider Alert - {alert['severity']} - {alert['market_question'][:50]}"

        body = self._format_email_body(alert)

        msg = MIMEMultipart()
        msg['From'] = monitor_config.EMAIL_FROM
        msg['To'] = monitor_config.EMAIL_TO
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        try:
            with smtplib.SMTP(monitor_config.EMAIL_SMTP_SERVER, monitor_config.EMAIL_SMTP_PORT) as server:
                server.starttls()
                server.login(monitor_config.EMAIL_FROM, monitor_config.EMAIL_PASSWORD)
                server.send_message(msg)
            logger.info(f"Email alert sent for {alert['wallet_address']}")
        except Exception as e:
            logger.error(f"Failed to send email: {e}")

    def _format_email_body(self, alert: Dict[str, Any]) -> str:
        """Format alert as email body"""
        body = f"""
POLYMARKET INSIDER TRADING ALERT
Severity: {alert['severity']}
Detected: {alert['timestamp']}

{'='*70}
MARKET INFORMATION
{'='*70}
Question: {alert['market_question']}
URL: {alert.get('polymarket_url', 'N/A')}
Volume: ${alert['market_volume']:,.2f}
Liquidity: ${alert['market_liquidity']:,.2f}

{'='*70}
WALLET INFORMATION
{'='*70}
Address: {alert['wallet_address']}
Age: {alert['wallet_info'].get('age_days', 'unknown')} days
Total Transactions: {alert['wallet_info'].get('tx_count', 'unknown')}
New Wallet: {alert['wallet_info'].get('is_new', 'unknown')}
Low Activity: {alert['wallet_info'].get('is_low_activity', 'unknown')}

{'='*70}
TRADE DETAILS
{'='*70}
Value: ${alert['trade_value']:,.2f}
Side: {alert['trade_side']}
Price: {alert['trade_price']}
Size: {alert['trade_size']}

{'='*70}
ANOMALY REASONS
{'='*70}
"""
        for i, reason in enumerate(alert['anomaly_reasons'], 1):
            body += f"{i}. {reason}\n"

        body += f"\n{'='*70}\n"
        body += "\nThis is an automated alert from Polymarket Insider Trading Detector.\n"

        return body

    def get_summary(self) -> Dict[str, Any]:
        """Get summary of alerts sent"""
        if not self.alerts_sent:
            return {
                'total_alerts': 0,
                'by_severity': {},
                'unique_wallets': 0
            }

        severity_counts = {}
        unique_wallets = set()

        for alert in self.alerts_sent:
            severity = alert['severity']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            unique_wallets.add(alert['wallet_address'])

        return {
            'total_alerts': len(self.alerts_sent),
            'by_severity': severity_counts,
            'unique_wallets': len(unique_wallets),
            'alerts': self.alerts_sent
        }

    def print_summary(self):
        """Print summary of this monitoring session"""
        summary = self.get_summary()

        print("\n" + "="*80)
        print("MONITORING SESSION SUMMARY")
        print("="*80)
        print(f"Total Alerts: {summary['total_alerts']}")
        print(f"Unique Wallets Flagged: {summary['unique_wallets']}")

        if summary['by_severity']:
            print("\nAlerts by Severity:")
            for severity, count in sorted(summary['by_severity'].items()):
                print(f"  {severity}: {count}")

        print("="*80 + "\n")


def create_alert_system() -> AlertSystem:
    """Factory function to create alert system instance"""
    return AlertSystem()
