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
        defaultChurchName: 'Lounge For You',
        leaders: [],
        areas: []
      }
    })
  }

  return settings
}

export async function updateSettings(data: { inactivityDays: number, defaultChurchName: string, leaders?: string[], areas?: string[], primaryColor?: string, themeMode?: string, webhookUrl?: string }) {
  try {
    await prisma.settings.upsert({
      where: { id: 'global' },
      update: {
        inactivityDays: data.inactivityDays,
        defaultChurchName: data.defaultChurchName,
        leaders: data.leaders,
        areas: data.areas,
        primaryColor: data.primaryColor,
        themeMode: data.themeMode,
        webhookUrl: data.webhookUrl
      },
      create: {
        id: 'global',
        inactivityDays: data.inactivityDays,
        defaultChurchName: data.defaultChurchName,
        leaders: data.leaders || [],
        areas: data.areas || [],
        primaryColor: data.primaryColor || '#4A3AFF',
        themeMode: data.themeMode || 'system',
        webhookUrl: data.webhookUrl || ''
      }
    })
    
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getHubSettings() {
  let settings = await prisma.hubSettings.findUnique({
    where: { id: 'global' }
  })
  if (!settings) {
    settings = await prisma.hubSettings.create({
      data: { id: 'global' }
    })
  }
  return settings
}

export async function updateHubSettings(data: any) {
  try {
    await prisma.hubSettings.upsert({
      where: { id: 'global' },
      update: {
        title: data.title,
        heroSubtitle: data.heroSubtitle,
        mission: data.mission,
        vision: data.vision,
        values: data.values,
        hhsInfo: data.hhsInfo,
        whatsappGroupUrl: data.whatsappGroupUrl,
        instagramUrl: data.instagramUrl
      },
      create: {
        id: 'global',
        title: data.title || "Bem-vindo!",
        heroSubtitle: data.heroSubtitle || "",
        mission: data.mission || "",
        vision: data.vision || "",
        values: data.values || "",
        hhsInfo: data.hhsInfo || "",
        whatsappGroupUrl: data.whatsappGroupUrl,
        instagramUrl: data.instagramUrl
      }
    })
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
