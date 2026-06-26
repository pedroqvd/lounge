const fs = require('fs');
let task = fs.readFileSync('src/app/(dashboard)/membros/MembersClient.tsx', 'utf8');
console.log("Length:", task.length);
