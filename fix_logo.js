const fs = require('fs');
let content = fs.readFileSync('src/components/Logo.tsx', 'utf8');

// Relax the height/width constraints on the logo
content = content.replace(
  "`flex items-center justify-center ${minimized ? 'w-10 h-10' : 'h-12'}`",
  "`flex items-center justify-center ${minimized ? 'w-10 h-10' : 'w-40 h-14'}`"
);

content = content.replace(
  "`object-contain ${minimized ? 'w-10 h-10' : 'h-12'}`",
  "`object-contain ${minimized ? 'w-10 h-10' : 'w-full h-full'}`"
);

fs.writeFileSync('src/components/Logo.tsx', content, 'utf8');
console.log('Logo size adjusted.');
