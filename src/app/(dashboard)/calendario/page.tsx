import { PrismaClient } from '@prisma/client'
import CalendarClient from './CalendarClient'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    include: {
      _count: { select: { attendances: true } }
    }
  })

  return <CalendarClient initialEvents={events} />
}
