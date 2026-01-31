@echo off
REM Master setup script for Home Prototype Module 1 (Windows)
call protect_overwrites.bat %*
REM 1. Python venv and dependencies
cd /d %~dp0
if not exist .venv (
    python -m venv .venv
)
call .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -r python_wrapper\requirements.txt
pip install -r rust_smart_bulbs\requirements.txt

REM 2. Rust build and FFI extension
if exist rust_smart_bulbs (
    cd rust_smart_bulbs
    where maturin >nul 2>nul || pip install maturin
    maturin develop --release
    cd ..
)

REM 3. Node.js dependencies for dashboard
if exist dashboard (
    cd dashboard
    npm install
    cd ..
)

echo.
echo [✔] All dependencies installed and built.
echo To start the backend: .venv\Scripts\uvicorn.exe python_wrapper.api:app --host 0.0.0.0 --port 8000 --reload
echo To start the dashboard: cd dashboard && npm run dev
