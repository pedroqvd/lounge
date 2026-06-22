'use client'

import { useState } from 'react'
import { Search, CheckCircle2, XCircle } from 'lucide-react'
import { updateAttendance } from '@/app/actions/events'

export default function AttendanceClient({ event, allMembers }: { event: any, allMembers: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [attendances, setAttendances] = useState<Record<string, boolean>>(
    event.attendances.reduce((acc: any, att: any) => ({...acc, [att.memberId]: att.isPresent}), {})
  )

  const handleToggle = async (memberId: string, isPresent: boolean) => {
    // Optimistic UI update
    setAttendances(prev => ({ ...prev, [memberId]: isPresent }))
    await updateAttendance(event.id, memberId, isPresent)
  }

  const filteredMembers = allMembers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const presentCount = Object.values(attendances).filter(Boolean).length

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-8 bg-primary text-primary-foreground rounded-3xl shadow-md">
        <h1 className="text-3xl font-extrabold">{event.title}</h1>
        <p className="font-medium opacity-90 mt-1">
          {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-background/20 rounded-xl font-bold">
          <CheckCircle2 className="w-5 h-5" />
          {presentCount} Presentes
        </div>
      </div>

      <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar membro pelo nome..." 
            className="w-full pl-12 pr-4 py-3 border border-input rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredMembers.map(member => {
            const isPresent = attendances[member.id] || false
            return (
              <div key={member.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isPresent ? 'bg-primary/5 border-primary/30' : 'bg-transparent border-border hover:border-primary/20'}`}>
                <div>
                  <p className="font-bold">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.group?.name || 'Sem célula'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggle(member.id, true)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isPresent ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
                  >
                    Presente
                  </button>
                  <button 
                    onClick={() => handleToggle(member.id, false)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${!isPresent ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
                  >
                    Faltou
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
