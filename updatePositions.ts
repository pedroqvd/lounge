import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const members = await prisma.ministryMember.findMany()
  for (const m of members) {
    if (m.position) {
      let newPos = m.position
        .replace(/Violinista/g, 'Violão')
        .replace(/Violonista/g, 'Violão')
        .replace(/Vocalista/g, 'Vocal')
        .replace(/Back-vocal/g, 'Vocal')
        .replace(/Ministro\(a\) de Louvor/g, 'Vocal')
        .replace(/Tecladista/g, 'Teclado')
        .replace(/Guitarrista/g, 'Guitarra')
        .replace(/Baixista/g, 'Baixo')
        .replace(/Baterista/g, 'Bateria')
        .replace(/Saxofonista/g, '')
        .replace(/Trompetista/g, '')
      
      newPos = newPos.split(',').map(p => p.trim()).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')
      
      if (newPos !== m.position) {
        await prisma.ministryMember.update({
          where: { id: m.id },
          data: { position: newPos }
        })
        console.log(`Updated ${m.id} to ${newPos}`)
      }
    }
  }
  console.log('Done updating positions')
}

main().catch(console.error)
