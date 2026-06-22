'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createEvent(data: { title: string, date: string, description?: string }) {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        description: data.description
      }
    })
    revalidatePath('/calendario')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteEvent(id: string) {
  try {
    await prisma.event.delete({
      where: { id }
    })
    revalidatePath('/calendario')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateAttendance(eventId: string, memberId: string, isPresent: boolean) {
  try {
    await prisma.attendance.upsert({
      where: {
        eventId_memberId: {
          eventId,
          memberId
        }
      },
      update: {
        isPresent
      },
      create: {
        eventId,
        memberId,
        isPresent
      }
    })
    revalidatePath(`/calendario/${eventId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
