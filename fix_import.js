const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/membros/MembersClient.tsx', 'utf8');
content = content.replace("import Link from 'next/link'", "import Link from 'next/link'\nimport { toast } from 'sonner'");
fs.writeFileSync('src/app/(dashboard)/membros/MembersClient.tsx', content, 'utf8');
