'use client'

import { useState } from 'react'
import { Plus, Calendar as CalendarIcon, Trash2, Users } from 'lucide-react'
import { createEvent, deleteEvent } from '@/app/actions/events'
import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'

export default function CalendarClient({ initialEvents }: { initialEvents: any[] }) {
  const [events, setEvents] = useState(initialEvents)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({ title: '', date: '', description: '' })

  const handleSave = async (e: React.FormEvent) => {
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
      }
    }
  }

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date())
  const pastEvents = events.filter(e => new Date(e.date) < new Date())

  const EventCard = ({ event }: { event: any }) => (
    <div className="p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <button onClick={() => handleDelete(event.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p className="text-sm font-semibold text-muted-foreground mb-1">
          {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
        {event.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{event.description}</p>}
      </div>
      
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="w-4 h-4" />
          {event._count?.attendances || 0} Check-ins
        </div>
        <Link 
          href={`/calendario/${event.id}`}
          className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Fazer Chamada
        </Link>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda & Eventos</h1>
          <p className="text-muted-foreground mt-1">Gerencie cultos, células e faça o check-in de presença.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ title: '', date: '', description: '' })
            setIsModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Evento
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Próximos Eventos</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum evento futuro agendado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}
      </div>

      {pastEvents.length > 0 && (
        <div className="space-y-4 pt-8">
          <h2 className="text-xl font-bold text-muted-foreground">Eventos Anteriores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
            {pastEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        </div>
      )}

      {/* Modal Novo Evento */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-lg">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">Novo Evento</Dialog.Title>
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Evento (ex: Célula, Culto)</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição (Opcional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 border rounded-md hover:bg-secondary transition-colors">Cancelar</button>
                </Dialog.Close>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isSaving ? 'Salvando...' : 'Criar Evento'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
