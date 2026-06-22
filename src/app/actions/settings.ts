'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: 'global' }
  })

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: 'global',
        inactivityDays: 20,
        defaultChurchName: 'Lounge For You'
      }
    })
  }

  return settings
}

export async function updateSettings(data: { inactivityDays: number, defaultChurchName: string }) {
  try {
    await prisma.settings.upsert({
      where: { id: 'global' },
      update: {
        inactivityDays: data.inactivityDays,
        defaultChurchName: data.defaultChurchName
      },
      create: {
        id: 'global',
        inactivityDays: data.inactivityDays,
        defaultChurchName: data.defaultChurchName
      }
    })
    
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
