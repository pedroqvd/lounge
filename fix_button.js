const fs = require('fs');
let membersContent = fs.readFileSync('src/app/(dashboard)/membros/MembersClient.tsx', 'utf8');

membersContent = membersContent.replace(
  `const [isImporting, setIsImporting] = useState(false)`,
  `const [isImporting, setIsImporting] = useState(false)\n  const [hideMassImport, setHideMassImport] = useState(false)\n\n  useEffect(() => {\n    if (typeof window !== 'undefined' && localStorage.getItem('hide_mass_import') === 'true') {\n      setHideMassImport(true);\n    }\n  }, [])`
);

const newHandleImport = `if (res.success) {
        localStorage.setItem('hide_mass_import', 'true');
        setHideMassImport(true);
        alert(\`Importação concluída! Adicionados: \${res.added}, Repetidos/Ignorados: \${res.skipped}\`)
      } else {`;

membersContent = membersContent.replace(/if \(res\.success\) \{[\s\S]*?alert\([\s\S]*?\n\s*\} else \{/g, newHandleImport);

const exactButton = membersContent.match(/<button[^>]*onClick=\{handleImport\}[^>]*>[\s\S]*?<\/button>/);
if (exactButton) {
  membersContent = membersContent.replace(exactButton[0], `{!hideMassImport && (\n          ${exactButton[0]}\n        )}`);
}

fs.writeFileSync('src/app/(dashboard)/membros/MembersClient.tsx', membersContent);
console.log('Fixed button hide logic.');
