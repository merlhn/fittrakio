'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, START_DATE, END_DATE, getAllDays, getDayName, getWeekNumber, getDaysInWeek } from '@/utils/constants'
import Logo from '@/components/Logo'
import MobileNav from '@/components/MobileNav'

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
}

interface Stats {
  userId: number
  name: string
  totalWorkouts: number
  totalDebt: number
  totalRewards: number
  balance: number
}

export default function PersonalPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const [pendingCompleted, setPendingCompleted] = useState<boolean>(false)
  const currentWeekRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Scroll to current week when component loads
  useEffect(() => {
    if (currentWeekRef.current && !loading) {
      currentWeekRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [loading])

  const fetchData = async () => {
    try {
      const [userRes, workoutsRes, statsRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/workouts'),
        fetch('/api/stats'),
      ])

      if (userRes.status === 401 || workoutsRes.status === 401 || statsRes.status === 401) {
        router.push('/login')
        return
      }

      const userData = await userRes.json()
      const workoutsData = await workoutsRes.json()
      const statsData = await statsRes.json()

      setCurrentUser(userData.user || null)
      
      // Filter workouts for current user only
      const userWorkouts = (workoutsData.workouts || []).filter(
        (w: Workout) => w.userId === userData.user.id
      )
      setWorkouts(userWorkouts)

      // Find current user's stats
      const userStats = (statsData.stats || []).find(
        (s: Stats) => s.userId === userData.user.id
      )
      setStats(userStats || null)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkoutToggle = (date: Date, completed: boolean) => {
    if (!currentUser) {
      console.log('No current user')
      return
    }

    console.log('handleWorkoutToggle called:', { date, completed })
    
    // Show confirmation modal for both check and uncheck
    setPendingDate(date)
    setPendingCompleted(completed)
    setShowConfirmModal(true)
    
    console.log('Modal should be shown now')
  }

  const confirmWorkout = async () => {
    if (pendingDate === null) return
    
    const dateToUpdate = pendingDate
    const completedToUpdate = pendingCompleted
    
    // Close modal first
    setShowConfirmModal(false)
    
    // Optimistically update the local state immediately
    const year = dateToUpdate.getFullYear()
    const month = String(dateToUpdate.getMonth() + 1).padStart(2, '0')
    const day = String(dateToUpdate.getDate()).padStart(2, '0')
    const dateKey = `${year}-${month}-${day}`
    
    // Update workouts state optimistically
    setWorkouts(prevWorkouts => {
      const existingWorkout = prevWorkouts.find(w => {
        const wDate = new Date(w.date)
        const wYear = wDate.getFullYear()
        const wMonth = String(wDate.getMonth() + 1).padStart(2, '0')
        const wDay = String(wDate.getDate()).padStart(2, '0')
        const wDateKey = `${wYear}-${wMonth}-${wDay}`
        return wDateKey === dateKey
      })
      
      if (existingWorkout) {
        // Update existing workout
        return prevWorkouts.map(w => {
          const wDate = new Date(w.date)
          const wYear = wDate.getFullYear()
          const wMonth = String(wDate.getMonth() + 1).padStart(2, '0')
          const wDay = String(wDate.getDate()).padStart(2, '0')
          const wDateKey = `${wYear}-${wMonth}-${wDay}`
          if (wDateKey === dateKey) {
            return { ...w, completed: completedToUpdate }
          }
          return w
        })
      } else if (completedToUpdate) {
        // Create new workout if checking
        return [...prevWorkouts, {
          id: Date.now(), // Temporary ID
          userId: currentUser!.id,
          date: dateToUpdate.toISOString(),
          completed: true
        }]
      } else {
        // If unchecking and workout doesn't exist, nothing to do
        return prevWorkouts
      }
    })
    
    // Clear pending state immediately
    setPendingDate(null)
    setPendingCompleted(false)
    
    // Update workout on server
    await updateWorkout(dateToUpdate, completedToUpdate)
  }

  const cancelWorkout = () => {
    setShowConfirmModal(false)
    setPendingDate(null)
    setPendingCompleted(false)
  }

  const updateWorkout = async (date: Date, completed: boolean) => {
    if (!currentUser) return

    // Ensure date is in local timezone, not UTC
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    console.log('Updating workout:', { date: dateStr, completed })

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, completed }),
      })

      const responseData = await res.json().catch(() => ({}))
      console.log('Update response:', { status: res.status, data: responseData })

      if (res.ok) {
        // Refresh data to sync with server
        await fetchData()
        // Refresh router to update other pages (Main Dashboard, Activity Monitoring, etc.)
        router.refresh()
      } else {
        const errorData = responseData.error || 'Unknown error'
        alert(errorData || 'An error occurred while saving workout')
        // On error, refresh to reset checkbox state
        await fetchData()
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating workout:', error)
      alert('An error occurred')
      // On error, refresh to reset checkbox state
      await fetchData()
      router.refresh()
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-3xl font-semibold text-black">Loading...</div>
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Get all days in the program
  const allDays = getAllDays()
  
  // Get current week number to highlight current week
  const currentWeekNumber = getWeekNumber(today)

  // Create a map of workouts by date
  const workoutsByDate = workouts.reduce((acc, workout) => {
    // Parse date and normalize to YYYY-MM-DD format
    const workoutDate = new Date(workout.date)
    const year = workoutDate.getFullYear()
    const month = String(workoutDate.getMonth() + 1).padStart(2, '0')
    const day = String(workoutDate.getDate()).padStart(2, '0')
    const dateKey = `${year}-${month}-${day}`
    acc[dateKey] = workout
    return acc
  }, {} as Record<string, Workout>)

  // Calculate summary
  // Ensure we count only completed workouts (explicit boolean check)
  const totalWorkouts = workouts.filter(w => w.completed === true).length
  const totalDays = Math.ceil((END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  // Calculate days passed from start date to today (inclusive)
  // Normalize dates to start of day for accurate calculation
  const startDateNormalized = new Date(START_DATE)
  startDateNormalized.setHours(0, 0, 0, 0)
  const todayNormalized = new Date(today)
  todayNormalized.setHours(0, 0, 0, 0)
  const diffTime = todayNormalized.getTime() - startDateNormalized.getTime()
  const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include start date
  const totalDebt = stats?.totalDebt || 0

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <Logo className="w-8 h-8 sm:w-10 sm:h-10 text-black flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black tracking-tight vercel-heading truncate">Personal Area</h1>
                <p className="text-xs sm:text-sm font-normal text-muted mt-1 truncate">{currentUser?.name}</p>
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
              <MobileNav currentPath="/dashboard/personal" onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12">
        {/* Summary */}
        <div className="bg-white border border-border rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 vercel-card">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-black tracking-tight vercel-heading">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="border border-border rounded-lg p-4 sm:p-6 hover:bg-vercel-gray transition-all duration-150 group vercel-card">
              <div className="text-xs font-medium text-muted mb-2">Total Debt</div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black transition-colors">€{totalDebt.toFixed(2)}</div>
            </div>
            <div className="border border-border rounded-lg p-4 sm:p-6 hover:bg-vercel-gray transition-all duration-150 group vercel-card">
              <div className="text-xs font-medium text-muted mb-2">Total Workout Days</div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black transition-colors">{totalWorkouts}</div>
            </div>
            <div className="border border-border rounded-lg p-4 sm:p-6 hover:bg-vercel-gray transition-all duration-150 group vercel-card">
              <div className="text-xs font-medium text-muted mb-2">Total Days Passed</div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black transition-colors">{daysPassed}</div>
            </div>
          </div>
        </div>

        {/* Workout Calendar */}
        <div className="bg-white border border-border rounded-lg p-4 sm:p-6 lg:p-8 vercel-card">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-black tracking-tight vercel-heading">Workout Calendar</h2>
          <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto relative pl-0 sm:pl-24">
            {allDays.map((day, index) => {
              // Normalize date to YYYY-MM-DD format (same as workoutsByDate)
              const year = day.getFullYear()
              const month = String(day.getMonth() + 1).padStart(2, '0')
              const dayNum = String(day.getDate()).padStart(2, '0')
              const dateKey = `${year}-${month}-${dayNum}`
              
              const workout = workoutsByDate[dateKey]
              
              // Check if today
              const todayYear = today.getFullYear()
              const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
              const todayDay = String(today.getDate()).padStart(2, '0')
              const todayKey = `${todayYear}-${todayMonth}-${todayDay}`
              const isToday = dateKey === todayKey
              
              // Check if this date has a pending change
              const pendingYear = pendingDate ? pendingDate.getFullYear() : null
              const pendingMonth = pendingDate ? String(pendingDate.getMonth() + 1).padStart(2, '0') : null
              const pendingDay = pendingDate ? String(pendingDate.getDate()).padStart(2, '0') : null
              const pendingDateKey = pendingYear && pendingMonth && pendingDay ? `${pendingYear}-${pendingMonth}-${pendingDay}` : null
              const isPending = pendingDateKey === dateKey
              // Explicitly check for completed === true
              const displayChecked = isPending ? pendingCompleted : (workout?.completed === true)
              
              // Check if this is the first day of current week
              const dayWeekNumber = getWeekNumber(day)
              const isFirstDayOfCurrentWeek = dayWeekNumber === currentWeekNumber && index > 0 && getWeekNumber(allDays[index - 1]) !== currentWeekNumber
              const isFirstDayOfWeek = index === 0 || getWeekNumber(allDays[index - 1]) !== dayWeekNumber

              return (
                <div
                  key={dateKey}
                  ref={isFirstDayOfCurrentWeek ? currentWeekRef : null}
                  className={`flex items-center justify-between p-4 border border-border rounded-md transition-all duration-150 relative ${
                    isToday ? 'bg-black text-white border-black' : 
                    dayWeekNumber === currentWeekNumber ? 'bg-vercel-gray/30' : 'hover:bg-vercel-gray'
                  }`}
                >
                  {isFirstDayOfWeek && (
                    <div className="hidden sm:block absolute -left-24 top-1/2 -translate-y-1/2 text-xs font-medium text-muted whitespace-nowrap">
                      Week {dayWeekNumber}
                    </div>
                  )}
                  <div className="flex items-center gap-3 sm:gap-5 w-full">
                    {isFirstDayOfWeek && (
                      <div className="sm:hidden text-xs font-medium text-muted mr-2">
                        W{dayWeekNumber}
                      </div>
                    )}
                    <input
                      type="checkbox"
                      checked={displayChecked}
                      onChange={(e) => {
                        console.log('Checkbox onChange triggered:', { dateKey, checked: e.target.checked })
                        handleWorkoutToggle(day, e.target.checked)
                      }}
                      className="w-5 h-5 border border-current rounded cursor-pointer accent-current"
                    />
                    <div>
                      <div className={`font-medium text-base ${isToday ? 'text-white' : 'text-black'}`}>
                        {formatDate(day)} - {getDayName(day)}
                      </div>
                      {isToday && (
                        <div className="text-xs font-normal text-white/80 mt-1">Today</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white border border-border rounded-lg p-6 sm:p-10 max-w-lg w-full mx-4 vercel-card">
            <h3 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-black tracking-tight vercel-heading">Confirm</h3>
            <p className="text-black mb-8 font-normal leading-relaxed text-base">
              {pendingCompleted
                ? 'I swear I am not lying. I proved it with videos.'
                : 'Are you sure you want to cancel this workout?'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmWorkout}
                className="flex-1 bg-black text-white py-3 px-6 rounded-md border border-black hover:bg-vercel-dark-gray transition-all duration-150 font-medium text-sm vercel-button vercel-button-primary"
              >
                Confirm
              </button>
              <button
                onClick={cancelWorkout}
                className="flex-1 border border-border py-3 px-6 rounded-md hover:bg-vercel-gray transition-all duration-150 font-medium text-sm vercel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

