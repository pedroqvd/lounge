'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'

const mockTemplates = [
  { id: '1', name: 'Boas-vindas Visitante', category: 'Pastoral', content: 'Olá, {nome}! Bem-vindo(a) à Lounge For You. Sentimos muita alegria em ter você conosco! Você já conhece nossa célula {grupo}?' },
  { id: '2', name: 'Aniversário', category: 'Aniversário', content: 'Parabéns, {nome}! Que Deus abençoe muito seu aniversário! 🎂🎉 Com amor, {lider} e toda a equipe.' },
]

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(mockTemplates[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates de Mensagens</h1>
          <p className="text-muted-foreground mt-1">Gerencie os modelos de mensagens para envio rápido.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" />
          Novo Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-border bg-card rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-border bg-secondary/50">
            <h2 className="font-semibold">Seus Templates</h2>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {mockTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                  selectedTemplate.id === template.id 
                    ? 'bg-primary/10 border border-primary/20 text-primary' 
                    : 'hover:bg-secondary border border-transparent'
                }`}
              >
                <p className="font-medium">{template.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{template.category}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 border border-border bg-card rounded-xl shadow-sm h-[600px] flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/50">
            <h2 className="font-semibold">Editar Template</h2>
            <div className="flex gap-2">
              <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6 flex-1 overflow-auto space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Template</label>
              <input 
                type="text" 
                value={selectedTemplate.name}
                readOnly
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent opacity-70"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <input 
                type="text" 
                value={selectedTemplate.category}
                readOnly
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent opacity-70"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Mensagem</span>
                <span className="text-xs text-muted-foreground font-normal">Variáveis: {'{nome}, {grupo}, {lider}, {data}'}</span>
              </label>
              <textarea 
                value={selectedTemplate.content}
                readOnly
                rows={6}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent opacity-70 resize-none"
              />
            </div>

            <div className="p-4 bg-secondary rounded-lg border border-border">
              <p className="text-sm font-medium mb-2">Pré-visualização (Exemplo)</p>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate.content
                  .replace('{nome}', 'João Silva')
                  .replace('{grupo}', 'Célula Norte')
                  .replace('{lider}', 'Pr. Marcos')
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
