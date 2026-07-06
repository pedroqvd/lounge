import { getAtas } from '@/app/actions/atas'
import AtasClient from './AtasClient'
import { prisma } from '@/lib/prisma'

export default async function AtasPage() {
  const atas = await getAtas()
  const users = await prisma.user.findMany({ select: { id: true, name: true, role: true } })

  return <AtasClient initialAtas={atas} users={users} />
}
