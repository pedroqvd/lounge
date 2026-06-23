'use client'

import { useState, useEffect } from 'react'
import { Search, CheckCircle2, QrCode } from 'lucide-react'
import { updateAttendance } from '@/app/actions/events'
import * as Dialog from '@radix-ui/react-dialog'

export default function AttendanceClient({ event, allMembers }: { event: any, allMembers: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [attendances, setAttendances] = useState<Record<string, boolean>>(
    event.attendances.reduce((acc: any, att: any) => ({...acc, [att.memberId]: att.isPresent}), {})
  )
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin
      const dataUrl = encodeURIComponent(`${origin}/checkin/${event.id}`)
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${dataUrl}`)
    }
  }, [event.id])

  const handleToggle = async (memberId: string, isPresent: boolean) => {
    setAttendances(prev => ({ ...prev, [memberId]: isPresent }))
    await updateAttendance(event.id, memberId, isPresent)
  }

  const filteredMembers = allMembers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const presentCount = Object.values(attendances).filter(Boolean).length

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-8 bg-primary text-primary-foreground rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{event.title}</h1>
          <p className="font-medium opacity-90 mt-1">
            {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-background/20 rounded-xl font-bold">
            <CheckCircle2 className="w-5 h-5" />
            {presentCount} Presentes
          </div>
        </div>
        <button 
          onClick={() => setIsQrModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-background text-primary font-bold rounded-xl hover:opacity-90 shadow-lg transition-transform hover:scale-105"
        >
          <QrCode className="w-6 h-6" />
          Modo Totem (Auto Check-in)
        </button>
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

      <Dialog.Root open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border-0 bg-transparent p-0 shadow-none sm:rounded-2xl outline-none">
            <div className="bg-white p-10 rounded-3xl text-center space-y-6">
              <h2 className="text-3xl font-extrabold text-slate-900">Auto Check-in</h2>
              <p className="text-slate-600 font-medium">Aponte a câmera do seu celular para registrar sua presença no {event.title}.</p>
              <div className="p-4 bg-slate-100 rounded-2xl inline-block mx-auto">
                {qrUrl && <img src={qrUrl} alt="QR Code" className="w-64 h-64 mx-auto rounded-lg" />}
              </div>
              <Dialog.Close asChild>
                <button className="w-full py-4 mt-4 bg-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-300 transition-colors">
                  Fechar (Voltar ao Painel)
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
