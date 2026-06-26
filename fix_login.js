const fs = require('fs');
let content = fs.readFileSync('src/app/login/page.tsx', 'utf8');

content = content.replace(/v\ufffdlido/g, 'válido');
content = content.replace(/m\ufffdnimo/g, 'mínimo');
content = content.replace(/T\ufffdcnico/g, 'Técnico');
content = content.replace(/est\ufffd/g, 'está');
content = content.replace(/Fa\ufffda/g, 'Faça');
content = content.replace(/placeholder="\ufffd"/g, 'placeholder="••••••••"');

// Fix styling of the logo. Increase size and remove height restriction if needed.
content = content.replace(
  'className="h-24 object-contain mb-4"',
  'className="w-48 h-auto object-contain mb-4"'
);

fs.writeFileSync('src/app/login/page.tsx', content, 'utf8');
console.log('Login page fixed.');
