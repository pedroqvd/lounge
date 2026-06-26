const fs = require('fs');
let content = fs.readFileSync('src/app/login/page.tsx', 'utf8');

content = content.replace(/<Input type="password" placeholder="[^"]+" \{\.\.\.field\} \/>/g, '<Input type="password" placeholder="********" {...field} />');

fs.writeFileSync('src/app/login/page.tsx', content, 'utf8');
console.log('Fixed password placeholder without encoding issues.');
