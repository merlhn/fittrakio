'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-white p-6 sm:p-8 lg:p-12 rounded-lg border border-border w-full max-w-lg vercel-card">
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <Logo className="w-12 h-12 sm:w-16 sm:h-16 text-black mb-3 sm:mb-4" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-center mb-2 sm:mb-3 text-black tracking-tight vercel-heading">
            Fittrakio
          </h1>
          <p className="text-center text-muted mb-6 sm:mb-10 font-normal text-xs sm:text-sm">
            Winning is not comfortable!
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-black mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-border rounded-md vercel-input text-black bg-white font-normal"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-black mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-border rounded-md vercel-input text-black bg-white font-normal"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-black text-white border border-border px-4 py-3 rounded-md font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 px-6 rounded-md border border-black hover:bg-vercel-dark-gray focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 font-medium text-sm vercel-button vercel-button-primary"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted font-normal">
          Don't have an account?{' '}
          <Link href="/register" className="text-black hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

