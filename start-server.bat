@echo off

:: Set paths
set NODE_PATH=C:\Program Files\nodejs\node.exe
set NPM_PATH=C:\Program Files\nodejs\npm.cmd

:: Install dependencies
echo Installing dependencies...
"%NPM_PATH%" install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    exit /b 1
)

:: Start the server
echo Starting server...
"%NODE_PATH%" server\index.js
if %errorlevel% neq 0 (
    echo Error: Failed to start server
    exit /b 1
)
