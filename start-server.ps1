# Set paths
$nodePath = 'C:\Program Files\nodejs\node.exe'
$npmPath = 'C:\Program Files\nodejs\npm.cmd'

# Install dependencies
& $npmPath install

# Start the server
& $nodePath .\server\index.js
