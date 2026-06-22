'use client'

import { useState } from 'react'
import { updateSettings } from '@/app/actions/settings'
import { Save, AlertTriangle, Building2, Bell, X } from 'lucide-react'

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [formData, setFormData] = useState<{
    inactivityDays: number;
    defaultChurchName: string;
    leaders: string[];
    areas: string[];
  }>({
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

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground mt-2">Ajuste os parâmetros de inteligência e personalização do Lounge For You.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Inteligência de Retenção */}
        <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-destructive/10 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            Inteligência de Retenção (Evasão)
          </h2>
          
          <div className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dias sem contato para Alerta Vermelho</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  min="1"
                  max="365"
                  value={formData.inactivityDays} 
                  onChange={e => setFormData({...formData, inactivityDays: parseInt(e.target.value) || 0})} 
                  className="flex h-12 w-32 rounded-xl border border-input bg-transparent px-4 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50" 
                />
                <span className="text-muted-foreground font-medium">dias</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                O painel inicial exibirá um alerta vermelho para visitantes e membros que não receberem nenhuma mensagem pelo sistema neste intervalo de dias. Padrão recomendado: 20 dias.
              </p>
            </div>
          </div>
        </div>

        {/* Personalização */}
        <div className="p-8 bg-card border border-border rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            Personalização do Ministério
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
              <p className="text-sm text-muted-foreground mt-2">
                Este nome poderá ser usado como variável automática nos seus templates de WhatsApp (ex: {"{igreja}"}).
              </p>
            </div>
            
            <div className="space-y-2 pt-4">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Líderes / Responsáveis</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.leaders.map((leader, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">
                    {leader}
                    <button type="button" onClick={() => setFormData({...formData, leaders: formData.leaders.filter((_, idx) => idx !== i)})} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="newLeaderInput"
                  placeholder="Nome do líder"
                  className="flex h-11 flex-1 rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
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
                  Adicionar
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Áreas de Escolha / Ministérios</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.areas.map((area, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">
                    {area}
                    <button type="button" onClick={() => setFormData({...formData, areas: formData.areas.filter((_, idx) => idx !== i)})} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="newAreaInput"
                  placeholder="Nome da área (Ex: Louvor, Recepção)"
                  className="flex h-11 flex-1 rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
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
                  Adicionar
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center justify-end">
          <button 
            type="submit" 
            disabled={isSaving} 
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  )
}
