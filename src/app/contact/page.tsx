'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const mailtoUrl = `mailto:taleneziocontact@gmail.com?subject=${encodeURIComponent(`Talenezio Inquiry from ${name.trim() || 'Website Visitor'}`)}&body=${encodeURIComponent(`Name: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setError('Please provide your name.');
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      setError('Please provide a message with at least 10 characters.');
      return;
    }

    // Direct user to email support
    const subject = encodeURIComponent(`Talenezio Inquiry from ${trimmedName}`);
    const body = encodeURIComponent(
      `Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}`
    );
    window.location.href = `mailto:taleneziocontact@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8">
        Contact Us
      </h1>
      <div className="max-w-xl">
        <div className="mb-10 space-y-4">
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Have a question or need assistance? Reach out to us directly or fill out the form below to compose an inquiry.
          </p>
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Social Profiles & Contact
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-zinc-600 dark:text-zinc-400 pt-1" aria-label="Social Profiles">
            <a
              href="mailto:taleneziocontact@gmail.com"
              aria-label="Send email to taleneziocontact@gmail.com"
              title="Email taleneziocontact@gmail.com"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm cursor-pointer touch-manipulation"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = 'mailto:taleneziocontact@gmail.com';
                }
              }}
            >
              <Mail className="h-4 w-4 text-blue-600 pointer-events-none" />
              <span>taleneziocontact@gmail.com</span>
            </a>
            <a
              href="mailto:taleneziocontact@gmail.com"
              aria-label="Send Email to taleneziocontact@gmail.com"
              title="Send Email"
              className="flex items-center justify-center h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:border-blue-700 transition-colors shadow-sm cursor-pointer touch-manipulation"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = 'mailto:taleneziocontact@gmail.com';
                }
              }}
            >
              <Mail className="h-5 w-5 pointer-events-none" />
            </a>
            <a
              href="https://www.linkedin.com/company/talenzoofficial/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="flex items-center justify-center h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:border-blue-700 transition-colors shadow-sm"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/talenezio?dlrf=ZWVlcXRwNjJjd2xu"
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
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/40">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-3">
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Opening your email client...
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Your inquiry has been prepared for{' '}
                  <a
                    href={mailtoUrl}
                    className="font-medium underline hover:text-emerald-900 dark:hover:text-emerald-100"
                  >
                    taleneziocontact@gmail.com
                  </a>
                  . If your email app did not open automatically, click the button below:
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={mailtoUrl}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
                  >
                    <Mail className="h-4 w-4" /> Open Email Client
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold text-emerald-800 underline dark:text-emerald-300 hover:text-emerald-900"
                  >
                    Edit message
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block min-h-11 w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm px-4 py-2 border"
                  placeholder="John Doe"
                  required
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block min-h-11 w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm px-4 py-2 border"
                  placeholder="you@example.com"
                  required
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
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="block min-h-11 w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm px-4 py-2 border"
                  placeholder="How can we help you?"
                  required
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-transparent bg-blue-600 hover:bg-blue-700 py-2.5 px-6 text-sm font-semibold text-white shadow-sm transition-colors cursor-pointer"
              >
                <Mail className="h-4 w-4" /> Send Email Inquiry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
