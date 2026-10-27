import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Video, Target, Award, CheckCircle, Shield, Briefcase } from 'lucide-react';
import ServiceCheckout from '@/components/services/ServiceCheckout';
import FeatureBottomNav from '@/components/FeatureBottomNav';

export default function InterviewPrepPage() {
  const features = [
    {
      title: "3 Live Google Meet Sessions",
      description: "Face-to-face mock interviews with industry experts providing real-time feedback.",
      icon: Video
    },
    {
      title: "5 Rigorous Mock Tests",
      description: "Industry-standard coding and aptitude assessments to sharpen your problem-solving skills.",
      icon: Target
    },
    {
      title: "Detailed Performance Analytics",
      description: "Comprehensive breakdown of your strengths and areas needing improvement.",
      icon: Award
    }
  ];

  const syllabus = [
    "Day 1-2: Resume Review & Behavioral Prep",
    "Day 3-4: Data Structures & Algorithms Deep Dive",
    "Day 5: First Live Mock Interview (Technical)",
    "Day 6-7: System Design & Advanced Architecture",
    "Day 8: Final Live Mock Interview & Action Plan"
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12 dark:bg-gray-950 sm:pb-16">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Talenezio</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent dark:from-purple-900/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/20 dark:bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium text-sm mb-8 border border-purple-200 dark:border-purple-800/50">
            <Shield className="w-4 h-4" />
            <span>8-Day Intensive Program</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 leading-tight">
            Crack Your Dream Job with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
              Confidence
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop getting rejected in the final rounds. Practice with MAANG engineers, take rigorous mock tests, and get the feedback you need to succeed.
          </p>

          <div id="enroll" className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-full sm:w-auto sm:min-w-64">
              <ServiceCheckout productCode="service:interview-prep" title="Interview Preparation" />
              <p className="mt-2 text-center text-xs text-gray-500">₹399 or free with an approved unlock entitlement.</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">or</p>
            <a href="#syllabus" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center">
              View Syllabus
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Syllabus & Trust */}
      <section id="syllabus" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What you&apos;ll learn in 8 days</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Our curriculum is designed by industry experts to simulate the exact pressure and expectations of top-tier company interviews.
            </p>
            
            <div className="space-y-4">
              {syllabus.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-gray-900 dark:text-gray-200 font-medium pt-1">{item}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-purple-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Briefcase className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Are you ready to commit?</h3>
              <p className="text-purple-200 mb-8 leading-relaxed">
                This program is intensive. We require 2-3 hours of your time daily for the duration of the 8 days. If you put in the work, we guarantee a massive improvement in your interview performance.
              </p>
              
              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-3 text-purple-100">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  Lifetime access to recorded sessions
                </li>
                <li className="flex items-center gap-3 text-purple-100">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  Exclusive discord community access
                </li>
                <li className="flex items-center gap-3 text-purple-100">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  100% money-back guarantee (within 2 days)
                </li>
              </ul>
              
              <a href="#enroll" className="block text-center w-full py-4 bg-white text-purple-900 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                Start Your Journey Today
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bottom Navigation */}
      <FeatureBottomNav />
    </div>
  );
}
