#!/usr/bin/env bash

set -e

echo "======================================================================"
echo "          AVANIYA LAND & ASSET PORTFOLIO MANAGER"
echo "         Real-time Liquidity & Deal Tracking Engine"
echo "======================================================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not found in PATH."
    echo "Please install Node.js (v18.17+ or v20+) from https://nodejs.org"
    exit 1
fi

# Install dependencies if missing
if [ ! -d "node_modules" ]; then
    echo "[INFO] First time setup: Installing npm dependencies..."
    echo ""
    npm install
fi

echo "[INFO] Starting Avaniya Portfolio Tracker on http://localhost:3000 ..."
echo "[INFO] Press Ctrl+C in this terminal anytime to stop the server."
echo ""

# Auto open browser on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 2 && open "http://localhost:3000") &
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    (sleep 2 && xdg-open "http://localhost:3000" 2>/dev/null) &
fi

# Launch Next.js dev server
npm run dev
