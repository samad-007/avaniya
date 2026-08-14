@echo off
title Avaniya Land & Asset Portfolio Manager
color 0F
cls
echo ======================================================================
echo           AVANIYA LAND & ASSET PORTFOLIO MANAGER
echo          Real-time Liquidity & Deal Tracking Engine
echo ======================================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js (v18.17+ or v20+) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist node_modules (
    echo [INFO] First time setup: Installing npm dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

echo [INFO] Starting Avaniya Portfolio Tracker on http://localhost:3000 ...
echo [INFO] Press Ctrl+C in this terminal anytime to stop the server.
echo.

:: Attempt to open browser automatically
start "" "http://localhost:3000"

:: Launch Next.js dev server
call npm run dev
pause
