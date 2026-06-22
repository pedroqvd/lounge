import { getMembers, getGroups } from '@/app/actions/members'
import MembersClient from './MembersClient'

export const dynamic = 'force-dynamic'

export default async function MembrosPage() {
  const [members, groups] = await Promise.all([
    getMembers(),
    getGroups()
  ])

  return <MembersClient initialMembers={members} groups={groups} />
}
