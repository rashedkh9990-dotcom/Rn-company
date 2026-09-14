#!/bin/bash

echo "==================================================="
echo "            Starting Anisa AI Assistant            "
echo "==================================================="
echo ""

# Try opening browser in background
(sleep 2 && (xdg-open http://localhost:3000 || open http://localhost:3000 || sensible-browser http://localhost:3000) &) 2>/dev/null &

echo "Running server on http://localhost:3000 ..."
echo "Press Ctrl+C to stop the server."
echo ""
npm start
