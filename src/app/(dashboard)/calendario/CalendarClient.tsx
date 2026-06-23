'use client'

import { useState, useMemo } from 'react'
import { Plus, Calendar as CalendarIcon, Trash2, Users, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { createEvent, deleteEvent } from '@/app/actions/events'
import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'

export default function CalendarClient({ initialEvents }: { initialEvents: any[] }) {
  const [events, setEvents] = useState(initialEvents)
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Modal States
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([])
  const [selectedDateStr, setSelectedDateStr] = useState('')

  // Form State
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({ 
    title: '', 
    date: '', 
    time: '',
    type: 'CULTO',
    location: '',
    description: '',
    isRecurring: false,
    recurrenceType: 'SEMANAL' as 'SEMANAL' | 'MENSAL',
    recurrenceEnd: ''
  })

  // Helpers for Calendar Math
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  // Previous month navigation
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  // Generate grid array (empty slots for days before 1st)
  const calendarGrid = useMemo(() => {
    const grid = []
    // Add empty slots for the beginning of the month
    for (let i = 0; i < firstDay; i++) {
      grid.push(null)
    }
    // Add real days
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push(new Date(currentYear, currentMonth, i))
    }
    return grid
  }, [currentYear, currentMonth, firstDay, daysInMonth])

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return events.filter(e => new Date(e.date).toISOString().split('T')[0] === dateString)
  }

  // Get Color by Type
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'CELULA': return 'bg-green-500'
      case 'CULTO': return 'bg-purple-500'
      case 'REUNIAO': return 'bg-orange-500'
      default: return 'bg-blue-500' // OUTRO
    }
  }

  // Event Handlers
  const handleDayClick = (date: Date) => {
    const dayEvents = getEventsForDate(date)
    const dateStr = date.toISOString().split('T')[0]
    setSelectedDayEvents(dayEvents)
    setSelectedDateStr(dateStr)
    setIsDayModalOpen(true)
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const res = await createEvent(formData)
    if (res.success) {
      window.location.reload()
    } else {
      alert('Erro ao criar evento')
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      const res = await deleteEvent(id)
      if (res.success) {
        setEvents(events.filter(ev => ev.id !== id))
        setSelectedDayEvents(selectedDayEvents.filter(ev => ev.id !== id)) // update modal if open
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário Completo</h1>
          <p className="text-muted-foreground mt-1">Visão geral de cultos, células e reuniões.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ title: '', date: new Date().toISOString().split('T')[0], time: '', type: 'CULTO', location: '', description: '', isRecurring: false, recurrenceType: 'SEMANAL', recurrenceEnd: '' })
            setIsNewEventModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Evento
        </button>
      </div>

      {/* Calendar Container */}
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
        
        {/* Calendar Header */}
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-extrabold capitalize">
              {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={goToToday} className="px-3 py-1 text-xs font-bold bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">Hoje</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 border rounded-full hover:bg-secondary transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={nextMonth} className="p-2 border rounded-full hover:bg-secondary transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarGrid.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="min-h-[120px] p-2 border-b border-r border-border bg-secondary/10 opacity-50"></div>
            }

            const isToday = date.toDateString() === new Date().toDateString()
            const dayEvents = getEventsForDate(date)

            return (
              <div 
                key={date.toISOString()} 
                onClick={() => handleDayClick(date)}
                className={`min-h-[120px] p-2 border-b border-r border-border hover:bg-secondary/20 transition-colors cursor-pointer relative group ${isToday ? 'bg-primary/5' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                    {date.getDate()}
                  </span>
                  {/* Plus button inside the day on hover */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setFormData({ title: '', date: date.toISOString().split('T')[0], time: '', type: 'CULTO', location: '', description: '', isRecurring: false, recurrenceType: 'SEMANAL', recurrenceEnd: '' })
                      setIsNewEventModalOpen(true)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2 space-y-1">
                  {dayEvents.slice(0, 3).map((ev: any) => (
                    <div key={ev.id} className="text-xs truncate px-1.5 py-0.5 rounded-sm bg-secondary/50 flex items-center gap-1.5 font-medium">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${getTypeColor(ev.type)}`}></span>
                      <span className="truncate">{ev.time && `${ev.time} `}{ev.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground font-bold px-1.5">+ {dayEvents.length - 3} mais</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MODAL: Eventos do Dia */}
      <Dialog.Root open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <Dialog.Title className="text-2xl font-extrabold capitalize">
                  {selectedDateStr && new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </Dialog.Title>
                <p className="text-muted-foreground font-medium text-sm mt-1">
                  {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'evento marcado' : 'eventos marcados'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setFormData({ title: '', date: selectedDateStr, time: '', type: 'CULTO', location: '', description: '', isRecurring: false, recurrenceType: 'SEMANAL', recurrenceEnd: '' })
                  setIsNewEventModalOpen(true)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90"
              >
                <Plus className="w-4 h-4" /> Adicionar Evento
              </button>
            </div>

            <div className="space-y-4">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-10 bg-secondary/30 rounded-xl border border-dashed border-border">
                  <CalendarIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground font-medium">Você tem o dia livre!</p>
                </div>
              ) : (
                selectedDayEvents.map(ev => (
                  <div key={ev.id} className="p-5 bg-card border border-border rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-4">
                      <div className={`w-1.5 rounded-full shrink-0 ${getTypeColor(ev.type)}`}></div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-secondary text-muted-foreground`}>{ev.type}</span>
                          <h3 className="font-bold text-lg">{ev.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-2">
                          {ev.time && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {ev.time}</span>}
                          {ev.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> {ev.location}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:border-l sm:border-border sm:pl-4">
                      <Link 
                        href={`/calendario/${ev.id}`}
                        className="flex-1 sm:flex-none text-center px-4 py-2 bg-secondary text-foreground text-sm font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Fazer Chamada
                      </Link>
                      <button onClick={() => handleDelete(ev.id)} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Dialog.Close asChild>
                <button className="px-5 py-2.5 font-bold text-sm bg-secondary rounded-lg hover:bg-secondary/80">Fechar</button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal Novo Evento */}
      <Dialog.Root open={isNewEventModalOpen} onOpenChange={setIsNewEventModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-8 shadow-2xl sm:rounded-2xl">
            <Dialog.Title className="text-2xl font-extrabold">Novo Evento</Dialog.Title>
            <form onSubmit={handleSaveEvent} className="space-y-4 mt-2">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Tipo</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="CULTO">Culto</option>
                    <option value="CELULA">Célula</option>
                    <option value="REUNIAO">Reunião</option>
                    <option value="OUTRO">Outro / Especial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Data</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Título (Ex: Culto de Jovens)</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer select-none">
                  <input type="checkbox" checked={formData.isRecurring} onChange={e => setFormData({...formData, isRecurring: e.target.checked})} className="w-4 h-4 rounded border-input text-primary focus:ring-primary" />
                  Repetir este evento?
                </label>
              </div>

              {formData.isRecurring && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl border border-border animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Frequência</label>
                    <select value={formData.recurrenceType} onChange={e => setFormData({...formData, recurrenceType: e.target.value as any})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="SEMANAL">Semanalmente</option>
                      <option value="MENSAL">Mensalmente</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Até quando?</label>
                    <input required={formData.isRecurring} type="date" value={formData.recurrenceEnd} onChange={e => setFormData({...formData, recurrenceEnd: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Horário (Opcional)</label>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Local (Opcional)</label>
                  <input placeholder="Igreja Sede" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Descrição (Opcional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
                <Dialog.Close asChild>
                  <button type="button" className="px-5 py-2.5 font-bold text-sm bg-secondary rounded-lg hover:bg-secondary/80">Cancelar</button>
                </Dialog.Close>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {isSaving ? 'Criando...' : 'Criar Evento'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
