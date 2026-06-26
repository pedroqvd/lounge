'use client'

import { useState } from 'react'
import { updateSettings, updateHubSettings } from '@/app/actions/settings'
import { updateUserRole, preRegisterUser } from '@/app/actions/auth'
import { updateGroup } from '@/app/actions/members'
import { Save, Building2, Shield, X, UserCog, Settings2, Link2, ListPlus, Activity, Webhook, Globe, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import * as Tabs from '@radix-ui/react-tabs'

export default function SettingsClient({ initialSettings, initialHubSettings, users, currentUser, groups = [] }: { initialSettings: any, initialHubSettings: any, users: any[], currentUser: any, groups?: any[] }) {
  const [localGroups, setLocalGroups] = useState(groups)
  const [localUsers, setLocalUsers] = useState(users)
  const [formData, setFormData] = useState({
    inactivityDays: initialSettings.inactivityDays || 20,
    defaultChurchName: initialSettings.defaultChurchName || 'Lounge For You',
    leaders: initialSettings.leaders || [],
    areas: initialSettings.areas || [],
    primaryColor: initialSettings.primaryColor || '#6366f1',
    themeMode: initialSettings.themeMode || 'system',
    webhookUrl: initialSettings.webhookUrl || ''
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [hubData, setHubData] = useState({
    title: initialHubSettings.title || "Bem-vindo!",
    heroSubtitle: initialHubSettings.heroSubtitle || "",
    mission: initialHubSettings.mission || "",
    vision: initialHubSettings.vision || "",
    values: initialHubSettings.values || "",
    hhsInfo: initialHubSettings.hhsInfo || "",
    whatsappGroupUrl: initialHubSettings.whatsappGroupUrl || "",
    instagramUrl: initialHubSettings.instagramUrl || ""
  })

  const handleSaveHub = async () => {
    setIsSaving(true)
    const res = await updateHubSettings(hubData)
    if (res.success) toast.success("Configurações do Hub salvas!")
    else toast.error("Erro: " + res.error)
    setIsSaving(false)
  }

  
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'LIDER' as 'ADMIN'|'LIDER' })
  const [isAddingUser, setIsAddingUser] = useState(false)

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingUser(true)
    const res = await preRegisterUser(newUser.name, newUser.email, newUser.role)
    if (res.success) {
      toast.success('Acesso criado! A pessoa já pode entrar no sistema.')
      setLocalUsers([{ id: Date.now().toString(), name: newUser.name, email: newUser.email, role: newUser.role, createdAt: new Date() }, ...localUsers])
      setNewUser({ name: '', email: '', role: 'LIDER' })
    } else {
      toast.error(res.error || 'Erro ao adicionar usuário.')
    }
    setIsAddingUser(false)
  }

  const handleSave = async (section: string) => {
    setIsSaving(true)
    const res = await updateSettings(formData)
    if (res.success) {
      toast.success(`Configurações de ${section} salvas com sucesso!`)
    } else {
      toast.error('Erro ao salvar: ' + res.error)
    }
    setIsSaving(false)
  }

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'LIDER') => {
    if (!confirm(`Deseja realmente mudar o acesso deste usuário para ${newRole}?`)) return
    
    const res = await updateUserRole(userId, newRole)
    if (res.success) {
      toast.success('Permissão alterada com sucesso!')
      setLocalUsers(localUsers.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } else {
      toast.error(res.error || 'Erro ao mudar acesso.')
    }
  }
  
  const handleTestWebhook = async () => {
    if (!formData.webhookUrl) {
      toast.error('Por favor, informe uma URL de Webhook primeiro e salve.')
      return
    }
    toast.promise(
      fetch(formData.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test',
          member: {
            name: 'Membro Teste',
            email: 'teste@loungeforyou.com',
            status: 'ATIVO',
            phone: '61999999999'
          }
        })
      }),
      {
        loading: 'Enviando payload de teste...',
        success: 'Teste enviado com sucesso!',
        error: 'Falha ao enviar requisição para o Webhook.'
      }
    )
  }

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Painel de Comando</h1>
        <p className="text-muted-foreground mt-2">Acesso restrito a Administradores do Lounge.</p>
      </div>

      <Tabs.Root defaultValue="geral" className="flex flex-col gap-6">
        <Tabs.List className="flex flex-wrap gap-2 border-b border-border pb-px">
          <Tabs.Trigger value="geral" className="flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all data-[state=active]:bg-card data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border data-[state=active]:text-primary text-muted-foreground hover:bg-secondary/50 data-[state=inactive]:border-b-transparent">
            <Settings2 className="w-4 h-4" /> Geral e Inteligência
          </Tabs.Trigger>
          <Tabs.Trigger value="acessos" className="flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all data-[state=active]:bg-card data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border data-[state=active]:text-primary text-muted-foreground hover:bg-secondary/50 data-[state=inactive]:border-b-transparent">
            <Shield className="w-4 h-4" /> Acessos e Permissões
          </Tabs.Trigger>
          <Tabs.Trigger value="listas" className="flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all data-[state=active]:bg-card data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border data-[state=active]:text-primary text-muted-foreground hover:bg-secondary/50 data-[state=inactive]:border-b-transparent">
            <ListPlus className="w-4 h-4" /> Listas Dinâmicas
          </Tabs.Trigger>
          <Tabs.Trigger value="hub" className="flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all data-[state=active]:bg-card data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border data-[state=active]:text-primary text-muted-foreground hover:bg-secondary/50 data-[state=inactive]:border-b-transparent">
            <Globe className="w-4 h-4" /> Hub Público
          </Tabs.Trigger>
          <Tabs.Trigger value="integracoes" className="flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all data-[state=active]:bg-card data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border data-[state=active]:text-primary text-muted-foreground hover:bg-secondary/50 data-[state=inactive]:border-b-transparent">
            <Link2 className="w-4 h-4" /> Integrações (Webhooks)
          </Tabs.Trigger>
          <Tabs.Trigger value="hhs" className="flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all data-[state=active]:bg-card data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border data-[state=active]:text-primary text-muted-foreground hover:bg-secondary/50 data-[state=inactive]:border-b-transparent">
            <MapPin className="w-4 h-4" /> Grupos e HHs
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="geral" className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              Identidade do Sistema
            </h2>
            <div className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Nome da Igreja / Ministério</label>
                <input 
                  type="text" 
                  value={formData.defaultChurchName} 
                  onChange={e => setFormData({...formData, defaultChurchName: e.target.value})} 
                  className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-base font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                />
                <p className="text-sm text-muted-foreground mt-2">Usado como variável em templates de WhatsApp.</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: formData.primaryColor }} />
              </div>
              Aparência Visual
            </h2>
            <div className="space-y-6 max-w-xl">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Cor Principal do Sistema (HEX)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={formData.primaryColor} 
                    onChange={e => setFormData({...formData, primaryColor: e.target.value})} 
                    className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0" 
                  />
                  <input 
                    type="text" 
                    value={formData.primaryColor} 
                    onChange={e => setFormData({...formData, primaryColor: e.target.value})} 
                    className="flex h-12 w-32 rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-base font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase transition-all" 
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">Mude a cor de todos os botões e detalhes do sistema.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Modo de Exibição (Tema)</label>
                <select 
                  value={formData.themeMode} 
                  onChange={e => setFormData({...formData, themeMode: e.target.value})} 
                  className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="system">Seguir o Sistema Operacional</option>
                  <option value="light">Claro (Light)</option>
                  <option value="dark">Escuro (Dark)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              Inteligência do Sistema
            </h2>
            <div className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Limiar de Inatividade (Desgarrados)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" min="1" 
                    value={formData.inactivityDays} 
                    onChange={e => setFormData({...formData, inactivityDays: Number(e.target.value)})} 
                    className="flex h-12 w-24 rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-base text-center font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                  <span className="text-sm font-medium">dias sem comparecer</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Se um membro faltar a cultos consecutivamente por este número de dias, o sistema sugerirá marcá-lo como Inativo/Desgarrado.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => handleSave('Geral e Inteligência')} disabled={isSaving} className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-md active:scale-95 disabled:opacity-50">
              <Save className="w-5 h-5" />
              {isSaving ? 'Salvando...' : 'Salvar Tudo'}
            </button>
          </div>
        </Tabs.Content>

        <Tabs.Content value="acessos" className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
          {currentUser?.role === 'ADMIN' ? (
            <>
              <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <UserCog className="w-6 h-6" />
                  </div>
                  Conceder Novo Acesso
                </h2>
                <form onSubmit={handleAddUser} className="space-y-4 max-w-2xl">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Nome da Pessoa</label>
                      <input 
                        required 
                        value={newUser.name} 
                        onChange={e => setNewUser({...newUser, name: e.target.value})} 
                        className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                        placeholder="Ex: João Silva" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Email Google</label>
                      <input 
                        required 
                        type="email" 
                        value={newUser.email} 
                        onChange={e => setNewUser({...newUser, email: e.target.value})} 
                        className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                        placeholder="joao@gmail.com" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Nível de Permissão</label>
                    <select 
                      value={newUser.role} 
                      onChange={e => setNewUser({...newUser, role: e.target.value as any})} 
                      className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    >
                      <option value="LIDER">Líder (Visualiza membros e grupos que participa)</option>
                      <option value="ADMIN">Administrador (Controle total)</option>
                    </select>
                  </div>
                  <button type="submit" disabled={isAddingUser} className="inline-flex items-center justify-center w-full md:w-auto mt-4 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-md active:scale-95 disabled:opacity-50">
                    <UserCog className="w-5 h-5 mr-2" />
                    {isAddingUser ? 'Adicionando...' : 'Adicionar Acesso'}
                  </button>
                </form>
              </div>

              <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Shield className="w-6 h-6" />
                  </div>
                  Usuários Registrados
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-xl">Nome</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3 text-center">Permissão</th>
                        <th className="px-4 py-3 rounded-tr-xl">Data de Criação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localUsers.map((user: any) => (
                        <tr key={user.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-4 font-bold">{user.name || 'Sem nome'}</td>
                          <td className="px-4 py-4 font-mono text-xs">{user.email}</td>
                          <td className="px-4 py-4 text-center">
                            <select 
                              value={user.role} 
                              onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                              disabled={user.email === currentUser?.email}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-primary outline-none transition-colors ${
                                user.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                              } disabled:opacity-50`}
                            >
                              <option value="LIDER">Líder</option>
                              <option value="ADMIN">Administrador</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                            <td className="px-4 py-4 text-muted-foreground">
                              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca'}
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-2xl">
              Você não tem permissão de Administrador para editar acessos.
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="listas" className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <ListPlus className="w-6 h-6" />
              </div>
              Variáveis do Sistema
            </h2>
            
            <div className="space-y-8 max-w-xl">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-foreground">Áreas de Serviço / Ministérios</label>
                  <p className="text-xs text-muted-foreground mb-3">Usado no cadastro de membros para saber onde eles servem.</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.areas.map((area: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold border border-border shadow-sm">
                      {area}
                      <button type="button" onClick={() => setFormData({...formData, areas: formData.areas.filter((_: string, idx: number) => idx !== i)})} className="hover:text-destructive hover:bg-destructive/10 p-1 rounded-full transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {formData.areas.length === 0 && <span className="text-sm text-muted-foreground italic">Nenhuma área cadastrada.</span>}
                </div>
                <div className="flex gap-2 relative">
                  <input 
                    type="text" id="newAreaInput" placeholder="Nova área (Ex: Louvor)"
                    className="flex h-12 flex-1 rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const val = e.currentTarget.value.trim()
                        if (val && !formData.areas.includes(val)) {
                          setFormData({...formData, areas: [...formData.areas, val]})
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('newAreaInput') as HTMLInputElement
                      const val = input.value.trim()
                      if (val && !formData.areas.includes(val)) {
                        setFormData({...formData, areas: [...formData.areas, val]})
                        input.value = ''
                      }
                    }}
                    className="px-6 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all font-bold text-sm"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <hr className="border-border" />

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-foreground">Líderes de Referência</label>
                  <p className="text-xs text-muted-foreground mb-3">Opções de supervisores ou pastores disponíveis.</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.leaders.map((leader: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold border border-border shadow-sm">
                      {leader}
                      <button type="button" onClick={() => setFormData({...formData, leaders: formData.leaders.filter((_: string, idx: number) => idx !== i)})} className="hover:text-destructive hover:bg-destructive/10 p-1 rounded-full transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {formData.leaders.length === 0 && <span className="text-sm text-muted-foreground italic">Nenhum líder cadastrado.</span>}
                </div>
                <div className="flex gap-2 relative">
                  <input 
                    type="text" id="newLeaderInput" placeholder="Nome do líder"
                    className="flex h-12 flex-1 rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const val = e.currentTarget.value.trim()
                        if (val && !formData.leaders.includes(val)) {
                          setFormData({...formData, leaders: [...formData.leaders, val]})
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('newLeaderInput') as HTMLInputElement
                      const val = input.value.trim()
                      if (val && !formData.leaders.includes(val)) {
                        setFormData({...formData, leaders: [...formData.leaders, val]})
                        input.value = ''
                      }
                    }}
                    className="px-6 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all font-bold text-sm"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => handleSave('Listas')} disabled={isSaving} className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-md active:scale-95 disabled:opacity-50">
              <Save className="w-5 h-5" />
              {isSaving ? 'Salvando...' : 'Salvar Listas'}
            </button>
          </div>
        </Tabs.Content>

        <Tabs.Content value="integracoes" className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl">
                <Link2 className="w-6 h-6" />
              </div>
              Integrações Externas
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Conecte o Lounge a outros aplicativos (como Google Sheets, Zapier, n8n ou Make). Quando um membro for criado ou atualizado, o Lounge enviará os dados automaticamente para a URL especificada abaixo.
            </p>
            
            <div className="space-y-6 max-w-xl">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">URL do Webhook</label>
                <input 
                  type="url" 
                  placeholder="https://hooks.zapier.com/..." 
                  value={formData.webhookUrl} 
                  onChange={e => setFormData({...formData, webhookUrl: e.target.value})} 
                  className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                />
                <p className="text-xs text-muted-foreground mt-2">Deixe em branco para desativar. Os envios são feitos via POST com o objeto JSON do membro.</p>
              </div>
              
              <div className="pt-4 flex items-center gap-4">
                <button 
                  onClick={handleTestWebhook}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  <Webhook className="w-4 h-4" />
                  Testar Conexão
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => handleSave('Integrações')} disabled={isSaving} className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-md active:scale-95 disabled:opacity-50">
              <Save className="w-5 h-5" />
              {isSaving ? 'Salvando...' : 'Salvar Webhook'}
            </button>
          </div>
        </Tabs.Content>

        <Tabs.Content value="hub" className="space-y-6 mt-6 outline-none animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Hub Público (Portal do Visitante)</h2>
              <p className="text-muted-foreground">Preencha as informações institucionais para a Landing Page de visitantes.</p>
            </div>
            <button onClick={handleSaveHub} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md">
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Hub'}
            </button>
          </div>

          <div className="p-8 bg-card border border-border rounded-2xl shadow-sm space-y-6">
             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Título de Boas-vindas</label>
                <input type="text" value={hubData.title} onChange={e => setHubData({...hubData, title: e.target.value})} className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary" />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Subtítulo</label>
                <input type="text" value={hubData.heroSubtitle} onChange={e => setHubData({...hubData, heroSubtitle: e.target.value})} className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary" />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Missão</label>
                <textarea value={hubData.mission} onChange={e => setHubData({...hubData, mission: e.target.value})} className="flex w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px]" />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Visão</label>
                <textarea value={hubData.vision} onChange={e => setHubData({...hubData, vision: e.target.value})} className="flex w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px]" />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Valores</label>
                <textarea value={hubData.values} onChange={e => setHubData({...hubData, values: e.target.value})} className="flex w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px]" />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Informações sobre HHs (Células)</label>
                <textarea value={hubData.hhsInfo} onChange={e => setHubData({...hubData, hhsInfo: e.target.value})} className="flex w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px]" />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Link Grupo do WhatsApp (Opcional)</label>
                <input type="text" value={hubData.whatsappGroupUrl || ''} onChange={e => setHubData({...hubData, whatsappGroupUrl: e.target.value})} className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary" />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Link do Instagram (Opcional)</label>
                <input type="text" value={hubData.instagramUrl || ''} onChange={e => setHubData({...hubData, instagramUrl: e.target.value})} className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary" />
             </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="hhs" className="space-y-6 mt-6 outline-none animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Endereços dos HHs / Grupos</h2>
              <p className="text-muted-foreground">Cadastre o mapa dos grupos ativos para que eles apareçam na página pública de visitantes.</p>
            </div>
          </div>

          <div className="grid gap-6">
            {localGroups.map((group: any) => (
              <div key={group.id} className="p-6 bg-card border border-border rounded-2xl shadow-sm flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> {group.name}</h3>
                  {group.description && <p className="text-sm text-muted-foreground mt-1">{group.description}</p>}
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground">Bairro / Região</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Asa Sul"
                        value={group.neighborhood || ''} 
                        onChange={e => setLocalGroups(prev => prev.map((g: any) => g.id === group.id ? { ...g, neighborhood: e.target.value } : g))}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground">Endereço (opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Quadra 300, Lote 10"
                        value={group.address || ''} 
                        onChange={e => setLocalGroups(prev => prev.map((g: any) => g.id === group.id ? { ...g, address: e.target.value } : g))}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground">Link do Google Maps</label>
                      <input 
                        type="url" 
                        placeholder="https://maps.app.goo.gl/..."
                        value={group.mapUrl || ''} 
                        onChange={e => setLocalGroups(prev => prev.map((g: any) => g.id === group.id ? { ...g, mapUrl: e.target.value } : g))}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground">Telefone p/ Contato</label>
                      <input 
                        type="text" 
                        placeholder="(61) 99999-9999"
                        value={group.contactPhone || ''} 
                        onChange={e => setLocalGroups(prev => prev.map((g: any) => g.id === group.id ? { ...g, contactPhone: e.target.value } : g))}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={async () => {
                        const loadingToast = toast.loading('Salvando endereço...')
                        const res = await updateGroup(group.id, {
                          neighborhood: group.neighborhood,
                          address: group.address,
                          mapUrl: group.mapUrl,
                          contactPhone: group.contactPhone
                        })
                        toast.dismiss(loadingToast)
                        if (res.success) toast.success('Endereço salvo com sucesso!')
                        else toast.error('Erro ao salvar endereço.')
                      }}
                      className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-sm font-bold rounded-xl transition-all"
                    >
                      Salvar Endereço
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {localGroups.length === 0 && (
              <div className="text-center p-8 text-muted-foreground border border-dashed rounded-xl">
                Nenhum grupo cadastrado ainda. Grupos são criados automaticamente ao cadastrar membros.
              </div>
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
