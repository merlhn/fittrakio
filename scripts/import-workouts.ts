import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get users
  const egemen = await prisma.user.findUnique({
    where: { email: 'i.egemenbasar@gmail.com' },
  })

  const bayram = await prisma.user.findUnique({
    where: { email: 'bayramcakir1992@gmail.com' },
  })

  if (!egemen || !bayram) {
    console.error('Users not found!')
    return
  }

  // Egemen Başar's workouts
  const egemenWorkouts = [
    '2025-10-27',
    '2025-10-28',
    '2025-11-01',
    '2025-11-02',
    '2025-11-03',
    '2025-11-05',
    '2025-11-06',
    '2025-11-07',
    '2025-11-08',
  ]

  // Bayram Çakır's workouts
  const bayramWorkouts = [
    '2025-10-28',
    '2025-10-31',
    '2025-11-01',
    '2025-11-02',
    '2025-11-03',
    '2025-11-04',
    '2025-11-06',
    '2025-11-07',
  ]

  console.log('Importing Egemen Başar workouts...')
  for (const dateStr of egemenWorkouts) {
    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)
    
    await prisma.workout.upsert({
      where: {
        userId_date: {
          userId: egemen.id,
          date: date,
        },
      },
      update: {
        completed: true,
      },
      create: {
        userId: egemen.id,
        date: date,
        completed: true,
      },
    })
    console.log(`  - ${dateStr}`)
  }

  console.log('\nImporting Bayram Çakır workouts...')
  for (const dateStr of bayramWorkouts) {
    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)
    
    await prisma.workout.upsert({
      where: {
        userId_date: {
          userId: bayram.id,
          date: date,
        },
      },
      update: {
        completed: true,
      },
      create: {
        userId: bayram.id,
        date: date,
        completed: true,
      },
    })
    console.log(`  - ${dateStr}`)
  }

  console.log('\nWorkouts imported successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

