const sharp = require('sharp');

async function trimImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .trim()
      .toFile(outputPath);
    console.log(`Trimmed ${inputPath} successfully.`);
  } catch (e) {
    console.error(`Error trimming ${inputPath}:`, e);
  }
}

async function run() {
  await trimImage('public/custom-logo-login.PNG', 'public/custom-logo-login-trimmed.PNG');
  await trimImage('public/custom-favicon.PNG', 'public/custom-favicon-trimmed.PNG');
  
  const fs = require('fs');
  // Replace the original files with trimmed versions
  fs.copyFileSync('public/custom-logo-login-trimmed.PNG', 'public/custom-logo-login.PNG');
  fs.copyFileSync('public/custom-favicon-trimmed.PNG', 'public/custom-favicon.PNG');
  
  // also replace src/app/icon.png which is used for the favicon
  if (fs.existsSync('src/app/icon.png')) {
    fs.copyFileSync('public/custom-favicon-trimmed.PNG', 'src/app/icon.png');
  }
  
  console.log('All images trimmed and replaced.');
}

run();
