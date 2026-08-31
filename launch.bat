@echo off
title Copycat Desktop App
cd /d "%~dp0"

echo ========================================================
echo   Starting Copycat Desktop Application
echo ========================================================
echo.
echo [1/3] Cleaning up previous locks...
taskkill /F /IM electron.exe >nul 2>&1

echo [2/3] Verifying bundle...
if not exist "dist\index.html" (
    call npx vite build
)

echo [3/3] Launching Copycat...
echo.
call npx electron .
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================================
    echo An error occurred. Please check the output above.
    echo ========================================================
    pause
)
