@echo off
REM Post-install check script for Home Prototype Module 1 (Windows)
call .venv\Scripts\activate
set missing=0
for %%p in (fastapi uvicorn pydantic starlette cryptography sounddevice numpy kasa zeroconf bleak psutil jsonschema twilio pyttsx3) do (
    python -c "import %%p" 2>nul || (
        echo [!] Missing Python package: %%p
        set missing=1
    )
)
python -c "import rust_smart_bulbs" 2>nul || (
    echo [!] Rust FFI extension (rust_smart_bulbs) not found
    set missing=1
)
if exist dashboard\node_modules (
    echo [✔] Node.js dependencies installed.
) else (
    echo [!] Node.js dependencies missing. Run npm install in dashboard/
    set missing=1
)
if %missing%==0 (
    echo [✔] All dependencies present.
    exit /b 0
) else (
    echo [!] Some dependencies are missing. Please review the messages above.
    exit /b 1
)
