const path = require('path');

// Build the client
console.log('Building React client...');
const { execSync } = require('child_process');
try {
    execSync('npm install', { cwd: 'client' });
    execSync('npm run build', { cwd: 'client' });
    console.log('Client build completed successfully');
} catch (error) {
    console.error('Error building client:', error);
    process.exit(1);
}

// Copy build files to server directory
console.log('Copying build files to server...');
const fs = require('fs');
const buildDir = path.join(__dirname, 'client', 'build');
const serverBuildDir = path.join(__dirname, 'server', 'build');

// Create server build directory if it doesn't exist
if (!fs.existsSync(serverBuildDir)) {
    fs.mkdirSync(serverBuildDir, { recursive: true });
}

// Copy all files
fs.readdirSync(buildDir).forEach(file => {
    const srcPath = path.join(buildDir, file);
    const destPath = path.join(serverBuildDir, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        fs.readdirSync(srcPath).forEach(subFile => {
            const subSrcPath = path.join(srcPath, subFile);
            const subDestPath = path.join(destPath, subFile);
            fs.copyFileSync(subSrcPath, subDestPath);
        });
    } else {
        fs.copyFileSync(srcPath, destPath);
    }
});

console.log('Deployment preparation complete!');
