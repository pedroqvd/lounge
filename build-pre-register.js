const fs = require('fs');

let authContent = fs.readFileSync('src/app/actions/auth.ts', 'utf8');

const preRegisterCode = `
import { v4 as uuidv4 } from 'uuid';

export async function preRegisterUser(name: string, email: string, role: 'ADMIN' | 'LIDER') {
  const currentUser = await getCurrentUser()
  if (currentUser?.role !== 'ADMIN') throw new Error('Unauthorized')

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { success: false, error: 'Este e-mail já possui acesso. Altere a permissão na tabela.' }
  }
  
  await prisma.user.create({
    data: {
      id: uuidv4(),
      email,
      name,
      role
    }
  })
  
  return { success: true }
}
`;

if (!authContent.includes('preRegisterUser')) {
  authContent += preRegisterCode;
  fs.writeFileSync('src/app/actions/auth.ts', authContent);
}

let settingsContent = fs.readFileSync('src/app/(dashboard)/configuracoes/SettingsClient.tsx', 'utf8');

settingsContent = settingsContent.replace(
  `import { updateUserRole } from '@/app/actions/auth'`,
  `import { updateUserRole, preRegisterUser } from '@/app/actions/auth'`
);

const stateCode = `  const [isSaving, setIsSaving] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'LIDER' as 'ADMIN'|'LIDER' })
  const [isAddingUser, setIsAddingUser] = useState(false)

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingUser(true)
    const res = await preRegisterUser(newUser.name, newUser.email, newUser.role)
    if (res.success) {
      alert('Acesso criado! A pessoa já pode entrar no sistema.')
      setLocalUsers([{ id: Date.now().toString(), name: newUser.name, email: newUser.email, role: newUser.role, createdAt: new Date() }, ...localUsers])
      setNewUser({ name: '', email: '', role: 'LIDER' })
    } else {
      alert(res.error || 'Erro ao adicionar usuário.')
    }
    setIsAddingUser(false)
  }
`;

settingsContent = settingsContent.replace(
  `const [isSaving, setIsSaving] = useState(false)`,
  stateCode
);

const formUI = `              </p>

              <form onSubmit={handleAddUser} className="mb-8 p-6 bg-secondary/30 border border-border rounded-xl flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Nome da Pessoa</label>
                  <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" placeholder="Ex: João" />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-xs font-bold uppercase text-muted-foreground">E-mail</label>
                  <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" placeholder="nome@email.com" />
                </div>
                <div className="w-full md:w-40 space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Permissão</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as 'ADMIN'|'LIDER'})} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50">
                    <option value="LIDER">Líder</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <button type="submit" disabled={isAddingUser} className="h-10 px-6 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap">
                  {isAddingUser ? 'Adicionando...' : 'Adicionar Acesso'}
                </button>
              </form>

              <div className="border border-border rounded-xl overflow-hidden bg-background">`;

settingsContent = settingsContent.replace(
  `              </p>\r\n\r\n              <div className="border border-border rounded-xl overflow-hidden bg-background">`,
  formUI
);
settingsContent = settingsContent.replace(
  `              </p>\n\n              <div className="border border-border rounded-xl overflow-hidden bg-background">`,
  formUI
);

fs.writeFileSync('src/app/(dashboard)/configuracoes/SettingsClient.tsx', settingsContent);
console.log('Pre-register UI created.');
