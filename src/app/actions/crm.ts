'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateMemberNotes(memberId: string, notes: string) {
  try {
    await prisma.member.update({
      where: { id: memberId },
      data: { notes }
    })
    
    revalidatePath(`/membros/${memberId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateMemberMinisterial(memberId: string, data: any) {
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
    
    revalidatePath(`/membros/${memberId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
