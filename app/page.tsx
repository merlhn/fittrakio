import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/Logo'
import { START_DATE, END_DATE } from '@/utils/constants'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <Logo className="w-8 h-8 sm:w-10 sm:h-10 text-black flex-shrink-0" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black tracking-tight vercel-heading">
                Fittrakio
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 bg-black text-white rounded-md border border-black hover:bg-vercel-dark-gray transition-all duration-150 font-medium text-sm vercel-button vercel-button-primary"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-24">
        <div className="text-center mb-16 sm:mb-20 lg:mb-24">
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="relative">
              <Logo className="w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 text-black" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-black rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-black tracking-tight vercel-heading mb-6 sm:mb-8">
            Track Your Fitness Journey
          </h2>
          <p className="text-xl sm:text-2xl text-muted max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed">
            Stay accountable with your team. Track workouts, monitor progress, and compete for monthly rewards.
          </p>
          <div className="flex justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-black text-white rounded-lg border border-black hover:bg-vercel-dark-gray transition-all duration-150 font-semibold text-base vercel-button vercel-button-primary shadow-lg hover:shadow-xl"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 sm:mt-28">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-black tracking-tight vercel-heading mb-4">
              Why Fittrakio?
            </h2>
            <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto">
              Everything you need to stay accountable and motivated
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="bg-white border-2 border-border rounded-xl p-8 sm:p-10 vercel-card hover:border-black transition-all duration-300 shadow-md hover:shadow-xl">
              <div className="text-5xl mb-6">📊</div>
              <h3 className="text-2xl font-semibold mb-4 vercel-heading">Track Progress</h3>
              <p className="text-muted text-base leading-relaxed">
                Monitor your daily workouts and see your progress over time with detailed tracking and analytics.
              </p>
            </div>
            <div className="bg-white border-2 border-border rounded-xl p-8 sm:p-10 vercel-card hover:border-black transition-all duration-300 shadow-md hover:shadow-xl">
              <div className="text-5xl mb-6">👥</div>
              <h3 className="text-2xl font-semibold mb-4 vercel-heading">Team Accountability</h3>
              <p className="text-muted text-base leading-relaxed">
                Stay motivated with your team. See everyone's progress and compete for monthly rewards in real-time.
              </p>
            </div>
            <div className="bg-white border-2 border-border rounded-xl p-8 sm:p-10 vercel-card hover:border-black transition-all duration-300 shadow-md hover:shadow-xl">
              <div className="text-5xl mb-6">🏆</div>
              <h3 className="text-2xl font-semibold mb-4 vercel-heading">Monthly Rewards</h3>
              <p className="text-muted text-base leading-relaxed">
                Win monthly prizes by being the most consistent. Track your ranking on the leaderboard and earn rewards.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 sm:mt-24">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-black tracking-tight vercel-heading mb-4">
              How It Works
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Get started with Fittrakio in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white border border-border rounded-lg p-6 sm:p-8 vercel-card">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-semibold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-3 vercel-heading">Login</h3>
              <p className="text-muted text-sm">
                Login with your credentials to access your fitness tracking dashboard and start monitoring your progress.
              </p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6 sm:p-8 vercel-card">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-semibold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-3 vercel-heading">Log Your Workouts</h3>
              <p className="text-muted text-sm">
                Go to your Personal Area and mark the days you completed your workouts. Confirm with your video proof.
              </p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6 sm:p-8 vercel-card">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-semibold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-3 vercel-heading">Track Progress</h3>
              <p className="text-muted text-sm">
                View your progress on the Main Dashboard. See weekly workout counts, debt calculations, and leaderboard rankings.
              </p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6 sm:p-8 vercel-card">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-semibold mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-3 vercel-heading">Win Monthly</h3>
              <p className="text-muted text-sm">
                Complete at least 3 workouts per week. The monthly winner receives rewards from other participants.
              </p>
            </div>
          </div>

        </div>

        {/* Rules & Regulations */}
        <div className="mt-20 sm:mt-28">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-black tracking-tight vercel-heading mb-4">
              Rules & Regulations
            </h2>
            <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto">
              Complete guidelines for the fitness tracking program
            </p>
          </div>

          <div className="bg-white border-2 border-border rounded-2xl p-8 sm:p-12 lg:p-16 vercel-card max-w-5xl mx-auto shadow-lg">
            {/* Program Dates */}
            <div className="bg-vercel-gray border border-border rounded-xl p-6 sm:p-8 mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted mb-2">Start Date</p>
                  <p className="text-2xl font-semibold text-black vercel-heading">
                    {START_DATE.toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-2">End Date</p>
                  <p className="text-2xl font-semibold text-black vercel-heading">
                    {END_DATE.toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Rules List */}
            <div className="space-y-6">
              <div className="border-l-4 border-black pl-6 py-2">
                <p className="text-lg text-black leading-relaxed">
                  <strong className="font-semibold">Weekly Minimum:</strong> Each participant must do fitness at least <strong>3 times per week</strong>. For each missed day, <strong>15 euros</strong> are paid to the fund.
                </p>
              </div>

              <div className="border-l-4 border-black pl-6 py-2">
                <p className="text-lg text-black leading-relaxed">
                  <strong className="font-semibold">Accepted Workouts:</strong> Running, spinning, and home workouts are <strong>not accepted</strong>. Only gym fitness workouts count.
                </p>
              </div>

              <div className="border-l-4 border-black pl-6 py-2">
                <p className="text-lg text-black leading-relaxed">
                  <strong className="font-semibold">Monthly Rewards:</strong> The other two participants send <strong>20 euros each</strong> to the monthly winner, and the first-place participant earns <strong>40 euros</strong> for the month.
                </p>
              </div>

              <div className="border-l-4 border-black pl-6 py-2">
                <p className="text-lg text-black leading-relaxed">
                  <strong className="font-semibold">Sickness Exemption:</strong> Participants who are sick are exempt from training during their illness period.
                </p>
              </div>

              <div className="border-l-4 border-black pl-6 py-2">
                <p className="text-lg text-black leading-relaxed">
                  <strong className="font-semibold">Business Trips & Holidays:</strong> In activities that disrupt daily life such as business trips and holidays, participants must fulfill the minimum rule.
                </p>
              </div>

              <div className="border-l-4 border-black pl-6 py-2">
                <p className="text-lg text-black leading-relaxed">
                  <strong className="font-semibold">Program Termination:</strong> Team members decide together on a possible termination idea. At least two people must approve termination. Each participant has equal voting equity.
                </p>
              </div>

              <div className="border-l-4 border-black pl-6 py-2">
                <p className="text-lg text-black leading-relaxed">
                  <strong className="font-semibold">Video Proof:</strong> The person doing the workout must send <strong>two videos 30 minutes apart</strong> during the workout period.
                </p>
              </div>

              <div className="border-l-4 border-black pl-6 py-2">
                <p className="text-lg text-black leading-relaxed">
                  <strong className="font-semibold">Misleading Actions:</strong> People who take misleading actions regarding activity proof are fined <strong>100 euros</strong> if caught and must pay <strong>50 euros each</strong> to the other two participants within a week.
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-border text-center">
              <p className="text-3xl sm:text-4xl font-bold text-black vercel-heading">
                Winning is not comfortable!
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 sm:mt-28 text-center">
          <div className="bg-gradient-to-br from-black to-vercel-dark-gray text-white rounded-2xl p-12 sm:p-16 lg:p-20 max-w-4xl mx-auto shadow-2xl">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6 vercel-heading">
              Ready to start tracking?
            </h3>
            <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join Fittrakio and start your fitness journey today. Track your progress, compete with your team, and win monthly rewards.
            </p>
            <div className="flex justify-center">
              <Link
                href="/login"
                className="inline-block px-10 py-4 bg-white text-black rounded-lg border-2 border-white hover:bg-vercel-gray hover:border-vercel-gray transition-all duration-150 font-semibold text-lg vercel-button shadow-lg hover:shadow-xl"
              >
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="mt-20 sm:mt-28 mb-20 sm:mb-28">
          <div className="bg-gradient-to-br from-white to-vercel-gray border-2 border-border rounded-2xl p-10 sm:p-14 lg:p-20 vercel-card max-w-6xl mx-auto shadow-lg overflow-hidden">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-black tracking-tight vercel-heading mb-6">
                Our Story
              </h2>
              <div className="w-24 h-1 bg-black mx-auto"></div>
            </div>

            <div className="space-y-8 text-lg sm:text-xl text-muted leading-relaxed">
              <p className="text-center">
                Fittrakio was born from a simple idea shared by three university friends: <strong className="text-black text-xl">Ömer İlhan</strong>, <strong className="text-black text-xl">Egemen Başar</strong>, and <strong className="text-black text-xl">Bayram Çakır</strong>.
              </p>
              <p>
                What started as a shared passion for fitness and the joy we found in working out together, quickly evolved into something more meaningful. We realized that staying consistent with our fitness goals was challenging, even when we loved what we were doing.
              </p>
              <p>
                The solution? Create a system that combines accountability, friendly competition, and real rewards. We built Fittrakio to track our workouts, hold each other accountable, and celebrate our progress together.
              </p>
              <p>
                Today, Fittrakio helps us stay motivated, track our fitness journey, and compete for monthly rewards—all while maintaining the spirit of friendship and shared commitment that brought us together in the first place.
              </p>
              
              {/* Image */}
              <div className="mt-10 sm:mt-12">
                <div className="relative w-full h-96 sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden border-2 border-border shadow-lg bg-vercel-gray">
                  <Image
                    src="/our-story.jpg"
                    alt="Ömer İlhan, Egemen Başar, and Bayram Çakır in Luxembourg Gardens, Paris"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6 text-black" />
              <span className="text-sm text-muted">Fittrakio</span>
            </div>
            <p className="text-xs sm:text-sm text-muted text-center sm:text-right">
              Winning is not comfortable!
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

