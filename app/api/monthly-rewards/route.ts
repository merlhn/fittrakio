import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'
import { START_DATE, END_DATE, MONTHLY_REWARD_WINNER, MONTHLY_REWARD_LOSER, formatOrdinal } from '@/utils/constants'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { month, year } = await request.json()

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Ay ve yıl zorunludur' },
        { status: 400 }
      )
    }

    // Check if rewards already calculated for this month
    const existingRewards = await prisma.monthlyReward.findFirst({
      where: {
        month,
        year,
      },
    })

    if (existingRewards) {
      return NextResponse.json(
        { error: 'Bu ay için ödüller zaten hesaplanmış' },
        { status: 400 }
      )
    }

    // Get all users
    const users = await prisma.user.findMany()

    // Calculate workouts for each user in the month
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59)

    const userStats = await Promise.all(
      users.map(async (u) => {
        const workouts = await prisma.workout.findMany({
          where: {
            userId: u.id,
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
            completed: true,
          },
        })

        return {
          userId: u.id,
          name: u.name,
          count: workouts.length,
        }
      })
    )

    // Sort by workout count
    userStats.sort((a, b) => b.count - a.count)

    // Create rewards
    const rewards = await Promise.all(
      userStats.map(async (stat, index) => {
        const position = index + 1
        const amount = position === 1 ? MONTHLY_REWARD_WINNER : -MONTHLY_REWARD_LOSER

        const reward = await prisma.monthlyReward.create({
          data: {
            userId: stat.userId,
            month,
            year,
            amount,
            position,
          },
        })

        // Create activity log
        if (position === 1) {
          await prisma.activity.create({
            data: {
              userId: stat.userId,
              type: 'reward',
              message: `${stat.name} won ${month}/${year} month! Earned +${MONTHLY_REWARD_WINNER}€ 🏆`,
            },
          })
        } else {
          await prisma.activity.create({
            data: {
              userId: stat.userId,
              type: 'reward',
              message: `${stat.name} finished ${formatOrdinal(position)} in ${month}/${year} month, paid ${MONTHLY_REWARD_LOSER}€`,
            },
          })
        }

        return reward
      })
    )

    return NextResponse.json({ rewards })
  } catch (error) {
    console.error('Calculate monthly rewards error:', error)
    return NextResponse.json(
      { error: 'An error occurred while calculating monthly rewards' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rewards = await prisma.monthlyReward.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    })

    return NextResponse.json({ rewards })
  } catch (error) {
    console.error('Get monthly rewards error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching monthly rewards' },
      { status: 500 }
    )
  }
}

