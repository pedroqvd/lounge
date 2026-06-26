import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { taskId, memberId, feedbackText } = await request.json();

    // Mark task as completed
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'COMPLETED' }
    });

    // Get a user for the history
    const defaultUser = await prisma.user.findFirst();

    // Create history
    if (defaultUser && memberId) {
      await prisma.contactHistory.create({
        data: {
          memberId: memberId,
          userId: defaultUser.id,
          customText: `[Resolução de Tarefa Diária]: ${feedbackText}`,
          sentAt: new Date()
        }
      });
      
      // Update invite status
      await prisma.member.update({
         where: { id: memberId },
         data: { inviteStatus: 'FEITO' }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
