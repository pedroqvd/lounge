"use client"

import { useState } from 'react'
import { CheckCircle2, MessageCircle, Instagram, MapPin, Heart, Target, Users, Sparkles, Lock, Menu, X } from 'lucide-react'

export default function WelcomeClient({ settings, globalSettings }: { settings: any, globalSettings: any }) {
  const primaryColor = globalSettings?.primaryColor || '#6366f1'
  const churchName = globalSettings?.defaultChurchName || 'Nossa Igreja'

  const [formData, setFormData] = useState({ name: '', phone: '', birthDate: '', sourceType: '', sourceFriend: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
      setErrorMsg('Por favor, preencha o telefone com DDD e 9 dígitos corretos.')
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

    const finalSource = formData.sourceType === 'Amigo' ? `Amigo: ${formData.sourceFriend}` : formData.sourceType

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
      if (res.ok) setIsSuccess(true)
      else setErrorMsg(data.error || 'Erro ao enviar cadastro.')
    } catch (err) {
      setErrorMsg('Erro de conexão.')
    }
    setIsSubmitting(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Que alegria ter você!</h1>
        <p className="text-xl text-muted-foreground max-w-md">Seu cadastro foi concluído. Sinta-se em casa, você faz parte da nossa família agora.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-tighter" style={{ color: primaryColor }}>
            <Sparkles className="w-5 h-5" />
            {churchName}
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Início</a>
            <a href="#dna" className="hover:text-primary transition-colors">Nosso DNA</a>
            <a href="#celulas" className="hover:text-primary transition-colors">Células</a>
            <a href="#cadastro" className="hover:text-primary transition-colors">Conectar</a>
          </nav>

          <div className="hidden md:flex items-center">
             <a href="#cadastro" className="px-5 py-2 text-sm font-bold text-white rounded-full shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
               Sou Visitante
             </a>
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md p-4 flex flex-col gap-4 font-semibold text-muted-foreground">
            <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">Início</a>
            <a href="#dna" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">Nosso DNA</a>
            <a href="#celulas" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">Células</a>
            <a href="#cadastro" onClick={() => setIsMobileMenuOpen(false)} className="text-primary font-bold">Conectar (Sou Visitante)</a>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="container mx-auto px-6 py-24 md:py-32 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-primary font-bold text-sm mb-8 shadow-sm border border-primary/20">
              Bem-vindo à sua nova casa
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1]">
              {settings.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {settings.heroSubtitle}
            </p>

            {(settings.whatsappGroupUrl || settings.instagramUrl) && (
              <div className="flex flex-wrap items-center justify-center gap-4">
                {settings.whatsappGroupUrl && (
                  <a href={settings.whatsappGroupUrl} target="_blank" className="flex items-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition-all hover:scale-105 shadow-xl shadow-[#25D366]/20">
                    <MessageCircle className="w-5 h-5" /> Grupo de Avisos
                  </a>
                )}
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold rounded-xl transition-all hover:scale-105 shadow-xl shadow-[#dc2743]/20">
                    <Instagram className="w-5 h-5" /> Nosso Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* DNA DA IGREJA */}
        {(settings.mission || settings.vision || settings.values) && (
          <section id="dna" className="container mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">O que nos move</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">Conheça os pilares que sustentam a nossa visão do Reino.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {settings.mission && (
                <div className="p-8 bg-card border border-border/50 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Target className="w-40 h-40" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center shadow-inner" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                    <Target className="w-6 h-6"/>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Missão</h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10">{settings.mission}</p>
                </div>
              )}
              {settings.vision && (
                <div className="p-8 bg-card border border-border/50 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Heart className="w-40 h-40" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center shadow-inner" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                    <Heart className="w-6 h-6"/>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Visão</h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10">{settings.vision}</p>
                </div>
              )}
              {settings.values && (
                <div className="p-8 bg-card border border-border/50 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Users className="w-40 h-40" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center shadow-inner" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                    <Users className="w-6 h-6"/>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Valores</h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10">{settings.values}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* CÉLULAS E FORMULÁRIO */}
        <section className="bg-secondary/20 border-t border-border/50">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 py-24">
            
            {/* INFO CÉLULAS */}
            <div id="celulas" className="space-y-8 flex flex-col justify-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Onde nos encontramos</h2>
                <p className="text-muted-foreground text-lg">A igreja acontece nas casas e nas celebrações.</p>
              </div>
              
              {settings.hhsInfo && (
                <div className="p-6 bg-background border border-border/50 rounded-3xl shadow-sm">
                  <p className="text-lg text-foreground whitespace-pre-wrap leading-relaxed">{settings.hhsInfo}</p>
                </div>
              )}
              <div className="flex items-start gap-4 p-5 bg-background border border-border/50 rounded-2xl shadow-sm">
                <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0"><MapPin className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Nossa Sede</h4>
                  <p className="text-muted-foreground leading-relaxed">Venha nos visitar presencialmente. Nossos encontros acontecem aos finais de semana e estamos de braços abertos para te receber.</p>
                </div>
              </div>
            </div>

            {/* FORMULÁRIO DE CADASTRO */}
            <div id="cadastro" className="p-8 md:p-10 bg-card border border-border rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold mb-3">Queremos te conhecer!</h3>
                <p className="text-muted-foreground mb-10 text-lg">Preencha seus dados para estarmos conectados e não perder nada do que acontece por aqui.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMsg && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold text-sm">{errorMsg}</div>}
                  
                  <div className="space-y-2.5">
                    <label className="text-sm font-bold text-foreground/80">Nome e Sobrenome *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex h-14 w-full rounded-2xl border-2 border-input bg-background/50 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium" placeholder="Ex: João da Silva" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-foreground/80">WhatsApp *</label>
                      <input required type="text" value={formData.phone} onChange={handlePhoneChange} className="flex h-14 w-full rounded-2xl border-2 border-input bg-background/50 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium" placeholder="(XX) XXXXX-XXXX" />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-foreground/80">Nascimento *</label>
                      <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="flex h-14 w-full rounded-2xl border-2 border-input bg-background/50 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-sm font-bold text-foreground/80">Como nos conheceu? *</label>
                    <select required value={formData.sourceType} onChange={e => setFormData({...formData, sourceType: e.target.value, sourceFriend: ''})} className="flex h-14 w-full rounded-2xl border-2 border-input bg-background/50 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none font-medium text-foreground">
                      <option value="" disabled>Selecione uma opção</option>
                      <option value="Instagram">Instagram</option>
                      <option value="WhatsApp">Grupo de WhatsApp</option>
                      <option value="Amigo">Um amigo me convidou</option>
                      <option value="Andando na rua">Passei na porta / Moro perto</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  {formData.sourceType === 'Amigo' && (
                    <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-bold text-primary">Qual o nome do amigo? *</label>
                      <input required type="text" value={formData.sourceFriend} onChange={e => setFormData({...formData, sourceFriend: e.target.value})} className="flex h-14 w-full rounded-2xl border-2 border-primary/40 bg-primary/5 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium" placeholder="Ex: Pedro Henrique" />
                    </div>
                  )}

                  <button type="submit" disabled={isSubmitting} className="w-full h-14 mt-6 text-white font-extrabold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-primary/25" style={{ backgroundColor: primaryColor }}>
                    {isSubmitting ? 'Enviando...' : 'Concluir Cadastro'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-black text-2xl tracking-tighter mb-4" style={{ color: primaryColor }}>
                <Sparkles className="w-6 h-6" />
                {churchName}
              </div>
              <p className="text-muted-foreground max-w-sm">
                Uma igreja apaixonada por Jesus e focada em amar as pessoas. Seja muito bem-vindo à nossa família.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 text-foreground">Acesso Rápido</h4>
              <ul className="space-y-3 text-muted-foreground font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Início</a></li>
                <li><a href="#dna" className="hover:text-primary transition-colors">Nosso DNA</a></li>
                <li><a href="#celulas" className="hover:text-primary transition-colors">Células (HH)</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 text-foreground">Legal</h4>
              <ul className="space-y-3 text-muted-foreground font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {churchName}. Todos os direitos reservados.
            </p>
            
            {/* DISCREET LOGIN LINK FOR ADMINS */}
            <a href="/acesso" className="flex items-center gap-2 text-xs font-bold text-muted-foreground/30 hover:text-primary transition-colors" title="Acesso Restrito">
              <Lock className="w-3 h-3" />
              <span>Acesso Liderança</span>
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
