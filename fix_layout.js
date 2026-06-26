const fs = require('fs');
let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');

layout = layout.replace('Minist\ufffdrio', 'Ministério');
layout = layout.replace('MinistǸrio', 'Ministério');
if (!layout.includes('<Toaster />')) {
  layout = layout.replace('{children}', '{children}\n          <Toaster />');
}
fs.writeFileSync('src/app/layout.tsx', layout, 'utf8');
console.log('Layout updated with Toaster');
