'use client'

import { useState, useEffect } from 'react'
import { updateMemberNotes, updateMemberMinisterial, updateMemberProfile } from '@/app/actions/crm'
import { User as UserIcon, Calendar, MapPin, Save, MessageCircle, Clock, BookOpen, Edit2, History, Camera } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

export default function ProfileClient({ member, groups }: { member: any, groups: any[] }) {
  const [userName, setUserName] = useState<string>('')
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
  }

  // Profile Edit State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: member.name,
    phone: member.phone || '',
    status: member.status,
    groupId: member.groupId || '',
    birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : '',
    photoUrl: member.photoUrl || ''
  })

  // Notes and Ministerial State
  const [notes, setNotes] = useState(member.notes || '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [minData, setMinData] = useState({
    address: member.address || '',
    city: member.city || '',
    neighborhood: member.neighborhood || '',
    joinDate: member.joinDate ? new Date(member.joinDate).toISOString().split('T')[0] : '',
    baptizeDate: member.baptizeDate ? new Date(member.baptizeDate).toISOString().split('T')[0] : '',
    isBaptized: member.isBaptized || false
  })
  const [isSavingMin, setIsSavingMin] = useState(false)

  // Timeline Tab State
  const [activeTab, setActiveTab] = useState<'contatos' | 'auditoria'>('contatos')

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    await updateMemberProfile(member.id, profileData, userName)
    setIsSavingProfile(false)
    setIsEditProfileOpen(false)
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    await updateMemberNotes(member.id, notes, userName)
    setIsSavingNotes(false)
  }

  const handleSaveMinisterial = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingMin(true)
    await updateMemberMinisterial(member.id, minData, userName)
    setIsSavingMin(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Coluna Esquerda: Header e Ministerial */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Header Hero */}
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary to-secondary opacity-20"></div>
          
          <button 
            onClick={() => setIsEditProfileOpen(true)}
            className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur border border-border rounded-lg shadow-sm text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 pt-12">
            <div className="w-28 h-28 rounded-full bg-background border-4 border-card shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative group/photo cursor-pointer" onClick={() => setIsEditProfileOpen(true)}>
              {member.photoUrl ? (
                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-black/50 items-center justify-center hidden group-hover/photo:flex transition-all">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 pb-2">
              <h1 className="text-4xl font-extrabold">{member.name}</h1>
              <div className="flex flex-wrap gap-4 mt-3 text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {member.status}</span>
                {member.phone && <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4"/> {member.phone}</span>}
                {member.birthDate && <span className="flex items-center gap-1.5"><UserIcon className="w-4 h-4"/> {new Date(member.birthDate).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</span>}
              </div>
            </div>
            {member.phone && (
              <a 
                href={`https://wa.me/${member.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-whatsapp text-whatsapp-foreground text-sm font-bold rounded-xl hover:opacity-90 hover:-translate-y-1 transition-all shadow-md shadow-whatsapp/20 mb-2"
              >
                <MessageCircle className="w-5 h-5" /> Falar agora
              </a>
            )}
          </div>
        </div>

        {/* Dados Ministeriais e Pessoais */}
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <MapPin className="w-6 h-6 text-blue-500" />
            </div>
            Dados Ministeriais e Endereço
          </h2>
          <form onSubmit={handleSaveMinisterial} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Endereço</label>
                <input type="text" value={minData.address} onChange={e => setMinData({...minData, address: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Bairro / Cidade</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Bairro" value={minData.neighborhood} onChange={e => setMinData({...minData, neighborhood: e.target.value})} className="flex h-11 w-1/2 rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <input type="text" placeholder="Cidade" value={minData.city} onChange={e => setMinData({...minData, city: e.target.value})} className="flex h-11 w-1/2 rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Data da Decisão (Chegada)</label>
                <input type="date" value={minData.joinDate} onChange={e => setMinData({...minData, joinDate: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Data do Batismo</label>
                <input type="date" value={minData.baptizeDate} onChange={e => setMinData({...minData, baptizeDate: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative flex items-center">
                <input type="checkbox" checked={minData.isBaptized} onChange={e => setMinData({...minData, isBaptized: e.target.checked})} className="peer sr-only" />
                <div className="w-11 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-bold">Membro é batizado</span>
            </label>

            <div className="flex justify-end">
              <button disabled={isSavingMin} type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                <Save className="w-4 h-4" /> {isSavingMin ? 'Salvando...' : 'Salvar Dados'}
              </button>
            </div>
          </form>
        </div>

        {/* Anotações Pastorais */}
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl">
              <BookOpen className="w-6 h-6 text-yellow-500" />
            </div>
            Anotações Pastorais
          </h2>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Digite informações importantes sobre o pastoreio, pedidos de oração, acompanhamento..."
            className="flex min-h-[150px] w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
          />
          <div className="flex justify-end">
            <button disabled={isSavingNotes} onClick={handleSaveNotes} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
              <Save className="w-4 h-4" /> {isSavingNotes ? 'Salvando...' : 'Salvar Anotações'}
            </button>
          </div>
        </div>

      </div>

      {/* Coluna Direita: Timelines */}
      <div className="p-8 bg-card border border-border rounded-3xl shadow-sm h-[800px] flex flex-col">
        
        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-border mb-6">
          <button 
            onClick={() => setActiveTab('contatos')}
            className={`pb-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'contatos' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Contatos WhatsApp
          </button>
          <button 
            onClick={() => setActiveTab('auditoria')}
            className={`pb-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'auditoria' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Histórico de Edições
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          
          {activeTab === 'contatos' && (
            member.histories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center relative z-10 bg-card py-4">Nenhum contato registrado.</p>
            ) : (
              member.histories.map((hist: any) => (
                <div key={hist.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-primary text-primary-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border bg-background shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {new Date(hist.sentAt).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        Por: {hist.user?.name || 'Sistema'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mb-1">{hist.template ? hist.template.name : 'Mensagem Livre'}</p>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {hist.template ? hist.template.content : hist.customText}
                    </p>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'auditoria' && (
            member.audits?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center relative z-10 bg-card py-4">Nenhuma edição registrada.</p>
            ) : (
              member.audits?.map((audit: any) => (
                <div key={audit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-secondary text-secondary-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10">
                    <History className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border bg-background shadow-sm group-hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {new Date(audit.createdAt).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mb-1">{audit.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {audit.action}
                    </p>
                  </div>
                </div>
              ))
            )
          )}

        </div>
      </div>

      {/* MODAL: IDENTIFICAÇÃO DO USUÁRIO */}
      <Dialog.Root open={isAuthModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-8 shadow-2xl rounded-2xl">
            <Dialog.Title className="text-2xl font-extrabold tracking-tight text-center">
              Identifique-se
            </Dialog.Title>
            <p className="text-center text-muted-foreground text-sm mb-4">
              Para acessar e editar perfis, precisamos saber quem é você para o registro de auditoria do sistema.
            </p>
            <form onSubmit={handleSaveAuth} className="space-y-4">
              <input 
                autoFocus
                required
                placeholder="Seu nome completo..."
                value={tempUserName}
                onChange={e => setTempUserName(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-input bg-transparent px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors">
                Entrar no Sistema
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* MODAL: EDITAR PERFIL */}
      <Dialog.Root open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-8 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-2xl font-extrabold tracking-tight mb-2">
              Editar Perfil
            </Dialog.Title>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-bold">URL da Foto (Instagram, Facebook, etc)</label>
                <input value={profileData.photoUrl} onChange={e => setProfileData({...profileData, photoUrl: e.target.value})} placeholder="https://..." className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Nome Completo</label>
                  <input required value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Telefone</label>
                  <input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Data de Nascimento</label>
                  <input type="date" value={profileData.birthDate} onChange={e => setProfileData({...profileData, birthDate: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Status</label>
                  <select value={profileData.status} onChange={e => setProfileData({...profileData, status: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="VISITANTE">Visitante</option>
                    <option value="ATIVO">Membro Ativo</option>
                    <option value="INATIVO">Inativo</option>
                    <option value="DISCIPULADO">Discipulado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Responsável / Célula</label>
                <select value={profileData.groupId} onChange={e => setProfileData({...profileData, groupId: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Nenhum</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <Dialog.Close asChild>
                  <button type="button" className="px-5 py-2.5 border rounded-xl hover:bg-secondary font-bold text-sm transition-colors">Cancelar</button>
                </Dialog.Close>
                <button type="submit" disabled={isSavingProfile} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-sm transition-colors disabled:opacity-50">
                  {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>

            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
