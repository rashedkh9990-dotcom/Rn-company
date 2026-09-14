#!/bin/bash
set -e

echo "==================================================="
echo "     Anisa AI Assistant - PC Setup (Mac / Linux)   "
echo "==================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please download and install Node.js (v18+) from: https://nodejs.org/"
    exit 1
fi

echo "[1/4] Node.js found: $(node -v)"
echo ""

# Create .env if missing
if [ ! -f .env ]; then
    echo "[2/4] Creating .env file..."
    cp .env.example .env
    echo "Remember to set your GEMINI_API_KEY in .env!"
else
    echo "[2/4] .env file already exists."
fi
echo ""

# Install dependencies
echo "[3/4] Installing dependencies (npm install)..."
npm install
echo "Dependencies installed."
echo ""

# Build frontend
echo "[4/4] Building production frontend (npm run build)..."
npm run build
echo ""

echo "==================================================="
echo "              Setup Completed Successfully!        "
echo "==================================================="
echo "Run ./start.sh to launch the application!"
