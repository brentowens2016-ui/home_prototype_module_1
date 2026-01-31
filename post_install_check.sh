#!/bin/bash
# Post-install check script for Home Prototype Module 1 (Unix/Linux/macOS)
set -e

# Check Python dependencies
source .venv/bin/activate
missing=0
for pkg in fastapi uvicorn pydantic starlette cryptography sounddevice numpy kasa zeroconf bleak psutil jsonschema twilio pyttsx3; do
  python -c "import $pkg" 2>/dev/null || { echo "[!] Missing Python package: $pkg"; missing=1; }
done

# Check Rust FFI extension
python -c "import rust_smart_bulbs" 2>/dev/null || { echo "[!] Rust FFI extension (rust_smart_bulbs) not found"; missing=1; }

# Check Node.js dependencies
if [ -d "dashboard/node_modules" ]; then
  echo "[✔] Node.js dependencies installed."
else
  echo "[!] Node.js dependencies missing. Run npm install in dashboard/"
  missing=1
fi

if [ $missing -eq 0 ]; then
  echo "[✔] All dependencies present."
  exit 0
else
  echo "[!] Some dependencies are missing. Please review the messages above."
  exit 1
fi
