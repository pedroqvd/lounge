import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // 1. ANIVERSARIANTES
    const members = await prisma.member.findMany({
      where: {
        status: { in: ['ATIVO', 'VISITANTE', 'DISCIPULADO'] },
        birthDate: { not: null }
      }
    });

    const birthdaysToday = members.filter(m => {
      if (!m.birthDate) return false;
      const bDate = new Date(m.birthDate);
      return bDate.getMonth() === currentMonth && bDate.getDate() === currentDay;
    });

    let bCount = 0;
    for (const member of birthdaysToday) {
      // Verifica se já existe uma tarefa hoje
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);

      const existingTask = await prisma.task.findFirst({
        where: {
          memberId: member.id,
          type: 'BIRTHDAY',
          createdAt: {
            gte: startOfDay
          }
        }
      });

      if (!existingTask) {
        await prisma.task.create({
          data: {
            title: `Aniversário de ${member.name}`,
            description: 'Envie uma mensagem de felicitação pelo WhatsApp.',
            type: 'BIRTHDAY',
            status: 'PENDING',
            dueDate: today,
            memberId: member.id
          }
        });
        bCount++;
      }
    }

    // 2. VISITANTES (ACOMPANHAMENTO DE 3 DIAS)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const startOfThreeDaysAgo = new Date(threeDaysAgo);
    startOfThreeDaysAgo.setHours(0,0,0,0);
    const endOfThreeDaysAgo = new Date(threeDaysAgo);
    endOfThreeDaysAgo.setHours(23,59,59,999);

    const recentVisitors = await prisma.member.findMany({
      where: {
        status: 'VISITANTE',
        createdAt: {
          gte: startOfThreeDaysAgo,
          lte: endOfThreeDaysAgo
        }
      }
    });

    let vCount = 0;
    for (const visitor of recentVisitors) {
      const existingTask = await prisma.task.findFirst({
        where: {
          memberId: visitor.id,
          type: 'FOLLOW_UP'
        }
      });

      if (!existingTask) {
        await prisma.task.create({
          data: {
            title: `Acompanhamento: ${visitor.name}`,
            description: 'Este visitante veio há 3 dias. Entre em contato para consolidar e saber como foi a experiência.',
            type: 'FOLLOW_UP',
            status: 'PENDING',
            dueDate: today,
            memberId: visitor.id,
          }
        });
        vCount++;
      }
    }

    return NextResponse.json({ success: true, birthdaysCreated: bCount, visitorsCreated: vCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
