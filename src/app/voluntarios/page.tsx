import { prisma } from '@/lib/prisma'
import VoluntariosClient from './VoluntariosClient'
import { getMinistries } from '@/app/actions/ministries'

export const dynamic = 'force-dynamic'

export default async function VoluntariosPage() {
  const ministries = await getMinistries()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingEvents = await prisma.event.findMany({
    where: { date: { gte: today } },
    orderBy: { date: 'asc' },
    include: {
      scheduleSlots: {
        include: { 
          member: { select: { id: true, name: true } },
          ministry: { select: { id: true, name: true, color: true, icon: true } }
        }
      }
    }
  })

  return <VoluntariosClient ministries={ministries} events={upcomingEvents} />
}
