import { getMembers, getGroups } from '@/app/actions/members'
import { getTemplates } from '@/app/actions/templates'
import MembersClient from './MembersClient'

export const dynamic = 'force-dynamic'

export default async function MembrosPage() {
  const [members, groups, templates] = await Promise.all([
    getMembers(),
    getGroups(),
    getTemplates()
  ])

  return <MembersClient initialMembers={members} groups={groups} templates={templates} />
}
