const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const badMembers = await prisma.member.findMany()
  const giantMember = badMembers.find(m => m.name.includes('\n') || m.name.length > 200)

  if (giantMember) {
    console.log('Found giant member, deleting...')
    await prisma.contactHistory.deleteMany({ where: { memberId: giantMember.id } })
    await prisma.attendance.deleteMany({ where: { memberId: giantMember.id } })
    await prisma.member.delete({ where: { id: giantMember.id } })
    console.log('Deleted successfully.')
  } else {
    console.log('No giant member found.')
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
