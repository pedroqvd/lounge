'use client'

import React, { useState } from 'react'
import { Music, DoorOpen, Baby, Camera, Heart, Plus, Users, ChevronLeft, Check } from 'lucide-react'
import { createScheduleSlot, removeScheduleSlot, removeMemberFromMinistry } from '@/app/actions/ministries'
import { toast } from 'sonner'
import Link from 'next/link'

type Ministry = any
type Member = any

const MINISTRY_ICONS: Record<string, any> = {
  music: Music, 'door-open': DoorOpen, baby: Baby, camera: Camera, heart: Heart, users: Users
}

const STATUS_CONFIG = {
  PENDENTE: { label: 'Pendente', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  CONFIRMADO: { label: 'Confirmado', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  RECUSADO: { label: 'Recusado', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
}

export default function MinistryDetailClient({ ministry, members, upcomingEvents }: { ministry: Ministry, members: Member[], upcomingEvents: any[] }) {
  const [isScaleOpen, setIsScaleOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [events, setEvents] = useState(upcomingEvents)

  const IconComp = MINISTRY_ICONS[ministry.icon] || Users
  const ministryMembers = ministry.members || []

  const openScale = (eventId: string) => {
    setSelectedEventId(eventId)
    const event = events.find(e => e.id === eventId)
    const alreadyScaled = event?.scheduleSlots.map((s: any) => s.memberId) || []
    setSelectedMemberIds(alreadyScaled)
    setIsScaleOpen(true)
  }

  const handleToggleScale = async (eventId: string, memberId: string, position: string, isCurrentlyScheduled: boolean, currentSlotId?: string) => {
    setIsSaving(true)
    if (isCurrentlyScheduled && currentSlotId) {
      await removeScheduleSlot(currentSlotId)
      toast.success('Voluntário removido da escala!')
    } else {
      await createScheduleSlot(ministry.id, eventId, memberId, position)
      toast.success('Voluntário escalado!')
    }
    setIsSaving(false)
    window.location.reload()
  }

  const handleRemoveVolunteer = async (ministryMemberId: string) => {
    if (!confirm('Remover este voluntário do ministério?')) return
    const res = await removeMemberFromMinistry(ministryMemberId)
    if (res.success) { toast.success('Removido!'); window.location.reload() }
    else toast.error(res.error || 'Erro')
  }

  // Obter todas as funções únicas do ministério
  const allPositions = new Set<string>()
  ministryMembers.forEach((mm: any) => {
    if (mm.position) {
      mm.position.split(',').forEach((p: string) => allPositions.add(p.trim()))
    }
  })
  let positionsArray = Array.from(allPositions).filter(Boolean)
  if (positionsArray.length === 0) positionsArray = ['Equipe'] // Fallback if no positions

  const standardOrder = ['Vocal', 'Teclado', 'Teclado 1', 'Teclado 2', 'Violão', 'Guitarra', 'Guitarra 1', 'Guitarra 2', 'Baixo', 'Bateria']
  positionsArray.sort((a, b) => {
    const idxA = standardOrder.indexOf(a)
    const idxB = standardOrder.indexOf(b)
    if (idxA !== -1 && idxB !== -1) return idxA - idxB
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1
    return a.localeCompare(b)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/escalas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Todos os Ministérios
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: ministry.color + '20', color: ministry.color }}>
              <IconComp className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Escalas: {ministry.name}</h1>
              <p className="text-sm text-muted-foreground">{ministry.description}</p>
            </div>
          </div>
          {events.length === 0 && (
            <Link href="/calendario" className="text-sm font-semibold text-primary hover:underline bg-primary/10 px-4 py-2 rounded-xl">
              + Criar Evento no Calendário
            </Link>
          )}
        </div>
      </div>

      {events.length > 0 ? (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="py-4 px-4 font-bold border-b border-r border-border bg-muted/30 sticky left-0 z-10 w-64 shadow-[1px_0_0_0_var(--border)]">
                  Função / Voluntário
                </th>
                {events.map((event: any) => {
                  const d = new Date(event.date)
                  return (
                    <th key={event.id} className="py-3 px-3 font-semibold border-b border-border bg-muted/10 text-center min-w-[140px] align-top">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: ministry.color + '15', color: ministry.color }}>
                          {event.type}
                        </span>
                        <span className="text-lg font-black leading-none mt-1">
                          {String(d.getDate()).padStart(2, '0')}/{d.toLocaleDateString('pt-BR', { month: 'short' })}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                          {event.time && ` • ${event.time}`}
                        </span>
                        <span className="text-xs font-bold truncate max-w-full px-2" title={event.title}>
                          {event.title}
                        </span>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {positionsArray.map((position, pIdx) => {
                // Find all members that have this position
                const membersWithPosition = ministryMembers.filter((mm: any) => {
                  if (positionsArray.length === 1 && positionsArray[0] === 'Equipe') return true
                  if (!mm.position) return false
                  const pArr = mm.position.split(',').map((p: string) => p.trim())
                  return pArr.includes(position)
                })

                if (membersWithPosition.length === 0) return null

                return (
                  <React.Fragment key={position}>
                    {/* Position Header Row */}
                    <tr>
                      <td colSpan={events.length + 1} className="py-2 px-4 font-bold text-sm bg-muted/40 border-y border-border" style={{ color: ministry.color }}>
                        {position}
                      </td>
                    </tr>
                    
                    {/* Member Rows for this position */}
                    {membersWithPosition.map((mm: any, mIdx: number) => {
                      const isLastInPosition = mIdx === membersWithPosition.length - 1
                      return (
                        <tr key={`${position}-${mm.id}`} className="hover:bg-muted/10 transition-colors">
                          <td className={`py-2 px-4 border-r border-border bg-background sticky left-0 z-10 shadow-[1px_0_0_0_var(--border)] ${!isLastInPosition ? 'border-b' : ''}`}>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: ministry.color }}>
                                {mm.member.name.charAt(0)}
                              </div>
                              <span className="text-sm font-semibold truncate" title={mm.member.name}>{mm.member.name}</span>
                            </div>
                          </td>
                          {events.map((event: any) => {
                            // Find if this specific member is scheduled for this specific position in this event
                            const slot = event.scheduleSlots?.find((s: any) => s.memberId === mm.memberId && s.position === position)
                            const isScheduled = !!slot
                            const isPending = isScheduled && slot.status === 'PENDENTE'
                            const isConfirmed = isScheduled && slot.status === 'CONFIRMADO'
                            const isRefused = isScheduled && slot.status === 'RECUSADO'
                            
                            return (
                              <td key={`${event.id}-${mm.id}`} className={`p-1.5 text-center ${!isLastInPosition ? 'border-b border-border' : ''}`}>
                                <button 
                                  disabled={isSaving}
                                  onClick={() => handleToggleScale(event.id, mm.memberId, position, isScheduled, slot?.id)}
                                  className={`w-full h-10 rounded-xl flex items-center justify-center transition-all ${
                                    isScheduled 
                                      ? isConfirmed 
                                        ? 'bg-emerald-500 text-white shadow-md' 
                                        : isRefused
                                          ? 'bg-red-500 text-white shadow-md'
                                          : 'bg-primary text-primary-foreground shadow-md'
                                      : 'bg-muted/30 hover:bg-muted border border-transparent hover:border-border text-transparent hover:text-muted-foreground'
                                  }`}
                                  style={isScheduled && !isConfirmed && !isRefused ? { backgroundColor: ministry.color } : {}}
                                >
                                  {isScheduled ? <Check className="w-5 h-5" /> : <Plus className="w-4 h-4" />}
                                </button>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-2xl">
          Nenhum evento futuro cadastrado no calendário.
        </div>
      )}
    </div>
  )
}
