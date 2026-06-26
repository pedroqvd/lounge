const fs = require('fs');

function getPngDimensions(filePath) {
  const data = fs.readFileSync(filePath);
  if (data.toString('ascii', 1, 4) !== 'PNG') {
    return 'Not a PNG';
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  return { width, height };
}

console.log('Logo:', getPngDimensions('public/custom-logo-login.PNG'));
console.log('Favicon:', getPngDimensions('public/custom-favicon.PNG'));
