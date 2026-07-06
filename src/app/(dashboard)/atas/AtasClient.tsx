'use client'

import { useState } from 'react'
import { Plus, Search, FileText, Calendar, Clock, CheckCircle2, User as UserIcon } from 'lucide-react'
import { createAta, updateAta, deleteAta } from '@/app/actions/atas'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as Dialog from '@radix-ui/react-dialog'

export default function AtasClient({ initialAtas, users }: { initialAtas: any[], users: any[] }) {
  const [atas, setAtas] = useState(initialAtas)
  const [activeTab, setActiveTab] = useState('TODAS')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'REUNIAO',
    status: 'ABERTO',
    dueDate: '',
    assignedTo: ''
  })

  const filteredAtas = atas.filter(ata => {
    const matchesTab = activeTab === 'TODAS' || ata.category === activeTab
    const matchesSearch = ata.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ata.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newAta = await createAta({
        ...formData,
        category: formData.category as any,
        status: formData.status as any,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      })
      // Append visually
      setAtas([newAta, ...atas])
      setIsModalOpen(false)
      toast.success('Registro salvo com sucesso!')
      setFormData({ title: '', content: '', category: 'REUNIAO', status: 'ABERTO', dueDate: '', assignedTo: '' })
    } catch (error) {
      toast.error('Erro ao salvar o registro.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONCLUIDO': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'EM_ANDAMENTO': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'ABERTO': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'CANCELADO': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-secondary text-muted-foreground border-border'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'REUNIAO': return 'bg-purple-500/10 text-purple-500'
      case 'DESPACHO': return 'bg-orange-500/10 text-orange-500'
      case 'TRAMITACAO': return 'bg-cyan-500/10 text-cyan-500'
      case 'FEEDBACK': return 'bg-pink-500/10 text-pink-500'
      default: return 'bg-secondary text-muted-foreground'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'REUNIAO': return 'Reunião'
      case 'DESPACHO': return 'Despacho'
      case 'TRAMITACAO': return 'Tramitação'
      case 'FEEDBACK': return 'Feedback'
      default: return category
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Atas & Atribuições
          </h1>
          <p className="text-muted-foreground mt-2">Registre reuniões, despachos, tramitações, feedbacks e atribua tarefas para a equipe.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
        >
          <Plus className="w-5 h-5" />
          Novo Registro
        </button>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-card p-2 rounded-2xl border border-border shadow-sm">
        <div className="flex w-full md:w-auto overflow-x-auto scrollbar-hide gap-1">
          {['TODAS', 'REUNIAO', 'DESPACHO', 'TRAMITACAO', 'FEEDBACK'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
            >
              {tab === 'TODAS' ? 'Todas' : tab === 'REUNIAO' ? 'Reunião' : tab === 'DESPACHO' ? 'Despacho' : tab === 'TRAMITACAO' ? 'Tramitação' : 'Feedback'}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar registros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
          />
        </div>
      </div>

      {/* LISTA DE ATAS */}
      <div className="grid gap-4">
        {filteredAtas.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border border-dashed rounded-3xl">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Nenhum registro encontrado</h3>
            <p className="text-muted-foreground">Crie sua primeira ata ou mude os filtros da busca.</p>
          </div>
        ) : (
          filteredAtas.map(ata => (
            <div key={ata.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                {/* Info Principal */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(ata.category)}`}>
                      {getCategoryLabel(ata.category)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(ata.status)}`}>
                      {ata.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{ata.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{ata.content}</p>
                </div>

                {/* Metadados */}
                <div className="flex flex-col md:items-end justify-between min-w-[200px] gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(ata.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                  </div>
                  
                  {ata.dueDate && (
                    <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-md ${new Date(ata.dueDate) < new Date() && ata.status !== 'CONCLUIDO' ? 'bg-red-500/10 text-red-500' : 'bg-secondary text-foreground'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      Prazo: {format(new Date(ata.dueDate), "dd/MM/yyyy")}
                    </div>
                  )}

                  {ata.assignee && (
                    <div className="flex items-center gap-2 text-xs font-medium bg-primary/5 text-primary px-2.5 py-1.5 rounded-lg border border-primary/10">
                      <UserIcon className="w-3.5 h-3.5" />
                      Atribuído para: {ata.assignee.name}
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE NOVO REGISTRO */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border rounded-[2rem] shadow-2xl z-50 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-border bg-muted/30">
              <Dialog.Title className="text-2xl font-black">Novo Registro</Dialog.Title>
              <Dialog.Description className="text-muted-foreground mt-1 text-sm">
                Crie uma ata, despacho ou atribua uma nova tarefa.
              </Dialog.Description>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Título</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: Reunião de Liderança" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Categoria</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                    <option value="REUNIAO">Reunião</option>
                    <option value="DESPACHO">Despacho</option>
                    <option value="TRAMITACAO">Tramitação</option>
                    <option value="FEEDBACK">Feedback</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Conteúdo / Detalhes</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Descreva os tópicos, decisões ou encaminhamentos..." />
              </div>

              <div className="grid md:grid-cols-2 gap-6 p-5 bg-secondary/30 rounded-2xl border border-border/50">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2"><UserIcon className="w-4 h-4 text-primary" /> Atribuir Tarefa Para</label>
                  <select value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                    <option value="">Ninguém (Apenas Registro)</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-red-500" /> Prazo Limite (Opcional)</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Dialog.Close asChild>
                  <button type="button" className="px-6 py-2.5 rounded-xl font-semibold text-muted-foreground hover:bg-secondary transition-colors">Cancelar</button>
                </Dialog.Close>
                <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105">
                  <CheckCircle2 className="w-5 h-5" /> Salvar Registro
                </button>
              </div>

            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
