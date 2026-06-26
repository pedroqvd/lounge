import { getMinistries } from '@/app/actions/ministries'
import { getMembers } from '@/app/actions/members'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions/auth'
import EscalasClient from './EscalasClient'

export const dynamic = 'force-dynamic'

export default async function EscalasPage() {
  const [ministries, members, events, currentUser] = await Promise.all([
    getMinistries(),
    getMembers(),
    prisma.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 20
    }),
    getCurrentUser()
  ])

  return <EscalasClient initialMinistries={ministries} members={members} events={events} currentUserEmail={currentUser?.email} />
}
