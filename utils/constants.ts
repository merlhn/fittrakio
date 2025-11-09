export const START_DATE = new Date('2025-10-27')
export const END_DATE = new Date('2026-09-01')
export const WEEKLY_MINIMUM_WORKOUTS = 3
export const DEBT_PER_MISSED_DAY = 15 // euros
export const MONTHLY_REWARD_WINNER = 40 // euros
export const MONTHLY_REWARD_LOSER = 20 // euros

export function getWeekNumber(date: Date): number {
  const start = new Date(START_DATE)
  const diffTime = date.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7) + 1
}

export function getDaysInWeek(weekNumber: number): Date[] {
  const start = new Date(START_DATE)
  const weekStart = new Date(start)
  weekStart.setDate(start.getDate() + (weekNumber - 1) * 7)
  
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    if (day <= END_DATE && day >= START_DATE) {
      days.push(day)
    }
  }
  return days
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

export function getAllDays(): Date[] {
  const days: Date[] = []
  const current = new Date(START_DATE)
  
  while (current <= END_DATE) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

export function getDayNumber(date: Date): number {
  const start = new Date(START_DATE)
  start.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

export function getDaysInWeekRange(weekNumber: number): Date[] {
  const start = new Date(START_DATE)
  const weekStart = new Date(start)
  weekStart.setDate(start.getDate() + (weekNumber - 1) * 7)
  
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    if (day <= END_DATE && day >= START_DATE) {
      days.push(day)
    }
  }
  return days
}

export function getTotalWeeks(): number {
  const start = new Date(START_DATE)
  const end = new Date(END_DATE)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.ceil(diffDays / 7)
}

export function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) return 'st'
  if (j === 2 && k !== 12) return 'nd'
  if (j === 3 && k !== 13) return 'rd'
  return 'th'
}

export function formatOrdinal(num: number): string {
  return `${num}${getOrdinalSuffix(num)}`
}

