#!/bin/bash
# Master setup script for Home Prototype Module 1 (Unix/Linux/macOS)
set -e

./protect_overwrites.sh "$@"
# 1. Python venv and dependencies
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install -r python_wrapper/requirements.txt
pip install -r rust_smart_bulbs/requirements.txt

# 2. Rust build and FFI extension
if [ -d "rust_smart_bulbs" ]; then
  cd rust_smart_bulbs
  maturin develop --release || pip install maturin && maturin develop --release
  cd ..
fi

# 3. Node.js dependencies for dashboard
if [ -d "dashboard" ]; then
  cd dashboard
  npm install
  cd ..
fi

echo "\n[✔] All dependencies installed and built."
echo "To start the backend: .venv/bin/uvicorn python_wrapper.api:app --host 0.0.0.0 --port 8000 --reload"
echo "To start the dashboard: cd dashboard && npm run dev"
