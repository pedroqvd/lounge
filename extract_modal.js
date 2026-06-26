const fs = require('fs');
const content = fs.readFileSync('src/app/(dashboard)/membros/MembersClient.tsx', 'utf8');

// Extract the Modal part
const modalStart = content.indexOf('<Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>');
const modalEnd = content.indexOf('</Dialog.Root>', modalStart) + 14;

console.log(content.substring(modalStart, modalEnd));
