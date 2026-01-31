@echo off
REM Windows Service wrapper for Home Prototype Module 1 Dashboard (React)
REM Requires NSSM (Non-Sucking Service Manager): https://nssm.cc/
REM Edit paths as needed

REM Install the dashboard service
nssm install HomePrototypeDashboard "C:\Program Files\nodejs\npm.cmd" "run dev"
nssm set HomePrototypeDashboard AppDirectory "C:\Users\brent\home_prototype_module_1\dashboard"
nssm set HomePrototypeDashboard Start SERVICE_AUTO_START
nssm start HomePrototypeDashboard

echo Dashboard service installed and started.
