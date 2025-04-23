const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Starting React application...');
  const clientDir = path.join(__dirname, 'client');
  process.chdir(clientDir);
  execSync('npx react-scripts start', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting React application:', error.message);
}
