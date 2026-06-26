"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { CheckCircle2, MessageCircle, Instagram, MapPin, Heart, Target, Users, Sparkles, Lock, Menu, X, Clock, Calendar, ChevronRight, Youtube, ArrowRight, Star, Sun, Moon, QrCode } from 'lucide-react'

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function AnimatedSection({ children, className = '', delay = 0, id }: any) {
  const { ref, inView } = useInView()
  return (
    <section id={id} ref={ref as any} className={className} style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(40px)', transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>
      {children}
    </section>
  )
}

const TYPE_LABELS: Record<string, string> = { CULTO: 'Culto', CELULA: 'Célula', REUNIAO: 'Reunião', OUTRO: 'Evento' }
const TYPE_COLORS: Record<string, string> = { CULTO: '#8b5cf6', CELULA: '#10b981', REUNIAO: '#f59e0b', OUTRO: '#3b82f6' }

export default function WelcomeClient({ settings, globalSettings, upcomingEvents, hhs = [] }: { settings: any, globalSettings: any, upcomingEvents?: any[], hhs?: any[] }) {
  const primaryColor = globalSettings?.primaryColor || '#6366f1'
  const churchName = globalSettings?.defaultChurchName || 'Lounge'

  const [formData, setFormData] = useState({ name: '', phone: '', birthDate: '', sourceType: '', sourceFriend: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mapTab, setMapTab] = useState<'SEDE' | 'HH'>('SEDE')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  useEffect(() => {
    setMounted(true)
    if (videoRef.current) {
      videoRef.current.play().catch(console.error)
    }
  }, [])
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://lounge.com'


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 11)
    let formatted = val
    if (val.length > 2 && val.length <= 7) formatted = `(${val.slice(0,2)}) ${val.slice(2)}`
    else if (val.length > 7) formatted = `(${val.slice(0,2)}) ${val.slice(2,7)}-${val.slice(7)}`
    setFormData(prev => ({ ...prev, phone: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (cleanPhone.length !== 11) { setErrorMsg('Preencha o telefone com DDD e 9 dígitos.'); return }
    if (!formData.sourceType) { setErrorMsg('Informe como nos conheceu.'); return }
    if (formData.sourceType === 'Amigo' && !formData.sourceFriend.trim()) { setErrorMsg('Informe o nome do amigo que te convidou.'); return }
    const finalSource = formData.sourceType === 'Amigo' ? `Amigo: ${formData.sourceFriend}` : formData.sourceType
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/hub/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, phone: formData.phone, birthDate: formData.birthDate, source: finalSource })
      })
      const data = await res.json()
      if (res.ok) setIsSuccess(true)
      else setErrorMsg(data.error || 'Erro ao enviar cadastro.')
    } catch { setErrorMsg('Erro de conexão.') }
    setIsSubmitting(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 relative" style={{ background: `linear-gradient(135deg, ${primaryColor}08, ${primaryColor}15)` }}>
        <button 
          onClick={() => setIsSuccess(false)}
          className="absolute top-6 right-6 p-3 rounded-full bg-background/50 backdrop-blur-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-background shadow-sm transition-all hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="w-28 h-28 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
          <CheckCircle2 className="w-14 h-14" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-4">Que alegria!</h1>
        <p className="text-xl text-muted-foreground max-w-md leading-relaxed">Seu cadastro foi concluído. Sinta-se em casa, você faz parte da nossa família agora. 🎉</p>
        <div className="mt-10 flex gap-4 flex-wrap justify-center">
          {settings?.whatsappGroupUrl && (
            <a href={settings.whatsappGroupUrl} target="_blank" className="flex items-center gap-2 px-6 py-3.5 bg-[#25D366] text-white font-bold rounded-xl shadow-xl shadow-[#25D366]/20 hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" /> Entrar no Grupo
            </a>
          )}
          {settings?.instagramUrl && (
            <a href={settings.instagramUrl} target="_blank" className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold rounded-xl shadow-xl shadow-[#dc2743]/20 hover:scale-105 transition-transform">
              <Instagram className="w-5 h-5" /> Seguir no Instagram
            </a>
          )}
        </div>
      </div>
    )
  }

  const navItems = [
    { label: 'Início', href: '#inicio' },
    { label: 'Nossa Essência', href: '#dna' },
    { label: 'Células', href: '#celulas' },
    { label: 'Próximos Eventos', href: '#eventos' },
    { label: 'Conectar', href: '#cadastro' },
  ]
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/custom-logo-login-trimmed.PNG" alt="Lounge" width={160} height={56} className="h-10 w-auto object-contain dark:brightness-200" priority />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
            {navItems.map(item => (
              <a key={item.href} href={item.href} className="hover:text-foreground transition-colors hover:scale-105 transform">{item.label}</a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {mounted && (
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full bg-secondary/50">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            {settings?.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" className="p-2 text-muted-foreground hover:text-pink-500 transition-colors"><Instagram className="w-5 h-5" /></a>
            )}
            <a href="#cadastro" className="px-5 py-2.5 text-sm font-bold text-white rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30" style={{ backgroundColor: primaryColor }}>
              Quero Me Conectar
            </a>
          </div>
          <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
            {navItems.map(item => (
              <a key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="font-semibold text-foreground hover:text-primary transition-colors text-lg">{item.label}</a>
            ))}
            {mounted && (
              <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 font-semibold text-foreground py-2 border border-border rounded-xl">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} Alternar Tema
              </button>
            )}
            <a href="#cadastro" onClick={() => setIsMobileMenuOpen(false)} className="mt-2 text-center py-3 text-white font-bold rounded-2xl shadow-lg" style={{ backgroundColor: primaryColor }}>
              Quero Me Conectar
            </a>
          </div>
        )}
      </header>

      <main className="flex-1">

        {/* HERO & DNA CONTAINER */}
        <div className="relative">
          {/* Video Background - fixed to viewport, behind everything */}
          <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              preload="auto"
              className="w-full h-full object-cover opacity-40 dark:opacity-50"
            >
              <source src="/bg-hero.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Background color accents (shared) */}
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 70% at 50% -20%, ${primaryColor}15, transparent)` }} />
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-30" style={{ backgroundColor: primaryColor }} />
          <div className="absolute top-[80vh] left-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }} />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none opacity-15" style={{ backgroundColor: primaryColor }} />

          {/* HERO */}
          <section id="inicio" className="relative min-h-[92vh] flex items-center z-10">

            <div className="container mx-auto px-4 md:px-6 py-16 md:py-32 relative z-10 text-center">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 md:mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                {settings?.title || `Bem-vindo ao ${churchName}`}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {settings?.heroSubtitle || 'Estamos felizes em ter você aqui. Uma comunidade que ama, acolhe e transforma vidas.'}
            </p>

            {/* Horários de culto */}
            {(settings?.cultoSchedule || settings?.celulaSchedule) && (
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mb-10 w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                {settings?.cultoSchedule && (
                  <div className="flex items-center gap-2.5 px-5 py-3 bg-card/80 w-full sm:w-auto justify-center backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor + '20', color: primaryColor }}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground font-semibold">CULTO</p>
                      <p className="font-bold text-sm">{settings.cultoSchedule}</p>
                    </div>
                  </div>
                )}
                {settings?.celulaSchedule && (
                  <div className="flex items-center gap-2.5 px-5 py-3 bg-card/80 w-full sm:w-auto justify-center backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor + '20', color: primaryColor }}>
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground font-semibold">CÉLULAS / HH</p>
                      <p className="font-bold text-sm">{settings.celulaSchedule}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 px-4 sm:px-0">
              <a href="#cadastro" className="flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 text-white font-bold rounded-2xl shadow-2xl transition-all hover:scale-105 hover:shadow-primary/40 text-base md:text-lg w-full sm:w-auto" style={{ backgroundColor: primaryColor }}>
                Quero Me Conectar <ArrowRight className="w-5 h-5" />
              </a>
              {settings?.whatsappGroupUrl && (
                <a href={settings.whatsappGroupUrl} target="_blank" className="flex items-center justify-center gap-2 px-6 py-3.5 md:py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-xl shadow-[#25D366]/20 text-base w-full sm:w-auto">
                  <MessageCircle className="w-5 h-5" /> Grupo de Avisos
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" className="flex items-center justify-center gap-2 px-6 py-3.5 md:py-4 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-xl shadow-[#dc2743]/20 text-base w-full sm:w-auto">
                  <Instagram className="w-5 h-5" /> Instagram
                </a>
              )}
            </div>
            <div className="mt-16 flex justify-center animate-bounce">
              <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
                <div className="w-1.5 h-3 rounded-full bg-muted-foreground/40" />
              </div>
            </div>
          </div>
        </section>

        {/* DNA SECTION */}
        {(settings?.mission || settings?.vision || settings?.values) && (
          <AnimatedSection id="dna" className="container mx-auto px-4 md:px-6 py-16 md:py-32 relative z-10">
            <div className="text-center mb-12 md:mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border" style={{ color: primaryColor, borderColor: primaryColor + '40', backgroundColor: primaryColor + '10' }}>Nossa Essência</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">O que nos move</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">Conheça os pilares que sustentam a nossa visão do Reino.</p>
              
              <a href="/sobre" className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-2xl shadow-sm border border-border/50 hover:bg-card transition-all hover:scale-105 group" style={{ color: primaryColor }}>
                Conheça nossa História Completa
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { key: 'mission', title: 'Missão', icon: Target, value: settings?.mission },
                { key: 'vision', title: 'Visão', icon: Heart, value: settings?.vision },
                { key: 'values', title: 'Valores', icon: Star, value: settings?.values },
              ].filter(item => item.value).map((item, idx) => (
                <div key={item.key} className="group p-8 bg-card border border-border/50 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                  style={{ transitionDelay: `${idx * 0.1}s` }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 0% 0%, ${primaryColor}08, transparent 60%)` }} />
                  <div className="absolute -top-12 -right-12 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity">
                    <item.icon className="w-full h-full" />
                  </div>
                  <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-lg relative z-10" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-extrabold mb-4 relative z-10">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10 whitespace-pre-wrap">{item.value}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}
        </div>
        
        {/* Solid background cover - hides the fixed video for sections below */}
        <div className="relative z-10 bg-background">
        
        {/* Smooth transition from video to solid background */}
        <div className="h-32 bg-gradient-to-b from-transparent to-background -mt-32 relative z-10" />
        {/* UPCOMING EVENTS */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <AnimatedSection id="eventos" className="bg-secondary/20 border-y border-border/30">
            <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
              <div className="text-center mb-10 md:mb-16">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border" style={{ color: primaryColor, borderColor: primaryColor + '40', backgroundColor: primaryColor + '10' }}>Agenda</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">Próximos Eventos</h2>
                <p className="text-muted-foreground text-lg">Venha participar! Todos são bem-vindos.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {upcomingEvents.slice(0, 6).map((event: any, idx: number) => {
                  const color = TYPE_COLORS[event.type] || TYPE_COLORS.OUTRO
                  const label = TYPE_LABELS[event.type] || 'Evento'
                  const d = new Date(event.date)
                  return (
                    <div key={event.id} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="h-1.5" style={{ backgroundColor: color }} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: color + '15' }}>
                            <span className="text-2xl font-black" style={{ color }}>{d.getDate()}</span>
                            <span className="text-xs font-bold uppercase" style={{ color }}>{d.toLocaleString('pt-BR', { month: 'short' })}</span>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: color + '15', color }}>{label}</span>
                        </div>
                        <h3 className="font-extrabold text-lg mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                        <div className="space-y-1.5">
                          {event.time && <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /> {event.time}</p>}
                          {event.location && <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> {event.location}</p>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* CÉLULAS / HHs + FORM */}
        <AnimatedSection id="celulas" className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-start">
            <div className="space-y-6 md:space-y-8">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border" style={{ color: primaryColor, borderColor: primaryColor + '40', backgroundColor: primaryColor + '10' }}>Comunidade</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">Onde nos encontramos</h2>
                <p className="text-muted-foreground text-lg">Nossa comunidade acontece nas casas e nas celebrações.</p>
              </div>
              {settings?.hhsInfo && (
                <div className="p-6 bg-card border border-border/50 rounded-3xl shadow-sm">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{settings.hhsInfo}</p>
                </div>
              )}
              {settings?.address && (
                <div className="flex items-start gap-4 p-5 bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: primaryColor + '15', color: primaryColor }}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Nossa Sede</h4>
                    <p className="text-muted-foreground leading-relaxed">{settings.address}</p>
                  </div>
                </div>
              )}
              {settings?.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" className="flex items-center gap-4 p-5 bg-red-500/5 border border-red-500/20 rounded-2xl hover:bg-red-500/10 transition-all group">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-xl shrink-0">
                    <Youtube className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-0.5">Assista Online</h4>
                    <p className="text-muted-foreground text-sm">Acompanhe os cultos pelo nosso canal no YouTube</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                </a>
              )}
            </div>

            {/* FORM */}
            <div id="cadastro" className="p-6 sm:p-8 md:p-10 bg-card border border-border rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-50" style={{ backgroundColor: primaryColor }} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: primaryColor + '20', color: primaryColor }}>
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-extrabold mb-2">Queremos te conhecer!</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">Preencha seus dados para estarmos conectados e não perder nada do que acontece por aqui.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMsg && <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl font-semibold text-sm">{errorMsg}</div>}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80">Nome e Sobrenome *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="flex h-14 w-full rounded-2xl border-2 border-input bg-background/50 px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                      placeholder="Ex: João da Silva" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/80">WhatsApp *</label>
                      <input required type="text" value={formData.phone} onChange={handlePhoneChange}
                        className="flex h-14 w-full rounded-2xl border-2 border-input bg-background/50 px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                        placeholder="(XX) XXXXX-XXXX" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/80">Nascimento *</label>
                      <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})}
                        className="flex h-14 w-full rounded-2xl border-2 border-input bg-background/50 px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80">Como nos conheceu? *</label>
                    <select required value={formData.sourceType} onChange={e => setFormData({...formData, sourceType: e.target.value, sourceFriend: ''})}
                      className="flex h-14 w-full rounded-2xl border-2 border-input bg-background/50 px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-foreground appearance-none">
                      <option value="" disabled>Selecione uma opção</option>
                      <option value="Instagram">Instagram</option>
                      <option value="WhatsApp">Grupo de WhatsApp</option>
                      <option value="Amigo">Um amigo me convidou</option>
                      <option value="Andando na rua">Passei na porta / Moro perto</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  {formData.sourceType === 'Amigo' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-sm font-bold" style={{ color: primaryColor }}>Qual o nome do amigo? *</label>
                      <input required type="text" value={formData.sourceFriend} onChange={e => setFormData({...formData, sourceFriend: e.target.value})}
                        className="flex h-14 w-full rounded-2xl border-2 bg-background/50 px-4 focus:ring-2 outline-none transition-all font-medium"
                        style={{ borderColor: primaryColor + '40' }}
                        placeholder="Ex: Pedro Henrique" />
                    </div>
                  )}

                  <button type="submit" disabled={isSubmitting}
                    className="w-full h-14 mt-2 text-white font-extrabold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor, boxShadow: `0 8px 30px ${primaryColor}40` }}>
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : 'Concluir Cadastro ✨'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* NOSSAS UNIDADES & MAPA */}
        <AnimatedSection className="py-16 md:py-24 bg-background relative overflow-hidden">
          {/* Floating dots decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute rounded-full opacity-20 animate-pulse" style={{ width: [8, 12, 6, 10, 8, 14][i], height: [8, 12, 6, 10, 8, 14][i], backgroundColor: primaryColor, top: [`15%`, `40%`, `70%`, `25%`, `60%`, `80%`][i], left: [`10%`, `85%`, `5%`, `75%`, `90%`, `15%`][i], animationDelay: `${i * 0.5}s`, animationDuration: `${3 + i}s` }} />
            ))}
          </div>
          
          <div className="container mx-auto px-4 md:px-6 max-w-5xl relative z-10">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                Nossas <span style={{ color: primaryColor }}>Unidades</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Encontre a unidade mais próxima de você.
              </p>
            </div>

            {/* Abas */}
            <div className="flex justify-center mb-8 w-full">
              <div className="bg-secondary/50 p-1.5 rounded-2xl flex flex-col sm:flex-row w-full sm:w-auto shadow-inner">
                <button 
                  onClick={() => setMapTab('SEDE')}
                  className={`px-6 py-3 sm:py-2.5 rounded-xl font-bold text-sm transition-all w-full sm:w-auto ${mapTab === 'SEDE' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                >
                  Sede
                </button>
                <button 
                  onClick={() => setMapTab('HH')}
                  className={`px-6 py-3 sm:py-2.5 rounded-xl font-bold text-sm transition-all w-full sm:w-auto ${mapTab === 'HH' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                >
                  Happy Hours (Células)
                </button>
              </div>
            </div>

            {/* Conteúdo Aba SEDE */}
            {mapTab === 'SEDE' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-center mb-10 px-4">
                  <div className="bg-card/60 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-6 sm:p-8 max-w-2xl w-full flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(135deg, ${primaryColor}10, transparent)` }} />
                    
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-inner relative z-10 transform group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: primaryColor + '15', color: primaryColor }}>
                      <MapPin className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                    
                    <div className="text-center sm:text-left relative z-10 flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 border" style={{ backgroundColor: primaryColor + '10', color: primaryColor, borderColor: primaryColor + '30' }}>
                        Sede Principal
                      </div>
                      <h3 className="font-black text-2xl sm:text-3xl mb-2 text-foreground">Igreja Millenium</h3>
                      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-medium">
                        {settings?.address || 'SGAS I SGAS 906 - Asa Sul, Brasília - DF, 70390-060'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-background ring-1 ring-border/50 relative">
                  <iframe 
                    src={settings?.mapsEmbedUrl || "https://maps.google.com/maps?q=-15.8035088,-47.8956179&t=&z=17&ie=UTF8&iwloc=&output=embed"} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}

            {/* Conteúdo Aba HH */}
            {mapTab === 'HH' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {(!hhs || hhs.length === 0) ? (
                  <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border/60">
                    <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Nenhum HH com mapa cadastrado</h3>
                    <p className="text-muted-foreground">Em breve teremos os locais mapeados aqui.</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hhs.map((hh, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
                          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: primaryColor }} />
                          <h3 className="font-bold text-xl mb-1">{hh.name}</h3>
                          {hh.neighborhood && (
                            <p className="text-sm font-bold mb-3" style={{ color: primaryColor }}>{hh.neighborhood}</p>
                          )}
                          {hh.address && (
                            <p className="text-sm text-muted-foreground mb-4 flex-1">{hh.address}</p>
                          )}
                          
                          <div className="mt-auto space-y-3 pt-4 border-t border-border/50">
                            {hh.mapUrl && (
                              <a 
                                href={hh.mapUrl} 
                                target="_blank" 
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                              >
                                <MapPin className="w-4 h-4" />
                                Abrir no Mapa
                              </a>
                            )}
                            {hh.contactPhone && (
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-2">Quer saber mais sobre o HH?</p>
                                <a 
                                  href={`https://wa.me/55${hh.contactPhone.replace(/\D/g, '')}?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20o%20HH%20${encodeURIComponent(hh.name)}`}
                                  target="_blank"
                                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  {hh.contactPhone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* GALLERY */}
        {settings?.galleryUrls && settings.galleryUrls.length > 0 && (
          <AnimatedSection className="bg-secondary/10 border-y border-border/30">
            <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
              <div className="text-center mb-10 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Momentos da nossa família</h2>
                <p className="text-muted-foreground">Registros dos encontros e celebrações</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {settings.galleryUrls.map((url: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300">
                    <img src={url} alt={"Foto " + (idx + 1)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-4 gap-10 mb-10 md:mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/custom-logo-login-trimmed.PNG" alt="Lounge" width={160} height={56} className="h-10 w-auto object-contain dark:brightness-200" priority />
              </div>
              <p className="text-muted-foreground max-w-sm leading-relaxed mb-6">Um ministério apaixonado por Jesus e focado em amar as pessoas. Seja muito bem-vindo à nossa família.</p>
              <div className="flex items-center gap-3">
                {settings?.whatsappGroupUrl && (
                  <a href={settings.whatsappGroupUrl} target="_blank" className="w-10 h-10 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all hover:scale-110">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
                {settings?.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f09433] hover:to-[#bc1888] hover:text-white transition-all hover:scale-110">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {settings?.youtubeUrl && (
                  <a href={settings.youtubeUrl} target="_blank" className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all hover:scale-110">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Acesso Rápido</h4>
              <div className="mb-6">
                <div className="p-3 bg-white rounded-xl inline-block shadow-sm">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(currentUrl)}`} alt="QR Code" className="w-20 h-20" />
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><QrCode className="w-3 h-3"/> Escaneie para compartilhar</p>
              </div>
              <ul className="space-y-2.5 text-muted-foreground font-medium">
                {navItems.map(item => (
                  <li key={item.href}><a href={item.href} className="hover:text-primary transition-colors flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5" /> {item.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Horários</h4>
              <div className="space-y-3 text-muted-foreground">
                {settings?.cultoSchedule && (
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                    <div>
                      <p className="font-bold text-foreground text-sm">Culto</p>
                      <p className="text-sm">{settings.cultoSchedule}</p>
                    </div>
                  </div>
                )}
                {settings?.celulaSchedule && (
                  <div className="flex items-start gap-2">
                    <Heart className="w-4 h-4 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                    <div>
                      <p className="font-bold text-foreground text-sm">Células / HH</p>
                      <p className="text-sm">{settings.celulaSchedule}</p>
                    </div>
                  </div>
                )}
                {settings?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                    <p className="text-sm">{settings.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Maps embed */}
          {settings?.mapsEmbedUrl && (
            <div className="rounded-2xl overflow-hidden border border-border mb-10 shadow-sm h-64">
              <iframe src={settings.mapsEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {churchName}. Todos os direitos reservados.</p>
            <a href="/acesso" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/30 hover:text-primary transition-colors" title="Acesso Restrito">
              <Lock className="w-3 h-3" /> Acesso Liderança
            </a>
          </div>
        </div>
        </div> {/* End bg-background cover */}
      </footer>
    </div>
  )
}
