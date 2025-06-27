@echo off

:: Set paths
set NPM_PATH=C:\Program Files\nodejs\npm.cmd

:: Change to client directory and start client
echo Starting client...
cd client
"%NPM_PATH%" start
