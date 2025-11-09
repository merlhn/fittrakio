import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'
import { START_DATE, END_DATE, WEEKLY_MINIMUM_WORKOUTS } from '@/utils/constants'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Normalize dates to ensure proper timezone handling
    const startDateFilter = startDate ? new Date(startDate) : new Date(START_DATE)
    startDateFilter.setHours(0, 0, 0, 0)
    const endDateFilter = endDate ? new Date(endDate) : new Date(END_DATE)
    endDateFilter.setHours(23, 59, 59, 999)

    const where: any = {
      date: {
        gte: startDateFilter,
        lte: endDateFilter,
      },
    }

    const workouts = await prisma.workout.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({ workouts })
  } catch (error) {
    console.error('Get workouts error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching workouts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date, completed } = await request.json()

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    // Parse date string (YYYY-MM-DD) in local timezone
    const [year, month, day] = date.split('-').map(Number)
    const workoutDate = new Date(year, month - 1, day)
    workoutDate.setHours(0, 0, 0, 0)

    // Compare dates properly
    const startDate = new Date(START_DATE)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(END_DATE)
    endDate.setHours(23, 59, 59, 999)

    if (workoutDate < startDate || workoutDate > endDate) {
      return NextResponse.json(
        { error: `Date is not within valid range. Valid range: ${startDate.toLocaleDateString('en-US')} - ${endDate.toLocaleDateString('en-US')}` },
        { status: 400 }
      )
    }

    // Ensure date is stored correctly (start of day in local timezone)
    const dbDate = new Date(workoutDate)
    dbDate.setHours(0, 0, 0, 0)

    // Ensure completed is explicitly boolean (false should be preserved, undefined should default to true)
    const completedValue = completed !== undefined ? Boolean(completed) : true
    
    console.log('Saving workout:', { userId: user.userId, date: dbDate.toISOString(), completed, completedValue })
    
    const workout = await prisma.workout.upsert({
      where: {
        userId_date: {
          userId: user.userId,
          date: dbDate,
        },
      },
      update: {
        completed: completedValue,
      },
      create: {
        userId: user.userId,
        date: dbDate,
        completed: completedValue,
      },
    })
    
    console.log('Workout saved:', { id: workout.id, completed: workout.completed })

    // Create activity log with detailed information
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true },
    })

    if (completedValue) {
      // Get total workout count AFTER saving the workout
      const totalWorkouts = await prisma.workout.count({
        where: {
          userId: user.userId,
          completed: true,
          date: {
            gte: new Date(START_DATE),
            lte: new Date(END_DATE),
          },
        },
      })

      // Get weekly workout count AFTER saving the workout
      const { getWeekNumber, getDaysInWeek, formatOrdinal } = await import('@/utils/constants')
      const weekNumber = getWeekNumber(workoutDate)
      const weekDays = getDaysInWeek(weekNumber)
      const weekStart = weekDays[0]
      const weekEnd = weekDays[weekDays.length - 1]

      const weeklyWorkouts = await prisma.workout.count({
        where: {
          userId: user.userId,
          completed: true,
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      })

      await prisma.activity.create({
        data: {
          userId: user.userId,
          type: 'workout',
          message: `${userData?.name} went to their ${formatOrdinal(totalWorkouts)} workout. This is their ${formatOrdinal(weeklyWorkouts)} workout in week ${weekNumber}.`,
        },
      })
    } else {
      await prisma.activity.create({
        data: {
          userId: user.userId,
          type: 'workout',
          message: `${userData?.name} canceled workout`,
        },
      })
    }

    // Check weekly minimum and calculate debt
    await checkWeeklyMinimum(user.userId, workoutDate)

    return NextResponse.json({ workout })
  } catch (error) {
    console.error('Create workout error:', error)
    return NextResponse.json(
      { error: 'An error occurred while saving workout' },
      { status: 500 }
    )
  }
}

async function checkWeeklyMinimum(userId: number, date: Date) {
  const { getWeekNumber, getDaysInWeek, WEEKLY_MINIMUM_WORKOUTS, DEBT_PER_MISSED_DAY } = await import('@/utils/constants')
  
  const weekNumber = getWeekNumber(date)
  const weekDays = getDaysInWeek(weekNumber)
  const weekStart = weekDays[0]
  const weekEnd = weekDays[weekDays.length - 1]

  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
      completed: true,
    },
  })

  const completedCount = workouts.length

  if (completedCount < WEEKLY_MINIMUM_WORKOUTS) {
    const missedDays = WEEKLY_MINIMUM_WORKOUTS - completedCount
    
    // Check if debt already exists for this week
    const existingDebt = await prisma.liability.findFirst({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
        reason: 'weekly_minimum_not_met',
      },
    })

    if (!existingDebt) {
      const amount = missedDays * DEBT_PER_MISSED_DAY
      
      await prisma.liability.create({
        data: {
          userId,
          amount,
          date: weekEnd,
          reason: 'weekly_minimum_not_met',
        },
      })

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      })

      await prisma.activity.create({
        data: {
          userId,
          type: 'debt',
          message: `${user?.name} missed weekly minimum (${completedCount}/${WEEKLY_MINIMUM_WORKOUTS}), ${amount}€ debt added ⚠️`,
        },
      })
    }
  }
}

