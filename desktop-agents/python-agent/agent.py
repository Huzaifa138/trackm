#!/usr/bin/env python3
"""
Cross-platform desktop monitoring agent for ActivTrack
This agent monitors running applications and processes, sends data to the server,
and handles application restrictions in real-time through WebSocket connections.
"""

import os
import sys
import time
import json
import logging
import platform
import signal
import subprocess
import threading
import queue
import datetime
import getpass
from pathlib import Path
from typing import Dict, List, Set, Any, Optional

import psutil
import requests
import websocket

# Configure logging
log_dir = Path(os.path.expanduser("~/.activtrack"))
log_dir.mkdir(exist_ok=True)
log_file = log_dir / "agent.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("ActivTrack-Agent")

# Constants
CONFIG_PATH = log_dir / "config.json"
API_ENDPOINT = "http://localhost:5000/api"  # Default API endpoint
WS_ENDPOINT = "ws://localhost:5000/ws"      # Default WebSocket endpoint
ACTIVITY_CHECK_INTERVAL = 10  # Check running apps every 10 seconds
RESTRICTED_APP_TIMEOUT = 120  # 2 minutes (in seconds)

class DesktopAgent:
    """Cross-platform desktop monitoring agent for ActivTrack"""
    
    def __init__(self):
        self.device_id = None
        self.jwt_token = None
        self.api_endpoint = API_ENDPOINT
        self.ws_endpoint = WS_ENDPOINT
        self.username = getpass.getuser()
        self.running = True
        self.ws = None
        self.ws_thread = None
        self.restricted_apps = []
        self.restricted_app_timers = {}
        self.event_queue = queue.Queue()
        
        # Detect operating system
        self.os_type = platform.system()
        self.os_version = platform.version()
        self.os_release = platform.release()
        
        logger.info(f"Agent initializing on {self.os_type} {self.os_release} ({self.os_version})")
        
        # Load configuration
        self.load_config()
    
    def load_config(self) -> None:
        """Load configuration from config file"""
        if not CONFIG_PATH.exists():
            logger.warning("Config file not found, using default settings")
            return
        
        try:
            with open(CONFIG_PATH, "r") as f:
                config = json.load(f)
            
            self.device_id = config.get("device_id")
            self.jwt_token = config.get("jwt")
            self.api_endpoint = config.get("api_endpoint", API_ENDPOINT)
            self.ws_endpoint = config.get("ws_endpoint", WS_ENDPOINT)
            
            if self.device_id and self.jwt_token:
                logger.info(f"Loaded configuration for device ID: {self.device_id}")
            else:
                logger.warning("Configuration loaded but missing device_id or jwt")
        except Exception as e:
            logger.error(f"Error loading configuration: {e}")
    
    def save_config(self, config: Dict[str, Any]) -> None:
        """Save configuration to config file"""
        try:
            with open(CONFIG_PATH, "w") as f:
                json.dump(config, f, indent=2)
            logger.info("Configuration saved successfully")
        except Exception as e:
            logger.error(f"Error saving configuration: {e}")
    
    def get_running_applications(self) -> List[Dict[str, Any]]:
        """Get list of currently running applications/processes"""
        running_apps = []
        
        try:
            for proc in psutil.process_iter(['pid', 'name', 'exe', 'username', 'create_time']):
                try:
                    # Skip system processes
                    if proc.info['username'] != self.username:
                        continue
                    
                    # Basic process info
                    proc_info = {
                        'pid': proc.info['pid'],
                        'name': proc.info['name'],
                        'exe_path': proc.info['exe'] if proc.info['exe'] else "",
                        'username': proc.info['username'],
                        'start_time': datetime.datetime.fromtimestamp(proc.info['create_time']).isoformat(),
                    }
                    
                    # Try to get additional details based on platform
                    if self.os_type == 'Windows':
                        try:
                            proc_info['window_title'] = self._get_window_title_windows(proc.info['pid'])
                        except:
                            proc_info['window_title'] = ""
                    elif self.os_type == 'Darwin':  # macOS
                        try:
                            proc_info['window_title'] = self._get_window_title_macos(proc.info['name'])
                        except:
                            proc_info['window_title'] = ""
                    
                    running_apps.append(proc_info)
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    continue
        except Exception as e:
            logger.error(f"Error getting running applications: {e}")
        
        return running_apps
    
    def _get_window_title_windows(self, pid: int) -> str:
        """Get window title for Windows processes (stub)"""
        # This would require Windows-specific libraries like pywin32
        # For now, we'll return empty string
        return ""
    
    def _get_window_title_macos(self, app_name: str) -> str:
        """Get window title for macOS processes (stub)"""
        # This would require macOS-specific approach, potentially using AppleScript
        # For now, we'll return empty string
        return ""
    
    def terminate_process(self, pid: int, name: str) -> bool:
        """Terminate a process based on its PID"""
        logger.info(f"Attempting to terminate restricted application: {name} (PID: {pid})")
        
        try:
            if self.os_type == 'Windows':
                # Windows process termination
                subprocess.run(['taskkill', '/F', '/PID', str(pid)], check=True)
                return True
            elif self.os_type == 'Darwin':  # macOS
                # Try normal termination first
                try:
                    process = psutil.Process(pid)
                    process.terminate()
                    process.wait(timeout=3)
                    return True
                except (psutil.NoSuchProcess, psutil.TimeoutExpired):
                    # If normal termination fails, try AppleScript for graceful quit
                    osascript = f'tell application "{name}" to quit'
                    subprocess.run(['osascript', '-e', osascript], check=True)
                    return True
            else:  # Linux and others
                process = psutil.Process(pid)
                process.terminate()
                process.wait(timeout=3)
                return True
        except Exception as e:
            logger.error(f"Failed to terminate process {name} (PID: {pid}): {e}")
            return False
    
    def check_restricted_apps(self) -> None:
        """Check for restricted applications and start timers if found"""
        if not self.restricted_apps:
            return
        
        running_apps = self.get_running_applications()
        current_time = time.time()
        
        # Set of currently running restricted apps
        running_restricted_apps = set()
        
        for app in running_apps:
            app_name = app['name'].lower()
            
            # Check if this app is in the restricted list
            for restricted_app in self.restricted_apps:
                restricted_name = restricted_app.lower()
                
                if restricted_name in app_name:
                    pid = app['pid']
                    key = f"{pid}:{app_name}"
                    running_restricted_apps.add(key)
                    
                    # If we haven't started a timer for this instance, start one
                    if key not in self.restricted_app_timers:
                        logger.warning(f"Restricted application detected: {app_name} (PID: {pid})")
                        self.restricted_app_timers[key] = {
                            'start_time': current_time,
                            'pid': pid,
                            'name': app_name,
                            'warned': False
                        }
                        
                        # Log the event
                        self.event_queue.put({
                            'event': 'restricted_app_detected',
                            'app_name': app_name,
                            'pid': pid,
                            'timestamp': datetime.datetime.now().isoformat()
                        })
        
        # Check timers and terminate if needed
        keys_to_remove = []
        for key, timer_info in self.restricted_app_timers.items():
            # If the process is no longer running or no longer restricted, remove the timer
            if key not in running_restricted_apps:
                keys_to_remove.append(key)
                continue
            
            elapsed_time = current_time - timer_info['start_time']
            
            # Warning at 1 minute
            if elapsed_time >= 60 and not timer_info['warned']:
                logger.warning(f"Restricted app warning: {timer_info['name']} running for 1 minute")
                timer_info['warned'] = True
            
            # Terminate after timeout (2 minutes)
            if elapsed_time >= RESTRICTED_APP_TIMEOUT:
                if self.terminate_process(timer_info['pid'], timer_info['name']):
                    logger.info(f"Terminated restricted app: {timer_info['name']} after {elapsed_time:.1f} seconds")
                    
                    # Log the termination event
                    self.event_queue.put({
                        'event': 'restricted_app_terminated',
                        'app_name': timer_info['name'],
                        'pid': timer_info['pid'],
                        'timestamp': datetime.datetime.now().isoformat()
                    })
                    
                    keys_to_remove.append(key)
        
        # Remove processed timers
        for key in keys_to_remove:
            self.restricted_app_timers.pop(key, None)
    
    def send_activity_data(self, activities: List[Dict[str, Any]]) -> bool:
        """Send activity data to the server"""
        if not self.device_id or not self.jwt_token:
            logger.error("Cannot send activity data: missing device_id or jwt_token")
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {self.jwt_token}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'device_id': self.device_id,
                'username': self.username,
                'timestamp': datetime.datetime.now().isoformat(),
                'activities': activities
            }
            
            response = requests.post(
                f"{self.api_endpoint}/activity",
                headers=headers,
                json=data,
                timeout=10
            )
            
            if response.status_code == 200 or response.status_code == 201:
                logger.debug(f"Activity data sent successfully: {len(activities)} activities")
                return True
            else:
                logger.error(f"Failed to send activity data: HTTP {response.status_code}, {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending activity data: {e}")
            return False
    
    def send_event_data(self) -> None:
        """Send accumulated events to the server"""
        if self.event_queue.empty():
            return
        
        events = []
        try:
            # Get all events from the queue without blocking
            while not self.event_queue.empty():
                events.append(self.event_queue.get_nowait())
                self.event_queue.task_done()
            
            if not events:
                return
            
            headers = {
                'Authorization': f'Bearer {self.jwt_token}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'device_id': self.device_id,
                'username': self.username,
                'events': events
            }
            
            response = requests.post(
                f"{self.api_endpoint}/events",
                headers=headers,
                json=data,
                timeout=10
            )
            
            if response.status_code == 200 or response.status_code == 201:
                logger.debug(f"Events data sent successfully: {len(events)} events")
            else:
                logger.error(f"Failed to send events data: HTTP {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error sending events data: {e}")
    
    def connect_websocket(self) -> None:
        """Establish WebSocket connection to server for real-time updates"""
        if not self.device_id or not self.jwt_token:
            logger.error("Cannot connect WebSocket: missing device_id or jwt_token")
            return
        
        # WebSocket URL with authentication parameters
        ws_url = f"{self.ws_endpoint}?userId={self.device_id}&jwt={self.jwt_token}"
        
        # Define WebSocket callbacks
        def on_message(ws, message):
            try:
                data = json.loads(message)
                
                if data.get('event') == 'restricted_apps_update':
                    self.restricted_apps = data.get('data', {}).get('restricted_apps', [])
                    logger.info(f"Received restricted apps update: {self.restricted_apps}")
                
                elif data.get('event') == 'config_update':
                    config_data = data.get('data', {})
                    logger.info("Received configuration update")
                    
                    # Update relevant configuration
                    if 'jwt' in config_data:
                        self.jwt_token = config_data['jwt']
                    
                    # Save the updated config
                    self.save_config({
                        'device_id': self.device_id,
                        'jwt': self.jwt_token,
                        'api_endpoint': self.api_endpoint,
                        'ws_endpoint': self.ws_endpoint
                    })
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {e}")
        
        def on_error(ws, error):
            logger.error(f"WebSocket error: {error}")
        
        def on_close(ws, close_status_code, close_msg):
            logger.warning(f"WebSocket connection closed: {close_status_code}, {close_msg}")
        
        def on_open(ws):
            logger.info("WebSocket connection established")
            
            # Send initial connection message
            ws.send(json.dumps({
                'event': 'agent_connected',
                'data': {
                    'device_id': self.device_id,
                    'username': self.username,
                    'os_type': self.os_type,
                    'os_version': f"{self.os_release} ({self.os_version})"
                }
            }))
        
        # Create WebSocket connection
        self.ws = websocket.WebSocketApp(
            ws_url,
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close
        )
        
        # Run WebSocket connection in a separate thread
        self.ws_thread = threading.Thread(target=self.ws.run_forever, daemon=True)
        self.ws_thread.start()
    
    def run(self) -> None:
        """Main agent loop"""
        logger.info("Starting ActivTrack desktop agent")
        
        # Connect to WebSocket for real-time updates
        self.connect_websocket()
        
        # Setup reconnection logic
        last_ws_check = time.time()
        last_activity_time = time.time()
        
        try:
            while self.running:
                current_time = time.time()
                
                # Check if it's time to gather activity data
                if current_time - last_activity_time >= ACTIVITY_CHECK_INTERVAL:
                    # Get running applications
                    activities = self.get_running_applications()
                    
                    # Send data to server
                    if activities:
                        self.send_activity_data(activities)
                    
                    # Check for restricted applications
                    self.check_restricted_apps()
                    
                    # Send any pending events
                    self.send_event_data()
                    
                    last_activity_time = current_time
                
                # Check WebSocket connection and reconnect if needed
                if current_time - last_ws_check >= 60:  # Check every minute
                    if not self.ws_thread or not self.ws_thread.is_alive():
                        logger.info("WebSocket connection lost, reconnecting...")
                        self.connect_websocket()
                    last_ws_check = current_time
                
                # Sleep to avoid high CPU usage
                time.sleep(1)
                
        except KeyboardInterrupt:
            logger.info("Agent stopping due to keyboard interrupt")
        except Exception as e:
            logger.error(f"Unexpected error in agent main loop: {e}")
        finally:
            # Clean up
            if self.ws:
                self.ws.close()
            logger.info("ActivTrack desktop agent stopped")
    
    def stop(self) -> None:
        """Stop the agent"""
        self.running = False


def setup_signal_handlers(agent):
    """Setup signal handlers for graceful shutdown"""
    def signal_handler(sig, frame):
        logger.info(f"Received signal {sig}, shutting down...")
        agent.stop()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)


if __name__ == "__main__":
    # Create and run the agent
    agent = DesktopAgent()
    setup_signal_handlers(agent)
    agent.run()