const fs = require('fs');

let importContent = fs.readFileSync('src/app/actions/importData.ts', 'utf8');

const oldLogic = `  const lines = rawData.split('\\n')
  let added = 0
  let skipped = 0

  for (const line of lines) {
    if (!line.trim()) continue

    const parts = line.split('\\t')
    const name = parts[0]?.trim()
    let phone = parts.length > 1 ? parts[1]?.trim() : null

    if (!name) continue

    // check if exists by name
    const existingByName = await prisma.member.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingByName) {
      skipped++
      continue
    }

    // format phone if possible
    if (phone && phone.startsWith('@')) {
      // keep instagram username
    } else if (phone) {
      // clean phone
      const digits = phone.replace(/\\D/g, '')
      if (digits.length >= 10) {
        phone = digits
      }
    }

    // check by phone
    if (phone) {
      const existingByPhone = await prisma.member.findFirst({
        where: { phone }
      })
      if (existingByPhone) {
        skipped++
        continue
      }
    }

    // add to db
    await prisma.member.create({
      data: {
        name,
        phone: phone || null,
        status: 'VISITANTE', // default status
      }
    })
    added++
  }`;

const newLogic = `  const lines = rawData.split('\\n')
  let added = 0
  let skipped = 0

  const uniqueMembersMap = new Map();

  for (const line of lines) {
    if (!line.trim()) continue
    const parts = line.split('\\t')
    const name = parts[0]?.trim()
    let phone = parts.length > 1 ? parts[1]?.trim() : null
    if (!name) continue
    
    if (phone && phone.startsWith('@')) {
      // keep
    } else if (phone) {
      const digits = phone.replace(/\\D/g, '')
      if (digits.length >= 10) phone = digits
    }

    const key = (phone || name.toLowerCase()).trim();
    if (!uniqueMembersMap.has(key)) {
      uniqueMembersMap.set(key, { name, phone });
    } else {
      skipped++; // Local duplicate
    }
  }
  
  const uniqueMembers = Array.from(uniqueMembersMap.values());

  for (const member of uniqueMembers) {
    const { name, phone } = member;

    const existingByName = await prisma.member.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingByName) {
      skipped++
      continue
    }

    if (phone) {
      const existingByPhone = await prisma.member.findFirst({
        where: { phone }
      })
      if (existingByPhone) {
        skipped++
        continue
      }
    }

    await prisma.member.create({
      data: {
        name,
        phone: phone || null,
        status: 'VISITANTE',
      }
    })
    added++
  }`;

importContent = importContent.replace(oldLogic, newLogic);
fs.writeFileSync('src/app/actions/importData.ts', importContent);

let membersContent = fs.readFileSync('src/app/(dashboard)/membros/MembersClient.tsx', 'utf8');

// Inject state
membersContent = membersContent.replace(
  `const [isImporting, setIsImporting] = useState(false)`,
  `const [isImporting, setIsImporting] = useState(false)\n  const [hideMassImport, setHideMassImport] = useState(false)\n\n  useEffect(() => {\n    if (localStorage.getItem('hide_mass_import') === 'true') {\n      setHideMassImport(true);\n    }\n  }, [])`
);

// Inject hide logic in handleImport
const oldHandleImport = `if (res.success) {
        alert(\`Importauo concluda! Adicionados: \${res.added}, Ignorados (jo existiam): \${res.skipped}\`)
      } else {`;
      
const newHandleImport = `if (res.success) {
        localStorage.setItem('hide_mass_import', 'true');
        setHideMassImport(true);
        alert(\`Importação concluída! Adicionados: \${res.added}, Repetidos/Ignorados: \${res.skipped}\`)
      } else {`;

membersContent = membersContent.replace(/if \(res\.success\) \{[\s\S]*?alert\([\s\S]*?\n\s*\} else \{/g, newHandleImport);

// Hide the button
const buttonPattern = /<button[\s\S]*?onClick=\{handleImport\}[\s\S]*?<\/button>/;
const match = membersContent.match(buttonPattern);
if (match) {
  membersContent = membersContent.replace(match[0], `{!hideMassImport && (\n            ${match[0]}\n          )}`);
}

fs.writeFileSync('src/app/(dashboard)/membros/MembersClient.tsx', membersContent);
console.log('Filtros e botão ocultável implementados com sucesso.');
