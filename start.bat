@echo off
title ResQFlow Launcher
color 0A

echo ======================================================================
echo             ResQFlow - Emergency Resource Allocation Platform        
echo ======================================================================
echo.

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo [0/4] Freeing existing ports 8000 and 3000 if occupied...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [1/4] Checking Python Backend Environment...
if not exist "backend\venv\Scripts\python.exe" (
    echo Virtual environment not found. Setting up Python venv...
    python -m venv backend\venv
    call backend\venv\Scripts\pip.exe install -r backend\requirements.txt
) else (
    echo Python virtual environment verified.
)

echo.
echo [2/4] Starting FastAPI Matching Engine (Port 8000)...
start "ResQFlow Backend (FastAPI - Port 8000)" cmd /k "cd /d ""%ROOT_DIR%backend"" && venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting for backend service initialization...
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Preparing Frontend (Cleaning stale cache if present)...
if exist "frontend\.next" (
    rmdir /s /q "frontend\.next" >nul 2>&1
)
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%ROOT_DIR%frontend"
    call npm install
    cd /d "%ROOT_DIR%"
) else (
    echo Frontend dependencies verified.
)

echo.
echo [4/4] Starting Next.js Frontend Server (Port 3000)...
start "ResQFlow Frontend (Next.js - Port 3000)" cmd /k "cd /d ""%ROOT_DIR%frontend"" && npm run dev"

echo Waiting for frontend compilation...
timeout /t 5 /nobreak >nul

echo.
echo ======================================================================
echo  ResQFlow is now running!
echo.
echo  - Frontend Dashboard:   http://localhost:3000
echo  - Backend API:          http://localhost:8000
echo  - Interactive API Docs: http://localhost:8000/docs
echo ======================================================================
echo.
echo Opening ResQFlow in your default web browser...
start http://localhost:3000

echo.
echo Press any key to close this launcher window (services will keep running).
pause >nul
