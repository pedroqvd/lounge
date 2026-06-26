const fs = require('fs');

// 1. Modificar page.tsx para passar o currentUser
let pageContent = fs.readFileSync('src/app/(dashboard)/membros/[id]/page.tsx', 'utf8');
if(!pageContent.includes('getCurrentUser')) {
  pageContent = pageContent.replace("import { getMemberProfile } from '@/app/actions/members'", "import { getMemberProfile } from '@/app/actions/members'\nimport { getCurrentUser } from '@/app/actions/auth'");
  pageContent = pageContent.replace("const member = await getMemberProfile(params.id)", "const member = await getMemberProfile(params.id)\n  const currentUser = await getCurrentUser()");
  pageContent = pageContent.replace("<ProfileClient member={memberWithAudits} groups={groups} />", "<ProfileClient member={memberWithAudits} groups={groups} currentUser={currentUser} />");
  fs.writeFileSync('src/app/(dashboard)/membros/[id]/page.tsx', pageContent, 'utf8');
}

// 2. Modificar ProfileClient.tsx para usar o currentUser e remover o modal
let clientContent = fs.readFileSync('src/app/(dashboard)/membros/[id]/ProfileClient.tsx', 'utf8');

clientContent = clientContent.replace("export default function ProfileClient({ member, groups }: { member: any, groups: any[] }) {", "export default function ProfileClient({ member, groups, currentUser }: { member: any, groups: any[], currentUser?: any }) {");

const stateToRemove = `const [userName, setUserName] = useState<string>('')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [tempUserName, setTempUserName] = useState('')

  useEffect(() => {
    const storedName = localStorage.getItem('lounge_username')
    if (storedName) {
      setUserName(storedName)
    } else {
      setIsAuthModalOpen(true)
    }
  }, [])

  const handleSaveAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempUserName.trim()) return
    localStorage.setItem('lounge_username', tempUserName)
    setUserName(tempUserName)
    setIsAuthModalOpen(false)
  }`;

clientContent = clientContent.replace(stateToRemove, "const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Sistema'");

// Delete Modal JSX
const modalStart = clientContent.indexOf("{/* MODAL: IDENTIFICA\ufffd\ufffdO DO USU\ufffd?RIO */}");
// let's just use regex to remove the modal completely. It's between the first Dialog.Root and the second.
clientContent = clientContent.replace(/\{\/\* MODAL: IDENTIFICA.*?[\s\S]*?<\/Dialog\.Root>/, "");

// Fix broken chars
clientContent = clientContent.replace(/Anota\ufffd\ufffdes/g, "Anotações");
clientContent = clientContent.replace(/edi\ufffd\ufffdo/g, "edição");
clientContent = clientContent.replace(/Respons\ufffdvel \/ C\ufffdlula/g, "Responsável / Célula");
clientContent = clientContent.replace(/quem \ufffd voc\ufffd/g, "quem é você");
clientContent = clientContent.replace(/Altera\ufffd\ufffdes/g, "Alterações");
clientContent = clientContent.replace(/M\ufffd\ufffds/g, "Mês");
clientContent = clientContent.replace(/Freq\ufffd\ufffdncia/g, "Frequência");
clientContent = clientContent.replace(/Informa\ufffd\ufffdes/g, "Informações");
clientContent = clientContent.replace(/A\ufffd\ufffdes/g, "Ações");

// Just in case it's completely garbled
clientContent = clientContent.replace(/Anota\ufffdes/g, "Anotações");
clientContent = clientContent.replace(/edi\ufffdo/g, "edição");
clientContent = clientContent.replace(/Altera\ufffdes/g, "Alterações");

fs.writeFileSync('src/app/(dashboard)/membros/[id]/ProfileClient.tsx', clientContent, 'utf8');
console.log('Member profile page updated.');
