'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime } from '@/utils/constants'
import Logo from '@/components/Logo'
import MobileNav from '@/components/MobileNav'

interface User {
  id: number
  name: string
  email: string
}

interface Activity {
  id: number
  userId: number
  type: string
  message: string
  createdAt: string
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

export default function ActivityPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<Stats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Poll for new activities every 5 seconds
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, activitiesRes, statsRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/activities?limit=100'),
        fetch('/api/stats'),
      ])

      if (userRes.status === 401 || activitiesRes.status === 401 || statsRes.status === 401) {
        router.push('/login')
        return
      }

      const userData = await userRes.json()
      const activitiesData = await activitiesRes.json()
      const statsData = await statsRes.json()

      setCurrentUser(userData.user || null)
      setActivities(activitiesData.activities || [])
      setStats(statsData.stats || [])
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
    const omer = stats.find(s => s.name.includes('Ömer'))
    const egemen = stats.find(s => s.name.includes('Egemen'))
    const bayram = stats.find(s => s.name.includes('Bayram'))
    return [omer, egemen, bayram].filter(Boolean) as Stats[]
  }, [stats])

  const leaderboard = useMemo(() => {
    return [...stats].sort((a, b) => b.totalWorkouts - a.totalWorkouts)
  }, [stats])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-3xl font-semibold text-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <Logo className="w-8 h-8 sm:w-10 sm:h-10 text-black flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black tracking-tight vercel-heading truncate">Fittrakio</h1>
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
              <MobileNav currentPath="/dashboard/activity" onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left: Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-border rounded-lg p-4 sm:p-6 vercel-card">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-black tracking-tight vercel-heading">Activity Monitoring</h2>
              <div className="space-y-3 sm:space-y-4 max-h-[500px] sm:max-h-[800px] overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="text-center py-12 text-black/60 font-semibold">
                    No activities yet
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="border border-border rounded-md p-4 hover:bg-vercel-gray transition-all duration-150 group vercel-card"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-base text-black transition-colors mb-1">
                            {activity.message}
                          </p>
                          <p className="text-xs text-muted font-normal">
                            {formatDateTime(new Date(activity.createdAt))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-border rounded-lg p-4 sm:p-6 vercel-card lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-black tracking-tight vercel-heading">Leader Board</h2>
              <div className="space-y-3">
                {leaderboard.map((stat, index) => (
                  <div
                    key={stat.userId}
                    className="flex justify-between items-center p-4 border border-border rounded-md hover:bg-vercel-gray transition-all duration-150 group vercel-card"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-semibold text-black transition-colors">
                        {index + 1}
                      </span>
                      <span className="font-medium text-base text-black transition-colors">
                        {stat.name.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-xl font-semibold text-black transition-colors">{stat.totalWorkouts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

