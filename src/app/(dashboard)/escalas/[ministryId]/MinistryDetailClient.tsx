'use client'

import { useState } from 'react'
import { Music, DoorOpen, Baby, Camera, Heart, Plus, Users, ChevronLeft, Crown, Check, X, Clock, MapPin, Trash2 } from 'lucide-react'
import { createScheduleSlot, updateSlotStatus, removeScheduleSlot, removeMemberFromMinistry } from '@/app/actions/ministries'
import * as Dialog from '@radix-ui/react-dialog'
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

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds(prev => prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId])
  }

  const handleSaveScale = async () => {
    if (!selectedEventId) return
    setIsSaving(true)
    const event = events.find(e => e.id === selectedEventId)
    const currentScaled = event?.scheduleSlots.map((s: any) => s.memberId) || []
    
    // Add new ones
    for (const memberId of selectedMemberIds) {
      if (!currentScaled.includes(memberId)) {
        await createScheduleSlot(ministry.id, selectedEventId, memberId)
      }
    }
    // Remove unchecked ones
    for (const slot of (event?.scheduleSlots || [])) {
      if (!selectedMemberIds.includes(slot.memberId)) {
        await removeScheduleSlot(slot.id)
      }
    }

    toast.success('Escala salva!')
    setIsScaleOpen(false)
    window.location.reload()
  }

  const handleStatusChange = async (slotId: string, status: 'PENDENTE' | 'CONFIRMADO' | 'RECUSADO') => {
    await updateSlotStatus(slotId, status)
    toast.success('Status atualizado!')
    window.location.reload()
  }

  const handleRemoveVolunteer = async (ministryMemberId: string) => {
    if (!confirm('Remover este voluntário do ministério?')) return
    const res = await removeMemberFromMinistry(ministryMemberId)
    if (res.success) { toast.success('Removido!'); window.location.reload() }
    else toast.error(res.error || 'Erro')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/escalas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Todos os Ministérios
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: ministry.color + '20', color: ministry.color }}>
            <IconComp className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{ministry.name}</h1>
            <p className="text-muted-foreground">{ministry.description}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">

        {/* Voluntários do Ministério */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Users className="w-5 h-5" /> Voluntários ({ministryMembers.length})</h2>
          <div className="space-y-2">
            {ministryMembers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl">Nenhum voluntário ainda. Adicione na página de escalas.</div>
            ) : ministryMembers.map((mm: any) => (
              <div key={mm.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl group hover:shadow-sm transition-all">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ backgroundColor: ministry.color }}>
                  {mm.member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{mm.member.name}</p>
                    {mm.role === 'LIDER_MINISTERIO' && <span title="Líder"><Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" /></span>}
                  </div>
                  {(mm.position || mm.instrument) && (
                    <p className="text-xs text-muted-foreground truncate">{mm.position || mm.instrument}</p>
                  )}
                </div>
                <button onClick={() => handleRemoveVolunteer(mm.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos Eventos e Escalas */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Clock className="w-5 h-5" /> Próximos Eventos</h2>
          {events.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl">
              Nenhum evento próximo cadastrado.<br />
              <Link href="/calendario" className="text-primary font-semibold hover:underline">Criar evento no Calendário</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event: any) => {
                const slots = event.scheduleSlots || []
                const hasSlots = slots.length > 0
                return (
                  <div key={event.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md" style={{ backgroundColor: ministry.color + '20', color: ministry.color }}>{event.type}</span>
                          <span className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                          {event.time && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/>{event.time}</span>}
                        </div>
                        <p className="font-bold truncate">{event.title}</p>
                        {event.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/>{event.location}</p>}
                      </div>
                      <button onClick={() => openScale(event.id)} className="ml-3 flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl text-white transition-all hover:opacity-90 shrink-0" style={{ backgroundColor: ministry.color }}>
                        <Plus className="w-3.5 h-3.5" /> Escalar
                      </button>
                    </div>

                    {hasSlots && (
                      <div className="border-t border-border px-4 pb-3 pt-2">
                        <p className="text-xs font-bold text-muted-foreground mb-2">ESCALADOS ({slots.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot: any) => {
                            const cfg = STATUS_CONFIG[slot.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDENTE
                            return (
                              <div key={slot.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                                {slot.member.name}
                                <div className="flex gap-0.5 ml-1">
                                  {slot.status !== 'CONFIRMADO' && <button onClick={() => handleStatusChange(slot.id, 'CONFIRMADO')} className="hover:scale-110 transition-transform" title="Confirmar"><Check className="w-3 h-3" /></button>}
                                  {slot.status !== 'RECUSADO' && <button onClick={() => handleStatusChange(slot.id, 'RECUSADO')} className="hover:scale-110 transition-transform" title="Recusar"><X className="w-3 h-3" /></button>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Scale Modal */}
      <Dialog.Root open={isScaleOpen} onOpenChange={setIsScaleOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] bg-background border border-border rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-extrabold mb-1">Escalar Voluntários</Dialog.Title>
            <p className="text-sm text-muted-foreground mb-4">Selecione quem serve neste evento</p>
            <div className="space-y-2 mb-6">
              {ministryMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Adicione voluntários ao ministério primeiro.</p>
              ) : ministryMembers.map((mm: any) => (
                <label key={mm.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedMemberIds.includes(mm.memberId) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                  <input type="checkbox" checked={selectedMemberIds.includes(mm.memberId)} onChange={() => toggleMember(mm.memberId)} className="sr-only" />
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${selectedMemberIds.includes(mm.memberId) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                    {selectedMemberIds.includes(mm.memberId) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: ministry.color }}>
                    {mm.member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{mm.member.name}</p>
                    {(mm.position || mm.instrument) && <p className="text-xs text-muted-foreground">{mm.position || mm.instrument}</p>}
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <Dialog.Close asChild><button className="flex-1 h-11 font-bold text-sm bg-secondary rounded-xl hover:bg-secondary/80">Cancelar</button></Dialog.Close>
              <button onClick={handleSaveScale} disabled={isSaving} className="flex-1 h-11 text-white font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: ministry.color }}>
                {isSaving ? 'Salvando...' : 'Salvar Escala'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
