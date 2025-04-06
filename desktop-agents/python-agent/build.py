#!/usr/bin/env python3
"""
Build script for the ActivTrack desktop agent
This script creates a ZIP file containing the agent and necessary files.
"""

import os
import sys
import shutil
import platform
import argparse
import subprocess
from pathlib import Path

def build_agent(org_id=None, output_dir=None):
    """Build the agent package"""
    print("Building ActivTrack Desktop Agent Package")
    print("========================================")
    
    # Define paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    if output_dir is None:
        output_dir = os.path.join(script_dir, "dist")
    
    build_dir = os.path.join(output_dir, "build")
    
    # Create build directory structure
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    
    os.makedirs(build_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    
    # Copy files to build directory
    shutil.copy(os.path.join(script_dir, "agent.py"), build_dir)
    shutil.copy(os.path.join(script_dir, "install.py"), build_dir)
    
    # Create a config template
    config_template = os.path.join(build_dir, "config.json.template")
    with open(config_template, "w") as f:
        f.write('{\n')
        f.write('  "device_id": "YOUR_DEVICE_ID",\n')
        if org_id:
            f.write(f'  "organization_id": "{org_id}",\n')
        f.write('  "jwt": "YOUR_JWT_TOKEN",\n')
        f.write('  "api_endpoint": "https://your-server-address/api",\n')
        f.write('  "ws_endpoint": "wss://your-server-address/ws"\n')
        f.write('}\n')
    
    # Create README
    readme_path = os.path.join(build_dir, "README.txt")
    with open(readme_path, "w") as f:
        f.write("ActivTrack Desktop Monitoring Agent\n")
        f.write("===================================\n\n")
        f.write("Installation Instructions:\n\n")
        f.write("1. Extract this ZIP file to a folder of your choice\n")
        f.write("2. Run the installer:\n")
        f.write("   Windows: Double-click install.py or run 'python install.py'\n")
        f.write("   macOS/Linux: Open Terminal and run 'python3 install.py'\n\n")
        f.write("3. Follow the on-screen instructions to complete the installation\n\n")
        f.write("Requirements:\n")
        f.write("- Python 3.6 or higher\n")
        f.write("- Required packages: psutil, requests, websocket-client\n\n")
        f.write("If you don't have Python installed:\n")
        f.write("- Windows: Download from https://www.python.org/downloads/\n")
        f.write("- macOS: Python is pre-installed, or use 'brew install python3'\n")
        f.write("- Linux: Use your package manager (apt, yum, etc.) to install Python 3\n\n")
        f.write("For support, contact your system administrator.\n")
    
    # Create requirements.txt
    req_path = os.path.join(build_dir, "requirements.txt")
    with open(req_path, "w") as f:
        f.write("psutil>=5.8.0\n")
        f.write("requests>=2.25.1\n")
        f.write("websocket-client>=1.0.0\n")
    
    # Create platform-specific files
    if platform.system() == "Windows":
        # Create Windows batch file for easy installation
        batch_path = os.path.join(build_dir, "install.bat")
        with open(batch_path, "w") as f:
            f.write("@echo off\n")
            f.write("echo Installing ActivTrack Desktop Agent...\n")
            f.write("echo.\n")
            f.write("python -m pip install -r requirements.txt\n")
            f.write("python install.py\n")
            f.write("echo.\n")
            f.write("echo Installation complete.\n")
            f.write("pause\n")
    
    # Create ZIP file
    zip_name = "activtrack-agent"
    if org_id:
        zip_name += f"-{org_id}"
    
    zip_path = os.path.join(output_dir, f"{zip_name}.zip")
    
    if os.path.exists(zip_path):
        os.remove(zip_path)
    
    shutil.make_archive(
        os.path.join(output_dir, zip_name),
        'zip',
        build_dir
    )
    
    print(f"Successfully created agent package: {zip_path}")
    return zip_path

def main():
    parser = argparse.ArgumentParser(description="Build the ActivTrack desktop agent package")
    parser.add_argument('--org-id', help='Organization ID to embed in config template')
    parser.add_argument('--output-dir', help='Output directory for the package')
    
    args = parser.parse_args()
    
    build_agent(args.org_id, args.output_dir)
    return 0

if __name__ == "__main__":
    sys.exit(main())