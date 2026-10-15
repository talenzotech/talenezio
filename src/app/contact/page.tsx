import { Mail } from "lucide-react";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8">
        Contact Us
      </h1>
      <div className="max-w-xl">
        <div className="mb-10 space-y-4">
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Have a question or need assistance? Reach out to us directly or fill out the form below.
          </p>
          <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 pt-1">
            <a
              href="https://www.linkedin.com/company/talenzoofficial/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="flex items-center justify-center h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
            <a
              href="mailto:Taleneziocontact@gmail.com"
              aria-label="Email"
              title="Email"
              className="flex items-center justify-center h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/talenezio_officail?exln=MWJoMWpjOWhyNHc3Zg=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
              className="flex items-center justify-center h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-300 dark:hover:border-pink-700 transition-colors shadow-sm"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm px-4 py-2 border"
                placeholder="John Doe"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm px-4 py-2 border"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Message
            </label>
            <div className="mt-1">
              <textarea
                id="message"
                name="message"
                rows={4}
                className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm px-4 py-2 border"
                placeholder="How can we help you?"
              />
            </div>
          </div>
          <div>
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-zinc-900 dark:bg-zinc-100 py-2 px-4 text-sm font-medium text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
