'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Helper to get or create a default user for logging
async function getDefaultUserId() {
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Sistema',
        email: 'sistema@loungeforyou.com',
        role: 'ADMIN',
      }
    })
  }
  return user.id
}

export async function createContactHistory(data: { memberId: string, templateId?: string, customText?: string, notes?: string }) {
  try {
    const userId = await getDefaultUserId()
    
    await prisma.contactHistory.create({
      data: {
        memberId: data.memberId,
        userId: userId,
        templateId: data.templateId || null,
        customText: data.customText || null,
        notes: data.notes || null,
      }
    })
    
    // Revalidate dashboard to update the 'Mensagens Enviadas' counter
    revalidatePath('/')
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
