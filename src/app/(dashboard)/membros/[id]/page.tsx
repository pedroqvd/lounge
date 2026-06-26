import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProfileClient from './ProfileClient'
import { getMemberProfile } from '@/app/actions/members'
import { getCurrentUser } from '@/app/actions/auth'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const member = await getMemberProfile(params.id)
  const currentUser = await getCurrentUser()

  if (!member) {
    notFound()
  }

  // To not break anything, we still need member.audits. Let's fetch them if missing.
  // Wait, I should just fetch it all here or update getMemberProfile.
  // getMemberProfile didn't fetch audits. Let me do it safely:
  const audits = await prisma.memberAudit.findMany({
    where: { memberId: params.id },
    orderBy: { createdAt: 'desc' }
  })
  
  const memberWithAudits = { ...member, audits }

  const groups = await prisma.group.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="space-y-6">
      <Link href="/membros" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Membros
      </Link>
      
      <ProfileClient member={memberWithAudits} groups={groups} currentUser={currentUser} />
    </div>
  )
}
