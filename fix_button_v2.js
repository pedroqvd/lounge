const fs = require('fs');

let membersContent = fs.readFileSync('src/app/(dashboard)/membros/MembersClient.tsx', 'utf8');

if (!membersContent.includes('useEffect')) {
  membersContent = membersContent.replace(
    `import { useState } from 'react'`,
    `import { useState, useEffect } from 'react'`
  );
}

membersContent = membersContent.replace(
  `const [isImporting, setIsImporting] = useState(false)`,
  `const [isImporting, setIsImporting] = useState(false)
  const [hideMassImport, setHideMassImport] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('hide_mass_import') === 'true') {
      setHideMassImport(true)
    }
  }, [])`
);

membersContent = membersContent.replace(
  /alert\(`Importa.?.?o conclu.?.?da! Adicionados: \$\{res\.added\}, Ignorados \(j.? existiam\): \$\{res\.skipped\}`\)/,
  `localStorage.setItem('hide_mass_import', 'true');
        setHideMassImport(true);
        alert(\`Importação concluída! Adicionados: \${res.added}, Repetidos/Ignorados: \${res.skipped}\`)`
);

const dynamicButtonMatch = membersContent.match(/<button \s*onClick=\{handleImport\}[\s\S]*?<\/button>/);
if (dynamicButtonMatch) {
  membersContent = membersContent.replace(
    dynamicButtonMatch[0],
    `{!hideMassImport && (\n          ${dynamicButtonMatch[0]}\n        )}`
  );
}

fs.writeFileSync('src/app/(dashboard)/membros/MembersClient.tsx', membersContent);
console.log('Fixed correctly.');
