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

      {/* Quick Action / Birthdays */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-8 bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
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
                      Dar Parabéns
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-8 bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-destructive/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            Atenção Necessária
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-secondary/30">
              <div>
                <p className="font-bold">Em breve</p>
                <p className="text-sm text-muted-foreground font-medium">O controle de inatividade será ativado no próximo módulo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
