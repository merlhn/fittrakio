'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface MobileNavProps {
  currentPath: string
  onLogout: () => void
}

export default function MobileNav({ currentPath, onLogout }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navItems = [
    { href: '/dashboard', label: 'Main Dashboard' },
    { href: '/dashboard/activity', label: 'Activity Monitoring' },
    { href: '/dashboard/rules', label: 'Rules & Regulations' },
    { href: '/dashboard/personal', label: 'Personal Area' },
  ]

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 border border-border rounded-md hover:bg-vercel-gray transition-all duration-150 z-50 relative"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[60]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-64 bg-white border-l border-border z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-vercel-gray rounded-md"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-md transition-all duration-150 ${
                  currentPath === item.href
                    ? 'bg-black text-white'
                    : 'hover:bg-vercel-gray'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsOpen(false)
                onLogout()
              }}
              className="w-full text-left px-4 py-3 bg-black text-white rounded-md hover:bg-vercel-dark-gray transition-all duration-150"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </>
  )
}

