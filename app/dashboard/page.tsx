'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, START_DATE, END_DATE, getWeekNumber, getDayNumber, getDaysInWeekRange, getTotalWeeks, WEEKLY_MINIMUM_WORKOUTS, DEBT_PER_MISSED_DAY } from '@/utils/constants'
import Logo from '@/components/Logo'
import MobileNav from '@/components/MobileNav'

const formatDateForRules = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

interface User {
  id: number
  name: string
  email: string
}

interface Workout {
  id: number
  userId: number
  date: string
  completed: boolean
  user: User
}

interface Stats {
  userId: number
  name: string
  totalWorkouts: number
  totalDebt: number
  totalRewards: number
  balance: number
}

interface WeeklyDebt {
  week: number
  omerDebt: number
  egemenDebt: number
  bayramDebt: number
  total: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [stats, setStats] = useState<Stats[]>([])
  const [monthlyRewards, setMonthlyRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Poll for updates every 5 seconds to sync with Personal Area changes
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, usersRes, workoutsRes, statsRes, rewardsRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/users'),
        fetch('/api/workouts'),
        fetch('/api/stats'),
        fetch('/api/monthly-rewards'),
      ])

      if (userRes.status === 401 || usersRes.status === 401 || workoutsRes.status === 401 || statsRes.status === 401 || rewardsRes.status === 401) {
        router.push('/login')
        return
      }

      const userData = await userRes.json()
      const usersData = await usersRes.json()
      const workoutsData = await workoutsRes.json()
      const statsData = await statsRes.json()
      const rewardsData = await rewardsRes.json()

      setCurrentUser(userData.user || null)
      setAllUsers(usersData.users || [])
      setWorkouts(workoutsData.workouts || [])
      setStats(statsData.stats || [])
      setMonthlyRewards(rewardsData.rewards || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  // Get users sorted: Ömer, Egemen, Bayram
  const sortedUsers = useMemo(() => {
    const omer = allUsers.find(u => u.name.includes('Ömer'))
    const egemen = allUsers.find(u => u.name.includes('Egemen'))
    const bayram = allUsers.find(u => u.name.includes('Bayram'))
    return [omer, egemen, bayram].filter(Boolean) as User[]
  }, [allUsers])

  // Create workouts map by user and date
  const workoutsMap = useMemo(() => {
    const map: Record<number, Record<string, boolean>> = {}
    workouts.forEach(w => {
      if (!map[w.userId]) map[w.userId] = {}
      // Use local timezone to match Personal Area format
      const workoutDate = new Date(w.date)
      const year = workoutDate.getFullYear()
      const month = String(workoutDate.getMonth() + 1).padStart(2, '0')
      const day = String(workoutDate.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      map[w.userId][dateKey] = w.completed
    })
    return map
  }, [workouts])

  // Get all days grouped by weeks
  const daysByWeek = useMemo(() => {
    const totalWeeks = getTotalWeeks()
    const weeks: Array<{ week: number; days: Date[] }> = []
    
    for (let week = 1; week <= totalWeeks; week++) {
      const weekDays = getDaysInWeekRange(week)
      if (weekDays.length > 0) {
        weeks.push({ week, days: weekDays })
      }
    }
    
    return weeks
  }, [])

  // Get monthly winners
  const monthlyWinners = useMemo(() => {
    const winners: Record<string, { month: number; year: number; winner: string }> = {}
    monthlyRewards.forEach((reward: any) => {
      if (reward.position === 1) {
        const key = `${reward.year}-${reward.month}`
        winners[key] = {
          month: reward.month,
          year: reward.year,
          winner: reward.user.name
        }
      }
    })
    return winners
  }, [monthlyRewards])

  // Check if date is month end
  const isMonthEnd = (date: Date): boolean => {
    const nextDay = new Date(date)
    nextDay.setDate(date.getDate() + 1)
    return nextDay.getMonth() !== date.getMonth()
  }

  // Calculate weekly debts
  const weeklyDebts = useMemo(() => {
    const debts: WeeklyDebt[] = []
    const totalWeeks = getTotalWeeks()
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    for (let week = 1; week <= totalWeeks; week++) {
      const weekDays = getDaysInWeekRange(week)
      if (weekDays.length === 0) continue
      
      // Check if this week has ended (all days in the week are in the past)
      const weekEnd = new Date(weekDays[weekDays.length - 1])
      weekEnd.setHours(23, 59, 59, 999)
      
      const omer = sortedUsers.find(u => u.name.includes('Ömer'))
      const egemen = sortedUsers.find(u => u.name.includes('Egemen'))
      const bayram = sortedUsers.find(u => u.name.includes('Bayram'))
      
      const calculateDebt = (userId: number | undefined) => {
        if (!userId) return 0
        
        // Only calculate debt if the week has ended
        if (weekEnd >= today) return 0
        
        const userWorkouts = weekDays.filter(day => {
          // Use local timezone to match Personal Area format
          const year = day.getFullYear()
          const month = String(day.getMonth() + 1).padStart(2, '0')
          const dayStr = String(day.getDate()).padStart(2, '0')
          const dateKey = `${year}-${month}-${dayStr}`
          return workoutsMap[userId]?.[dateKey] === true
        }).length
        
        const missed = WEEKLY_MINIMUM_WORKOUTS - userWorkouts
        return missed > 0 ? missed * DEBT_PER_MISSED_DAY : 0
      }
      
      const omerDebt = calculateDebt(omer?.id)
      const egemenDebt = calculateDebt(egemen?.id)
      const bayramDebt = calculateDebt(bayram?.id)
      
      debts.push({
        week,
        omerDebt,
        egemenDebt,
        bayramDebt,
        total: omerDebt + egemenDebt + bayramDebt
      })
    }
    
    return debts
  }, [sortedUsers, workoutsMap])

  // Get user stats
  const omerStats = stats.find(s => s.name.includes('Ömer'))
  const egemenStats = stats.find(s => s.name.includes('Egemen'))
  const bayramStats = stats.find(s => s.name.includes('Bayram'))

  const leaderboard = [...stats].sort((a, b) => b.totalWorkouts - a.totalWorkouts)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-3xl font-black text-black uppercase tracking-wider">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <Logo className="w-8 h-8 sm:w-10 sm:h-10 text-black flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black tracking-tight vercel-heading truncate">Fittrakio</h1>
                <p className="text-xs sm:text-sm font-normal text-muted mt-1 hidden sm:block">Winning is not comfortable!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex gap-4">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 border border-border rounded-md hover:bg-vercel-gray transition-all duration-150 font-medium text-sm vercel-button"
                >
                  Main Dashboard
                </Link>
                <Link
                  href="/dashboard/activity"
                  className="px-4 py-2 border border-border rounded-md hover:bg-vercel-gray transition-all duration-150 font-medium text-sm vercel-button"
                >
                  Activity Monitoring
                </Link>
                <Link
                  href="/dashboard/rules"
                  className="px-4 py-2 border border-border rounded-md hover:bg-vercel-gray transition-all duration-150 font-medium text-sm vercel-button"
                >
                  Rules & Regulations
                </Link>
                <Link
                  href="/dashboard/personal"
                  className="px-4 py-2 border border-border rounded-md hover:bg-vercel-gray transition-all duration-150 font-medium text-sm vercel-button"
                >
                  Personal Area
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-black text-white rounded-md border border-black hover:bg-vercel-dark-gray transition-all duration-150 font-medium text-sm vercel-button vercel-button-primary"
                >
                  Logout
                </button>
              </div>
              {/* Mobile Navigation */}
              <MobileNav currentPath="/dashboard" onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left: Workout Tracking Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-border rounded-lg p-4 sm:p-6 vercel-card">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-black tracking-tight vercel-heading">Workout Tracking</h2>
              <div className="overflow-x-auto max-h-[600px] sm:max-h-[800px] overflow-y-auto">
                <table className="w-full text-[10px] sm:text-xs min-w-[500px]">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-border">
                      <th className="text-left p-2 font-semibold">Weeks</th>
                      <th className="text-left p-2 font-semibold">Days</th>
                      <th className="text-left p-2 font-semibold">Date</th>
                      {sortedUsers.map(user => (
                        <th key={user.id} className="text-center p-2 font-semibold text-center">
                          {user.name.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {daysByWeek.map(({ week, days }) => {
                      const rows: React.ReactElement[] = []
                      let weekRowSpan = days.length
                      let winnerRowsCount = 0
                      
                      // First pass: check for month ends and winners
                      days.forEach((day) => {
                        const monthEnd = isMonthEnd(day)
                        if (monthEnd) {
                          const monthKey = `${day.getFullYear()}-${day.getMonth() + 1}`
                          const monthlyWinner = monthlyWinners[monthKey]
                          if (monthlyWinner) {
                            winnerRowsCount++
                          }
                        }
                      })
                      
                      weekRowSpan += winnerRowsCount
                      
                      // Second pass: render rows
                      days.forEach((day, dayIndex) => {
                        const dayNum = getDayNumber(day)
                        // Use local timezone to match Personal Area format
                        const year = day.getFullYear()
                        const month = String(day.getMonth() + 1).padStart(2, '0')
                        const dayStr = String(day.getDate()).padStart(2, '0')
                        const dateKey = `${year}-${month}-${dayStr}`
                        const isFirstDayOfWeek = dayIndex === 0
                        
                        // Check if this is month end
                        const monthEnd = isMonthEnd(day)
                        const monthKey = `${day.getFullYear()}-${day.getMonth() + 1}`
                        const monthlyWinner = monthlyWinners[monthKey]
                        
                        rows.push(
                          <tr key={dateKey} className="border-b border-border hover:bg-vercel-gray/50">
                            {isFirstDayOfWeek && (
                              <td rowSpan={weekRowSpan} className="p-2 font-medium text-center align-middle border-r border-border">
                                {week}
                              </td>
                            )}
                            <td className="p-2 font-medium text-center">{dayNum}</td>
                            <td className="p-2 font-normal text-muted">{formatDate(day)}</td>
                            {sortedUsers.map(user => {
                              const isChecked = workoutsMap[user.id]?.[dateKey] === true
                              return (
                                <td key={user.id} className="p-2 text-center">
                                  {isChecked ? (
                                    <div className="w-4 h-4 mx-auto border border-foreground bg-white rounded flex items-center justify-center">
                                      <span className="text-foreground font-semibold text-xs leading-none">×</span>
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 mx-auto border border-border bg-white rounded" />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                        
                        // Add monthly winner row after month end
                        if (monthEnd && monthlyWinner) {
                          rows.push(
                            <tr key={`winner-${monthKey}`} className="border-b border-border bg-vercel-gray">
                              <td colSpan={3} className="p-2 font-semibold text-center">
                                {monthlyWinner.month}/{monthlyWinner.year} Winner: {monthlyWinner.winner.split(' ')[0]} 🏆
                              </td>
                              <td colSpan={sortedUsers.length} className="p-2"></td>
                            </tr>
                          )
                        }
                      })
                      
                      return rows
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Middle: Total Debt Accumulated and Weekly Debt Account */}
          <div className="lg:col-span-1 space-y-6">
            {/* Total Debt Accumulated */}
            <div className="bg-black text-white border border-border rounded-lg p-4 sm:p-6 vercel-card">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 tracking-tight vercel-heading">Total Debt Accumulated</h2>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-2">
                €{stats.reduce((sum, s) => sum + s.totalDebt, 0).toFixed(2)}
              </div>
              <p className="text-sm font-normal text-white/80">
                Total Debt
              </p>
            </div>

            {/* Weekly Debt Breakdown */}
            <div className="bg-white border border-border rounded-lg p-4 sm:p-6 vercel-card">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-black tracking-tight vercel-heading">Weekly Debt Account</h2>
              <div className="overflow-x-auto max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                <table className="w-full text-[10px] sm:text-xs min-w-[400px]">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-border">
                      <th className="text-left p-2 font-semibold">Weeks</th>
                      <th className="text-center p-2 font-semibold">Threshold</th>
                      <th className="text-center p-2 font-semibold">O. Debt</th>
                      <th className="text-center p-2 font-semibold">E. Debt</th>
                      <th className="text-center p-2 font-semibold">B. Debt</th>
                      <th className="text-center p-2 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyDebts.map(debt => (
                      <tr key={debt.week} className="border-b border-border hover:bg-vercel-gray/50">
                        <td className="p-2 font-medium text-center">{debt.week}</td>
                        <td className="p-2 font-medium text-center">{WEEKLY_MINIMUM_WORKOUTS}</td>
                        <td className="p-2 font-medium text-center">€{debt.omerDebt.toFixed(2)}</td>
                        <td className="p-2 font-medium text-center">€{debt.egemenDebt.toFixed(2)}</td>
                        <td className="p-2 font-medium text-center">€{debt.bayramDebt.toFixed(2)}</td>
                        <td className="p-2 font-semibold text-center">€{debt.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-border font-semibold bg-vercel-gray">
                      <td colSpan={2} className="p-2 text-center">Total</td>
                      <td className="p-2 text-center">€{weeklyDebts.reduce((sum, d) => sum + d.omerDebt, 0).toFixed(2)}</td>
                      <td className="p-2 text-center">€{weeklyDebts.reduce((sum, d) => sum + d.egemenDebt, 0).toFixed(2)}</td>
                      <td className="p-2 text-center">€{weeklyDebts.reduce((sum, d) => sum + d.bayramDebt, 0).toFixed(2)}</td>
                      <td className="p-2 text-center">€{weeklyDebts.reduce((sum, d) => sum + d.total, 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
