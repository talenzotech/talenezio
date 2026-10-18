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
          <div className="flex flex-col space-y-2 text-zinc-700 dark:text-zinc-300">
            <p>
              <strong>Email:</strong> <a href="mailto:support@example.com" className="hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4">[Email to be provided]</a>
            </p>
            <p>
              <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/company/talenezioofficial/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4">Talenezio Official</a>
            </p>
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
