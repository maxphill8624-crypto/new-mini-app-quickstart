#!/bin/bash
# Run Polymarket Monitor every hour
# This script can be added to cron for automated monitoring

# Change to script directory
cd "$(dirname "$0")/.." || exit 1

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run the monitor
python main.py --mode single

# Deactivate virtual environment
if [ -d "venv" ]; then
    deactivate
fi
