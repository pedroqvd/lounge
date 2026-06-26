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

  return <WelcomeClient settings={settings} globalSettings={globalSettings} />
}
