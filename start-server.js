const path = require('path');
const { spawn } = require('child_process');

const nodePath = 'C:\\Program Files\\nodejs\\node.exe';
const serverPath = path.join(__dirname, 'server', 'index.js');

const serverProcess = spawn(nodePath, [serverPath], {
    stdio: 'inherit',
    cwd: __dirname
});

serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
});

serverProcess.on('exit', (code) => {
    console.log(`Server process exited with code ${code}`);
});
