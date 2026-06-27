import { getAuditLogs } from '@/app/actions/audit'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ShieldAlert, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AuditPage({
  searchParams
}: {
  searchParams: { page?: string }
}) {
  const page = Number(searchParams.page) || 1
  
  let result = null
  let errorMsg = ''
  
  try {
    result = await getAuditLogs(page, 50)
  } catch (err: any) {
    errorMsg = err.message
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe todas as ações gerenciais e configurações alteradas no sistema em tempo real.
        </p>
      </div>

      {errorMsg ? (
        <div className="border border-destructive bg-destructive/10 rounded-xl shadow-sm">
          <div className="p-6">
            <ShieldAlert className="w-5 h-5" />
            Você não tem permissão para acessar esta página ou ocorreu um erro ({errorMsg}).
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="flex gap-2 items-center">
              <Activity className="w-5 h-5 text-primary" />
              Histórico do Sistema
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-xl">Data / Hora</th>
                    <th className="px-4 py-3">Responsável</th>
                    <th className="px-4 py-3">Módulo</th>
                    <th className="px-4 py-3">Ação Realizada</th>
                  </tr>
                </thead>
                <tbody>
                  {result?.logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3 font-medium">{log.userName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-bold">
                          {log.resource}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{log.action}</td>
                    </tr>
                  ))}
                  {result?.logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhum log registrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {result && result.totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                <p>Página {page} de {result.totalPages}</p>
                <div className="flex gap-2">
                  <a href={`?page=${Math.max(page - 1, 1)}`} className="px-3 py-1 bg-muted rounded-md hover:bg-muted/80">Anterior</a>
                  <a href={`?page=${Math.min(page + 1, result.totalPages)}`} className="px-3 py-1 bg-muted rounded-md hover:bg-muted/80">Próxima</a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
