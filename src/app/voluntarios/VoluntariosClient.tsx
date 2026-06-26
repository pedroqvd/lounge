'use client'

import { useState, useRef } from 'react'
import { AudioWaveform, UserCheck, BookOpen, Aperture, Flame, Users, Calendar, MapPin, Clock, ChevronLeft, Mic2, Compass, Download, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

const MINISTRY_ICONS: Record<string, any> = {
  music: AudioWaveform, 'door-open': UserCheck, baby: BookOpen, camera: Aperture, heart: Flame, users: Users, mic: Mic2, sparkles: Compass
}

export default function VoluntariosClient({ ministries, events }: { ministries: any[], events: any[] }) {
  const { theme, setTheme } = useTheme()
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
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
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
                  <div className="relative z-10 overflow-x-auto rounded-xl border-2 border-[#1e3a8a] bg-white">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr>
                          <th colSpan={ministryEvents.length + 1} className="bg-[#1e3a8a] text-white py-3 text-2xl font-bold uppercase tracking-widest border-b-2 border-white">
                            Escala {selectedMinistry?.name} - {new Date(ministryEvents[0].date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                          </th>
                        </tr>
                        <tr className="bg-[#1e3a8a] text-white">
                          <th className="py-3 px-4 font-bold border-r-2 border-white w-1/5 text-lg">Data</th>
                          {ministryEvents.map((event) => {
                            const d = new Date(event.date)
                            return (
                              <th key={event.id} className="py-3 px-4 font-bold border-r-2 border-white last:border-r-0 text-lg">
                                {String(d.getDate()).padStart(2, '0')}/{d.toLocaleDateString('pt-BR', { month: 'short' })}
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody className="text-black bg-white">
                        {(() => {
                          // Extract all unique positions from the members of this ministry
                          const allPositions = new Set<string>()
                          selectedMinistry?.members?.forEach((mm: any) => {
                            if (mm.position) {
                              mm.position.split(',').forEach((p: string) => allPositions.add(p.trim()))
                            }
                          })
                          
                          let positionsArray = Array.from(allPositions).filter(Boolean)
                          if (positionsArray.length === 0) positionsArray = ['Equipe'] // Fallback if no positions

                          // Order positions based on standard Louvor order if applicable
                          const standardOrder = ['Vocal', 'Teclado', 'Violão', 'Guitarra', 'Baixo', 'Bateria']
                          positionsArray.sort((a, b) => {
                            const idxA = standardOrder.indexOf(a)
                            const idxB = standardOrder.indexOf(b)
                            if (idxA !== -1 && idxB !== -1) return idxA - idxB
                            if (idxA !== -1) return -1
                            if (idxB !== -1) return 1
                            return a.localeCompare(b)
                          })

                          return positionsArray.map((position, idx) => {
                            return (
                              <tr key={position} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="py-4 px-4 border-2 border-[#1e3a8a] bg-[#1e3a8a] text-white font-bold text-lg align-middle">
                                  {position}
                                </td>
                                {ministryEvents.map((event) => {
                                  // Find members scheduled for this event
                                  const slots = event.scheduleSlots.filter((s: any) => s.ministryId === selectedMinistryId)
                                  
                                  // Filter members who have this position
                                  const scheduledMembersForPosition = slots.filter((slot: any) => {
                                    const minMember = selectedMinistry?.members?.find((mm: any) => mm.memberId === slot.member.id)
                                    if (positionsArray.length === 1 && positionsArray[0] === 'Equipe') return true // Show all if no positions defined
                                    if (!minMember || !minMember.position) return false
                                    const memberPositions = minMember.position.split(',').map((p: string) => p.trim())
                                    return memberPositions.includes(position)
                                  })

                                  return (
                                    <td key={event.id} className="py-2 px-2 border-2 border-[#1e3a8a] align-top">
                                      {scheduledMembersForPosition.length > 0 ? (
                                        <div className="flex flex-col gap-1">
                                          {scheduledMembersForPosition.map((slot: any) => (
                                            <div key={slot.id} className="font-semibold text-base py-1 border-b border-gray-200 last:border-0">
                                              {slot.member.name.split(' ')[0]} {slot.member.name.split(' ').length > 1 ? slot.member.name.split(' ').pop()?.charAt(0) + '.' : ''}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 font-bold">-</span>
                                      )}
                                    </td>
                                  )
                                })}
                              </tr>
                            )
                          })
                        })()}
                      </tbody>
                    </table>
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
