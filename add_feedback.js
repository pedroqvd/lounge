const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/membros/MembersClient.tsx', 'utf8');

// 1. Add Feedback State
const stateInject = `  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    member: Member | null;
    message: string;
    templateId?: string;
    isMass: boolean;
    selectedIds?: Set<string>;
  }>({ isOpen: false, member: null, message: '', isMass: false })
  const [feedbackText, setFeedbackText] = useState('Convidei para o Culto/Agenda')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingFeedback(true)
    try {
      if (feedbackState.isMass && feedbackState.selectedIds) {
        // Mass feedback
        const promises = Array.from(feedbackState.selectedIds).map(async (id) => {
          const m = members.find(x => x.id === id)
          if (!m) return
          await createContactHistory({
            memberId: id,
            templateId: feedbackState.templateId,
            customText: \`[Feedback]: \${feedbackText}\\n[Mensagem]: \${feedbackState.message}\`
          })
          await updateMemberInviteStatus(id, 'FEITO')
        })
        await Promise.all(promises)
        setMembers(prev => prev.map(m => feedbackState.selectedIds!.has(m.id) ? { ...m, inviteStatus: 'FEITO' } : m))
        toast.success('Feedbacks em massa registrados!')
      } else if (feedbackState.member) {
        // Single feedback
        await createContactHistory({
          memberId: feedbackState.member.id,
          templateId: feedbackState.templateId,
          customText: \`[Feedback]: \${feedbackText}\\n[Mensagem]: \${feedbackState.message}\`
        })
        await updateMemberInviteStatus(feedbackState.member.id, 'FEITO')
        setMembers(prev => prev.map(m => m.id === feedbackState.member.id ? { ...m, inviteStatus: 'FEITO' } : m))
        toast.success('Feedback de contato registrado com sucesso!')
      }
    } catch (err) {
      toast.error('Erro ao salvar feedback.')
    }
    setIsSubmittingFeedback(false)
    setFeedbackState(prev => ({ ...prev, isOpen: false }))
  }
`;

content = content.replace("const [contactingMember, setContactingMember] = useState<Member | null>(null)", stateInject + "\n  const [contactingMember, setContactingMember] = useState<Member | null>(null)");

// 2. Remove automatic history from handleSend and open Feedback Modal instead
const singleAutoHistory = /await createContactHistory\(\{[\s\S]*?\}\)[\s\S]*?await updateMemberInviteStatus\(contactingMember\.id, 'FEITO'\)[\s\S]*?setMembers\(prev => prev\.map\(m => m\.id === contactingMember\.id \? \{ \.\.\.m, inviteStatus: 'FEITO' \} : m\)\)/;
const singleModalTrigger = `
      // Open WhatsApp first
      const phoneDigits = contactingMember.phone.replace(/\\D/g, '')
      const whatsappUrl = \`https://wa.me/55\${phoneDigits}?text=\${encodeURIComponent(finalMessage)}\`
      window.open(whatsappUrl, '_blank')

      // Trigger Feedback Modal
      setFeedbackText('Convidei para o Culto/Agenda')
      setFeedbackState({
        isOpen: true,
        member: contactingMember,
        message: finalMessage,
        templateId: usedTemplateId,
        isMass: false
      })
      
      setIsTemplateModalOpen(false)
      setContactingMember(null)
      return;
`;
content = content.replace(singleAutoHistory, ""); 
// wait, the previous replace will just delete the history block. But we also need to replace the window.open part to avoid double opening.
// Actually, let's just replace the WHOLE handleSend body after `const finalMessage = ...` 

const handleSendRegex = /(const finalMessage = [\s\S]*?)(await createContactHistory\(\{[\s\S]*?window\.open\(whatsappUrl, '_blank'\))/;

content = content.replace(handleSendRegex, `$1${singleModalTrigger}`);


// 3. Do the same for handleMassSend
const massHandleRegex = /(const finalMessage = [\s\S]*?)await createContactHistory\(\{[\s\S]*?window\.open\(whatsappUrl, '_blank'\)/g;
content = content.replace(massHandleRegex, `$1window.open(whatsappUrl, '_blank')`);

// Remove the mass automate
const massAutoRegex = /await updateMemberInviteStatus\(member\.id, 'FEITO'\)/g;
content = content.replace(massAutoRegex, "");

// Replace the after mass loop
const afterMassRegex = /setMembers\(prev => prev\.map\(m => selectedMembers\.has\(m\.id\) \? \{ \.\.\.m, inviteStatus: 'FEITO' \} : m\)\)\s*alert\('Envios em massa finalizados \(abas abertas\)\.'\)/;
const massModalTrigger = `
      setFeedbackText('Convidei para o Culto/Agenda')
      setFeedbackState({
        isOpen: true,
        member: null,
        message: 'Múltiplas mensagens enviadas.',
        templateId: selectedTemplateId || undefined,
        isMass: true,
        selectedIds: new Set(selectedMembers)
      })
      setIsTemplateModalOpen(false)
      toast.success('Abas do WhatsApp abertas!')
`;
content = content.replace(afterMassRegex, massModalTrigger);

// 4. Add the JSX for Feedback Modal at the end of the file, before the last `</div>`
const feedbackModalJsx = `
      {/* MODAL DE FEEDBACK DE CONTATO */}
      <Dialog.Root open={feedbackState.isOpen} onOpenChange={(open) => !open && setFeedbackState(prev => ({...prev, isOpen: false}))}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
            <Dialog.Title className="text-xl font-bold mb-4">Feedback do Contato</Dialog.Title>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                O WhatsApp foi aberto! Para garantir a transparência do sistema, por favor, descreva o que foi feito com {feedbackState.isMass ? 'os membros selecionados' : feedbackState.member?.name}.
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Relatório / Resultado:</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ex: Convidei para o culto, Tirei dúvidas, etc."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Dialog.Close asChild>
                  <button type="button" className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-colors">
                    Não Enviei / Cancelar
                  </button>
                </Dialog.Close>
                <button type="submit" disabled={isSubmittingFeedback} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md">
                  {isSubmittingFeedback ? 'Salvando...' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
`;

const lastDivIndex = content.lastIndexOf('</div>');
content = content.slice(0, lastDivIndex) + feedbackModalJsx + content.slice(lastDivIndex);

fs.writeFileSync('src/app/(dashboard)/membros/MembersClient.tsx', content, 'utf8');
console.log('Feedback modal added successfully.');
