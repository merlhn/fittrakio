import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
  console.log('Searching for user "ömer ilhan" (omer@gmail.com)...\n')

  // Find user by email (the one in 4th place with 0 workouts)
  const userToDelete = await prisma.user.findUnique({
    where: { email: 'omer@gmail.com' },
    include: {
      workouts: true,
      activities: true,
      liabilities: true,
      monthlyRewards: true,
    },
  })

  if (!userToDelete) {
    console.log('❌ User not found with email: omer@gmail.com')
    
    // List all users to help identify
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    console.log('\nAll users in database:')
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`)
    })
    
    return
  }

  console.log(`Found user:`)
  console.log(`   Name: ${userToDelete.name}`)
  console.log(`   Email: ${userToDelete.email}`)
  console.log(`   ID: ${userToDelete.id}`)
  console.log(`   Workouts: ${userToDelete.workouts.length}`)
  console.log(`   Activities: ${userToDelete.activities.length}`)
  console.log(`   Liabilities: ${userToDelete.liabilities.length}`)
  console.log(`   Monthly Rewards: ${userToDelete.monthlyRewards.length}`)

  console.log(`\n🗑️  Deleting user: ${userToDelete.name} (${userToDelete.email})`)
  console.log(`   This will also delete:`)
  console.log(`   - ${userToDelete.workouts.length} workout(s)`)
  console.log(`   - ${userToDelete.activities.length} activity/activities`)
  console.log(`   - ${userToDelete.liabilities.length} liability/liabilities`)
  console.log(`   - ${userToDelete.monthlyRewards.length} monthly reward(s)`)

  await prisma.user.delete({
    where: {
      id: userToDelete.id,
    },
  })

  console.log(`\n✅ User "${userToDelete.name}" deleted successfully!`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

