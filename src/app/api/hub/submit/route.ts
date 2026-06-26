import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, phone, birthDate, source } = await request.json();

    if (!name || !phone || !birthDate || !source) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Mathematical sanitization of the phone (keep only digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 });
    }

    // Check if phone already exists
    const existingMember = await prisma.member.findFirst({
      where: { phone: cleanPhone }
    });

    let finalNotes = '';
    if (existingMember) {
      finalNotes = `[ALERTA DUPLICIDADE] Número compartilhado com o membro "${existingMember.name}".`;
    }

    // Create visitor
    const newVisitor = await prisma.member.create({
      data: {
        name,
        phone: cleanPhone,
        birthDate: new Date(birthDate),
        source,
        status: 'VISITANTE',
        inviteStatus: 'PENDENTE',
        notes: finalNotes || null
      }
    });

    return NextResponse.json({ success: true, visitor: newVisitor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
