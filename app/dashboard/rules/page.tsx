'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { START_DATE, END_DATE } from '@/utils/constants'
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

export default function RulesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const userRes = await fetch('/api/user')
      if (userRes.status === 401) {
        router.push('/login')
        return
      }
      const userData = await userRes.json()
      setCurrentUser(userData.user || null)
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
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
              <MobileNav currentPath="/dashboard/rules" onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12">
        {/* Rules and Regulations Section */}
        <div className="bg-white border border-border rounded-lg p-4 sm:p-6 lg:p-8 vercel-card">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 sm:mb-8 text-black tracking-tight vercel-heading">Rules and Regulations</h2>
          <div className="space-y-6 text-base">
            <div className="border-b border-border pb-4">
              <p className="font-semibold text-black mb-2 text-lg">
                Start Date: <span className="font-normal">{formatDateForRules(START_DATE)}</span>
              </p>
              <p className="font-semibold text-black text-lg">
                End Date: <span className="font-normal">{formatDateForRules(END_DATE)}</span>
              </p>
            </div>
            
            <ul className="space-y-4 list-none">
              <li className="flex items-start gap-3">
                <span className="font-semibold text-black mt-1 text-lg">*</span>
                <span className="text-black leading-relaxed">
                  Each participant must do fitness at least 3 times per week. For each missed day, 15 euros are paid to the fund.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold text-black mt-1 text-lg">*</span>
                <span className="text-black leading-relaxed">
                  Running, spinning, and home workouts are not accepted.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold text-black mt-1 text-lg">*</span>
                <span className="text-black leading-relaxed">
                  The other two participants send 20 euros each to the monthly winner, and the first-place participant earns 40 euros for the month.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold text-black mt-1 text-lg">*</span>
                <span className="text-black leading-relaxed">
                  Participants who are sick are exempt from training during their illness period.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold text-black mt-1 text-lg">*</span>
                <span className="text-black leading-relaxed">
                  In activities that disrupt daily life such as business trips and holidays, participants must fulfill the minimum rule.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold text-black mt-1 text-lg">*</span>
                <span className="text-black leading-relaxed">
                  Team members decide together on a possible termination idea. At least two people must approve termination. Each participant has equal voting equity.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold text-black mt-1 text-lg">*</span>
                <span className="text-black leading-relaxed">
                  The person doing the workout must send two videos 30 minutes apart during the workout period.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold text-black mt-1 text-lg">*</span>
                <span className="text-black leading-relaxed">
                  People who take misleading actions regarding activity proof are fined 100 euros if caught and must pay 50 euros each to the other two participants within a week.
                </span>
              </li>
            </ul>
            
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-2xl font-semibold text-black text-center vercel-heading">
                Winning is not comfortable!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

