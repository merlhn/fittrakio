'use client'

import { HiChartBar, HiUsers } from 'react-icons/hi'
import { FaTrophy } from 'react-icons/fa'

export function TrackProgressIcon() {
  return <HiChartBar className="w-16 h-16 text-black" />
}

export function TeamAccountabilityIcon() {
  return <HiUsers className="w-16 h-16 text-black" />
}

export function MonthlyRewardsIcon() {
  return <FaTrophy className="w-16 h-16 text-black" />
}

