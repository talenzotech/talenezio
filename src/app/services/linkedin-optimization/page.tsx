import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import ServiceCheckout from '@/components/services/ServiceCheckout';
import FeatureBottomNav from '@/components/FeatureBottomNav';

export default function LinkedInOptimizationPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 pb-24 dark:bg-gray-950 sm:px-8 sm:pb-28">
      <div className="mx-auto max-w-3xl">
        <Link href="/services" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600"><ArrowLeft className="h-4 w-4" /> All services</Link>
        <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-900 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">₹149</p>
          <h1 className="mt-3 text-4xl font-extrabold text-gray-900 dark:text-white">LinkedIn Optimization</h1>
          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-400">Get focused recommendations to position your profile for the roles you want.</p>
          <ul className="my-8 space-y-4 text-gray-700 dark:text-gray-300">
            {['Profile review', 'Headline and summary recommendations', 'Experience section guidance', 'Five-day access window'].map((item) => <li key={item} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600" /> {item}</li>)}
          </ul>
          <ServiceCheckout productCode="service:linkedin-optimization" title="LinkedIn Optimization" />
          <p className="mt-3 text-center text-xs text-gray-500">Free for eligible users with an approved unlock entitlement.</p>
        </div>
      </div>

      <FeatureBottomNav />
    </main>
  );
}
