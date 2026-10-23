import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, User, CheckCircle, ChevronRight, Compass } from 'lucide-react';
import ServiceCheckout from '@/components/services/ServiceCheckout';

export default function CounselingPage() {
  const plans = [
    {
      title: "1-on-1 Guidance",
      price: "₹299",
      description: "A focused one-hour session to discuss your specific career hurdles.",
      features: [
        "One-hour video call",
        "Career direction review",
        "Action plan",
        "Participation certificate"
      ],
      popular: false
    },
    {
      title: "Career Starter Pack",
      price: "₹299",
      description: "A compact launch package combining assessment, preparation, and resume review.",
      features: [
        "10 total test attempts",
        "Interview preparation",
        "Resume review",
        "Certificate of Completion"
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent dark:from-blue-900/20"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-blue-500/20 dark:bg-blue-900/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium text-sm mb-8 border border-blue-200 dark:border-blue-800/50">
              <Compass className="w-4 h-4" />
              <span>Expert Career Guidance</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
              Navigate Your Career Path with <span className="text-blue-600 dark:text-blue-500">Clarity</span>.
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-lg">
              Feeling stuck? Not getting callbacks? Talk to industry veterans who have successfully navigated the modern job market and get actionable advice.
            </p>

            <a href="#pricing" className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 transition-all items-center gap-2 text-lg">
              View Pricing Plans
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          <div className="flex-1 w-full max-w-lg">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 relative">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 dark:bg-blue-900/50 rounded-full blur-2xl -z-10"></div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800">
                     <p className="text-sm text-gray-700 dark:text-gray-300">I&apos;ve applied to 50 jobs this month and haven&apos;t gotten a single interview. What am I doing wrong?</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 flex-row-reverse">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                    <span className="text-white font-bold">T</span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl rounded-tr-none border border-blue-100 dark:border-blue-900/50">
                     <p className="text-sm text-gray-900 dark:text-gray-100">Let&apos;s look at your LinkedIn and Resume. The ATS systems are likely filtering you out before a human even sees it. We can fix this today.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Invest in yourself. Our counseling sessions have helped hundreds of candidates secure their dream roles and negotiate better salaries.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, idx) => (
              <div key={idx} className={`relative bg-white dark:bg-gray-950 p-8 rounded-3xl border ${plan.popular ? 'border-blue-500 shadow-2xl shadow-blue-500/10' : 'border-gray-200 dark:border-gray-800 shadow-sm'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                   <span className="text-gray-500 dark:text-gray-400">{plan.title === 'Career Starter Pack' ? '/package' : '/session'}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <ServiceCheckout
                  productCode={plan.title === 'Career Starter Pack' ? 'service:career-starter-pack' : 'service:career-counseling'}
                  title={plan.title}
                />
                <p className="mt-3 text-center text-xs text-gray-500">Available free with an approved unlock entitlement.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
