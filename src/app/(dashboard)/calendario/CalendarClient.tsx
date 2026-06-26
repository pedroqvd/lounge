'use client'

import { useState, useMemo } from 'react'
import { Plus, Calendar as CalendarIcon, Trash2, Users, ChevronLeft, ChevronRight, Clock, MapPin, Edit2, List, CalendarDays, ClipboardList } from 'lucide-react'
import { createEvent, deleteEvent, updateEvent } from '@/app/actions/events'
import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'
import { toast } from 'sonner'

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CULTO:   { label: 'Culto',   color: '#8b5cf6', bg: 'bg-purple-500' },
  CELULA:  { label: 'Célula',  color: '#10b981', bg: 'bg-emerald-500' },
  REUNIAO: { label: 'Reunião', color: '#f59e0b', bg: 'bg-amber-500' },
  OUTRO:   { label: 'Outro',   color: '#3b82f6', bg: 'bg-blue-500' },
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function CalendarClient({ initialEvents }: { initialEvents: any[] }) {
  const [events, setEvents] = useState(initialEvents)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month')
  
  // Day Modal
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([])
  const [selectedDateStr, setSelectedDateStr] = useState('')
  
  // Event Form
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '', date: '', time: '', type: 'CULTO', location: '', description: '',
    isRecurring: false, recurrenceType: 'SEMANAL' as 'SEMANAL' | 'MENSAL', recurrenceEnd: ''
  })

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()

  const calendarGrid = useMemo(() => {
    const grid: (Date | null)[] = []
    for (let i = 0; i < firstDay; i++) grid.push(null)
    for (let i = 1; i <= daysInMonth; i++) grid.push(new Date(currentYear, currentMonth, i))
    return grid
  }, [currentYear, currentMonth, firstDay, daysInMonth])

  // Week view: get 7 days starting from Sunday of current week
  const weekDays = useMemo(() => {
    const day = currentDate.getDay()
    const sunday = new Date(currentDate)
    sunday.setDate(currentDate.getDate() - day)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday)
      d.setDate(sunday.getDate() + i)
      return d
    })
  }, [currentDate])

  const prevWeek = () => setCurrentDate(d => { const n = new Date(d); n.setDate(d.getDate() - 7); return n })
  const nextWeek = () => setCurrentDate(d => { const n = new Date(d); n.setDate(d.getDate() + 7); return n })

  const getEventsForDate = (date: Date) => {
    const ds = date.toISOString().split('T')[0]
    return events.filter(e => new Date(e.date).toISOString().split('T')[0] === ds)
  }

  const handleDayClick = (date: Date) => {
    const dayEvents = getEventsForDate(date)
    setSelectedDayEvents(dayEvents)
    setSelectedDateStr(date.toISOString().split('T')[0])
    setIsDayModalOpen(true)
  }

  const openNewEvent = (dateStr?: string) => {
    setEditingEvent(null)
    setFormData({ title: '', date: dateStr || '', time: '', type: 'CULTO', location: '', description: '', isRecurring: false, recurrenceType: 'SEMANAL', recurrenceEnd: '' })
    setIsEventFormOpen(true)
  }

  const openEditEvent = (event: any) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time || '',
      type: event.type,
      location: event.location || '',
      description: event.description || '',
      isRecurring: false, recurrenceType: 'SEMANAL', recurrenceEnd: ''
    })
    setIsDayModalOpen(false)
    setIsEventFormOpen(true)
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    if (editingEvent) {
      const res = await updateEvent(editingEvent.id, formData)
      if (res.success) { toast.success('Evento atualizado!'); window.location.reload() }
      else { toast.error(res.error || 'Erro'); setIsSaving(false) }
    } else {
      const res = await createEvent(formData)
      if (res.success) { toast.success('Evento criado!'); window.location.reload() }
      else { toast.error(res.error || 'Erro'); setIsSaving(false) }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este evento?')) return
    const res = await deleteEvent(id)
    if (res.success) {
      toast.success('Evento excluído!')
      setEvents(events.filter(ev => ev.id !== id))
      setSelectedDayEvents(prev => prev.filter(ev => ev.id !== id))
    } else toast.error(res.error || 'Erro')
  }

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  const upcomingListEvents = useMemo(() => {
    return [...events]
      .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 30)
  }, [events])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda & Eventos</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os eventos e cultos da igreja.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-secondary rounded-xl gap-1">
            {([['month', CalendarIcon, 'Mês'], ['week', CalendarDays, 'Semana'], ['list', List, 'Lista']] as const).map(([mode, Icon, label]) => (
              <button key={mode} onClick={() => setViewMode(mode as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === mode ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted'}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
          <button onClick={() => openNewEvent()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Novo Evento
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goToToday} className="px-4 py-2 text-sm font-bold bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">Hoje</button>
        <div className="flex items-center gap-3">
          <button onClick={viewMode === 'week' ? prevWeek : prevMonth} className="p-2 rounded-xl hover:bg-secondary transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-lg font-extrabold capitalize min-w-[200px] text-center">
            {viewMode === 'week'
              ? `${weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`
              : monthName
            }
          </h2>
          <button onClick={viewMode === 'week' ? nextWeek : nextMonth} className="p-2 rounded-xl hover:bg-secondary transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.bg}`} /> {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 border-b border-border">
            {WEEK_DAYS.map(d => (
              <div key={d} className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wide">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarGrid.map((date, idx) => {
              if (!date) return <div key={'empty-' + idx} className="min-h-[100px] border-b border-r border-border/50 bg-muted/10" />
              const dayEvents = getEventsForDate(date)
              const isToday = date.toDateString() === new Date().toDateString()
              const isPast = date < new Date(new Date().setHours(0,0,0,0))
              return (
                <div key={date.toISOString()}
                  onClick={() => handleDayClick(date)}
                  className={`min-h-[100px] border-b border-r border-border/50 p-2 cursor-pointer transition-colors group ${isPast ? 'bg-muted/5' : 'hover:bg-primary/5'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-colors ${isToday ? 'bg-primary text-primary-foreground shadow-md' : 'group-hover:bg-primary/10 text-foreground'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(ev => {
                      const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.OUTRO
                      return (
                        <div key={ev.id} className="flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md truncate text-white" style={{ backgroundColor: cfg.color }}>
                          <span className="truncate">{ev.title}</span>
                        </div>
                      )
                    })}
                    {dayEvents.length > 3 && <div className="text-xs text-muted-foreground px-1">+{dayEvents.length - 3} mais</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map(date => {
              const isToday = date.toDateString() === new Date().toDateString()
              return (
                <div key={date.toISOString()} className="p-3 text-center border-r border-border/50 last:border-r-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase">{WEEK_DAYS[date.getDay()]}</p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold mx-auto mt-1 ${isToday ? 'bg-primary text-primary-foreground shadow-md' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="grid grid-cols-7 min-h-[300px]">
            {weekDays.map(date => {
              const dayEvs = getEventsForDate(date)
              return (
                <div key={date.toISOString()} onClick={() => handleDayClick(date)} className="p-2 border-r border-border/50 last:border-r-0 cursor-pointer hover:bg-primary/5 transition-colors min-h-[200px] space-y-1">
                  {dayEvs.map(ev => {
                    const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.OUTRO
                    return (
                      <div key={ev.id} className="text-xs font-semibold px-2 py-1.5 rounded-lg text-white truncate" style={{ backgroundColor: cfg.color }}>
                        {ev.time && <span className="opacity-80 mr-1">{ev.time}</span>}
                        {ev.title}
                      </div>
                    )
                  })}
                  {dayEvs.length === 0 && <div className="h-full flex items-center justify-center opacity-0 hover:opacity-30 transition-opacity"><Plus className="w-5 h-5 text-muted-foreground" /></div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {upcomingListEvents.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-2xl">Nenhum evento próximo cadastrado.</div>
          ) : upcomingListEvents.map(ev => {
            const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.OUTRO
            return (
              <div key={ev.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all group">
                <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: cfg.color + '15' }}>
                  <span className="text-xl font-extrabold" style={{ color: cfg.color }}>{new Date(ev.date).getDate()}</span>
                  <span className="text-xs font-bold uppercase" style={{ color: cfg.color }}>{new Date(ev.date).toLocaleString('pt-BR', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.color + '20', color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <h3 className="font-bold truncate">{ev.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {ev.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{ev.time}</span>}
                    {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{ev.location}</span>}
                    {ev._count?.attendances > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{ev._count.attendances} presentes</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditEvent(ev)} className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <Link href={'/calendario/' + ev.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary font-bold rounded-lg hover:bg-primary hover:text-white text-xs transition-colors">
                    <Users className="w-3.5 h-3.5" /> Chamada
                  </Link>
                  <button onClick={() => handleDelete(ev.id)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Day Modal */}
      <Dialog.Root open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-background border border-border rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-extrabold">
                {selectedDateStr ? new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) : ''}
              </Dialog.Title>
              <button onClick={() => { setIsDayModalOpen(false); openNewEvent(selectedDateStr) }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Novo
              </button>
            </div>
            {selectedDayEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Nenhum evento neste dia.</p>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map(ev => {
                  const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.OUTRO
                  return (
                    <div key={ev.id} className="p-4 rounded-xl border border-border hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: cfg.color }}>{cfg.label}</span>
                          <h3 className="font-bold">{ev.title}</h3>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEditEvent(ev)} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(ev.id)} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-1">
                        {ev.time && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/>{ev.time}</span>}
                        {ev.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/>{ev.location}</span>}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link href={'/calendario/' + ev.id} className="flex-1 text-center px-3 py-2 bg-secondary text-foreground text-xs font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                          <Users className="w-3.5 h-3.5 inline mr-1" />Chamada
                        </Link>
                        <Link href={'/escalas'} className="flex-1 text-center px-3 py-2 bg-secondary text-foreground text-xs font-bold rounded-lg hover:bg-muted transition-colors">
                          <ClipboardList className="w-3.5 h-3.5 inline mr-1" />Escalas
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Dialog.Close asChild><button className="px-5 py-2.5 font-bold text-sm bg-secondary rounded-xl hover:bg-secondary/80">Fechar</button></Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Event Form Modal */}
      <Dialog.Root open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-background border border-border rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-2xl font-extrabold mb-4">{editingEvent ? 'Editar Evento' : 'Novo Evento'}</Dialog.Title>
            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Tipo</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="CULTO">Culto</option>
                    <option value="CELULA">Célula</option>
                    <option value="REUNIAO">Reunião</option>
                    <option value="OUTRO">Outro / Especial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Data</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Título</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Culto de Louvor, Célula da Semana..." className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              {!editingEvent && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <input type="checkbox" checked={formData.isRecurring} onChange={e => setFormData({...formData, isRecurring: e.target.checked})} className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
                    Repetir este evento?
                  </label>
                  {formData.isRecurring && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl border border-border">
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-muted-foreground">Frequência</label>
                        <select value={formData.recurrenceType} onChange={e => setFormData({...formData, recurrenceType: e.target.value as any})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                          <option value="SEMANAL">Semanalmente</option>
                          <option value="MENSAL">Mensalmente</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-muted-foreground">Até quando?</label>
                        <input required={formData.isRecurring} type="date" value={formData.recurrenceEnd} onChange={e => setFormData({...formData, recurrenceEnd: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Horário</label>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Local</label>
                  <input placeholder="Igreja Sede" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Descrição</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Dialog.Close asChild><button type="button" className="px-5 py-2.5 font-bold text-sm bg-secondary rounded-xl hover:bg-secondary/80">Cancelar</button></Dialog.Close>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50">
                  {isSaving ? 'Salvando...' : editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
