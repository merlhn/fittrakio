import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all users
  const omer = await prisma.user.findFirst({
    where: { name: { contains: 'Ömer' } },
  })

  const egemen = await prisma.user.findFirst({
    where: { name: { contains: 'Egemen' } },
  })

  const bayram = await prisma.user.findFirst({
    where: { name: { contains: 'Bayram' } },
  })

  if (!omer || !egemen || !bayram) {
    console.error('Users not found!')
    return
  }

  console.log('Found users:')
  console.log(`- ${omer.name} (${omer.email})`)
  console.log(`- ${egemen.name} (${egemen.email})`)
  console.log(`- ${bayram.name} (${bayram.email})`)

  // Ömer İlhan's workouts based on final data (11 workouts)
  const omerWorkouts = [
    '2025-10-27', // Day 1
    '2025-10-28', // Day 2
    '2025-10-30', // Day 4
    '2025-10-31', // Day 5
    '2025-11-01', // Day 6
    '2025-11-02', // Day 7
    '2025-11-03', // Day 8
    '2025-11-04', // Day 9
    '2025-11-06', // Day 11
    '2025-11-07', // Day 12
    '2025-11-08', // Day 13
  ]

  // Egemen Başar's workouts based on final data (9 workouts)
  const egemenWorkouts = [
    '2025-10-27', // Day 1
    '2025-10-28', // Day 2
    '2025-11-01', // Day 6
    '2025-11-02', // Day 7
    '2025-11-03', // Day 8
    '2025-11-05', // Day 10
    '2025-11-06', // Day 11
    '2025-11-07', // Day 12
    '2025-11-08', // Day 13
  ]

  // Bayram Çakır's workouts based on final data (9 workouts)
  const bayramWorkouts = [
    '2025-10-28', // Day 2
    '2025-10-30', // Day 4
    '2025-10-31', // Day 5
    '2025-11-01', // Day 6
    '2025-11-02', // Day 7
    '2025-11-03', // Day 8
    '2025-11-04', // Day 9
    '2025-11-06', // Day 11
    '2025-11-08', // Day 13
    '2025-11-09', // Day 14
  ]

  // First, delete all existing workouts for these users in the date range
  const startDate = new Date('2025-10-27')
  const endDate = new Date('2025-11-20')
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)

  console.log('\nClearing existing workouts in date range...')
  await prisma.workout.deleteMany({
    where: {
      userId: { in: [omer.id, egemen.id, bayram.id] },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  // Import Ömer's workouts
  console.log('\nImporting Ömer İlhan workouts...')
  for (const dateStr of omerWorkouts) {
    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)
    
    await prisma.workout.upsert({
      where: {
        userId_date: {
          userId: omer.id,
          date: date,
        },
      },
      update: {
        completed: true,
      },
      create: {
        userId: omer.id,
        date: date,
        completed: true,
      },
    })
    console.log(`  - ${dateStr}`)
  }

  // Import Egemen's workouts
  console.log('\nImporting Egemen Başar workouts...')
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

  // Import Bayram's workouts
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

  console.log('\n✅ All workouts updated successfully!')
  console.log(`\nSummary:`)
  console.log(`- Ömer İlhan: ${omerWorkouts.length} workouts`)
  console.log(`- Egemen Başar: ${egemenWorkouts.length} workouts`)
  console.log(`- Bayram Çakır: ${bayramWorkouts.length} workouts`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

