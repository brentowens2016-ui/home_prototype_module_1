#!/bin/bash
# Linux/macOS installer for Home Prototype Module 1
# This script will set up Python, Node.js, and install dependencies

set -e

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3.9+ and rerun this script."
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js (LTS) and rerun this script."
    exit 1
fi

# Set up Python virtual environment
cd "$(dirname "$0")"
if [ ! -d venv ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# Upgrade pip
python3 -m pip install --upgrade pip

# Install Python dependencies
cd python_wrapper
if [ -f requirements.txt ]; then
    pip install -r requirements.txt
else
    pip install fastapi uvicorn pydantic SpeechRecognition PyAudio twilio
fi
cd ..

# Install Rust extension (if maturin is available)
if command -v maturin &> /dev/null; then
    cd rust_smart_bulbs
    maturin develop --release
    cd ..
fi

# Install Node.js dependencies
cd dashboard
npm install
cd ..

echo ""
echo "Installation complete!"
echo "To start the API: source venv/bin/activate && uvicorn python_wrapper.api:app --reload"
echo "To start the dashboard: cd dashboard && npm run dev"
