'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { createTemplate, updateTemplate, deleteTemplate } from '@/app/actions/templates'
import { Template } from '@prisma/client'

export default function TemplatesClient({ initialTemplates }: { initialTemplates: Template[] }) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(initialTemplates[0] || null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', category: '', content: '' })

  const handleNewTemplate = () => {
    setSelectedTemplate(null)
    setFormData({ name: '', category: '', content: '' })
    setIsEditing(true)
  }

  const handleEditTemplate = () => {
    if (!selectedTemplate) return
    setFormData({
      name: selectedTemplate.name,
      category: selectedTemplate.category,
      content: selectedTemplate.content
    })
    setIsEditing(true)
  }

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      const res = await deleteTemplate(id)
      if (res.success) {
        window.location.reload()
      } else {
        alert('Erro ao excluir template: ' + res.error)
      }
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.content) {
      alert('Nome e Mensagem são obrigatórios.')
      return
    }

    setIsSaving(true)
    let res
    if (selectedTemplate) {
      res = await updateTemplate(selectedTemplate.id, formData)
    } else {
      res = await createTemplate(formData)
    }

    if (res.success) {
      setIsEditing(false)
      window.location.reload()
    } else {
      alert('Erro ao salvar template: ' + res.error)
    }
    setIsSaving(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (templates.length > 0) {
      setSelectedTemplate(templates[0])
    } else {
      setSelectedTemplate(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates de Mensagens</h1>
          <p className="text-muted-foreground mt-1">Gerencie os modelos de mensagens para envio rápido.</p>
        </div>
        <button 
          onClick={handleNewTemplate}
          disabled={isEditing && !selectedTemplate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
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
            {templates.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Nenhum template cadastrado.
              </div>
            )}
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  if (isEditing) return
                  setSelectedTemplate(template)
                }}
                disabled={isEditing}
                className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                  selectedTemplate?.id === template.id 
                    ? 'bg-primary/10 border border-primary/20 text-primary' 
                    : 'hover:bg-secondary border border-transparent'
                } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <p className="font-medium">{template.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{template.category || 'Sem categoria'}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 border border-border bg-card rounded-xl shadow-sm h-[600px] flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/50">
            <h2 className="font-semibold">{isEditing ? (selectedTemplate ? 'Editando Template' : 'Novo Template') : 'Visualizar Template'}</h2>
            {!isEditing && selectedTemplate && (
              <div className="flex gap-2">
                <button onClick={handleEditTemplate} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteTemplate(selectedTemplate.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="p-6 flex-1 overflow-auto space-y-6">
            {!isEditing && !selectedTemplate ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Selecione um template ou crie um novo.
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Template</label>
                  <input 
                    type="text" 
                    value={isEditing ? formData.name : selectedTemplate?.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    readOnly={!isEditing}
                    placeholder="Ex: Boas-vindas Visitante"
                    className={`w-full px-3 py-2 border border-input rounded-md bg-transparent ${!isEditing ? 'opacity-70' : 'focus:ring-1 focus:ring-primary focus:outline-none'}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <input 
                    type="text" 
                    value={isEditing ? formData.category : selectedTemplate?.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    readOnly={!isEditing}
                    placeholder="Ex: Pastoral, Aniversário..."
                    className={`w-full px-3 py-2 border border-input rounded-md bg-transparent ${!isEditing ? 'opacity-70' : 'focus:ring-1 focus:ring-primary focus:outline-none'}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center justify-between">
                    <span>Mensagem</span>
                    <span className="text-xs text-muted-foreground font-normal">Variáveis: {'{nome}, {grupo}, {lider}, {data}'}</span>
                  </label>
                  <textarea 
                    value={isEditing ? formData.content : selectedTemplate?.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    readOnly={!isEditing}
                    placeholder="Digite a mensagem do template..."
                    rows={6}
                    className={`w-full px-3 py-2 border border-input rounded-md bg-transparent resize-none ${!isEditing ? 'opacity-70' : 'focus:ring-1 focus:ring-primary focus:outline-none'}`}
                  />
                </div>

                {!isEditing && selectedTemplate && (
                  <div className="p-4 bg-secondary rounded-lg border border-border">
                    <p className="text-sm font-medium mb-2">Pré-visualização (Exemplo)</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedTemplate.content
                        .replace(/{nome}/g, 'João Silva')
                        .replace(/{grupo}/g, 'Célula Norte')
                        .replace(/{lider}/g, 'Pr. Marcos')
                        .replace(/{data}/g, '15/10')
                      }
                    </p>
                  </div>
                )}

                {isEditing && (
                  <div className="flex gap-2 justify-end pt-4 border-t border-border mt-4">
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2 border border-input bg-transparent rounded-md hover:bg-secondary transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
