@echo off
title Copycat Desktop App
cd /d "%~dp0"
echo ===================================================
echo   Starting Copycat Desktop App
echo ===================================================
echo.
npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo An error occurred while starting Copycat.
    pause
)
