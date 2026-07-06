'use client'

import { FileText, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export function DashboardAtasClient({ myAssignments, globalAssignments, role }: { myAssignments: any[], globalAssignments: any[], role: string }) {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'REUNIAO': return 'Reunião'
      case 'DESPACHO': return 'Despacho'
      case 'TRAMITACAO': return 'Tramitação'
      case 'FEEDBACK': return 'Feedback'
      default: return category
    }
  }

  const renderList = (atas: any[], title: string, subtitle: string, icon: any, colorClass: string) => {
    if (!atas || atas.length === 0) return null
    
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 rounded-xl ${colorClass}`}>
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Link href="/atas" className="ml-auto text-sm font-semibold text-primary hover:underline">Ver tudo</Link>
        </div>

        <div className="space-y-3">
          {atas.slice(0, 5).map(ata => {
            const isOverdue = ata.dueDate && new Date(ata.dueDate) < new Date()
            return (
              <div key={ata.id} className={`flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 rounded-xl border ${isOverdue ? 'bg-red-500/5 border-red-500/20' : 'bg-secondary/30 border-border/50'}`}>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-background border border-border">{getCategoryLabel(ata.category)}</span>
                    <h4 className="font-bold">{ata.title}</h4>
                  </div>
                  {role === 'ADMIN' && ata.assignee && (
                    <p className="text-xs text-muted-foreground">Responsável: <strong className="text-foreground">{ata.assignee.name}</strong></p>
                  )}
                </div>
                
                {ata.dueDate && (
                  <div className={`flex items-center gap-2 text-xs font-bold px-2.5 py-1.5 rounded-lg ${isOverdue ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground bg-background border border-border'}`}>
                    {isOverdue ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    Prazo: {format(new Date(ata.dueDate), "dd/MM")}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      {renderList(myAssignments, "Minhas Atribuições Pendentes", "Tarefas designadas a você", <FileText className="w-6 h-6 text-primary" />, "bg-primary/10 text-primary")}
      {role === 'ADMIN' && renderList(globalAssignments, "Atribuições Globais da Equipe", "Acompanhamento geral de pendências", <CheckCircle2 className="w-6 h-6 text-emerald-500" />, "bg-emerald-500/10")}
    </div>
  )
}
