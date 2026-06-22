import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AttendanceClient from './AttendanceClient'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const dynamic = 'force-dynamic'

export default async function AttendancePage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      attendances: true
    }
  })

  if (!event) notFound()

  const members = await prisma.member.findMany({
    orderBy: { name: 'asc' },
    include: { group: true }
  })

  return (
    <div className="space-y-6">
      <Link href="/calendario" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para a Agenda
      </Link>
      <AttendanceClient event={event} allMembers={members} />
    </div>
  )
}
