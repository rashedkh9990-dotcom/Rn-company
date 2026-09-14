@echo off
title Anisa AI - Computer Setup
echo ===================================================
echo        Anisa AI Assistant - PC Setup (Windows)
echo ===================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js (v18 or higher) from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/4] Node.js found:
node -v
echo.

:: Create .env if not exists
if not exist ".env" (
    echo [2/4] Creating .env file from .env.example...
    copy .env.example .env >nul
    echo Please open the .env file in Notepad and add your GEMINI_API_KEY!
) else (
    echo [2/4] .env file already exists.
)
echo.

:: Install dependencies
echo [3/4] Installing project dependencies (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed successfully.
echo.

:: Build frontend
echo [4/4] Building production frontend assets (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo [WARNING] Build had issues, but dev mode can still run.
)
echo.

echo ===================================================
echo               Setup Completed!
echo ===================================================
echo 1. Make sure your GEMINI_API_KEY is saved in the .env file.
echo 2. Double-click "start.bat" to launch Anisa AI!
echo.
pause
