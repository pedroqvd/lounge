import { getMinistryById } from '@/app/actions/ministries'
import { getMembers } from '@/app/actions/members'
import { prisma } from '@/lib/prisma'
import MinistryDetailClient from './MinistryDetailClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MinistryPage({ params }: { params: { ministryId: string } }) {
  const [ministry, members, upcomingEvents] = await Promise.all([
    getMinistryById(params.ministryId),
    getMembers(),
    prisma.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 10,
      include: {
        scheduleSlots: {
          where: { ministryId: params.ministryId },
          include: { member: { select: { id: true, name: true } } }
        }
      }
    })
  ])

  if (!ministry) notFound()

  return <MinistryDetailClient ministry={ministry} members={members} upcomingEvents={upcomingEvents} />
}
