import { PrismaClient } from '@prisma/client'
import { Users, UserPlus, Cake, MessageCircle, AlertCircle, BookOpen, UserCheck } from 'lucide-react'
import { getSettings } from '@/app/actions/settings'
import Link from 'next/link'
import { DashboardTasksClient } from '@/components/DashboardTasksClient'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const settings = await getSettings()
  
  const [totalAtivos, visitantes, discipulado, batizados, historicoCount] = await Promise.all([
    prisma.member.count({ where: { status: 'ATIVO' } }),
    prisma.member.count({ where: { status: 'VISITANTE' } }),
    prisma.member.count({ where: { status: 'DISCIPULADO' } }),
    prisma.member.count({ where: { isBaptized: true } }),
    prisma.contactHistory.count()
  ])

  // Taxa de Retenção de Visitantes
  const visitantesComPresenca = await prisma.member.findMany({
    where: { status: 'VISITANTE' },
    select: { attendances: { select: { id: true } } }
  })
  const visitantesRetidos = visitantesComPresenca.filter(m => m.attendances.length > 1).length
  const taxaRetencao = visitantesComPresenca.length > 0 ? Math.round((visitantesRetidos / visitantesComPresenca.length) * 100) : 0

  // Oportunidades
  const ativosNaoBatizados = await prisma.member.count({ where: { status: 'ATIVO', isBaptized: false } })
  const visitantesAssiduos = visitantesComPresenca.filter(m => m.attendances.length >= 3).length

  // OTIMIZAÇÃO: Filtrando aniversariantes puxando o mínimo de dados possível
  const membersWithBday = await prisma.member.findMany({
    where: { 
      status: { in: ['ATIVO', 'VISITANTE', 'DISCIPULADO'] },
      birthDate: { not: null }
    },
    select: { id: true, name: true, birthDate: true, phone: true }
  })

  const pendingTasks = await prisma.task.findMany({
    where: { status: 'PENDING' },
    include: { member: true },
    orderBy: { dueDate: 'asc' }
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
      status: { in: ['ATIVO', 'VISITANTE', 'DISCIPULADO'] },
      OR: [
        {
          histories: { some: {} },
          NOT: {
            histories: { some: { sentAt: { gte: cutoffDate } } }
          }
        },
        {
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
    { name: 'Em Discipulado', value: discipulado.toString(), icon: BookOpen, color: 'text-orange-500' },
    { name: 'Retenção Visitantes', value: `${taxaRetencao}%`, icon: UserCheck, color: 'text-green-500' },
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

      <DashboardTasksClient initialTasks={pendingTasks} />

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

        {/* Funil da Jornada */}
        <div className="md:col-span-1 p-8 bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-xl">
              <BookOpen className="w-6 h-6 text-orange-500" />
            </div>
            Jornada do Membro (Funil)
          </h2>
          <div className="flex-1 flex flex-col gap-3 justify-center">
            
            <div className="flex flex-col items-center group relative">
              <div className="w-full h-12 bg-blue-500/20 rounded-xl flex items-center justify-between px-4 border border-blue-500/30">
                <span className="font-bold text-blue-700 dark:text-blue-400">Visitantes</span>
                <span className="font-extrabold text-blue-700 dark:text-blue-400">{visitantes}</span>
              </div>
            </div>

            <div className="flex justify-center -my-1 relative z-10">
              <div className="w-px h-4 bg-border"></div>
            </div>

            <div className="flex flex-col items-center group relative">
              <div className="w-[90%] h-12 bg-orange-500/20 rounded-xl flex items-center justify-between px-4 border border-orange-500/30">
                <span className="font-bold text-orange-700 dark:text-orange-400">Em Discipulado</span>
                <span className="font-extrabold text-orange-700 dark:text-orange-400">{discipulado}</span>
              </div>
            </div>

            <div className="flex justify-center -my-1 relative z-10">
              <div className="w-px h-4 bg-border"></div>
            </div>

            <div className="flex flex-col items-center group relative">
              <div className="w-[80%] h-12 bg-teal-500/20 rounded-xl flex items-center justify-between px-4 border border-teal-500/30">
                <span className="font-bold text-teal-700 dark:text-teal-400">Batizados</span>
                <span className="font-extrabold text-teal-700 dark:text-teal-400">{batizados}</span>
              </div>
            </div>

            <div className="flex justify-center -my-1 relative z-10">
              <div className="w-px h-4 bg-border"></div>
            </div>

            <div className="flex flex-col items-center group relative">
              <div className="w-[70%] h-12 bg-green-500/20 rounded-xl flex items-center justify-between px-4 border border-green-500/30">
                <span className="font-bold text-green-700 dark:text-green-400">Membros Ativos</span>
                <span className="font-extrabold text-green-700 dark:text-green-400">{totalAtivos}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Demografia e Oportunidades */}
        <div className="md:col-span-1 p-8 bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            Oportunidades & Ações
          </h2>
          <div className="space-y-4">
            
            <div className="group flex flex-col p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-secondary/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-foreground">Ativos não batizados</p>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-bold rounded-full text-xs">
                  {ativosNaoBatizados} pessoas
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Membros que são ativos na igreja mas ainda não desceram às águas. Oportunidade de classe de batismo.</p>
            </div>

            <div className="group flex flex-col p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-secondary/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-foreground">Visitantes Assíduos</p>
                <span className="px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-400 font-bold rounded-full text-xs">
                  {visitantesAssiduos} pessoas
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Visitantes que já vieram a 3 ou mais cultos. Excelente momento para convidá-los para uma célula/discipulado.</p>
            </div>

            <div className="group flex flex-col p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-secondary/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-foreground">Aniversariantes (7d)</p>
                <span className="px-3 py-1 bg-pink-500/20 text-pink-700 dark:text-pink-400 font-bold rounded-full text-xs">
                  {birthdays.length} pessoas
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Pessoas fazendo aniversário nesta semana. Mande uma mensagem de felicitação.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
