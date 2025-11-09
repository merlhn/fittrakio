import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/middleware'
import { START_DATE, END_DATE, WEEKLY_MINIMUM_WORKOUTS, DEBT_PER_MISSED_DAY, getTotalWeeks, getDaysInWeekRange } from '@/utils/constants'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // Get stats for each user
    const startDate = new Date(START_DATE)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(END_DATE)
    endDate.setHours(23, 59, 59, 999)
    
    const stats = await Promise.all(
      users.map(async (u) => {
        const workouts = await prisma.workout.findMany({
          where: {
            userId: u.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
            completed: true,
          },
        })

        // Calculate total debt from workouts (not from debt table)
        // This ensures synchronization with frontend calculations
        // Only calculate debt for weeks that have already passed (up to today)
        let totalDebt = 0
        const today = new Date()
        today.setHours(23, 59, 59, 999) // End of today
        
        // Get current week number
        const { getWeekNumber } = await import('@/utils/constants')
        const currentWeek = getWeekNumber(today)
        
        // Only calculate debt for weeks that have ended (up to current week)
        for (let week = 1; week <= currentWeek; week++) {
          const weekDays = getDaysInWeekRange(week)
          if (weekDays.length === 0) continue
          
          // Check if this week has ended (all days in the week are in the past)
          const weekEnd = weekDays[weekDays.length - 1]
          weekEnd.setHours(23, 59, 59, 999)
          
          // Only calculate debt if the week has ended
          if (weekEnd < today) {
            const weekWorkouts = weekDays.filter(day => {
              const dateKey = day.toISOString().split('T')[0]
              return workouts.some(w => {
                const workoutDateKey = new Date(w.date).toISOString().split('T')[0]
                return workoutDateKey === dateKey
              })
            }).length
            
            const missed = WEEKLY_MINIMUM_WORKOUTS - weekWorkouts
            if (missed > 0) {
              totalDebt += missed * DEBT_PER_MISSED_DAY
            }
          }
        }

        const monthlyRewards = await prisma.monthlyReward.findMany({
          where: {
            userId: u.id,
          },
        })

        const totalRewards = monthlyRewards.reduce((sum, r) => sum + r.amount, 0)

        const balance = totalRewards - totalDebt

        return {
          userId: u.id,
          name: u.name,
          email: u.email,
          totalWorkouts: workouts.length,
          totalDebt,
          totalRewards,
          balance,
        }
      })
    )

    // Sort by total workouts for leaderboard
    const leaderboard = [...stats].sort((a, b) => b.totalWorkouts - a.totalWorkouts)

    return NextResponse.json({ stats, leaderboard })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching statistics' },
      { status: 500 }
    )
  }
}

