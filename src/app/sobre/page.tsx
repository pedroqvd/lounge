import { prisma } from '@/lib/prisma'
import SobreClient from './SobreClient'

export const dynamic = 'force-dynamic'

export default async function SobrePage() {
  let globalSettings = await prisma.settings.findUnique({
    where: { id: 'global' }
  })

  let settings = await prisma.hubSettings.findUnique({
    where: { id: 'global' }
  })

  return <SobreClient globalSettings={globalSettings} settings={settings} />
}
