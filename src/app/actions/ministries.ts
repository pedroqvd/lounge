'use server'

import { getCurrentUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getMinistries() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    return await prisma.ministry.findMany({
      orderBy: { name: 'asc' },
      include: {
        members: {
          include: {
            member: { select: { id: true, name: true, phone: true, status: true } }
          }
        }
      }
    })
  } catch { return [] }
}

export async function getMinistryById(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    return await prisma.ministry.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            member: { select: { id: true, name: true, phone: true, status: true } }
          }
        },
        schedules: {
          include: {
            event: true,
            member: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  } catch { return null }
}

export async function createMinistry(data: { name: string; description?: string; color: string; icon: string }) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    await prisma.ministry.create({ data })
    revalidatePath('/escalas')
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function updateMinistry(id: string, data: { name?: string; description?: string; color?: string; icon?: string }) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    await prisma.ministry.update({ where: { id }, data })
    revalidatePath('/escalas')
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function deleteMinistry(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    await prisma.ministry.delete({ where: { id } })
    revalidatePath('/escalas')
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function addMemberToMinistry(ministryId: string, memberId: string, role: 'VOLUNTARIO' | 'LIDER_MINISTERIO', instrument?: string, position?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    await prisma.ministryMember.create({ data: { ministryId, memberId, role, instrument, position } })
    revalidatePath('/escalas')
    return { success: true }
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: 'Membro ja esta neste ministerio.' }
    return { success: false, error: e.message }
  }
}

export async function updateMinistryMember(id: string, data: { role?: string; instrument?: string; position?: string }) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    await prisma.ministryMember.update({ where: { id }, data: data as any })
    revalidatePath('/escalas')
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function removeMemberFromMinistry(ministryMemberId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    await prisma.ministryMember.delete({ where: { id: ministryMemberId } })
    revalidatePath('/escalas')
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function createScheduleSlot(ministryId: string, eventId: string, memberId: string, position?: string, notes?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    await prisma.scheduleSlot.create({ data: { ministryId, eventId, memberId, position, notes } })
    revalidatePath('/escalas')
    revalidatePath('/calendario')
    return { success: true }
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: 'Membro ja esta escalado para este evento.' }
    return { success: false, error: e.message }
  }
}

export async function updateSlotStatus(slotId: string, status: 'PENDENTE' | 'CONFIRMADO' | 'RECUSADO') {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    await prisma.scheduleSlot.update({ where: { id: slotId }, data: { status } })
    revalidatePath('/escalas')
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function removeScheduleSlot(slotId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    await prisma.scheduleSlot.delete({ where: { id: slotId } })
    revalidatePath('/escalas')
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function getScheduleForEvent(eventId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    return await prisma.scheduleSlot.findMany({
      where: { eventId },
      include: { ministry: true, member: { select: { id: true, name: true } } }
    })
  } catch { return [] }
}

export async function seedMinistries() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const existing = await prisma.ministry.count()
    if (existing > 0) return { success: false, error: 'Ministerios ja existem.' }
    const ministries = [
      { name: 'Louvor', description: 'Ministerio de louvor e adoracao', color: '#8b5cf6', icon: 'music' },
      { name: 'Recepcao', description: 'Acolhimento e recepcao de visitantes', color: '#f59e0b', icon: 'door-open' },
      { name: 'Kids', description: 'Ministerio infantil - criancas e adolescentes', color: '#10b981', icon: 'baby' },
      { name: 'Midia', description: 'Transmissao, fotografia e redes sociais', color: '#3b82f6', icon: 'camera' },
      { name: 'Intercessao', description: 'Grupo de oracao e intercessao', color: '#ef4444', icon: 'heart' },
    ]
    for (const m of ministries) await prisma.ministry.create({ data: m })
    revalidatePath('/escalas')
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}
export async function bulkUpdateScheduleSlots(
  ministryId: string,
  additions: { eventId: string; memberId: string; position: string }[],
  removals: string[]
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');



    await prisma.$transaction(async (tx) => {
      if (removals.length > 0) {
        await tx.scheduleSlot.deleteMany({
          where: { id: { in: removals } }
        })
      }

      if (additions.length > 0) {
        await tx.scheduleSlot.createMany({
          data: additions.map(add => ({
            eventId: add.eventId,
            memberId: add.memberId,
            ministryId,
            position: add.position,
            status: 'CONFIRMADO',
            notified: false
          }))
        })
      }
    })

    revalidatePath('/escalas')
    revalidatePath(`/escalas/${ministryId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error in bulk update:', error)
    return { success: false, error: error.message }
  }
}