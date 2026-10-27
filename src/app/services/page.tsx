import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react';
import ServiceCheckout from '@/components/services/ServiceCheckout';
import ServiceEnquiryForm from '@/components/services/ServiceEnquiryForm';
import FeatureBottomNav from '@/components/FeatureBottomNav';
import { SERVICE_CATALOG } from '@/lib/services/catalog';

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 pb-24 dark:bg-gray-950 sm:px-8 sm:pb-28">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Talenezio services</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">Choose the support you need next.</h1>
          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-400">Every paid offer has a clear price and delivery path. Approved free-unlock users can access eligible services without payment.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Object.values(SERVICE_CATALOG).map((service) => (
            <article id={service.code === 'internships' ? 'internships' : undefined} key={service.code} className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"><BriefcaseBusiness className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{service.title}</h2>
                </div>
                <span className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {service.pricePaise === null ? 'Enquire' : `₹${service.pricePaise / 100}`}
                </span>
              </div>
              <p className="mb-5 text-gray-600 dark:text-gray-400">{service.description}</p>
              <ul className="mb-7 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {service.inclusions.map((inclusion) => <li key={inclusion}>• {inclusion}</li>)}
              </ul>
              {service.paid ? (
                <>
                  <ServiceCheckout productCode={`service:${service.code}`} title={service.title} />
                  {service.freeUnlock && <p className="mt-3 text-center text-xs text-gray-500">Also available with an approved free unlock.</p>}
                </>
              ) : (
                <ServiceEnquiryForm serviceCode={service.code as 'courses' | 'internships'} />
              )}
            </article>
          ))}
        </div>
      </div>

      <FeatureBottomNav />
    </main>
  );
}
