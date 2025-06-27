@echo off
echo Starting TTRPG Companion development environment...

:: Install dependencies if needed
echo Installing dependencies...
call npm install
cd client
call npm install
cd ..

:: Start development servers
echo Starting development servers...
start "Backend" cmd /k "npm run dev"
timeout /t 2
echo Starting frontend...
start "Frontend" cmd /k "npm run client"

:: Wait a moment for servers to start
timeout /t 5
echo Development environment is starting up...
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:3001
echo
echo Press Ctrl+C in the respective windows to stop the servers.
pause
