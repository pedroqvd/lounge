'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

import { addWeeks, addMonths, isBefore, isSameDay } from 'date-fns'

export async function createEvent(data: { 
  title: string, 
  date: string, 
  type: string, 
  time?: string, 
  location?: string, 
  description?: string,
  isRecurring?: boolean,
  recurrenceType?: 'SEMANAL' | 'MENSAL',
  recurrenceEnd?: string
}) {
  try {
    const startDate = new Date(data.date)
    const eventsToCreate = []
    
    if (data.isRecurring && data.recurrenceType && data.recurrenceEnd) {
      let currentDate = startDate
      const endDate = new Date(data.recurrenceEnd)
      
      let count = 0
      while ((isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) && count < 52) {
        eventsToCreate.push({
          title: data.title,
          date: currentDate,
          type: data.type,
          time: data.time || null,
          location: data.location || null,
          description: data.description || null
        })
        
        if (data.recurrenceType === 'SEMANAL') {
          currentDate = addWeeks(currentDate, 1)
        } else {
          currentDate = addMonths(currentDate, 1)
        }
        count++
      }
    } else {
      eventsToCreate.push({
        title: data.title,
        date: startDate,
        type: data.type,
        time: data.time || null,
        location: data.location || null,
        description: data.description || null
      })
    }

    await prisma.event.createMany({
      data: eventsToCreate
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


export async function updateEvent(id: string, data: {
  title: string
  date: string
  type: string
  time?: string
  location?: string
  description?: string
}) {
  try {
    await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        date: new Date(data.date),
        type: data.type,
        time: data.time || null,
        location: data.location || null,
        description: data.description || null,
      }
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

export async function memberSelfCheckin(eventId: string, identifier: string) {
  try {
    // Busca membro pelo nome (exato) ou telefone
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { name: { equals: identifier, mode: 'insensitive' } }
        ]
      }
    })

    if (!member) {
      return { success: false, error: 'Membro não encontrado com este nome ou telefone. Procure a recepção.' }
    }

    await prisma.attendance.upsert({
      where: {
        eventId_memberId: {
          eventId,
          memberId: member.id
        }
      },
      update: {
        isPresent: true
      },
      create: {
        eventId,
        memberId: member.id,
        isPresent: true
      }
    })

    revalidatePath(`/calendario/${eventId}`)
    return { success: true, memberName: member.name }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
