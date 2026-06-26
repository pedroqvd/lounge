import { getSettings, getHubSettings } from '@/app/actions/settings'
import { getCurrentUser, getAllUsers } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'ADMIN') {
    redirect('/')
  }

  const settings = await getSettings()
  const hubSettings = await getHubSettings()
  const users = await getAllUsers()
  
  return <SettingsClient initialSettings={settings} initialHubSettings={hubSettings} users={users} currentUser={currentUser} />
}
