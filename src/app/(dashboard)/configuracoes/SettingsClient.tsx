'use client'

import { useState } from 'react'
import { updateSettings } from '@/app/actions/settings'
import { updateUserRole } from '@/app/actions/auth'
import { Save, AlertTriangle, Building2, Shield, X, UserCog } from 'lucide-react'

export default function SettingsClient({ initialSettings, users, currentUser }: { initialSettings: any, users: any[], currentUser: any }) {
  const [activeTab, setActiveTab] = useState<'geral' | 'acessos' | 'listas'>('geral')
  const [localUsers, setLocalUsers] = useState(users)
  const [formData, setFormData] = useState({
    inactivityDays: initialSettings.inactivityDays || 20,
    defaultChurchName: initialSettings.defaultChurchName || 'Lounge For You',
    leaders: initialSettings.leaders || [],
    areas: initialSettings.areas || []
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const res = await updateSettings(formData)
    if (res.success) {
      alert('Configurações salvas com sucesso!')
    } else {
      alert('Erro ao salvar: ' + res.error)
    }
    setIsSaving(false)
  }

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'LIDER') => {
    if (!confirm(`Deseja realmente mudar o acesso deste usuário para ${newRole}?`)) return
    
    const res = await updateUserRole(userId, newRole)
    if (res.success) {
      setLocalUsers(localUsers.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } else {
      alert(res.error || 'Erro ao mudar acesso.')
    }
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Painel de Comando</h1>
        <p className="text-muted-foreground mt-2">Acesso restrito a Administradores do Lounge.</p>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-px">
        <button 
          onClick={() => setActiveTab('geral')} 
          className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-colors ${activeTab === 'geral' ? 'bg-card border-x border-t border-border text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
        >
          ⚙️ Geral e Inteligência
        </button>
        <button 
          onClick={() => setActiveTab('acessos')} 
          className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-colors ${activeTab === 'acessos' ? 'bg-card border-x border-t border-border text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
        >
          🛡️ Acessos e Permissões
        </button>
        <button 
          onClick={() => setActiveTab('listas')} 
          className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-colors ${activeTab === 'listas' ? 'bg-card border-x border-t border-border text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
        >
          📋 Listas Dinâmicas
        </button>
      </div>

      {/* CONTEÚDO DAS TABS */}
      <div className="pt-2">
        
        {/* TAB: GERAL */}
        {activeTab === 'geral' && (
          <form onSubmit={handleSave} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                Identidade do Sistema
              </h2>
              <div className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nome da Igreja / Ministério</label>
                  <input 
                    type="text" 
                    value={formData.defaultChurchName} 
                    onChange={e => setFormData({...formData, defaultChurchName: e.target.value})} 
                    className="flex h-12 w-full rounded-xl border border-input bg-transparent px-4 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  />
                  <p className="text-sm text-muted-foreground mt-2">Usado como variável em templates de WhatsApp.</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-destructive/10 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                Inteligência de Retenção
              </h2>
              <div className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dias sem contato para Risco de Evasão</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" min="1" max="365"
                      value={formData.inactivityDays} 
                      onChange={e => setFormData({...formData, inactivityDays: parseInt(e.target.value) || 0})} 
                      className="flex h-12 w-32 rounded-xl border border-input bg-transparent px-4 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    />
                    <span className="text-muted-foreground font-medium">dias</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Aciona o alerta vermelho no painel inicial. Padrão: 20 dias.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50">
                <Save className="w-5 h-5" />
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </form>
        )}

        {/* TAB: ACESSOS */}
        {activeTab === 'acessos' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                Gerenciar Permissões
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
                Controle quem pode acessar o sistema. <strong className="text-primary">ADMIN</strong> tem poder total (inclusive de apagar pessoas). <strong className="text-foreground">LIDER</strong> pode apenas visualizar, cadastrar e enviar mensagens. Para adicionar alguém novo, peça para a pessoa fazer login no site; depois, venha aqui para aprovar e alterar a patente dela.
              </p>

              <div className="border border-border rounded-xl overflow-hidden bg-background">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50 text-muted-foreground font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Nome & E-mail</th>
                      <th className="px-6 py-4 text-center">Permissão Atual</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {localUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground text-base">{u.name}</div>
                          <div className="text-muted-foreground">{u.email}</div>
                          {u.id === currentUser.id && <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-md uppercase">Você</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                            {u.role === 'ADMIN' ? '👑 Admin' : '👤 Líder'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select 
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as 'ADMIN' | 'LIDER')}
                            disabled={u.id === currentUser.id}
                            className="bg-transparent border border-input rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                          >
                            <option value="ADMIN">Promover p/ Admin</option>
                            <option value="LIDER">Rebaixar p/ Líder</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: LISTAS */}
        {activeTab === 'listas' && (
          <form onSubmit={handleSave} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-green-500/10 rounded-xl">
                  <UserCog className="w-6 h-6 text-green-500" />
                </div>
                Listas Bases do Sistema
              </h2>
              
              <div className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Áreas de Serviço / Ministérios</label>
                  <p className="text-sm text-muted-foreground mb-2">Usado no cadastro de membros para saber onde eles servem.</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.areas.map((area, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium border border-border">
                        {area}
                        <button type="button" onClick={() => setFormData({...formData, areas: formData.areas.filter((_, idx) => idx !== i)})} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" id="newAreaInput" placeholder="Nova área (Ex: Louvor)"
                      className="flex h-11 flex-1 rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" 
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
                      className="px-4 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-colors font-bold text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <hr className="border-border" />

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Líderes de Referência</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.leaders.map((leader, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium border border-border">
                        {leader}
                        <button type="button" onClick={() => setFormData({...formData, leaders: formData.leaders.filter((_, idx) => idx !== i)})} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" id="newLeaderInput" placeholder="Nome do líder"
                      className="flex h-11 flex-1 rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" 
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
                      className="px-4 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-colors font-bold text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50">
                <Save className="w-5 h-5" />
                {isSaving ? 'Salvando...' : 'Salvar Listas'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
