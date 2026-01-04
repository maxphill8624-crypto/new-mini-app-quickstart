#!/bin/bash
# Setup cron job to run Polymarket Monitor every hour

# Get the absolute path to the run script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUN_SCRIPT="$SCRIPT_DIR/run_hourly.sh"

# Make run script executable
chmod +x "$RUN_SCRIPT"

# Create cron job entry
CRON_JOB="0 * * * * $RUN_SCRIPT >> $SCRIPT_DIR/../polymarket_cron.log 2>&1"

# Add to crontab if not already present
(crontab -l 2>/dev/null | grep -v "$RUN_SCRIPT"; echo "$CRON_JOB") | crontab -

echo "Cron job installed successfully!"
echo "The monitor will run every hour at :00 minutes"
echo "Logs will be written to: $SCRIPT_DIR/../polymarket_cron.log"
echo ""
echo "To view current cron jobs: crontab -l"
echo "To remove this cron job: crontab -e (then delete the line)"
