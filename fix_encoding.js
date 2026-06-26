const fs = require('fs');

const files = [
  'src/app/(dashboard)/configuracoes/SettingsClient.tsx',
  'src/app/(dashboard)/membros/MembersClient.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/Permiss\ufffdo/gi, 'Permissão');
  content = content.replace(/Permisso/gi, 'Permissão');
  content = content.replace(/L\ufffdder/gi, 'Líder');
  content = content.replace(/Lder/gi, 'Líder');
  content = content.replace(/Jo\ufffdo/gi, 'João');
  content = content.replace(/Joo/gi, 'João');
  content = content.replace(/A\ufffd\ufffdo/gi, 'Ação');
  content = content.replace(/A\ufffdo/gi, 'Ação');
  content = content.replace(/Usu\ufffdrio/gi, 'Usuário');
  content = content.replace(/Intelig\ufffdncia/gi, 'Inteligência');
  content = content.replace(/Din\ufffdmicas/gi, 'Dinâmicas');
  content = content.replace(/Integra\ufffdes/gi, 'Integrações');
  content = content.replace(/pr\ufffdprio/gi, 'próprio');
  content = content.replace(/Configura\ufffdes/gi, 'Configurações');
  content = content.replace(/algu\ufffdm/gi, 'alguém');
  content = content.replace(/Voc\ufffd/gi, 'Você');
  content = content.replace(/Importa\ufffd\ufffdo/gi, 'Importação');
  content = content.replace(/Importa\ufffdo/gi, 'Importação');
  content = content.replace(/conclu\ufffdda/gi, 'concluída');
  content = content.replace(/j\ufffd/gi, 'já');
  
  // also handle some cases where it became something else
  content = content.replace(/Permiss.o/gi, 'Permissão');
  content = content.replace(/L.der/gi, 'Líder');
  content = content.replace(/Jo.o/gi, 'João');

  fs.writeFileSync(file, content);
}
console.log('Fixed encoding bugs.');
