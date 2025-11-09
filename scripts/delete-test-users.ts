import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find and delete test users
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'test' } },
        { name: { contains: 'Test' } },
      ],
    },
  })

  console.log(`Found ${testUsers.length} test user(s) to delete:`)
  testUsers.forEach(user => {
    console.log(`- ${user.name} (${user.email})`)
  })

  // Delete test users (cascade will delete related workouts, activities, etc.)
  const deleteResult = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: 'test' } },
        { name: { contains: 'Test' } },
      ],
    },
  })

  console.log(`\nDeleted ${deleteResult.count} test user(s) successfully!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

