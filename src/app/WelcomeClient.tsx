"use client"

import { useState } from 'react'
import { CheckCircle2, MessageCircle, Instagram, MapPin, Heart, Target, Users, Sparkles, Lock } from 'lucide-react'

export default function WelcomeClient({ settings, globalSettings }: { settings: any, globalSettings: any }) {
  const primaryColor = globalSettings?.primaryColor || '#6366f1'
  const churchName = globalSettings?.defaultChurchName || 'Nossa Igreja'

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    sourceType: '',
    sourceFriend: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Mscara de Telefone (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 11) val = val.slice(0, 11)
    
    let formatted = val
    if (val.length > 2 && val.length <= 7) {
      formatted = `(${val.slice(0,2)}) ${val.slice(2)}`
    } else if (val.length > 7) {
      formatted = `(${val.slice(0,2)}) ${val.slice(2,7)}-${val.slice(7)}`
    }
    setFormData(prev => ({ ...prev, phone: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (cleanPhone.length !== 11) {
      setErrorMsg('Por favor, preencha o telefone com DDD e 9 dgitos corretos.')
      return
    }

    if (!formData.sourceType) {
      setErrorMsg('Por favor, informe como nos conheceu.')
      return
    }

    if (formData.sourceType === 'Amigo' && !formData.sourceFriend.trim()) {
      setErrorMsg('Por favor, informe o nome do amigo que te convidou.')
      return
    }

    const finalSource = formData.sourceType === 'Amigo' 
      ? `Amigo: ${formData.sourceFriend}` 
      : formData.sourceType

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/hub/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          birthDate: formData.birthDate,
          source: finalSource
        })
      })

      const data = await res.json()
      if (res.ok) {
        setIsSuccess(true)
      } else {
        setErrorMsg(data.error || 'Erro ao enviar cadastro.')
      }
    } catch (err) {
      setErrorMsg('Erro de conexo.')
    }
    setIsSubmitting(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Que alegria ter voc!</h1>
        <p className="text-xl text-muted-foreground max-w-md">Seu cadastro foi concludo. Sinta-se em casa, voc faz parte da nossa famlia agora.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-primary/20">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-primary font-bold text-sm mb-6 shadow-sm border border-primary/20">
            <Sparkles className="w-4 h-4" /> Bem-vindo a {churchName}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            {settings.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            {settings.heroSubtitle}
          </p>

          {(settings.whatsappGroupUrl || settings.instagramUrl) && (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              {settings.whatsappGroupUrl && (
                <a href={settings.whatsappGroupUrl} target="_blank" className="flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg">
                  <MessageCircle className="w-5 h-5" /> Grupo de Avisos
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg">
                  <Instagram className="w-5 h-5" /> Nosso Instagram
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DNA DA IGREJA */}
      {(settings.mission || settings.vision || settings.values) && (
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-extrabold text-center mb-12">Nosso DNA</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {settings.mission && (
              <div className="p-8 bg-card border border-border rounded-3xl shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Target className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2"><Target className="w-5 h-5"/> Misso</h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">{settings.mission}</p>
              </div>
            )}
            {settings.vision && (
              <div className="p-8 bg-card border border-border rounded-3xl shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Heart className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2"><Heart className="w-5 h-5"/> Viso</h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">{settings.vision}</p>
              </div>
            )}
            {settings.values && (
              <div className="p-8 bg-card border border-border rounded-3xl shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Users className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2"><Users className="w-5 h-5"/> Valores</h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">{settings.values}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CLULAS E FORMULRIO */}
      <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-12 py-10">
        
        {/* INFO CLULAS */}
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold">Onde nos encontramos</h2>
          {settings.hhsInfo && (
            <div className="p-6 bg-secondary/30 border border-border rounded-3xl">
              <p className="text-lg text-muted-foreground whitespace-pre-wrap">{settings.hhsInfo}</p>
            </div>
          )}
          <div className="flex items-center gap-4 p-4 border border-primary/20 bg-primary/5 rounded-2xl">
            <div className="p-3 bg-primary/20 text-primary rounded-xl"><MapPin className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold">Nossa Casa</h4>
              <p className="text-sm text-muted-foreground">Domingos s 18h e 20h</p>
            </div>
          </div>
        </div>

        {/* FORMULRIO DE CADASTRO */}
        <div id="cadastro" className="p-8 bg-card border border-border rounded-3xl shadow-2xl relative">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
          <h3 className="text-2xl font-extrabold mb-2">Queremos te conhecer!</h3>
          <p className="text-muted-foreground mb-8">Preencha seus dados para estarmos conectados.</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold text-sm">{errorMsg}</div>}
            
            <div className="space-y-2">
              <label className="text-sm font-bold">Nome e Sobrenome *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex h-12 w-full rounded-xl border border-input bg-background px-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Joo da Silva" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">WhatsApp *</label>
                <input required type="text" value={formData.phone} onChange={handlePhoneChange} className="flex h-12 w-full rounded-xl border border-input bg-background px-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="(XX) XXXXX-XXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Nascimento *</label>
                <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="flex h-12 w-full rounded-xl border border-input bg-background px-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">Como nos conheceu? *</label>
              <select required value={formData.sourceType} onChange={e => setFormData({...formData, sourceType: e.target.value, sourceFriend: ''})} className="flex h-12 w-full rounded-xl border border-input bg-background px-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none">
                <option value="" disabled>Selecione uma opo</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">Grupo de WhatsApp</option>
                <option value="Amigo">Um amigo me convidou</option>
                <option value="Andando na rua">Passei na porta / Moro perto</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            {formData.sourceType === 'Amigo' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-bold text-primary">Qual o nome do amigo? *</label>
                <input required type="text" value={formData.sourceFriend} onChange={e => setFormData({...formData, sourceFriend: e.target.value})} className="flex h-12 w-full rounded-xl border border-primary/50 bg-primary/5 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Ex: Pedro Henrique" />
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full h-14 mt-4 bg-primary text-primary-foreground font-extrabold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
              {isSubmitting ? 'Enviando...' : 'Concluir Cadastro'}
            </button>
          </form>
        </div>
      </div>


      <a href="/acesso" className="absolute bottom-6 right-6 opacity-5 hover:opacity-50 transition-opacity"><Lock className="w-4 h-4" /></a>
    </div>
  )
}
