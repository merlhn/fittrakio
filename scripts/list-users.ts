import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Known passwords from scripts
const knownPasswords: Record<string, string> = {
  'i.egemenbasar@gmail.com': 'Egemen2025!',
  'bayramcakir1992@gmail.com': 'Bayram2025!',
  'omerlhn@gmail.com': 'Omer2025!', // Default assumption, may need to verify
}

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      createdAt: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  console.log(`\nTotal users: ${users.length}\n`)
  console.log('Users in database:')
  console.log('─'.repeat(70))
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
    
    // Show known password if available
    const knownPassword = knownPasswords[user.email]
    if (knownPassword) {
      console.log(`   Password: ${knownPassword}`)
    } else {
      console.log(`   Password: (Unknown - check registration or scripts)`)
    }
    
    console.log(`   Password Hash: ${user.password.substring(0, 20)}...`)
    console.log('')
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

