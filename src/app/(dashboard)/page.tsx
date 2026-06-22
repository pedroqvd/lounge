import { PrismaClient } from '@prisma/client'
import { Users, UserPlus, Cake, MessageCircle, AlertCircle } from 'lucide-react'

// Use a global variable to prevent creating multiple Prisma clients in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function DashboardPage() {
  // In a real scenario, we'd fetch actual data from Prisma.
  // For the sake of this setup, we'll implement the queries that Vercel will run.
  
  // const totalAtivos = await prisma.member.count({ where: { status: 'ATIVO' } })
  // const visitantesMes = await prisma.member.count({ 
  //   where: { 
  //     status: 'VISITANTE',
  //     createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
  //   } 
  // })
  
  // Mock data for preview until DB is fully seeded
  const stats = [
    { name: 'Total de Ativos', value: '142', icon: Users, color: 'text-primary' },
    { name: 'Visitantes no Mês', value: '12', icon: UserPlus, color: 'text-blue-500' },
    { name: 'Aniversariantes da Semana', value: '4', icon: Cake, color: 'text-pink-500' },
    { name: 'Sem contato > 30 dias', value: '18', icon: AlertCircle, color: 'text-destructive' },
    { name: 'Mensagens Enviadas', value: '340', icon: MessageCircle, color: 'text-whatsapp' },
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
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium">João Silva</p>
                <p className="text-sm text-muted-foreground">Faz 22 anos amanhã</p>
              </div>
              <button className="px-3 py-1 bg-whatsapp text-whatsapp-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
                Dar Parabéns
              </button>
            </div>
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
                <p className="font-medium">Maria Clara</p>
                <p className="text-sm text-muted-foreground">Sem contato há 35 dias</p>
              </div>
              <button className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                Ver Perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
