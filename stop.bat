@echo off
title ResQFlow Stopper
color 0C

echo ======================================================================
echo             Stopping ResQFlow Services (Ports 3000 & 8000)            
echo ======================================================================
echo.

echo Terminating backend (port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Terminating frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All ResQFlow processes stopped successfully.
timeout /t 2 >nul
