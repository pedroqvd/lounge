'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions/auth'

export async function logAction(
  action: string,
  resource: string,
  resourceId?: string,
  details?: string
) {
  try {
    const user = await getCurrentUser()
    if (!user) return

    await prisma.systemAudit.create({
      data: {
        userName: user.name,
        action,
        resource,
        resourceId,
        details
      }
    })
  } catch (error) {
    console.error('Falha ao gravar log de auditoria:', error)
  }
}

export async function getAuditLogs(page = 1, limit = 50) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized')

  const skip = (page - 1) * limit

  const logs = await prisma.systemAudit.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' }
  })

  const total = await prisma.systemAudit.count()

  return { logs, total, totalPages: Math.ceil(total / limit) }
}
