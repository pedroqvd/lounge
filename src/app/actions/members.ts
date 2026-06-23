'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'
import { MemberStatus } from '@prisma/client'

// SEED DATABASE
export async function seedMembers() {
  try {
    // Read the seed file
    const filePath = path.join(process.cwd(), 'src/data/seed-members.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const membersData = JSON.parse(fileContent)

    let count = 0

    for (const data of membersData) {
      // Find or create group
      let group = null
      if (data.groupName) {
        group = await prisma.group.findFirst({
          where: { name: data.groupName }
        })
        if (!group) {
          group = await prisma.group.create({
            data: { name: data.groupName }
          })
        }
      }

      // Format status
      const status = data.status as MemberStatus

      // Check if member already exists (by phone if not empty, otherwise by name)
      let exists = false
      if (data.phone && data.phone.trim() !== '') {
        const existingMember = await prisma.member.findFirst({
          where: { phone: data.phone }
        })
        if (existingMember) exists = true
      } else {
        const existingMember = await prisma.member.findFirst({
          where: { name: data.name }
        })
        if (existingMember) exists = true
      }

      if (!exists) {
        await prisma.member.create({
          data: {
            name: data.name,
            phone: data.phone || null,
            status: status,
            notes: data.notes || null,
            groupId: group ? group.id : null,
          }
        })
        count++
      }
    }

    revalidatePath('/membros')
    revalidatePath('/')
    return { success: true, count }
  } catch (error: any) {
    console.error('Failed to seed:', error)
    return { success: false, error: error.message }
  }
}

// GET ALL MEMBERS
export async function getMembers() {
  try {
    const members = await prisma.member.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        inviteStatus: true,
        groupId: true,
        group: {
          select: {
            name: true,
            liderId: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    return members
  } catch (error: any) {
    return []
  }
}

// GET ALL GROUPS
export async function getGroups() {
  try {
    return await prisma.group.findMany({ orderBy: { name: 'asc' } })
  } catch (error) {
    return []
  }
}

// CREATE MEMBER
export async function createMember(data: { name: string, phone?: string, status: string, groupId?: string, email?: string, notes?: string }) {
  try {
    const member = await prisma.member.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        status: data.status as MemberStatus,
        groupId: data.groupId || null,
        email: data.email || null,
        notes: data.notes || null,
      }
    })

    const settings = await prisma.settings.findUnique({ where: { id: 'global' } })
    if (settings?.webhookUrl) {
      fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', member })
      }).catch(err => console.error('Webhook error:', err))
    }

    revalidatePath('/membros')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// UPDATE MEMBER
export async function updateMember(id: string, data: { name: string, phone?: string, status: string, groupId?: string, email?: string, notes?: string }) {
  try {
    const member = await prisma.member.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone || null,
        status: data.status as MemberStatus,
        groupId: data.groupId || null,
        email: data.email || null,
        notes: data.notes || null,
      }
    })

    const settings = await prisma.settings.findUnique({ where: { id: 'global' } })
    if (settings?.webhookUrl) {
      fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE', member })
      }).catch(err => console.error('Webhook error:', err))
    }

    revalidatePath('/membros')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// DELETE MEMBER
export async function deleteMember(id: string) {
  try {
    const { getCurrentUser } = await import('./auth')
    const currentUser = await getCurrentUser()
    if (currentUser?.role !== 'ADMIN') {
      return { success: false, error: 'Apenas Administradores podem deletar membros.' }
    }

    await prisma.member.delete({
      where: { id }
    })
    revalidatePath('/membros')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateMemberInviteStatus(id: string, inviteStatus: string) {
  try {
    await prisma.member.update({
      where: { id },
      data: { inviteStatus: inviteStatus as any }
    })
    revalidatePath('/membros')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
