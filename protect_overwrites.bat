@echo off
REM Overwrite protection script for Home Prototype Module 1 (Windows)
REM Prevents accidental overwrites of critical files by creating .bak backups
setlocal enabledelayedexpansion
set files=requirements.txt python_wrapper\requirements.txt rust_smart_bulbs\requirements.txt dashboard\package.json dashboard\package-lock.json .env python_wrapper\users.json python_wrapper\device_mapping.json
for %%f in (%files%) do (
    if exist %%f (
        if not exist %%f.bak (
            copy /Y %%f %%f.bak >nul
            echo [✔] Backup created for %%f as %%f.bak
        )
    )
    REM Prevent overwrite if backup exists and file is newer than backup
    if exist %%f.bak (
        for %%A in (%%f) do for %%B in (%%f.bak) do (
            if %%~tA GTR %%~tB (
                echo [!] Warning: %%f has changed since last backup. Review before overwriting.
            )
        )
    )
    REM Optionally, refuse to overwrite unless --force is passed
    REM (Uncomment below to enforce)
    REM if exist %%f.bak (
    REM     for %%A in (%%f) do for %%B in (%%f.bak) do (
    REM         if %%~tA GTR %%~tB if /I not "%1"=="--force" (
    REM             echo [!] Refusing to overwrite %%f. Use --force to override.
    REM             exit /b 1
    REM         )
    REM     )
    REM )
    REM To restore: copy /Y %%f.bak %%f
)
endlocal
