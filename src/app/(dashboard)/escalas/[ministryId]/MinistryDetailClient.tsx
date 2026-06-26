'use client'

import React, { useState, useEffect } from 'react'
import { Music, DoorOpen, Baby, Camera, Heart, Plus, Users, ChevronLeft, Check, Save } from 'lucide-react'
import { removeMemberFromMinistry, bulkUpdateScheduleSlots } from '@/app/actions/ministries'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

type SlotEdit = { eventId: string, memberId: string, position: string, currentSlotId?: string, isRemoved?: boolean }

export default function MinistryDetailClient({ ministry, members, upcomingEvents }: { ministry: Ministry, members: Member[], upcomingEvents: any[] }) {
  const router = useRouter()
  const [isScaleOpen, setIsScaleOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [edits, setEdits] = useState<Record<string, SlotEdit>>({})

  const hasUnsavedChanges = Object.keys(edits).length > 0

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleSaveScale = async () => {
    setIsSaving(true)
    const additions: any[] = []
    const removals: string[] = []

    Object.values(edits).forEach(edit => {
      if (edit.currentSlotId) {
        removals.push(edit.currentSlotId)
        if (!edit.isRemoved) {
          additions.push({ eventId: edit.eventId, memberId: edit.memberId, position: edit.position })
        }
      } else {
        if (!edit.isRemoved) {
          additions.push({ eventId: edit.eventId, memberId: edit.memberId, position: edit.position })
        }
      }
    })

    const res = await bulkUpdateScheduleSlots(ministry.id, additions, removals)
    if (res.success) {
      toast.success('Escala salva com sucesso!')
      setEdits({})
      router.refresh()
    } else {
      toast.error(res.error || 'Erro ao salvar escala')
    }
    setIsSaving(false)
  }

  // Compute available months
  const months = Array.from(new Set(upcomingEvents.map(e => {
    const d = new Date(e.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }))).sort()

  const [selectedMonth, setSelectedMonth] = useState<string>(months.length > 0 ? months[0] : '')

  const events = upcomingEvents.filter(e => {
    const d = new Date(e.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth
  })

  const IconComp = MINISTRY_ICONS[ministry.icon] || Users
  const ministryMembers = ministry.members || []

  const openScale = (eventId: string) => {
    setSelectedEventId(eventId)
    const event = events.find(e => e.id === eventId)
    const alreadyScaled = event?.scheduleSlots.map((s: any) => s.memberId) || []
    setSelectedMemberIds(alreadyScaled)
    setIsScaleOpen(true)
  }

  const handleToggleLocal = (eventId: string, memberId: string, category: string, currentSlot: any | null, specificPosition?: string) => {
    const key = `${eventId}-${memberId}-${category}`
    const posToSave = specificPosition || category
    
    setEdits(prev => {
      const newEdits = { ...prev }
      const existingEdit = newEdits[key]
      
      if (existingEdit) {
        if (!existingEdit.isRemoved) {
          if (specificPosition && existingEdit.position !== specificPosition) {
            newEdits[key] = { ...existingEdit, position: posToSave }
          } else {
            if (currentSlot) {
              newEdits[key] = { ...existingEdit, isRemoved: true }
            } else {
              delete newEdits[key]
            }
          }
        } else {
          if (currentSlot && currentSlot.position === posToSave) {
            delete newEdits[key]
          } else {
            newEdits[key] = { ...existingEdit, isRemoved: false, position: posToSave }
          }
        }
      } else {
        if (currentSlot) {
          if (specificPosition && currentSlot.position !== specificPosition) {
            newEdits[key] = { eventId, memberId, position: posToSave, currentSlotId: currentSlot.id, isRemoved: false }
          } else {
            newEdits[key] = { eventId, memberId, position: posToSave, currentSlotId: currentSlot.id, isRemoved: true }
          }
        } else {
          newEdits[key] = { eventId, memberId, position: posToSave, isRemoved: false }
        }
      }
      return newEdits
    })
  }

  const handleRemoveVolunteer = async (ministryMemberId: string) => {
    if (hasUnsavedChanges && !confirm('Você tem alterações não salvas. Deseja remover o voluntário mesmo assim? (As escalas não salvas serão perdidas)')) return
    if (!confirm('Remover este voluntário do ministério?')) return
    const res = await removeMemberFromMinistry(ministryMemberId)
    if (res.success) { toast.success('Removido!'); router.refresh() }
    else toast.error(res.error || 'Erro')
  }

  const LOUVOR_MAPPING: Record<string, string> = {
    'Ministro(a) de Louvor': 'Vocal', 'Vocalista': 'Vocal', 'Back-vocal': 'Vocal', 'Vocal': 'Vocal',
    'Tecladista': 'Teclado', 'Teclado': 'Teclado', 'Teclado 1': 'Teclado', 'Teclado 2': 'Teclado',
    'Violinista': 'Violão', 'Violonista': 'Violão', 'Violão': 'Violão',
    'Guitarrista': 'Guitarra', 'Guitarra': 'Guitarra', 'Guitarra 1': 'Guitarra', 'Guitarra 2': 'Guitarra',
    'Baixista': 'Baixo', 'Baixo': 'Baixo',
    'Baterista': 'Bateria', 'Bateria': 'Bateria'
  }
  const STANDARD_ORDER = ['Vocal', 'Teclado', 'Violão', 'Guitarra', 'Baixo', 'Bateria']

  // Obter todas as funções únicas do ministério, agrupadas
  const allCategories = new Set<string>()
  ministryMembers.forEach((mm: any) => {
    if (mm.position) {
      mm.position.split(',').forEach((p: string) => {
        const trimP = p.trim()
        allCategories.add(LOUVOR_MAPPING[trimP] || trimP)
      })
    }
  })
  let categoriesArray = Array.from(allCategories).filter(Boolean)
  if (categoriesArray.length === 0) categoriesArray = ['Equipe'] // Fallback if no positions

  categoriesArray.sort((a, b) => {
    const idxA = STANDARD_ORDER.indexOf(a)
    const idxB = STANDARD_ORDER.indexOf(b)
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
          {events.length === 0 && upcomingEvents.length === 0 && (
            <Link href="/calendario" className="text-sm font-semibold text-primary hover:underline bg-primary/10 px-4 py-2 rounded-xl">
              + Criar Evento no Calendário
            </Link>
          )}
        </div>
      </div>

      {events.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            disabled={!hasUnsavedChanges || isSaving}
            onClick={handleSaveScale}
            className={`flex items-center gap-2 px-6 py-4 rounded-full font-extrabold text-white shadow-2xl transition-all ${
              hasUnsavedChanges 
                ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] scale-100 opacity-100 hover:scale-105 active:scale-95' 
                : 'bg-muted scale-95 opacity-0 pointer-events-none'
            }`}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Salvar Escala
          </button>
        </div>
      )}

      {months.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {months.map(m => {
            const [year, month] = m.split('-')
            const date = new Date(parseInt(year), parseInt(month) - 1, 1)
            const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
            const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${selectedMonth === m ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                {capitalizedLabel}
              </button>
            )
          })}
        </div>
      )}

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
              {categoriesArray.map((category, pIdx) => {
                // Find all members that have this mapped category
                const membersWithCategory = ministryMembers.filter((mm: any) => {
                  if (categoriesArray.length === 1 && categoriesArray[0] === 'Equipe') return true
                  if (!mm.position) return false
                  const memberCategories = mm.position.split(',').map((p: string) => LOUVOR_MAPPING[p.trim()] || p.trim())
                  return memberCategories.includes(category)
                })

                if (membersWithCategory.length === 0) return null

                // Sort members so Ministers are first
                membersWithCategory.sort((a: any, b: any) => {
                  const aIsMin = (a.position || '').includes('Ministro')
                  const bIsMin = (b.position || '').includes('Ministro')
                  if (aIsMin && !bIsMin) return -1
                  if (!aIsMin && bIsMin) return 1
                  return 0
                })

                return (
                  <React.Fragment key={category}>
                    {/* Position Header Row */}
                    <tr>
                      <td colSpan={events.length + 1} className="py-2 px-4 font-bold text-sm bg-muted/40 border-y border-border" style={{ color: ministry.color }}>
                        {category}
                      </td>
                    </tr>
                    
                    {/* Member Rows for this position */}
                    {membersWithCategory.map((mm: any, mIdx: number) => {
                      const isLastInPosition = mIdx === membersWithCategory.length - 1
                      const isMinister = (mm.position || '').includes('Ministro')
                      return (
                        <tr key={`${category}-${mm.id}`} className="hover:bg-muted/10 transition-colors">
                          <td className={`py-2 px-4 border-r border-border bg-background sticky left-0 z-10 shadow-[1px_0_0_0_var(--border)] ${!isLastInPosition ? 'border-b' : ''}`}>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: ministry.color }}>
                                {mm.member.name.charAt(0)}
                              </div>
                              <span className={`text-sm truncate ${isMinister ? 'font-black text-foreground' : 'font-semibold'}`} title={mm.member.name}>{mm.member.name}</span>
                            </div>
                          </td>
                          {events.map((event: any) => {
                            const slots = event.scheduleSlots?.filter((s: any) => s.memberId === mm.memberId) || []
                            const slot = slots.find((s: any) => s.position ? (LOUVOR_MAPPING[s.position] || s.position) === category : true)
                            
                            const editKey = `${event.id}-${mm.memberId}-${category}`
                            const edit = edits[editKey]
                            
                            let isScheduled = false
                            let scheduledPosition = ''
                            let isConfirmed = false
                            let isRefused = false

                            if (edit) {
                              isScheduled = !edit.isRemoved
                              scheduledPosition = edit.position
                              isConfirmed = true // Edições locais não confirmadas no DB ainda, mas vamos renderizar verde.
                            } else {
                              isScheduled = !!slot
                              scheduledPosition = slot?.position || category
                              isConfirmed = isScheduled && slot.status === 'CONFIRMADO'
                              isRefused = isScheduled && slot.status === 'RECUSADO'
                            }
                            
                            const isVocal = category === 'Vocal'

                            return (
                              <td key={`${event.id}-${mm.id}`} className={`p-1.5 text-center ${!isLastInPosition ? 'border-b border-border' : ''}`}>
                                {isVocal ? (
                                  <div className="flex gap-1 h-10 w-full min-w-[70px]">
                                    <button 
                                      disabled={isSaving}
                                      onClick={() => handleToggleLocal(event.id, mm.memberId, category, slot, 'Ministro(a) de Louvor')}
                                      className={`flex-1 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                                        isScheduled && scheduledPosition.includes('Ministro') 
                                          ? 'bg-emerald-500 text-white shadow-md' 
                                          : 'bg-muted/30 hover:bg-muted text-muted-foreground'
                                      }`}
                                      title="Ministro(a) de Louvor"
                                    >
                                      M
                                    </button>
                                    <button 
                                      disabled={isSaving}
                                      onClick={() => handleToggleLocal(event.id, mm.memberId, category, slot, 'Back-vocal')}
                                      className={`flex-1 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                                        isScheduled && !scheduledPosition.includes('Ministro') 
                                          ? 'bg-emerald-500 text-white shadow-md' 
                                          : 'bg-muted/30 hover:bg-muted text-muted-foreground'
                                      }`}
                                      title="Back-vocal"
                                    >
                                      B
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    disabled={isSaving}
                                    onClick={() => handleToggleLocal(event.id, mm.memberId, category, slot)}
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
                                )}
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
