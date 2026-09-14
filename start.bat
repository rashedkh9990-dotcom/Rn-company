@echo off
title Anisa AI Assistant - Server Running
echo ===================================================
echo             Starting Anisa AI Assistant
echo ===================================================
echo.

:: Open browser after a short 2-second delay
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: Start the application
echo Running server on http://localhost:3000 ...
echo Press Ctrl+C in this window to stop the server.
echo.
call npm start

pause
