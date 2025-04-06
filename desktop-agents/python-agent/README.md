# ActivTrack Desktop Monitoring Agent

A cross-platform desktop monitoring agent for Windows and macOS that monitors running applications and processes, communicates with the ActivTrack server, and enforces application restrictions in real-time.

## Features

- **Cross-Platform Support**: Works on Windows and macOS
- **Activity Monitoring**: Tracks running applications and processes
- **Real-time Updates**: Maintains WebSocket connection for instant restriction updates
- **Application Restrictions**: Enforces application usage policies with countdown warnings
- **Secure Communication**: Uses JWT tokens for authentication
- **Automatic Reconnection**: Maintains server connection despite network issues
- **Background Operation**: Runs silently without UI
- **Startup Integration**: Can be configured to start automatically at system boot

## Requirements

- Python 3.6 or higher
- Required Python packages:
  - psutil
  - websocket-client
  - requests

## Installation

### Automatic Installation

Run the installer script which will set up the agent with proper configuration:

```bash
python install.py
```

The installer will:
1. Create the necessary configuration directory
2. Install the agent script
3. Prompt for configuration information (device ID, JWT token, server endpoints)
4. Set up appropriate startup integration based on your platform

### Manual Installation

1. Create a directory for the agent:
   ```bash
   mkdir -p ~/.activtrack
   ```

2. Copy the agent script:
   ```bash
   cp agent.py ~/.activtrack/
   chmod +x ~/.activtrack/agent.py
   ```

3. Create a configuration file `~/.activtrack/config.json`:
   ```json
   {
     "device_id": "YOUR_DEVICE_ID",
     "jwt": "YOUR_JWT_TOKEN",
     "api_endpoint": "http://your-server-address/api",
     "ws_endpoint": "ws://your-server-address/ws"
   }
   ```

## Usage

### Running the Agent

To run the agent manually:

```bash
python ~/.activtrack/agent.py
```

For background operation:

```bash
# On Windows
pythonw ~/.activtrack/agent.py

# On macOS/Linux
python ~/.activtrack/agent.py &
```

### Platform-Specific Setup for Automatic Startup

#### Windows

Create a batch file to run the agent and add it to the Windows startup folder:

```batch
@echo off
start pythonw "C:\path\to\agent.py"
```

#### macOS

Create a LaunchAgent plist file at `~/Library/LaunchAgents/com.activtrack.agent.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.activtrack.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>python3</string>
        <string>/path/to/agent.py</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load the LaunchAgent:

```bash
launchctl load ~/Library/LaunchAgents/com.activtrack.agent.plist
```

#### Linux

Create a systemd user service file at `~/.config/systemd/user/activtrack-agent.service`:

```
[Unit]
Description=ActivTrack Desktop Monitoring Agent

[Service]
ExecStart=/usr/bin/python3 /path/to/agent.py
Restart=always
RestartSec=5s

[Install]
WantedBy=default.target
```

Enable and start the service:

```bash
systemctl --user daemon-reload
systemctl --user enable activtrack-agent.service
systemctl --user start activtrack-agent.service
```

## Configuration Options

The `config.json` file supports the following options:

- `device_id`: Unique identifier for this device (required)
- `jwt`: JWT authentication token (required)
- `api_endpoint`: URL of the API server (default: "http://localhost:5000/api")
- `ws_endpoint`: URL of the WebSocket server (default: "ws://localhost:5000/ws")

## Logs

The agent logs its activity to:

- `~/.activtrack/agent.log`

## Security Considerations

- The agent requires the JWT token to be stored locally
- Activity data is transmitted to the server over HTTPS (when properly configured)
- WebSocket connections use secure WebSockets (WSS) when the server supports it

## Troubleshooting

- **Agent not connecting**: Check the `config.json` file for correct server URLs and authentication tokens
- **Missing dependencies**: Make sure all required Python packages are installed
- **Process termination issues**: On macOS, make sure the agent has the necessary permissions

## License

This software is licensed under proprietary terms for ActivTrack.