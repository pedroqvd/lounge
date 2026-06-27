'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'
import { MemberStatus } from '@prisma/client'
import { getCurrentUser } from './auth'

async function logAudit(memberId: string, action: string) {
  const currentUser = await getCurrentUser()
  const userName = currentUser?.name || 'Sistema'
  
  await prisma.memberAudit.create({
    data: {
      memberId,
      userName,
      action
    }
  })
}

// GET ALL MEMBERS (ACTIVE ONLY)
export async function getMembers() {
  try {
    const recentCultos = await prisma.event.findMany({
      where: { type: 'CULTO', date: { lte: new Date() } },
      orderBy: { date: 'desc' },
      take: 4,
      select: { id: true }
    });
    const eventIds = recentCultos.map(e => e.id);

    const members = await prisma.member.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        inviteStatus: true,
        groupId: true,
        isDeleted: true,
        group: { select: { name: true, liderId: true } },
        attendances: {
          where: { eventId: { in: eventIds }, isPresent: true },
          select: { eventId: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return members.map(m => {
      const recentAttendances = eventIds.map(id => m.attendances.some(a => a.eventId === id));
      return { ...m, recentAttendances };
    })
  } catch (error: any) {
    return []
  }
}

// GET DELETED MEMBERS
export async function getDeletedMembers() {
  try {
    const currentUser = await getCurrentUser()
    if (currentUser?.role !== 'ADMIN') return []

    return await prisma.member.findMany({
      where: { isDeleted: true },
      select: {
        id: true, name: true, phone: true, status: true, deletedAt: true,
        group: { select: { name: true } }
      },
      orderBy: { deletedAt: 'desc' }
    })
  } catch (error) {
    return []
  }
}

// GET MEMBER PROFILE
export async function getMemberProfile(id: string) {
  try {
    return await prisma.member.findUnique({
      where: { id },
      include: {
        group: true,
        histories: { orderBy: { sentAt: 'desc' }, include: { user: { select: { name: true } }, template: { select: { name: true } } } },
        attendances: { orderBy: { createdAt: 'desc' }, include: { event: true } },
        audits: { orderBy: { createdAt: 'desc' } }
      }
    })
  } catch (error) {
    return null
  }
}

// GET ALL GROUPS
export async function getGroups() {
  try { return await prisma.group.findMany({ orderBy: { name: 'asc' } }) }
  catch (error) { return [] }
}

// CREATE MEMBER
export async function createMember(data: { name: string, phone?: string, status: string, groupId?: string, email?: string, notes?: string }) {
  try {
    const member = await prisma.member.create({
      data: {
        name: data.name, phone: data.phone || null, status: data.status as MemberStatus,
        groupId: data.groupId || null, email: data.email || null, notes: data.notes || null,
      }
    })
    await logAudit(member.id, 'Criou o cadastro de ' + data.name)
    revalidatePath('/membros')
    revalidatePath('/painel')
    return { success: true }
  } catch (error: any) { return { success: false, error: error.message } }
}

// UPDATE MEMBER
export async function updateMember(id: string, data: { name: string, phone?: string, status: string, groupId?: string, email?: string, notes?: string }) {
  try {
    const old = await prisma.member.findUnique({ where: { id } })
    
    const member = await prisma.member.update({
      where: { id },
      data: {
        name: data.name, phone: data.phone || null, status: data.status as MemberStatus,
        groupId: data.groupId || null, email: data.email || null, notes: data.notes || null,
      }
    })

    if (old?.status !== data.status) {
      await logAudit(id, `Alterou o Status de ${old?.status} para ${data.status}`)
    } else {
      await logAudit(id, 'Atualizou os dados de perfil (Edição geral)')
    }

    revalidatePath('/membros')
    revalidatePath('/painel')
    return { success: true }
  } catch (error: any) { return { success: false, error: error.message } }
}

// SOFT DELETE
export async function deleteMember(id: string) {
  try {
    const currentUser = await getCurrentUser()
    if (currentUser?.role !== 'ADMIN') return { success: false, error: 'Apenas Administradores.' }

    await prisma.member.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    })
    await logAudit(id, 'Movel o cadastro para a Lixeira (Soft Delete)')
    revalidatePath('/membros')
    revalidatePath('/painel')
    return { success: true }
  } catch (error: any) { return { success: false, error: error.message } }
}

// RESTORE MEMBER
export async function restoreMember(id: string) {
  try {
    const currentUser = await getCurrentUser()
    if (currentUser?.role !== 'ADMIN') return { success: false, error: 'Apenas Administradores.' }

    await prisma.member.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null }
    })
    await logAudit(id, 'Restaurou o cadastro da Lixeira')
    revalidatePath('/membros')
    return { success: true }
  } catch (error: any) { return { success: false, error: error.message } }
}

// HARD DELETE
export async function hardDeleteMember(id: string) {
  try {
    const currentUser = await getCurrentUser()
    if (currentUser?.role !== 'ADMIN') return { success: false, error: 'Apenas Administradores.' }

    await prisma.member.delete({ where: { id } })
    revalidatePath('/membros')
    return { success: true }
  } catch (error: any) { return { success: false, error: error.message } }
}

export async function updateMemberInviteStatus(id: string, inviteStatus: string) {
  try {
    const old = await prisma.member.findUnique({ where: { id } })
    await prisma.member.update({ where: { id }, data: { inviteStatus: inviteStatus as any } })
    await logAudit(id, `Alterou o Convite para HH de ${old?.inviteStatus} para ${inviteStatus}`)
    revalidatePath('/membros')
    return { success: true }
  } catch (error: any) { return { success: false, error: error.message } }
}

// SEED DATABASE
export async function seedMembers() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/seed-members.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const membersData = JSON.parse(fileContent)
    let count = 0
    for (const data of membersData) {
      let group = null
      if (data.groupName) {
        group = await prisma.group.findFirst({ where: { name: data.groupName } })
        if (!group) group = await prisma.group.create({ data: { name: data.groupName } })
      }
      const status = data.status as MemberStatus
      let exists = false
      if (data.phone && data.phone.trim() !== '') {
        const existingMember = await prisma.member.findFirst({ where: { phone: data.phone } })
        if (existingMember) exists = true
      } else {
        const existingMember = await prisma.member.findFirst({ where: { name: data.name } })
        if (existingMember) exists = true
      }
      if (!exists) {
        const m = await prisma.member.create({
          data: { name: data.name, phone: data.phone || null, status: status, notes: data.notes || null, groupId: group ? group.id : null }
        })
        await logAudit(m.id, 'Importado via Seed/Planilha')
        count++
      }
    }
    revalidatePath('/membros')
    revalidatePath('/painel')
    return { success: true, count }
  } catch (error: any) { return { success: false, error: error.message } }
}
export async function updateGroup(id: string, data: { address?: string; neighborhood?: string; mapUrl?: string; contactPhone?: string }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return { success: false, error: 'Não autorizado' }

    await prisma.group.update({ where: { id }, data })
    revalidatePath('/configuracoes')
    revalidatePath('/')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function updateMemberPhoto(memberId: string, photoUrl: string) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')
    
    await prisma.member.update({
      where: { id: memberId },
      data: { photoUrl }
    })
    
    await logAction('Atualizou a foto de perfil do membro', 'MEMBER', memberId, `Nova URL: ${photoUrl}`)
  } catch (error) {
    console.error('Error updating member photo:', error)
    throw error
  }
}
