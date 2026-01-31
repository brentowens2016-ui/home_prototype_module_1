#!/bin/bash
set -e

# Activate venv or create if missing
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate

# Install/update dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Build Rust extension if needed
if [ -d "rust_smart_bulbs" ]; then
  cd rust_smart_bulbs
  maturin develop --release || pip install maturin && maturin develop --release
  cd ..
fi

# Start FastAPI server
exec .venv/bin/uvicorn python_wrapper.api:app --host 0.0.0.0 --port 8000 --reload
