'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateMemberNotes(memberId: string, notes: string, userName: string) {
  try {
    await prisma.member.update({
      where: { id: memberId },
      data: { notes }
    })
    
    await prisma.memberAudit.create({
      data: { memberId, userName, action: 'Atualizou as Anotações Pastorais' }
    })

    revalidatePath(`/membros/${memberId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateMemberMinisterial(memberId: string, data: any, userName: string) {
  try {
    await prisma.member.update({
      where: { id: memberId },
      data: {
        address: data.address,
        city: data.city,
        neighborhood: data.neighborhood,
        joinDate: data.joinDate ? new Date(data.joinDate) : null,
        baptizeDate: data.baptizeDate ? new Date(data.baptizeDate) : null,
        isBaptized: data.isBaptized
      }
    })
    
    await prisma.memberAudit.create({
      data: { memberId, userName, action: 'Atualizou os Dados Ministeriais e de Endereço' }
    })

    revalidatePath(`/membros/${memberId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateMemberProfile(memberId: string, data: any, userName: string) {
  try {
    await prisma.member.update({
      where: { id: memberId },
      data: {
        name: data.name,
        phone: data.phone,
        status: data.status,
        groupId: data.groupId || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        photoUrl: data.photoUrl || null
      }
    })
    
    await prisma.memberAudit.create({
      data: { memberId, userName, action: 'Atualizou os Dados Cadastrais Básicos (Nome, Foto, Status...)' }
    })

    revalidatePath(`/membros/${memberId}`)
    revalidatePath('/membros')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
