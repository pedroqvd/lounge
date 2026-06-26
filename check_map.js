const fs = require('fs');
const content = fs.readFileSync('src/app/(dashboard)/membros/MembersClient.tsx', 'utf8');

// Find where members are mapped
const mapStart = content.indexOf('filteredMembers.map((member) => (');
const mapEnd = content.indexOf('</tbody>', mapStart);
console.log(content.substring(mapStart, mapEnd));
