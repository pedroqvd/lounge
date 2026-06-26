"use client"

import { useState } from 'react'
import { CheckCircle2, Clock, Calendar, MessageCircle, AlertCircle, Phone, X, Check } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function DashboardTasksClient({ initialTasks }: { initialTasks: any[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    task: any;
    feedbackText: string;
  }>({ isOpen: false, task: null, feedbackText: '' })

  if (tasks.length === 0) return null;

  const handleResolveTask = (task: any) => {
    let msg = ''
    if (task.type === 'BIRTHDAY') {
      msg = `Parabéns pelo seu dia, ${task.member?.name}! Que Deus te abençoe rica e abundantemente.`
      setFeedbackState({ isOpen: true, task, feedbackText: 'Enviei mensagem de feliz aniversário' })
    } else {
      msg = `Olá ${task.member?.name}, tudo bem?`
      setFeedbackState({ isOpen: true, task, feedbackText: 'Entrei em contato' })
    }

    if (task.member?.phone) {
      const phoneDigits = task.member.phone.replace(/\D/g, '')
      window.open(`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(msg)}`, '_blank')
    } else {
      toast.warning('Este membro não possui telefone cadastrado. O WhatsApp não será aberto.')
      setFeedbackState({ isOpen: true, task, feedbackText: 'Tentei contato, mas não havia número' })
    }
  }

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/tasks/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: feedbackState.task.id,
          memberId: feedbackState.task.memberId,
          feedbackText: feedbackState.feedbackText
        })
      })

      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== feedbackState.task.id))
        toast.success('Tarefa concluída com sucesso!')
        setFeedbackState(prev => ({ ...prev, isOpen: false }))
        router.refresh()
      } else {
        toast.error('Erro ao resolver tarefa.')
      }
    } catch (err) {
      toast.error('Erro de conexão.')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="mb-8 p-6 bg-card border border-border rounded-2xl shadow-lg relative overflow-hidden">
      {/* Decoração Premium */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">Tarefas do Dia</h2>
          <p className="text-sm text-muted-foreground">O sistema gerou {tasks.length} interações prioritárias para hoje.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 relative z-10">
        {tasks.map(task => (
          <div key={task.id} className="p-4 bg-background border border-border rounded-xl flex flex-col gap-3 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{task.type === 'BIRTHDAY' ? '🎂 Aniversário' : '🔁 Acompanhamento'}</span>
                <h3 className="font-bold mt-1 text-foreground">{task.title}</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            <div className="mt-auto pt-4 flex gap-2">
              <button 
                onClick={() => handleResolveTask(task)}
                className="flex-1 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Resolver
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE FEEDBACK */}
      <Dialog.Root open={feedbackState.isOpen} onOpenChange={(open) => !open && setFeedbackState(prev => ({...prev, isOpen: false}))}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
            <Dialog.Title className="text-xl font-bold mb-4">Registro da Tarefa</Dialog.Title>
            <form onSubmit={submitFeedback} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Como foi a execução da tarefa <strong>{feedbackState.task?.title}</strong>?
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Relatório / Resultado:</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={feedbackState.feedbackText}
                  onChange={e => setFeedbackState(prev => ({ ...prev, feedbackText: e.target.value }))}
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Dialog.Close asChild>
                  <button type="button" className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-colors">
                    Cancelar
                  </button>
                </Dialog.Close>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md">
                  {isSubmitting ? 'Salvando...' : 'Confirmar Conclusão'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
