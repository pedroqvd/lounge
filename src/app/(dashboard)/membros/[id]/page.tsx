import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProfileClient from './ProfileClient'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: {
      group: true,
      audits: {
        orderBy: { createdAt: 'desc' }
      },
      histories: {
        include: { template: true, user: true },
        orderBy: { sentAt: 'desc' }
      }
    }
  })

  if (!member) {
    notFound()
  }

  const groups = await prisma.group.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="space-y-6">
      <Link href="/membros" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Membros
      </Link>
      
      <ProfileClient member={member} groups={groups} />
    </div>
  )
}
