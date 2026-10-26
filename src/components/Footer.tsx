import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black pt-8 pb-28 sm:pb-32 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Talenezio
          </span>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            © {new Date().getFullYear()} Talenezio. All rights reserved.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
}
