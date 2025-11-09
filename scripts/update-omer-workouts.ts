import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find Ömer İlhan - try to find by name
  const omer = await prisma.user.findFirst({
    where: { 
      name: { contains: 'Ömer' }
    },
  })

  if (!omer) {
    console.error('Ömer İlhan not found!')
    return
  }

  console.log(`Found Ömer İlhan: ${omer.name} (${omer.email})`)

  // Ömer İlhan's workouts based on Excel data
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

  console.log('\nÖmer İlhan workouts updated successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

