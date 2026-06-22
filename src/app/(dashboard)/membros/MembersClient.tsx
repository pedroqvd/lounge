'use client'

import { useState } from 'react'
import { Plus, Search, MessageCircle, Filter, ChevronDown, Edit2, Trash2, Database, Send } from 'lucide-react'
import { seedMembers, deleteMember, createMember, updateMember } from '@/app/actions/members'
import { createContactHistory } from '@/app/actions/history'
import * as Dialog from '@radix-ui/react-dialog'

type Member = any 
type Group = any
type Template = any

export default function MembersClient({ initialMembers, groups, templates }: { initialMembers: Member[], groups: Group[], templates: Template[] }) {
  const [members, setMembers] = useState(initialMembers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [isSeeding, setIsSeeding] = useState(false)

  // Member Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', status: 'VISITANTE', groupId: '' })

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [contactingMember, setContactingMember] = useState<Member | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [customMessage, setCustomMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSeed = async () => {
    setIsSeeding(true)
    const res = await seedMembers()
    if (res.success) {
      alert(`Importação concluída! ${res.count} membros importados. Recarregue a página se os dados não aparecerem.`)
      window.location.reload()
    } else {
      alert('Erro: ' + res.error)
    }
    setIsSeeding(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este membro?')) {
      const res = await deleteMember(id)
      if (res.success) window.location.reload()
      else alert('Erro ao excluir')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    let res
    if (editingMember) {
      res = await updateMember(editingMember.id, formData)
    } else {
      res = await createMember(formData)
    }

    if (res.success) {
      setIsModalOpen(false)
      window.location.reload()
    } else {
      alert('Erro ao salvar: ' + res.error)
    }
    setIsSaving(false)
  }

  const openModal = (member?: Member) => {
    if (member) {
      setEditingMember(member)
      setFormData({
        name: member.name,
        phone: member.phone || '',
        status: member.status,
        groupId: member.groupId || ''
      })
    } else {
      setEditingMember(null)
      setFormData({ name: '', phone: '', status: 'VISITANTE', groupId: '' })
    }
    setIsModalOpen(true)
  }

  const openTemplateModal = (member: Member) => {
    setContactingMember(member)
    setSelectedTemplateId('')
    setCustomMessage('')
    setIsTemplateModalOpen(true)
  }

  const handleSendMessage = async () => {
    if (!contactingMember || !contactingMember.phone) return
    setIsSending(true)

    let finalMessage = customMessage
    let usedTemplateId = selectedTemplateId || undefined

    if (selectedTemplateId) {
      const template = templates?.find((t: Template) => t.id === selectedTemplateId)
      if (template) {
        finalMessage = template.content
          .replace(/{nome}/g, contactingMember.name)
          .replace(/{grupo}/g, contactingMember.group?.name || 'sua célula')
          .replace(/{lider}/g, contactingMember.group?.lider?.name || 'sua liderança')
          .replace(/{data}/g, new Date().toLocaleDateString('pt-BR'))
      }
    }

    // Call server action to log history
    await createContactHistory({
      memberId: contactingMember.id,
      templateId: usedTemplateId,
      customText: finalMessage,
    })

    // Open WhatsApp
    const phoneDigits = contactingMember.phone.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(finalMessage)}`
    window.open(whatsappUrl, '_blank')

    setIsTemplateModalOpen(false)
    setIsSending(false)
  }

  const toggleSelectAll = () => {
    if (selectedMembers.size === members.length) {
      setSelectedMembers(new Set())
    } else {
      setSelectedMembers(new Set(members.map(m => m.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedMembers)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedMembers(newSet)
  }

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.phone && m.phone.includes(searchTerm))
  )

  const previewTemplate = () => {
    if (!contactingMember) return ''
    if (customMessage) return customMessage
    if (selectedTemplateId) {
      const template = templates?.find((t: Template) => t.id === selectedTemplateId)
      if (template) {
        return template.content
          .replace(/{nome}/g, contactingMember.name)
          .replace(/{grupo}/g, contactingMember.group?.name || 'sua célula')
          .replace(/{lider}/g, contactingMember.group?.lider?.name || 'sua liderança')
          .replace(/{data}/g, new Date().toLocaleDateString('pt-BR'))
      }
    }
    return ''
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Membros</h1>
          <p className="text-muted-foreground mt-1">Gerencie os membros e visitantes do ministério.</p>
        </div>
        <div className="flex items-center gap-2">
          {members.length === 0 && (
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Database className="w-5 h-5" />
              {isSeeding ? 'Importando...' : 'Importar Planilha'}
            </button>
          )}
          <button 
            onClick={() => openModal()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Membro
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..." 
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" checked={selectedMembers.size === members.length && members.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" checked={selectedMembers.has(member.id)} onChange={() => toggleSelect(member.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      member.status === 'ATIVO' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      member.status === 'VISITANTE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{member.group?.name || '-'}</td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                    {member.phone && (
                      <button onClick={() => openTemplateModal(member)} title="Enviar WhatsApp" className="w-8 h-8 rounded-full bg-whatsapp/10 text-whatsapp flex items-center justify-center hover:bg-whatsapp hover:text-whatsapp-foreground">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => openModal(member)} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(member.id)} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              {editingMember ? 'Editar Membro' : 'Novo Membro'}
            </Dialog.Title>
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone (Whatsapp)</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="61 9..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="VISITANTE">Visitante</option>
                    <option value="ATIVO">Membro Ativo</option>
                    <option value="INATIVO">Inativo (Desgarrado)</option>
                    <option value="DISCIPULADO">Discipulado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Responsável</label>
                  <select value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Sem responsável</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 border rounded-md hover:bg-secondary transition-colors">Cancelar</button>
                </Dialog.Close>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Template Sending Modal */}
      <Dialog.Root open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-lg">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              Enviar WhatsApp para {contactingMember?.name}
            </Dialog.Title>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Escolha um Template</label>
                <select 
                  value={selectedTemplateId} 
                  onChange={e => {
                    setSelectedTemplateId(e.target.value)
                    setCustomMessage('') // Clear custom if picking template
                  }} 
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Mensagem Livre --</option>
                  {templates?.map((t: Template) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
              </div>

              {!selectedTemplateId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ou digite uma mensagem livre</label>
                  <textarea 
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-md bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    placeholder="Digite a mensagem que deseja enviar..."
                  />
                </div>
              )}

              {selectedTemplateId && (
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Pré-visualização de envio:</p>
                  <p className="text-sm whitespace-pre-wrap">{previewTemplate()}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 border rounded-md hover:bg-secondary transition-colors font-medium">Cancelar</button>
                </Dialog.Close>
                <button 
                  onClick={handleSendMessage}
                  disabled={isSending || (!selectedTemplateId && !customMessage.trim())} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-whatsapp text-whatsapp-foreground rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? 'Processando...' : 'Abrir WhatsApp'}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
