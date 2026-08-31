@echo off
title Copycat Desktop App
cd /d "%~dp0"

echo ========================================================
echo   Starting Copycat Desktop Application
echo ========================================================
echo.
echo [1/2] Cleaning up previous locks...
taskkill /F /IM electron.exe >nul 2>&1

echo [2/2] Starting Copycat Desktop Window...
echo.
call npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================================
    echo An error occurred. Please check the output above.
    echo ========================================================
    pause
)
