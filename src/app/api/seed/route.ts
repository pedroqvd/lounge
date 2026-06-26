import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const usersToSeed = [
      { email: 'gerciane@lounge.com', name: 'gerciane', role: 'LIDER' },
      { email: 'cheni@lounge.com', name: 'cheni', role: 'ADMIN' },
      { email: 'sistema@loungeforyou.com', name: 'Sistema', role: 'ADMIN' }
    ];

    let count = 0;
    for (const u of usersToSeed) {
      const exists = await prisma.user.findUnique({ where: { email: u.email } });
      if (!exists) {
        await prisma.user.create({
          data: {
            id: uuidv4(),
            email: u.email,
            name: u.name,
            role: u.role as any
          }
        });
        count++;
      }
    }
    return NextResponse.json({ success: true, message: `${count} contas sincronizadas com o banco de dados!` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
