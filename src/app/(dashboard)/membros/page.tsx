'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, MessageCircle, Filter, ChevronDown } from 'lucide-react'

// Mock Data for the frontend logic
const mockMembers = [
  { id: '1', name: 'João Silva', phone: '+55 11 99999-1111', group: 'Célula Norte', status: 'ATIVO', avatar: 'JS' },
  { id: '2', name: 'Maria Clara', phone: '+55 11 98888-2222', group: 'Célula Sul', status: 'VISITANTE', avatar: 'MC' },
  { id: '3', name: 'Pedro Henrique', phone: '+55 11 97777-3333', group: 'Célula Norte', status: 'INATIVO', avatar: 'PH' },
]

export default function MembrosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedMembers)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedMembers(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedMembers.size === mockMembers.length) {
      setSelectedMembers(new Set())
    } else {
      setSelectedMembers(new Set(mockMembers.map(m => m.id)))
    }
  }

  const handleBatchWhatsApp = () => {
    if (selectedMembers.size === 0) return
    const confirm = window.confirm(`Você irá abrir ${selectedMembers.size} janelas de WhatsApp. Certifique-se de permitir pop-ups. Confirmar?`)
    if (confirm) {
      const selected = mockMembers.filter(m => selectedMembers.has(m.id))
      selected.forEach((member, index) => {
        setTimeout(() => {
          // Template message logic goes here
          const text = encodeURIComponent(`Olá ${member.name}, temos um recado para você!`)
          window.open(`https://wa.me/${member.phone.replace(/\D/g, '')}?text=${text}`, '_blank')
        }, index * 500) // Stagger window opening slightly
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Membros</h1>
          <p className="text-muted-foreground mt-1">Gerencie os membros e visitantes do ministério.</p>
        </div>
        <Link 
          href="/membros/novo" 
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Membro
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..." 
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-input bg-transparent rounded-md hover:bg-secondary transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {selectedMembers.size > 0 && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
          <span className="text-primary font-medium">{selectedMembers.size} membros selecionados</span>
          <button 
            onClick={handleBatchWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2 bg-whatsapp text-whatsapp-foreground font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-5 h-5" />
            Enviar Mensagem Lote
          </button>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-input text-primary focus:ring-primary"
                    checked={selectedMembers.size === mockMembers.length && mockMembers.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3">Membro</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockMembers.map((member) => (
                <tr key={member.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-input text-primary focus:ring-primary"
                      checked={selectedMembers.has(member.id)}
                      onChange={() => toggleSelect(member.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      member.status === 'ATIVO' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      member.status === 'VISITANTE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{member.group}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => window.open(`https://wa.me/${member.phone.replace(/\D/g, '')}`, '_blank')}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-whatsapp/10 text-whatsapp hover:bg-whatsapp hover:text-whatsapp-foreground transition-colors"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
