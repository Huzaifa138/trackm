#!/bin/bash
# ActivTrack Agent Setup Script
# This script sets up agents for testing with the correct environment variables

echo "====================================="
echo "ActivTrack Agent Setup Script"
echo "====================================="
echo

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOF
# API and WebSocket connection URLs
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000/ws

# Default organization ID for testing
DEFAULT_ORG_ID=1

# Agent settings
AGENT_SCREENSHOT_INTERVAL=300
AGENT_ACTIVITY_CHECK_INTERVAL=10
AGENT_IDLE_THRESHOLD=300
AGENT_HEARTBEAT_INTERVAL=60

# Server settings
PORT=5000
HOST=0.0.0.0
EOF
  echo "Created .env file with default settings"
else
  echo ".env file already exists, skipping creation"
fi

# Build agent packages
echo
echo "Building agent packages..."
mkdir -p dist
python desktop-agents/build_agents.py --org_id 1 --api_url "http://localhost:5000/api" --ws_url "ws://localhost:5000/ws" --output_dir ./dist

# Make the agent files executable
chmod +x dist/*.exe
chmod +x dist/*.pkg

echo
echo "Agent setup complete!"
echo "Agent files are available in the ./dist directory:"
ls -la dist/

echo
echo "To test agent downloads, visit:"
echo "- http://localhost:5000/api/agent/download/python"
echo "- http://localhost:5000/api/agent/download/windows"
echo "- http://localhost:5000/api/agent/download/macos"
echo
echo "====================================="