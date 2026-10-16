import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signout } from '../(auth)/actions'
import { LogOut, FileText, CheckSquare, Video, Briefcase, Unlock, ArrowRight, Sparkles, TrendingUp, BookOpen, CalendarDays, Clock } from 'lucide-react'

import { ThemeToggle } from '@/components/ThemeToggle'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userMetadata = user.user_metadata || {}
  const fullName = userMetadata.full_name || 'Guest'
  const firstName = fullName.split(' ')[0]
  const avatarUrl = userMetadata.avatar_url || null

  // Fetch upcoming sessions for this user
  const { data: upcomingSessions } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .order('scheduled_for', { ascending: true, nullsFirst: false })
    .limit(3);

  const features = [
    {
      title: 'Skill Assessment Tests',
      description: 'Take free or premium mock tests in AI, Tech, Finance, and Marketing to earn verified certificates.',
      icon: CheckSquare,
      href: '/tests',
      color: 'bg-blue-600',
      tag: 'Popular'
    },
    {
      title: 'Resume Builder',
      description: 'Create a professional, ATS-friendly one-page resume. Export instantly to PDF for free.',
      icon: FileText,
      href: '/resume-builder',
      color: 'bg-emerald-500',
      tag: 'Free'
    },
    {
      title: 'Interview Preparation',
      description: 'Join an 8-day intensive program with 3 Google Meet sessions and 5 rigorous mock tests.',
      icon: Video,
      href: '/services/interview-prep',
      color: 'bg-purple-600',
      tag: 'Pro'
    },
    {
      title: 'Career Counseling',
      description: 'Book 1-on-1 sessions, get LinkedIn optimization, or grab the Career Starter Pack.',
      icon: Briefcase,
      href: '/services/counseling',
      color: 'bg-rose-500',
      tag: 'Pro'
    },
    {
      title: 'Free Unlock Program',
      description: 'Bypass paywalls completely! Share the app and upload proof to access premium features for free.',
      icon: Unlock,
      href: '/unlock-program',
      color: 'bg-amber-500',
      tag: 'Special'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-8 sm:py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Talenzo</span>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Pro Plan Available</span>
            </div>

            <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4 hidden sm:flex">
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarUrl} alt={fullName} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {firstName}
              </span>
            </div>

            <form action={signout}>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 mb-12">
        <div className="relative rounded-3xl overflow-hidden bg-blue-900 shadow-2xl">
          {/* Background Image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/80 to-transparent"></div>
          
          {/* Content */}
          <div className="relative z-10 p-6 sm:p-12 md:p-16 flex flex-col justify-center min-h-[320px] max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              Ready to elevate your career, {firstName}?
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-8 leading-relaxed">
              Build an ATS-friendly resume, take industry-standard mock tests, and practice with experts to land your dream job.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/resume-builder" className="w-full sm:w-auto justify-center bg-white text-blue-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-white/10 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Build Resume Now
              </Link>
              <Link href="/tests" className="w-full sm:w-auto justify-center bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 border border-blue-500 transition-colors flex items-center gap-2">
                <CheckSquare className="w-5 h-5" /> Take a Free Test
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Upcoming Sessions Section */}
        {upcomingSessions && upcomingSessions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Upcoming Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      {session.service_code.replace('-', ' ')}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${session.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {session.status}
                    </span>
                  </div>

                  {session.domain && <h3 className="font-bold text-gray-900 dark:text-white mb-4">{session.domain}</h3>}

                  {session.scheduled_for ? (
                    <div className="space-y-2 mb-6">
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        <span suppressHydrationWarning>{new Date(session.scheduled_for).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span suppressHydrationWarning>{new Date(session.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-6 italic">Date and time to be announced</p>
                  )}

                  {session.meeting_url ? (
                    <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-blue-500/20">
                      Join Meeting
                    </a>
                  ) : (
                    <button disabled className="block w-full py-2.5 text-center bg-gray-100 dark:bg-zinc-800 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                      Link pending
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Features</h2>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Link href={feature.href} key={idx} className="group block h-full">
              <div className="h-full bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col group-hover:border-blue-100 dark:group-hover:border-blue-900/50">
                
                {/* Background Decor */}
                <div className={`absolute -right-16 -top-16 w-40 h-40 rounded-full opacity-5 transition-transform duration-500 group-hover:scale-150 ${feature.color}`}></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`p-4 rounded-2xl text-white shadow-lg ${feature.color}`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                    feature.tag === 'Free' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    feature.tag === 'Popular' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    feature.tag === 'Special' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-purple-50 text-purple-600 border-purple-100'
                  }`}>
                    {feature.tag}
                  </span>
                </div>

                <div className="relative z-10 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                    {feature.description}
                  </p>
                </div>

                <div className="relative z-10 mt-auto flex items-center text-sm font-bold text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Get Started 
                  <span className="flex items-center justify-center w-8 h-8 ml-3 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:translate-x-2 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
