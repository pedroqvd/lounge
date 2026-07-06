'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'

export async function getAtas(category?: 'REUNIAO' | 'DESPACHO' | 'TRAMITACAO' | 'FEEDBACK') {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const atas = await prisma.ata.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, role: true } },
      assignee: { select: { id: true, name: true, role: true } }
    }
  })
  
  return atas
}

export async function getMyAssignments() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const assignments = await prisma.ata.findMany({
    where: { 
      assignedTo: user.id,
      status: { not: 'CONCLUIDO' }
    },
    orderBy: { dueDate: 'asc' },
    include: {
      author: { select: { id: true, name: true, role: true } }
    }
  })
  
  return assignments
}

export async function getGlobalAssignments() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error('Not authorized')

  const assignments = await prisma.ata.findMany({
    where: { 
      assignedTo: { not: null },
      status: { not: 'CONCLUIDO' }
    },
    orderBy: { dueDate: 'asc' },
    include: {
      author: { select: { id: true, name: true, role: true } },
      assignee: { select: { id: true, name: true, role: true } }
    }
  })
  
  return assignments
}

export async function createAta(data: {
  title: string
  content: string
  category: 'REUNIAO' | 'DESPACHO' | 'TRAMITACAO' | 'FEEDBACK'
  status?: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  date?: Date
  dueDate?: Date
  assignedTo?: string
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const ata = await prisma.ata.create({
    data: {
      title: data.title,
      content: data.content,
      category: data.category,
      status: data.status || 'ABERTO',
      date: data.date || new Date(),
      dueDate: data.dueDate,
      assignedTo: data.assignedTo || null,
      authorId: user.id
    }
  })

  revalidatePath('/atas')
  revalidatePath('/painel')
  return ata
}

export async function updateAta(id: string, data: {
  title?: string
  content?: string
  category?: 'REUNIAO' | 'DESPACHO' | 'TRAMITACAO' | 'FEEDBACK'
  status?: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  date?: Date
  dueDate?: Date
  assignedTo?: string
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  // Check permissions: ONLY admin or the author or the assignee can edit
  const existingAta = await prisma.ata.findUnique({ where: { id } })
  if (!existingAta) throw new Error('Ata not found')
  
  if (user.role !== 'ADMIN' && existingAta.authorId !== user.id && existingAta.assignedTo !== user.id) {
    throw new Error('Not authorized to update this ata')
  }

  const ata = await prisma.ata.update({
    where: { id },
    data: {
      ...data,
      assignedTo: data.assignedTo === '' ? null : data.assignedTo
    }
  })

  revalidatePath('/atas')
  revalidatePath('/painel')
  return ata
}

export async function deleteAta(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const existingAta = await prisma.ata.findUnique({ where: { id } })
  if (!existingAta) throw new Error('Ata not found')
  
  if (user.role !== 'ADMIN' && existingAta.authorId !== user.id) {
    throw new Error('Not authorized to delete this ata')
  }

  await prisma.ata.delete({ where: { id } })
  revalidatePath('/atas')
  revalidatePath('/painel')
  return true
}
