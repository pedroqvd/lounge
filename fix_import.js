const fs = require('fs');

let importContent = fs.readFileSync('src/app/actions/importData.ts', 'utf8');

const replacement = `const lines = rawData.split('\\n')
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
      // keep instagram username
    } else if (phone) {
      const digits = phone.replace(/\\D/g, '')
      if (digits.length >= 10) phone = digits
    }

    const key = (phone || name.toLowerCase()).trim();
    if (!uniqueMembersMap.has(key)) {
      uniqueMembersMap.set(key, { name, phone });
    } else {
      skipped++; // Duplicate in raw data
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
  }

  revalidatePath('/membros')`;

importContent = importContent.replace(/const lines = rawData\.split\([\s\S]*revalidatePath\('\/membros'\)/, replacement);

fs.writeFileSync('src/app/actions/importData.ts', importContent);
console.log('Deduplication logic applied.');
