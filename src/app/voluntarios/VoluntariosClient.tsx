'use client'

import { useState, useRef, useEffect } from 'react'
import { AudioWaveform, UserCheck, BookOpen, Aperture, Flame, Users, Calendar, MapPin, Clock, ChevronLeft, Mic2, Compass, Download, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import PrintableSchedule from '@/components/PrintableSchedule'

const MINISTRY_ICONS: Record<string, any> = {
  music: AudioWaveform, 'door-open': UserCheck, baby: BookOpen, camera: Aperture, heart: Flame, users: Users, mic: Mic2, sparkles: Compass
}

export default function VoluntariosClient({ ministries, events }: { ministries: any[], events: any[] }) {
  const { theme, setTheme } = useTheme()
  const selectedMinistry = ministries.find(m => m.id === selectedMinistryId)

  // Filtra eventos que tem Pelo Menos 1 escalado deste ministério
  const allMinistryEvents = selectedMinistryId 
    ? events.filter(e => e.scheduleSlots.some((slot: any) => slot.ministryId === selectedMinistryId))
    : []

  // Compute available months
  const months = Array.from(new Set(allMinistryEvents.map(e => {
    const d = new Date(e.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }))).sort()

  const [selectedMonth, setSelectedMonth] = useState<string>('')

  useEffect(() => {
    if (!selectedMonth && months.length > 0) {
      setSelectedMonth(months[0])
    }
  }, [months, selectedMonth])

  const ministryEvents = allMinistryEvents.filter(e => {
    const d = new Date(e.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth
  })

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
                      className="relative overflow-hidden flex flex-col items-center justify-center gap-3 sm:gap-4 p-6 sm:p-8 bg-card/80 backdrop-blur-md border border-border/50 rounded-3xl sm:rounded-[2rem] hover:shadow-2xl hover:shadow-primary/5 transition-all group active:scale-95"
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-10 bg-card/50 backdrop-blur-md p-5 sm:p-6 rounded-3xl sm:rounded-[2rem] border border-border/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedMinistryId(null)}
                      className="w-12 h-12 rounded-full flex items-center justify-center bg-background hover:bg-muted border border-border transition-colors shadow-sm shrink-0 active:scale-90"
                    >
                      <ChevronLeft className="w-6 h-6 text-muted-foreground" />
                    </button>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tighter" style={{ color: selectedMinistry?.color }}>{selectedMinistry?.name}</h2>
                      <p className="text-muted-foreground text-sm sm:text-base font-medium flex items-center gap-2 mt-0.5">
                        <Calendar className="w-4 h-4" /> Escalas de Serviço
                      </p>
                    </div>
                  </div>
                </div>
                {months.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x w-full md:w-auto">
                    {months.map(m => {
                      const [year, month] = m.split('-')
                      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
                      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
                      return (
                        <button
                          key={m}
                          onClick={() => setSelectedMonth(m)}
                          className={`px-5 py-3 sm:px-4 sm:py-2 rounded-2xl sm:rounded-xl text-base sm:text-sm font-bold whitespace-nowrap transition-colors snap-start ${selectedMonth === m ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted hover:bg-muted/80'}`}
                          style={selectedMonth === m ? { backgroundColor: selectedMinistry?.color } : {}}
                        >
                          {capitalizedLabel}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <PrintableSchedule 
                selectedMinistry={selectedMinistry} 
                ministryEvents={ministryEvents} 
              />

              {/* Área que será printada */}

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
