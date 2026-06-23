import { getMembers, getGroups } from '@/app/actions/members'
import { getTemplates } from '@/app/actions/templates'
import { getCurrentUser } from '@/app/actions/auth'
import MembersClient from './MembersClient'

export const dynamic = 'force-dynamic'

export default async function MembrosPage() {
  const [members, groups, templates, currentUser] = await Promise.all([
    getMembers(),
    getGroups(),
    getTemplates(),
    getCurrentUser()
  ])

  return <MembersClient initialMembers={members} groups={groups} templates={templates} userRole={currentUser?.role || 'LIDER'} />
}
