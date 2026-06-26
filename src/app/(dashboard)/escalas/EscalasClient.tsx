'use client'

import { useState } from 'react'
import { Music, DoorOpen, Baby, Camera, Heart, Plus, Users, ChevronRight, Trash2, Crown, Mic2, Settings2, ClipboardList, Sparkles } from 'lucide-react'
import { createMinistry, deleteMinistry, seedMinistries, addMemberToMinistry, removeMemberFromMinistry, updateMinistryMember } from '@/app/actions/ministries'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import Link from 'next/link'

type Ministry = any
type Member = any

const MINISTRY_ICONS: Record<string, any> = {
  music: Music, 'door-open': DoorOpen, baby: Baby, camera: Camera, heart: Heart, users: Users, mic: Mic2, sparkles: Sparkles
}
const ICON_OPTIONS = [
  { value: 'music', label: 'Música' },
  { value: 'mic', label: 'Microfone' },
  { value: 'door-open', label: 'Porta' },
  { value: 'baby', label: 'Criança' },
  { value: 'camera', label: 'Câmera' },
  { value: 'heart', label: 'Coração' },
  { value: 'users', label: 'Grupo' },
  { value: 'sparkles', label: 'Estrelas' },
]
const COLOR_PRESETS = ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ec4899', '#f97316', '#6366f1']

// Positions per ministry
const POSITION_OPTIONS: Record<string, string[]> = {
  'Louvor': ['Ministro(a) de Louvor', 'Guitarrista', 'Baixista', 'Baterista', 'Tecladista', 'Violinista', 'Vocalista', 'Back-vocal', 'Violonista', 'Trompetista', 'Saxofonista'],
  'Recepção': ['Porteiro(a)', 'Recepcionista', 'Estacionamento', 'Coordenador(a)'],
  'Kids': ['Professor(a)', 'Auxiliar', 'Coordenador(a)', 'Narrador(a)'],
  'Mídia': ['Câmera', 'Transmissão ao Vivo', 'Fotógrafo(a)', 'Editor(a)', 'Redes Sociais', 'Iluminação', 'Som/Áudio'],
  'Intercessão': ['Intercessor(a)', 'Líder de Oração'],
}

