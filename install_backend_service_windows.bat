@echo off
REM Windows Service wrapper for Home Prototype Module 1 Backend (FastAPI)
REM Requires NSSM (Non-Sucking Service Manager): https://nssm.cc/
REM Edit paths as needed

REM Install the backend service
nssm install HomePrototypeBackend "C:\Users\brent\home_prototype_module_1\.venv\Scripts\uvicorn.exe" "python_wrapper.api:app --host 0.0.0.0 --port 8000 --reload"
nssm set HomePrototypeBackend AppDirectory "C:\Users\brent\home_prototype_module_1"
nssm set HomePrototypeBackend AppEnvironmentExtra SECURE_STORAGE_KEY=your_base64_32byte_key_here
nssm set HomePrototypeBackend Start SERVICE_AUTO_START
nssm start HomePrototypeBackend

echo Backend service installed and started.
