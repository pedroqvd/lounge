const fs = require('fs');

const files = [
  'src/app/(dashboard)/configuracoes/SettingsClient.tsx',
  'src/app/(dashboard)/membros/MembersClient.tsx'
];

for(const f of files){
  const buf = fs.readFileSync(f);
  let clean = Buffer.alloc(buf.length);
  let j = 0;
  for(let i=0; i<buf.length; i++){
    if(buf[i] !== 0) {
      clean[j++] = buf[i];
    }
  }
  clean = clean.slice(0, j);
  fs.writeFileSync(f, clean);
}
console.log('Removed null bytes.');
