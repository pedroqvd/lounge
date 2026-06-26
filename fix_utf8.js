const fs = require('fs');

const file = 'src/app/(dashboard)/configuracoes/SettingsClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// The file currently has bad chars instead of 'Permissão', 'Líder', 'João'
// Let's use regex that targets anything between standard text
content = content.replace(/Permiss.*?o/g, 'Permissão');
content = content.replace(/L.*?der/g, 'Líder');
content = content.replace(/Jo.*?o/g, 'João');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed utf8 with Set-Content Encoding UTF8');
