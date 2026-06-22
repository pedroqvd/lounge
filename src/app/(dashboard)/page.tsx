import { PrismaClient } from '@prisma/client'
import { Users, UserPlus, Cake, MessageCircle, AlertCircle } from 'lucide-react'
import { startOfMonth, subDays, addDays } from 'date-fns'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [totalAtivos, visitantes, historicoCount] = await Promise.all([
    prisma.member.count({ where: { status: 'ATIVO' } }),
    prisma.member.count({ where: { status: 'VISITANTE' } }),
    prisma.contactHistory.count()
  ])
  
  // This is a naive birthday calculation. In a real robust system, we would query by month and day ignoring the year.
  // For simplicity and speed of deployment, we will fetch all members and filter in JS
  const allMembers = await prisma.member.findMany({
    select: { id: true, name: true, birthDate: true, status: true, phone: true }
  })

  const today = new Date()
  today.setHours(0,0,0,0)
  
  const birthdays = allMembers.filter(m => {
    if (!m.birthDate) return false
    const bday = new Date(m.birthDate)
    const bdayThisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
    const diff = (bdayThisYear.getTime() - today.getTime()) / (1000 * 3600 * 24)
    return diff >= 0 && diff <= 7
  }).sort((a, b) => {
    const aBday = new Date(today.getFullYear(), new Date(a.birthDate!).getMonth(), new Date(a.birthDate!).getDate())
    const bBday = new Date(today.getFullYear(), new Date(b.birthDate!).getMonth(), new Date(b.birthDate!).getDate())
    return aBday.getTime() - bBday.getTime()
  })

  const stats = [
    { name: 'Total de Ativos', value: totalAtivos.toString(), icon: Users, color: 'text-primary' },
    { name: 'Visitantes', value: visitantes.toString(), icon: UserPlus, color: 'text-blue-500' },
    { name: 'Aniversariantes (7 dias)', value: birthdays.length.toString(), icon: Cake, color: 'text-pink-500' },
    { name: 'Sem contato > 30 dias', value: '0', icon: AlertCircle, color: 'text-destructive' }, // Will implement later
    { name: 'Mensagens Enviadas', value: historicoCount.toString(), icon: MessageCircle, color: 'text-whatsapp' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Resumo</h1>
        <p className="text-muted-foreground mt-2">Visão geral do Ministério de Jovens.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action / Birthdays */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Cake className="w-5 h-5 text-pink-500" />
            Aniversariantes Próximos
          </h2>
          <div className="space-y-4">
            {birthdays.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum aniversariante nos próximos 7 dias.</p>
            ) : (
              birthdays.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Aniversário: {new Date(m.birthDate!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long'})}
                    </p>
                  </div>
                  {m.phone && (
                    <a 
                      href={`https://wa.me/${m.phone.replace(/\D/g, '')}?text=Feliz aniversário!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-whatsapp text-whatsapp-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                    >
                      Dar Parabéns
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Atenção Necessária
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium">Em breve</p>
                <p className="text-sm text-muted-foreground">O controle de inatividade será ativado no próximo módulo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
