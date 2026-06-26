const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/membros/MembersClient.tsx', 'utf8');

// 1. Remove Seeding Button
const seedBtnRegex = /\{userRole === 'ADMIN' && \([\s\S]*?<Database className="w-5 h-5" \/>[\s\S]*?<\/button>\s*\)\}/;
content = content.replace(seedBtnRegex, '');

// 2. Remove Mass Import Button
const importBtnRegex = /\{!hideMassImport && \([\s\S]*?<UploadCloud className="w-5 h-5" \/>[\s\S]*?<\/button>\s*\)\}/;
content = content.replace(importBtnRegex, '');

// 3. Fix Select colors (replace bg-transparent with bg-background for filters)
content = content.replace(/className="px-3 py-2 border border-input rounded-md bg-transparent/g, 'className="px-3 py-2 border border-input rounded-md bg-background text-foreground');

// 4. Automation for single send
const historyCall = `await createContactHistory({
        memberId: contactingMember.id,
        templateId: usedTemplateId,
        customText: finalMessage,
      })`;
const newHistoryCall = historyCall + `\n      await updateMemberInviteStatus(contactingMember.id, 'FEITO')\n      setMembers(prev => prev.map(m => m.id === contactingMember.id ? { ...m, inviteStatus: 'FEITO' } : m))`;
content = content.replace(historyCall, newHistoryCall);

// 5. Automation for mass send
const historyCallMass = `await createContactHistory({
          memberId: member.id,
          templateId: selectedTemplateId || undefined,
          customText: finalMessage,
        })`;
const newHistoryCallMass = historyCallMass + `\n        await updateMemberInviteStatus(member.id, 'FEITO')`;
content = content.replace(historyCallMass, newHistoryCallMass);

const afterMass = `alert('Envios em massa finalizados (abas abertas).')`;
const newAfterMass = `setMembers(prev => prev.map(m => selectedMembers.has(m.id) ? { ...m, inviteStatus: 'FEITO' } : m))\n      alert('Envios em massa finalizados (abas abertas).')`;
content = content.replace(afterMass, newAfterMass);

fs.writeFileSync('src/app/(dashboard)/membros/MembersClient.tsx', content, 'utf8');
console.log('Automations and fixes applied.');
