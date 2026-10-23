import { ReactNode } from 'react'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-50 dark:bg-gray-950">
      {/* Left side - Brand/Visuals */}
      <div className="relative hidden md:flex flex-col justify-between p-12 bg-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/80 to-transparent"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-xl">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Talenezio</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Accelerate your career journey today.
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            Join thousands of professionals taking mock tests, securing internships, and unlocking their true potential.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-3 md:hidden mb-12">
            <div className="p-2 bg-blue-600 rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Talenezio</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
