'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const rawData = `Maria Clara	61996985175
Larissa	61981897994
Julia Raquel	61 8144-1915
Luiza Prevato	47 9276-0994
Sarah	61 9307-4716
Caio Matheus	61 998024769
Yanne	61991859106
Geovanna	61 9430-0592
Ana Bia 	61 9676-6521
Kaique	61993593085
Bernardo	 61998569929
Rafaela	61 9917-3001
Carlos Eduardo	61984060201
Calebe	61986415471
Nayane	61993097914
Waleska	61992954894
Marjorie	61 9187-9156
Ana Julia	61 8193-1560
Clara Paniago	61 9881-1603
Rebeca	61982615322
Gui da Beca	61983197416
Isaac	
Emily (namorada do Isaac)	
Fernanda Drummond	61 98112-6619
Beatriz Almeida	61 8501-4706
Gege	61 9855-0590
Pedro Quevedo	61 8142-2511
Rafael Pereira	61 9693-6985
Saidy	61 8198-4685
João Gabriel 	61 8200-1150
Ana Clara	61 8422-3106
Julio Prado	61994508150
Murilo Meireles	61 9884-8854
Arthur Assis	61 998150808
Marcos Paulo	61 9422-3260
João Rubens	61 9234-7067
João Pedro	61 9661-0293
Daniel 	61 99666-6962
Matheus Cundari	619873-2308
Patrick 	61995139393
André	61981702018
Luiggi	61 993767887
Sergio	61995636167
Natália Dias	61981611355
Luíza Ricon	6198129-0433
Yasnáia	6199265-4481
Eloá	61 9946-0701
Aline Bernardes Mingati 	61991388937
Arthur Machado	55984414514
Alan Ximenes	61992343670
Isa (filha raquel) 	61982964408
Isa Grativol	61 8300-8525
Paloma	61 8292-1137
Anna Arlinda	61 9802-4769
Brenno	61991516170
André Luiz	61984406247
Dorival	61 983580989
Cibelle	61 99224-8281
Priscilla	61981374666
Gabriela filha da Michelli	61985833145
Fernando	61999291574
Rafa HH	61999173001
Eliabe	61995119686
Camilly	61981891785
Giovani	61983250428
Anna Luzia	61991414963
Bella	61 9639-8821
Cauã Dias	61992820743
Arthur	61996763319
Victor Freitas	61982731510
Ana Clara	61999757151
Rafaella Salles	(22) 988781880
Victoria	61984630186
Rodrigo	13 997874497 
Calebe Mendes de Paula 	61981879536
Lucas ulysses	@lucas_orlando23
Pedro Henrique Paulini	61991194956
Junhão	(61) 9 9906-0904
Esther 	61994360128
Laís 	61998146904
Thainara Nobre 	(61) 983595748
Letícia Dutra	61999421638
Ana Carolina Borges	61984035181
Esther Valentia	61981568307
Thiago Rezende 	619614-1515
Vini Alves	619676-3050
Miguel	6199832-0109
Kayo Fernando Passos Alexandre	61 99414-8488
João Manoel	61981803372
Pedro Paulo	61982922266
Nathanael	61998342124
Cassia	61994465700
Mauricio	61993973901
Jess (amiga Manu) 	61 9155-7685`

export async function executeImport() {
  // CLEANUP: If there was a giant bad block imported previously, remove it
  const badMembers = await prisma.member.findMany({
    where: {
      name: { contains: '\n' }
    }
  })
  for (const b of badMembers) {
    await prisma.contactHistory.deleteMany({ where: { memberId: b.id } })
    await prisma.attendance.deleteMany({ where: { memberId: b.id } })
    await prisma.member.delete({ where: { id: b.id } })
  }

  const lines = rawData.split('\n')
  let added = 0
  let skipped = 0

  for (const line of lines) {
    if (!line.trim()) continue

    const parts = line.split('\t')
    const name = parts[0]?.trim()
    let phone = parts.length > 1 ? parts[1]?.trim() : null

    if (!name) continue

    // check if exists by name
    const existingByName = await prisma.member.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingByName) {
      skipped++
      continue
    }

    // format phone if possible
    if (phone && phone.startsWith('@')) {
      // keep instagram username
    } else if (phone) {
      // clean phone
      const digits = phone.replace(/\\D/g, '')
      if (digits.length >= 10) {
        phone = digits
      }
    }

    // check by phone
    if (phone) {
      const existingByPhone = await prisma.member.findFirst({
        where: { phone }
      })
      if (existingByPhone) {
        skipped++
        continue
      }
    }

    // add to db
    await prisma.member.create({
      data: {
        name,
        phone: phone || null,
        status: 'VISITANTE', // default status
      }
    })
    added++
  }

  revalidatePath('/membros')
  revalidatePath('/')
  
  return { success: true, added, skipped }
}
