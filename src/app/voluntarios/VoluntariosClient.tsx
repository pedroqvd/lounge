'use client'

import { useState, useRef } from 'react'
import { AudioWaveform, UserCheck, BookOpen, Aperture, Flame, Users, Calendar, MapPin, Clock, ChevronLeft, Mic2, Compass, Download } from 'lucide-react'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import { motion, AnimatePresence } from 'framer-motion'

const MINISTRY_ICONS: Record<string, any> = {
  music: AudioWaveform, 'door-open': UserCheck, baby: BookOpen, camera: Aperture, heart: Flame, users: Users, mic: Mic2, sparkles: Compass
}

export default function VoluntariosClient({ ministries, events }: { ministries: any[], events: any[] }) {
  const [selectedMinistryId, setSelectedMinistryId] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  const selectedMinistry = ministries.find(m => m.id === selectedMinistryId)

  // Filtra eventos que tem Pelo Menos 1 escalado deste ministério
  const ministryEvents = selectedMinistryId 
    ? events.filter(e => e.scheduleSlots.some((slot: any) => slot.ministryId === selectedMinistryId))
    : []

  const handleDownloadImage = async () => {
    if (!captureRef.current || !selectedMinistry) return
    try {
      setIsDownloading(true)
      const canvas = await html2canvas(captureRef.current, {
        scale: 3, // Alta resolução
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      })
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `escala-${selectedMinistry.name.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = url
      link.click()
    } catch (error) {
      console.error('Erro ao gerar imagem:', error)
      alert('Não foi possível gerar a imagem.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Animações
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decoração de fundo com gradiente */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none -z-10" />

      <header className="bg-card/50 backdrop-blur-xl border-b border-border/50 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Central de Voluntários</h1>
              <p className="text-xs text-muted-foreground font-medium hidden sm:block">Acompanhe suas escalas de serviço</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <AnimatePresence mode="wait">
          {!selectedMinistryId ? (
            <motion.div 
              key="ministries-grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center py-8">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring' }} className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <Users className="w-10 h-10 text-primary" />
                </motion.div>
                <h2 className="text-4xl font-black tracking-tighter mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Qual é o seu Ministério?</h2>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">Selecione uma área abaixo para visualizar o calendário com as escalas de serviço.</p>
              </div>
              
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
              >
                {ministries.map(ministry => {
                  const IconComp = MINISTRY_ICONS[ministry.icon] || Users
                  return (
                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      key={ministry.id}
                      onClick={() => setSelectedMinistryId(ministry.id)}
                      className="relative overflow-hidden flex flex-col items-center justify-center gap-4 p-8 bg-card/80 backdrop-blur-md border border-border/50 rounded-[2rem] hover:shadow-2xl hover:shadow-primary/5 transition-all group"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundColor: ministry.color }} />
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner"
                        style={{ backgroundColor: ministry.color + '15', color: ministry.color }}
                      >
                        <IconComp className="w-8 h-8" />
                      </div>
                      <span className="font-extrabold text-sm sm:text-base text-center group-hover:text-foreground transition-colors">{ministry.name}</span>
                    </motion.button>
                  )
                })}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="schedule-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 bg-card/50 backdrop-blur-md p-6 rounded-[2rem] border border-border/50">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedMinistryId(null)}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-background hover:bg-muted border border-border transition-colors shadow-sm shrink-0"
                  >
                    <ChevronLeft className="w-6 h-6 text-muted-foreground" />
                  </button>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter" style={{ color: selectedMinistry?.color }}>{selectedMinistry?.name}</h2>
                    <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" /> Escalas de Serviço
                    </p>
                  </div>
                </div>
                {ministryEvents.length > 0 && (
                  <button
                    onClick={handleDownloadImage}
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-bold transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
                    style={{ backgroundColor: selectedMinistry?.color || '#000', boxShadow: `0 10px 25px -5px ${selectedMinistry?.color}40` }}
                  >
                    <Download className="w-5 h-5" />
                    {isDownloading ? 'Gerando Imagem...' : 'Salvar Escala'}
                  </button>
                )}
              </div>

              {/* Área que será printada */}
              <div ref={captureRef} className="bg-background/80 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] border border-border/30 shadow-2xl relative overflow-hidden">
                
                {/* Marca d'água no fundo da escala */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
                  <Users className="w-[120%] h-[120%]" />
                </div>

                {/* Cabeçalho exclusivo para o Print */}
                <div className="hidden print:flex print:flex-col items-center justify-center mb-10 relative z-10">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ backgroundColor: selectedMinistry?.color + '20', color: selectedMinistry?.color }}>
                    {(() => {
                      const IconComp = MINISTRY_ICONS[selectedMinistry?.icon] || Users
                      return <IconComp className="w-8 h-8" />
                    })()}
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter" style={{ color: selectedMinistry?.color }}>Escala: {selectedMinistry?.name}</h2>
                  <p className="text-muted-foreground font-semibold mt-2 text-lg">Gerado pela plataforma Lounge</p>
                  <div className="w-24 h-1 rounded-full mt-6" style={{ backgroundColor: selectedMinistry?.color }} />
                </div>

                {ministryEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
                    <div className="w-24 h-24 bg-muted/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-6 border border-border">
                      <Calendar className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-2">Nenhuma escala programada</h3>
                    <p className="text-muted-foreground text-lg max-w-md">Não há eventos futuros com voluntários escalados para este ministério no momento.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6 relative z-10">
                    {ministryEvents.map((event, idx) => {
                      const slots = event.scheduleSlots.filter((s: any) => s.ministryId === selectedMinistryId)
                      const eventDate = new Date(event.date)
                      
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1, duration: 0.4 }}
                          key={event.id} 
                          className="bg-card rounded-[2rem] overflow-hidden border border-border/50 shadow-sm print:shadow-none print:border-border"
                        >
                          <div className="p-6 border-b border-border/50 bg-muted/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-foreground/5 to-transparent rounded-bl-full pointer-events-none" />
                            
                            <div className="flex items-center gap-3 mb-4">
                              <div className="bg-background shadow-sm border border-border/50 px-3 py-2 rounded-xl flex flex-col items-center justify-center min-w-[3.5rem]">
                                <span className="text-xs font-bold text-muted-foreground uppercase">{eventDate.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                <span className="text-xl font-black leading-none" style={{ color: selectedMinistry?.color }}>{eventDate.getDate()}</span>
                              </div>
                              <div>
                                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg" style={{ backgroundColor: selectedMinistry?.color + '15', color: selectedMinistry?.color }}>
                                  {event.type}
                                </span>
                                <p className="text-sm font-semibold text-muted-foreground mt-1 capitalize">
                                  {eventDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                                </p>
                              </div>
                            </div>
                            
                            <h3 className="font-black text-xl mb-3">{event.title}</h3>
                            
                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
                              {event.time && (
                                <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-lg border border-border/50"><Clock className="w-3.5 h-3.5"/> {event.time}</span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-lg border border-border/50"><MapPin className="w-3.5 h-3.5"/> {event.location}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Voluntários Escalados</p>
                              <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{slots.length}</span>
                            </div>
                            
                            <div className="flex flex-col gap-2.5">
                              {slots.map((slot: any) => (
                                <div key={slot.id} className="flex items-center gap-3 bg-muted/20 hover:bg-muted/40 transition-colors rounded-2xl p-2.5 border border-transparent hover:border-border/50 group">
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-sm group-hover:scale-105 transition-transform" style={{ backgroundColor: selectedMinistry?.color }}>
                                    {slot.member.name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="font-bold text-sm block truncate">{slot.member.name}</span>
                                    {/* Caso no futuro a gente queira exibir o instrumento/função aqui, tem espaço */}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
