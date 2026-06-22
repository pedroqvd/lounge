'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// GET ALL TEMPLATES
export async function getTemplates() {
  try {
    return await prisma.template.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    return []
  }
}

// CREATE TEMPLATE
export async function createTemplate(data: { name: string, category: string, content: string }) {
  try {
    await prisma.template.create({
      data: {
        name: data.name,
        category: data.category,
        content: data.content,
        isActive: true,
      }
    })
    revalidatePath('/templates')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// UPDATE TEMPLATE
export async function updateTemplate(id: string, data: { name: string, category: string, content: string }) {
  try {
    await prisma.template.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        content: data.content,
      }
    })
    revalidatePath('/templates')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// DELETE TEMPLATE
export async function deleteTemplate(id: string) {
  try {
    await prisma.template.delete({
      where: { id }
    })
    revalidatePath('/templates')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
