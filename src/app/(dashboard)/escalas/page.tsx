import { getMinistries } from '@/app/actions/ministries'
import { getMembers } from '@/app/actions/members'
import { prisma } from '@/lib/prisma'
import EscalasClient from './EscalasClient'

export const dynamic = 'force-dynamic'

export default async function EscalasPage() {
  const [ministries, members, events] = await Promise.all([
    getMinistries(),
    getMembers(),
    prisma.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 20
    })
  ])

  return <EscalasClient initialMinistries={ministries} members={members} events={events} />
}
