'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const supabase = createClient()
  
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()
  
  if (!supabaseUser || !supabaseUser.email) {
    return null
  }

  // Check if user exists in Prisma
  let prismaUser = await prisma.user.findUnique({
    where: { email: supabaseUser.email }
  })

  if (!prismaUser) {
    // Determine initial role (Specific instruction: pquevedo2011.ph@gmail.com is ADMIN)
    const initialRole = supabaseUser.email === 'pquevedo2011.ph@gmail.com' ? 'ADMIN' : 'LIDER'
    
    prismaUser = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
        role: initialRole
      }
    })
  }

  return prismaUser
}

export async function getAllUsers() {
  const currentUser = await getCurrentUser()
  if (currentUser?.role !== 'ADMIN') throw new Error('Unauthorized')
  
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })
}

export async function updateUserRole(userId: string, role: 'ADMIN' | 'LIDER') {
  const currentUser = await getCurrentUser()
  if (currentUser?.role !== 'ADMIN') throw new Error('Unauthorized')
  
  // Prevent removing own admin
  if (currentUser.id === userId && role !== 'ADMIN') {
    return { success: false, error: 'Você não pode remover seu próprio acesso de Administrador.' }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role }
  })
  return { success: true }
}
