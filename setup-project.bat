@echo off
setlocal

:: Set paths
set NODE_PATH=C:\Program Files\nodejs\node.exe
set NPM_PATH=C:\Program Files\nodejs\npm.cmd

:: Verify Node.js version
echo Verifying Node.js version...
"%NODE_PATH%" --version
if %errorlevel% neq 0 (
    echo ERROR: Failed to run Node.js
    exit /b 1
)

:: Verify npm version
echo Verifying npm version...
"%NPM_PATH%" --version
if %errorlevel% neq 0 (
    echo ERROR: Failed to run npm
    exit /b 1
)

:: Install root dependencies
echo Installing root dependencies...
cd /d "%~dp0"
start "Root Install" cmd /c ""%NPM_PATH%" install"
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    exit /b 1
)

echo.

:: Install client dependencies
echo Installing client dependencies...
cd client
start "Client Install" cmd /c ""%NPM_PATH%" install"
if %errorlevel% neq 0 (
    echo ERROR: Failed to install client dependencies
    exit /b 1
)

echo.

:: Start the server
echo Starting server...
start "Server" cmd /c ""%NODE_PATH%" server\index.js"

echo.

:: Start the client
echo Starting client...
cd ..
start "Client" cmd /c ""%NPM_PATH%" start"

echo.
echo Setup complete! The application is starting up...
echo.
echo - Server is running on port 3001
echo - Client is running on port 3000
echo.
echo Open http://localhost:3000 in your browser to access the application.

endlocal
