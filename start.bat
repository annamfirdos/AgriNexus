@echo off
echo ===================================================
echo   Starting AgriNexus Full-Stack AI Farm Platform
echo ===================================================
echo.

REM Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies. Make sure Node.js is installed.
        pause
        exit /b %errorlevel%
    )
)

echo Starting AgriNexus Server on http://localhost:3000...
echo.
echo Available URLs:
echo   - Farmer App:    http://localhost:3000/app
echo   - 3D Story:      http://localhost:3000
echo   - Pitch Deck:    http://localhost:3000/pitch
echo   - API Status:    http://localhost:3000/api/status
echo.
echo Press Ctrl+C to stop the server anytime.
echo.

call npm start
pause
