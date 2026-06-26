'use client'

import { useState } from 'react'
import { Music, DoorOpen, Baby, Camera, Heart, Users, Calendar, MapPin, Clock, ChevronLeft, Mic2, Sparkles } from 'lucide-react'
import Link from 'next/link'

const MINISTRY_ICONS: Record<string, any> = {
  music: Music, 'door-open': DoorOpen, baby: Baby, camera: Camera, heart: Heart, users: Users, mic: Mic2, sparkles: Sparkles
}

export default function VoluntariosClient({ ministries, events }: { ministries: any[], events: any[] }) {
  const [selectedMinistryId, setSelectedMinistryId] = useState<string | null>(null)

  const selectedMinistry = ministries.find(m => m.id === selectedMinistryId)

  // Filtra eventos que tem Pelo Menos 1 escalado deste ministério
  const ministryEvents = selectedMinistryId 
    ? events.filter(e => e.scheduleSlots.some((slot: any) => slot.ministryId === selectedMinistryId))
    : []

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Central de Voluntários</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!selectedMinistryId ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center py-8">
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Qual é o seu Ministério?</h2>
              <p className="text-muted-foreground">Selecione abaixo para visualizar a escala de serviço deste mês.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ministries.map(ministry => {
                const IconComp = MINISTRY_ICONS[ministry.icon] || Users
                return (
                  <button
                    key={ministry.id}
                    onClick={() => setSelectedMinistryId(ministry.id)}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all group"
                  >
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: ministry.color + '20', color: ministry.color }}
                    >
                      <IconComp className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-sm text-center">{ministry.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedMinistryId(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: selectedMinistry?.color }}>{selectedMinistry?.name}</h2>
                  <p className="text-sm text-muted-foreground">Escalas de Serviço</p>
                </div>
              </div>
            </div>

            {ministryEvents.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Nenhuma escala programada</h3>
                <p className="text-muted-foreground">Não há eventos futuros com voluntários escalados para este ministério.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {ministryEvents.map(event => {
                  const slots = event.scheduleSlots.filter((s: any) => s.ministryId === selectedMinistryId)
                  return (
                    <div key={event.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-5 border-b border-border/50 bg-muted/20">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md" style={{ backgroundColor: selectedMinistry?.color + '20', color: selectedMinistry?.color }}>
                            {event.type}
                          </span>
                          <span className="text-sm font-semibold">
                            {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-lg mb-1">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                          {event.time && (
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {event.time}</span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> {event.location}</span>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Voluntários Escalados</p>
                        <div className="flex flex-col gap-2">
                          {slots.map((slot: any) => (
                            <div key={slot.id} className="flex items-center gap-3 bg-background rounded-xl p-2 border border-border/50">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: selectedMinistry?.color }}>
                                {slot.member.name.charAt(0)}
                              </div>
                              <span className="font-medium text-sm">{slot.member.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