export default function EscalasClient({ initialMinistries, members, events }: { initialMinistries: Ministry[], members: Member[], events: any[] }) {
  const [ministries, setMinistries] = useState(initialMinistries)
  const [isNewMinistryOpen, setIsNewMinistryOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [memberRole, setMemberRole] = useState<'VOLUNTARIO' | 'LIDER_MINISTERIO'>('VOLUNTARIO')
  const [memberPositions, setMemberPositions] = useState<string[]>([])

  const [newForm, setNewForm] = useState({ name: '', description: '', color: '#6366f1', icon: 'music' })

  const handleSeed = async () => {
    setIsSeeding(true)
    const res = await seedMinistries()
    if (res.success) { toast.success('Ministérios criados!'); window.location.reload() }
    else toast.error(res.error || 'Erro')
    setIsSeeding(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const res = await createMinistry(newForm)
    if (res.success) { toast.success('Ministério criado!'); window.location.reload() }
    else toast.error(res.error || 'Erro ao criar')
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este ministério? Todos os voluntários e escalas serão removidos.')) return
    const res = await deleteMinistry(id)
    if (res.success) { toast.success('Ministério excluído!'); setMinistries(m => m.filter(x => x.id !== id)) }
    else toast.error(res.error || 'Erro')
  }

  const openAddMember = (ministry: Ministry) => {
    setSelectedMinistry(ministry)
    setSelectedMemberId('')
    setMemberRole('VOLUNTARIO')
    setMemberPositions([])
    setIsAddMemberOpen(true)
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMinistry || !selectedMemberId) return
    setIsSaving(true)
    const posString = memberPositions.length > 0 ? memberPositions.join(', ') : undefined
    const res = await addMemberToMinistry(selectedMinistry.id, selectedMemberId, memberRole, undefined, posString)
    if (res.success) { toast.success('Voluntário adicionado!'); setIsAddMemberOpen(false); window.location.reload() }
    else toast.error(res.error || 'Erro')
    setIsSaving(false)
  }

  const handleRemoveMember = async (ministryMemberId: string) => {
    const res = await removeMemberFromMinistry(ministryMemberId)
    if (res.success) { toast.success('Removido!'); window.location.reload() }
    else toast.error(res.error || 'Erro')
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) && m.isDeleted === false
  )

  const positionOptions = selectedMinistry ? (POSITION_OPTIONS[selectedMinistry.name] || []) : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalas e Ministérios</h1>
          <p className="text-muted-foreground mt-1">Gerencie os ministérios e escalas de serviço da igreja.</p>
        </div>
        <div className="flex items-center gap-2">
          {ministries.length === 0 && (
            <button onClick={handleSeed} disabled={isSeeding} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors text-sm">
              <Sparkles className="w-4 h-4" />
              {isSeeding ? 'Criando...' : 'Criar Ministérios Padrão'}
            </button>
          )}
          <Dialog.Root open={isNewMinistryOpen} onOpenChange={setIsNewMinistryOpen}>
            <Dialog.Trigger asChild>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Novo Ministério
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-background border border-border rounded-2xl p-6 shadow-2xl">
                <Dialog.Title className="text-xl font-extrabold mb-4">Novo Ministério</Dialog.Title>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold">Nome *</label>
                    <input required value={newForm.name} onChange={e => setNewForm({...newForm, name: e.target.value})} placeholder="Ex: Louvor, Kids, Recepção..." className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold">Descrição</label>
                    <input value={newForm.description} onChange={e => setNewForm({...newForm, description: e.target.value})} placeholder="Breve descrição do ministério..." className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-bold">Ícone</label>
                      <select value={newForm.icon} onChange={e => setNewForm({...newForm, icon: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                        {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold">Cor</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {COLOR_PRESETS.map(c => (
                          <button key={c} type="button" onClick={() => setNewForm({...newForm, color: c})} className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${newForm.color === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-border">
                    <Dialog.Close asChild><button type="button" className="flex-1 h-11 font-bold text-sm bg-secondary rounded-xl hover:bg-secondary/80">Cancelar</button></Dialog.Close>
                    <button type="submit" disabled={isSaving} className="flex-1 h-11 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50">
                      {isSaving ? 'Criando...' : 'Criar Ministério'}
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* Ministry Cards Grid */}
      {ministries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
            <ClipboardList className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">Nenhum ministério criado</h3>
          <p className="text-muted-foreground max-w-sm">Crie ministérios padrão ou crie um personalizado para começar a organizar os voluntários.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map((ministry: Ministry) => {
            const IconComp = MINISTRY_ICONS[ministry.icon] || Users
            const liderCount = ministry.members.filter((m: any) => m.role === 'LIDER_MINISTERIO').length
            const volunteerCount = ministry.members.filter((m: any) => m.role === 'VOLUNTARIO').length
            return (
              <div key={ministry.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Header color bar */}
                <div className="h-2" style={{ backgroundColor: ministry.color }} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: ministry.color + '20', color: ministry.color }}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg leading-tight">{ministry.name}</h3>
                        <p className="text-xs text-muted-foreground">{ministry.description}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(ministry.id)} className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    {liderCount > 0 && <span className="flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-amber-500" /> {liderCount} líder{liderCount > 1 ? 'es' : ''}</span>}
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {volunteerCount} voluntário{volunteerCount !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Volunteer avatars */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {ministry.members.slice(0, 5).map((mm: any) => (
                        <div key={mm.id} className="w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ backgroundColor: ministry.color }}>
                          {mm.member.name.charAt(0)}
                        </div>
                      ))}
                      {ministry.members.length > 5 && (
                        <div className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          +{ministry.members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => openAddMember(ministry)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-muted hover:bg-muted/70 rounded-xl text-sm font-semibold transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Voluntário
                    </button>
                    <Link href={'/escalas/' + ministry.id} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ backgroundColor: ministry.color }}>
                      Ver Escalas <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Member Modal */}
      <Dialog.Root open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-background border border-border rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-extrabold mb-4">
              Adicionar ao {selectedMinistry?.name}
            </Dialog.Title>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold">Buscar membro</label>
                <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="Digite o nome..." className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              {memberSearch && (
                <div className="max-h-40 overflow-y-auto border border-border rounded-xl divide-y divide-border">
                  {filteredMembers.filter(m => !selectedMinistry?.members.find((mm: any) => mm.memberId === m.id)).slice(0, 8).map((m: any) => (
                    <button key={m.id} type="button" onClick={() => { setSelectedMemberId(m.id); setMemberSearch(m.name) }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 ${selectedMemberId === m.id ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{m.name.charAt(0)}</div>
                      {m.name}
                    </button>
                  ))}
                  {filteredMembers.filter(m => !selectedMinistry?.members.find((mm: any) => mm.memberId === m.id)).length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum membro disponível</p>
                  )}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-bold">Função</label>
                <select value={memberRole} onChange={e => setMemberRole(e.target.value as any)} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="VOLUNTARIO">Voluntário</option>
                  <option value="LIDER_MINISTERIO">Líder do Ministério</option>
                </select>
              </div>
              {positionOptions.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-bold">Funções (Selecione uma ou mais)</label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {positionOptions.map(p => (
                      <label key={p} className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-xl cursor-pointer hover:bg-muted transition-colors border border-transparent has-[:checked]:border-primary/50 has-[:checked]:bg-primary/10">
                        <input
                          type="checkbox"
                          checked={memberPositions.includes(p)}
                          onChange={(e) => {
                            if (e.target.checked) setMemberPositions(prev => [...prev, p]);
                            else setMemberPositions(prev => prev.filter(x => x !== p));
                          }}
                          className="rounded border-input text-primary focus:ring-primary w-4 h-4 accent-primary"
                        />
                        <span className="text-sm font-medium">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2 border-t border-border">
                <Dialog.Close asChild><button type="button" className="flex-1 h-11 font-bold text-sm bg-secondary rounded-xl hover:bg-secondary/80">Cancelar</button></Dialog.Close>
                <button type="submit" disabled={isSaving || !selectedMemberId} className="flex-1 h-11 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50">
                  {isSaving ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
