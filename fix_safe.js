const fs = require('fs');
require('child_process').execSync('git checkout src/app/(dashboard)/configuracoes/SettingsClient.tsx');

let content = fs.readFileSync('src/app/(dashboard)/configuracoes/SettingsClient.tsx', 'utf8');

// Use exact string replacements instead of regex wildcards to be safe
content = content.replaceAll('Permiss\ufffdo', 'Permissão');
content = content.replaceAll('Permissǜo', 'Permissão');
content = content.replaceAll('Permisso', 'Permissão');

content = content.replaceAll('L\ufffdder', 'Líder');
content = content.replaceAll('Lder', 'Líder');
content = content.replaceAll('Lder', 'Líder');

content = content.replaceAll('Jo\ufffdo', 'João');
content = content.replaceAll('Joǜo', 'João');
content = content.replaceAll('Joo', 'João');

content = content.replaceAll('A\ufffd\ufffdo', 'Ação');
content = content.replaceAll('A\ufffdo', 'Ação');
content = content.replaceAll('Aǜo', 'Ação');
content = content.replaceAll('Ao', 'Ação');

content = content.replaceAll('Usu\ufffdrio', 'Usuário');
content = content.replaceAll('Usuǭrio', 'Usuário');

content = content.replaceAll('Intelig\ufffdncia', 'Inteligência');
content = content.replaceAll('InteligǦncia', 'Inteligência');

content = content.replaceAll('Din\ufffdmicas', 'Dinâmicas');
content = content.replaceAll('Dinǽmicas', 'Dinâmicas');

content = content.replaceAll('Integra\ufffdes', 'Integrações');
content = content.replaceAll('Integraes', 'Integrações');

content = content.replaceAll('pr\ufffdprio', 'próprio');
content = content.replaceAll('prprio', 'próprio');

content = content.replaceAll('Configura\ufffdes', 'Configurações');
content = content.replaceAll('Configuraes', 'Configurações');

content = content.replaceAll('algu\ufffdm', 'alguém');
content = content.replaceAll('alguǸm', 'alguém');

content = content.replaceAll('Voc\ufffd', 'Você');
content = content.replaceAll('VocǦ', 'Você');

fs.writeFileSync('src/app/(dashboard)/configuracoes/SettingsClient.tsx', content, 'utf8');
console.log('Fixed properly without regex.');
