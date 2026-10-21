export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8">
        Terms and Conditions
      </h1>
      <div className="prose dark:prose-invert max-w-none">
        <p>
          Welcome to Talenezio. These terms and conditions outline the rules and
           regulations for the use of Talenezio&apos;s Website.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing this website we assume you accept these terms and conditions.
          Do not continue to use Talenezio if you do not agree to take all of the
          terms and conditions stated on this page.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-4">2. License</h2>
        <p>
           Unless otherwise stated, Talenezio and/or its licensors own the
           intellectual property rights for all material on Talenezio. All
          intellectual property rights are reserved.
        </p>
        {/* Add more terms content as needed */}
      </div>
    </div>
  );
}
