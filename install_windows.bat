@echo off
REM Windows installer for Home Prototype Module 1
REM This script will set up Python, Node.js, and install dependencies

REM Check for Python
where python >nul 2>nul || (
    echo Python is not installed. Please install Python 3.9+ and rerun this script.
    pause
    exit /b 1
)

REM Check for Node.js
where node >nul 2>nul || (
    echo Node.js is not installed. Please install Node.js (LTS) and rerun this script.
    pause
    exit /b 1
)

REM Set up Python virtual environment
cd /d %~dp0
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate

REM Upgrade pip
python -m pip install --upgrade pip

REM Install Python dependencies
cd python_wrapper
pip install -r requirements.txt || (
    echo requirements.txt not found, installing core packages...
    pip install fastapi uvicorn pydantic SpeechRecognition PyAudio twilio
)
cd ..

REM Install Rust extension (if maturin is available)
where maturin >nul 2>nul && (
    cd rust_smart_bulbs
    maturin develop --release
    cd ..
)

REM Install Node.js dependencies
cd dashboard
npm install
cd ..

REM Done
@echo.
@echo Installation complete!
@echo To start the API: activate the venv and run: uvicorn python_wrapper.api:app --reload
@echo To start the dashboard: cd dashboard && npm run dev
pause
