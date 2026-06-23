'use client'

import { useState } from 'react'
import { memberSelfCheckin } from '@/app/actions/events'
import { CheckCircle2, UserCheck, AlertCircle } from 'lucide-react'

export default function CheckinClient({ event }: { event: any }) {
  const [identifier, setIdentifier] = useState('')
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
  const [message, setMessage] = useState('')

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) return

    setStatus('LOADING')
    const res = await memberSelfCheckin(event.id, identifier.trim())
    
    if (res.success) {
      setStatus('SUCCESS')
      setMessage(`Bem-vindo(a), ${res.memberName}! Sua presença foi confirmada.`)
      setIdentifier('')
      
      // Reset after 5 seconds for the next person
      setTimeout(() => {
        setStatus('IDLE')
        setMessage('')
      }, 5000)
    } else {
      setStatus('ERROR')
      setMessage(res.error || 'Erro desconhecido ao fazer check-in.')
    }
  }

  if (status === 'SUCCESS') {
    return (
      <div className="w-full max-w-md p-8 bg-card border border-green-500/20 rounded-3xl shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Check-in Realizado!</h2>
          <p className="text-lg text-muted-foreground mt-2 font-medium">{message}</p>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse mt-8">Próximo em 5 segundos...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md p-8 bg-card border border-border rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8" />
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">{event.type}</span>
        <h1 className="text-3xl font-extrabold mt-4 text-foreground">{event.title}</h1>
        <p className="text-muted-foreground font-medium mt-2 capitalize">
          {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      <form onSubmit={handleCheckin} className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block text-center">Digite seu Telefone ou Nome Completo</label>
          <input 
            type="text" 
            autoFocus
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Ex: 61 99999-9999"
            className="flex h-14 w-full rounded-2xl border-2 border-input bg-transparent px-5 py-2 text-xl font-medium text-center focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        {status === 'ERROR' && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive animate-in shake">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-bold">{message}</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={status === 'LOADING' || !identifier.trim()}
          className="w-full py-4 bg-primary text-primary-foreground text-xl font-extrabold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-50"
        >
          {status === 'LOADING' ? 'Buscando...' : 'Confirmar Presença'}
        </button>
      </form>
    </div>
  )
}
