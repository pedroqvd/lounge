import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CheckinClient from './CheckinClient'

export default async function CheckinPage({ params }: { params: { eventId: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
    select: { id: true, title: true, date: true, type: true }
  })

  if (!event) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <CheckinClient event={event} />
    </div>
  )
}
