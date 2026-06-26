import { prisma } from '@/lib/prisma'
import WelcomeClient from './WelcomeClient'

export const dynamic = 'force-dynamic'

export default async function WelcomePage() {
  let settings = await prisma.hubSettings.findUnique({
    where: { id: 'global' }
  })
  if (!settings) {
    settings = await prisma.hubSettings.create({ data: { id: 'global' } })
  }
  
  let globalSettings = await prisma.settings.findUnique({
    where: { id: 'global' }
  })

  const hhs = await prisma.group.findMany({
    where: { mapUrl: { not: null } },
    select: { name: true, address: true, neighborhood: true, mapUrl: true, contactPhone: true }
  })

  return <WelcomeClient settings={settings} globalSettings={globalSettings} hhs={hhs} />
}
