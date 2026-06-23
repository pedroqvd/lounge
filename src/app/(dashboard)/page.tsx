import { PrismaClient } from '@prisma/client'
import { Users, UserPlus, Cake, MessageCircle, AlertCircle } from 'lucide-react'
import { getSettings } from '@/app/actions/settings'
import Link from 'next/link'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const settings = await getSettings()
  
  const [totalAtivos, visitantes, historicoCount] = await Promise.all([
    prisma.member.count({ where: { status: 'ATIVO' } }),
    prisma.member.count({ where: { status: 'VISITANTE' } }),
    prisma.contactHistory.count()
  ])

  // OTIMIZAÇÃO: Filtrando aniversariantes puxando o mínimo de dados possível
  const membersWithBday = await prisma.member.findMany({
    where: { 
      status: { in: ['ATIVO', 'VISITANTE'] },
      birthDate: { not: null }
    },
    select: { id: true, name: true, birthDate: true, phone: true }
  })

  const today = new Date()
  today.setHours(0,0,0,0)
  
  const birthdays = membersWithBday.filter(m => {
    const bday = new Date(m.birthDate!)
    const bdayThisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
    const diff = (bdayThisYear.getTime() - today.getTime()) / (1000 * 3600 * 24)
    return diff >= 0 && diff <= 7
  }).sort((a, b) => {
    const aBday = new Date(today.getFullYear(), new Date(a.birthDate!).getMonth(), new Date(a.birthDate!).getDate())
    const bBday = new Date(today.getFullYear(), new Date(b.birthDate!).getMonth(), new Date(b.birthDate!).getDate())
    return aBday.getTime() - bBday.getTime()
  })

  // OTIMIZAÇÃO: Filtrar Risco de Evasão DIRETAMENTE no banco de dados
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - settings.inactivityDays)

  const atRiskMembers = await prisma.member.findMany({
    where: {
      status: { in: ['ATIVO', 'VISITANTE'] },
      OR: [
        {
          // Tem histórico, mas o mais recente é mais velho que a data de corte
          histories: { some: {} },
          NOT: {
            histories: { some: { sentAt: { gte: cutoffDate } } }
          }
        },
        {
          // Não tem nenhum histórico e foi criado antes da data de corte
          histories: { none: {} },
          createdAt: { lt: cutoffDate }
        }
      ]
    },
    select: {
      id: true, name: true, phone: true, createdAt: true,
      histories: { orderBy: { sentAt: 'desc' }, take: 1, select: { sentAt: true } }
    },
    orderBy: { createdAt: 'asc' }
  })

  const stats = [
    { name: 'Total de Ativos', value: totalAtivos.toString(), icon: Users, color: 'text-primary' },
    { name: 'Visitantes', value: visitantes.toString(), icon: UserPlus, color: 'text-blue-500' },
    { name: 'Aniversariantes (7 dias)', value: birthdays.length.toString(), icon: Cake, color: 'text-pink-500' },
    { name: `Risco de Evasão (> ${settings.inactivityDays}d)`, value: atRiskMembers.length.toString(), icon: AlertCircle, color: 'text-destructive' },
    { name: 'Mensagens Enviadas', value: historicoCount.toString(), icon: MessageCircle, color: 'text-whatsapp' },
  ]

  // Gráfico CSS de Frequência: Buscar últimos 4 eventos do tipo CULTO
  const recentEvents = await prisma.event.findMany({
    where: { type: 'CULTO', date: { lte: new Date() } },
    orderBy: { date: 'desc' },
    take: 5,
    select: { id: true, title: true, date: true, attendances: { where: { isPresent: true }, select: { id: true } } }
  })
  
  const chartData = recentEvents.reverse().map(ev => ({
    name: new Date(ev.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    value: ev.attendances.length
  }))
  const maxAttendance = Math.max(...chartData.map(d => d.value), 1) // Prevent division by zero

  const birthdaysToday = birthdays.filter(m => {
    const bday = new Date(m.birthDate!)
    return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth()
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Resumo</h1>
        <p className="text-muted-foreground mt-2">Visão geral do Ministério de Jovens.</p>
      </div>

      {birthdaysToday.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full animate-bounce">
              <Cake className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">Temos aniversariante hoje! 🎉</h2>
              <p className="font-medium opacity-90">{birthdaysToday.map(m => m.name).join(', ')}</p>
            </div>
          </div>
          {birthdaysToday[0].phone && (
            <a 
              href={`https://wa.me/${birthdaysToday[0].phone.replace(/\D/g, '')}?text=Parabéns pelo seu dia, ${birthdaysToday[0].name}! Deus te abençoe rica e abundantemente!`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-pink-600 font-extrabold rounded-xl hover:scale-105 transition-transform shadow-md"
            >
              Mandar Parabéns Agora
            </a>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.name} className="group relative p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 overflow-hidden cursor-pointer">
            {/* Efeito de brilho premium no hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-3.5 rounded-xl bg-secondary ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.name}</p>
                <h3 className="text-3xl font-extrabold mt-1">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* CSS Chart */}
        <div className="md:col-span-1 p-8 bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
            Frequência (Últimos Cultos)
          </h2>
          
          <div className="flex-1 flex items-end justify-between gap-2 mt-4 pt-4 border-t border-border/50">
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground mx-auto my-auto">Nenhum culto recente com lista de chamada.</p>
            ) : (
              chartData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group w-full">
                  <div className="text-xs font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{d.value}</div>
                  <div 
                    className="w-full bg-primary/20 rounded-t-md relative overflow-hidden group-hover:bg-primary transition-colors"
                    style={{ height: `${(d.value / maxAttendance) * 150}px`, minHeight: '4px' }}
                  >
                    <div className="absolute bottom-0 w-full bg-primary rounded-t-md" style={{ height: '100%' }}></div>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground mt-1 truncate">{d.name}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Action / Birthdays */}
        <div className="md:col-span-1 p-8 bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-pink-500/10 rounded-xl">
              <Cake className="w-6 h-6 text-pink-500" />
            </div>
            Aniversariantes Próximos
          </h2>
          <div className="space-y-4">
            {birthdays.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-xl text-center">Nenhum aniversariante nos próximos 7 dias.</p>
            ) : (
              birthdays.map(m => (
                <div key={m.id} className="group flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-secondary/20 transition-all duration-300">
                  <div>
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors">{m.name}</p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Aniversário: {new Date(m.birthDate!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long'})}
                    </p>
                  </div>
                  {m.phone && (
                    <a 
                      href={`https://wa.me/${m.phone.replace(/\D/g, '')}?text=Feliz aniversário!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-whatsapp text-whatsapp-foreground text-sm font-bold rounded-lg hover:opacity-90 hover:scale-105 transition-all shadow-md shadow-whatsapp/20"
                    >
                      Parabéns
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-1 p-8 bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-destructive/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            Atenção Necessária
          </h2>
          <div className="space-y-4">
            {atRiskMembers.length === 0 ? (
              <div className="p-4 border border-border rounded-xl bg-green-500/10 text-green-700 dark:text-green-400 text-center text-sm font-medium">
                Parabéns! Nenhum membro está há mais de {settings.inactivityDays} dias sem contato.
              </div>
            ) : (
              atRiskMembers.slice(0, 5).map(m => {
                const daysSince = m.histories.length > 0 
                  ? Math.floor((new Date().getTime() - new Date(m.histories[0].sentAt).getTime()) / (1000 * 3600 * 24))
                  : Math.floor((new Date().getTime() - new Date(m.createdAt).getTime()) / (1000 * 3600 * 24));
                  
                return (
                  <div key={m.id} className="group flex items-center justify-between p-4 border border-destructive/20 rounded-xl hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-300">
                    <div>
                      <Link href={`/membros/${m.id}`} className="font-bold text-foreground group-hover:text-destructive transition-colors">
                        {m.name}
                      </Link>
                      <p className="text-sm text-muted-foreground font-medium">
                        {daysSince} dias
                      </p>
                    </div>
                    {m.phone && (
                      <a 
                        href={`https://wa.me/${m.phone.replace(/\D/g, '')}?text=Oi ${m.name}, sentimos sua falta!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-destructive text-destructive-foreground text-sm font-bold rounded-lg hover:opacity-90 hover:scale-105 transition-all shadow-md shadow-destructive/20"
                      >
                        Resgatar
                      </a>
                    )}
                  </div>
                )
              })
            )}
            {atRiskMembers.length > 5 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                E mais {atRiskMembers.length - 5} pessoas. Acesse a área de Membros.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
