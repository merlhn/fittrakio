import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'
import { getWeekNumber, getDaysInWeek } from '../utils/constants'

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning incorrect debt entries for Week 3 (ongoing week)...\n')

  // Week 3 starts on 11/10/2025 (Monday)
  const week3Date = new Date(2025, 10, 10) // November 10, 2025 (month is 0-indexed)
  const weekNumber = getWeekNumber(week3Date)
  const weekDays = getDaysInWeek(weekNumber)
  const weekStart = weekDays[0]
  const weekEnd = weekDays[weekDays.length - 1]

  console.log(`Week ${weekNumber} date range:`)
  console.log(`  Start: ${weekStart.toLocaleDateString()}`)
  console.log(`  End: ${weekEnd.toLocaleDateString()}\n`)

  // Find Ömer İlhan
  const omer = await prisma.user.findFirst({
    where: {
      name: {
        contains: 'Ömer',
      },
    },
  })

  if (!omer) {
    console.log('❌ User "Ömer İlhan" not found')
    return
  }

  console.log(`Found user: ${omer.name} (ID: ${omer.id})\n`)

  // Find incorrect liability entries for Week 3
  const incorrectLiabilities = await prisma.liability.findMany({
    where: {
      userId: omer.id,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
      reason: 'weekly_minimum_not_met',
    },
  })

  console.log(`Found ${incorrectLiabilities.length} incorrect liability/liabilities for Week ${weekNumber}:`)
  incorrectLiabilities.forEach(liability => {
    console.log(`  - ID: ${liability.id}, Amount: ${liability.amount}€, Date: ${new Date(liability.date).toLocaleDateString()}`)
  })

  // Find incorrect activity logs
  const incorrectActivities = await prisma.activity.findMany({
    where: {
      userId: omer.id,
      type: 'debt',
      message: {
        contains: 'missed weekly minimum',
      },
      createdAt: {
        gte: new Date(2025, 10, 10, 0, 0, 0), // November 10, 2025
      },
    },
  })

  console.log(`\nFound ${incorrectActivities.length} incorrect activity/activities:`)
  incorrectActivities.forEach(activity => {
    console.log(`  - ID: ${activity.id}, Message: ${activity.message.substring(0, 60)}...`)
    console.log(`    Created: ${new Date(activity.createdAt).toLocaleString()}`)
  })

  if (incorrectLiabilities.length === 0 && incorrectActivities.length === 0) {
    console.log('\n✅ No incorrect entries found. Nothing to clean.')
    return
  }

  // Delete incorrect entries
  if (incorrectLiabilities.length > 0) {
    const deletedLiabilities = await prisma.liability.deleteMany({
      where: {
        id: {
          in: incorrectLiabilities.map(l => l.id),
        },
      },
    })
    console.log(`\n✅ Deleted ${deletedLiabilities.count} liability/liabilities`)
  }

  if (incorrectActivities.length > 0) {
    const deletedActivities = await prisma.activity.deleteMany({
      where: {
        id: {
          in: incorrectActivities.map(a => a.id),
        },
      },
    })
    console.log(`✅ Deleted ${deletedActivities.count} activity/activities`)
  }

  console.log('\n✅ Cleanup completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

