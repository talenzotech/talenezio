import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signout } from '../(auth)/actions'
import {
  LogOut,
  FileText,
  Target,
  GraduationCap,
  BriefcaseBusiness,
  UserCheck,
  ArrowRight,
  CalendarDays,
  Clock,
} from 'lucide-react'
import { isLocalDemoSession } from '@/lib/auth/local-demo'
import FeatureBottomNav from '@/components/FeatureBottomNav'
import { DashboardHeroBanner } from '@/components/dashboard/DashboardHeroBanner'
import { MotivationBanner } from '@/components/dashboard/MotivationBanner'

export default async function DashboardPage() {
  const localDemoSession = await isLocalDemoSession()
  const supabase = localDemoSession ? null : await createClient()
  const { data: { user } } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } }

  if (!user && !localDemoSession) {
    redirect('/login')
  }

  const userMetadata = user?.user_metadata || {}
  const fullName = localDemoSession ? 'Demo User' : userMetadata.full_name || 'Guest'
  const firstName = fullName.split(' ')[0]
  const avatarUrl = userMetadata.avatar_url || null

  // Fetch upcoming sessions for this user
  const upcomingSessionsQuery = supabase
    ?.from('bookings')
    .select('*')
    .eq('user_id', user?.id || '')
    .in('status', ['pending', 'confirmed'])
    .order('scheduled_for', { ascending: true, nullsFirst: false })
    .limit(3)
  const { data: upcomingSessions } = upcomingSessionsQuery
    ? await upcomingSessionsQuery
    : { data: [] }

  const serviceOrdersQuery = supabase
    ?.from('service_orders')
    .select('id, service_code, status, scheduled_for, meeting_url, fulfilment_note')
    .order('created_at', { ascending: false })
    .limit(5)
  const { data: serviceOrders } = serviceOrdersQuery
    ? await serviceOrdersQuery
    : { data: [] }

  const features = [
    {
      title: 'Skill Assessments',
      description: 'Assess your knowledge in Technology, Finance, Digital Marketing and AI to identify your strengths and areas for improvement.',
      icon: Target,
      href: '/tests',
      color: 'bg-blue-600',
      tag: 'Popular',
    },
    {
      title: 'Resume Building',
      description: 'Create professional, recruiter-friendly resumes that showcase your skills, experience and potential.',
      icon: FileText,
      href: '/resume-builder',
      color: 'bg-emerald-500',
      tag: 'Free',
    },
    {
      title: 'Internship Opportunities',
      description: 'Explore opportunities to gain practical experience, develop valuable skills and take your first steps into the professional world.',
      icon: GraduationCap,
      href: '/services',
      color: 'bg-amber-500',
      tag: 'New',
    },
    {
      title: 'Expert-Led Career Support',
      description: 'Get practical interview preparation and focused career guidance built around your next opportunity.',
      icon: BriefcaseBusiness,
      href: '/career',
      color: 'bg-purple-600',
      tag: 'Pro',
    },
    {
      title: 'LinkedIn Optimization',
      description: 'Strengthen your professional presence with an optimized LinkedIn profile, compelling content ideas and a personal brand that stands out.',
      icon: UserCheck,
      href: '/services/linkedin-optimization',
      color: 'bg-sky-600',
      tag: 'Pro',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-28 dark:bg-gray-950">
      
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="Talenezio home">
            <Image
              src="/talenezio-logo.png"
              alt="Talenezio Logo"
              width={40}
              height={40}
              priority
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Talenezio</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
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
        <DashboardHeroBanner />
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

        {serviceOrders && serviceOrders.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Your Service Orders</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {serviceOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold capitalize text-gray-900 dark:text-white">{order.service_code.replaceAll('-', ' ')}</p>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold capitalize text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">{order.status.replaceAll('_', ' ')}</span>
                  </div>
                  {order.scheduled_for && <p className="mt-3 text-sm text-gray-500"><span suppressHydrationWarning>{new Date(order.scheduled_for).toLocaleString()}</span></p>}
                  {order.fulfilment_note && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{order.fulfilment_note}</p>}
                  {order.meeting_url && <a href={order.meeting_url} target="_blank" rel="noopener noreferrer" className="mt-4 block rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-bold text-white">Open delivery link</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explore Features Section - Exact content, styling and layout from main */}
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
                    feature.tag === 'Free' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 
                    feature.tag === 'Popular' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' :
                    feature.tag === 'New' || feature.tag === 'Special' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' :
                    'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
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

        {/* Motivation Banner below Feature Cards */}
        <MotivationBanner />

      </main>

      {/* Fixed Feature Bottom Navigation */}
      <FeatureBottomNav />
    </div>
  )
}
