export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8">
        Privacy Policy
      </h1>
      <div className="prose dark:prose-invert max-w-none">
        <p>
          At Talenezio, accessible from our website, one of our main priorities is the
          privacy of our visitors. This Privacy Policy document contains types of
          information that is collected and recorded by Talenezio and how we use it.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-4">Information we collect</h2>
        <p>
          The personal information that you are asked to provide, and the reasons
          why you are asked to provide it, will be made clear to you at the point we
          ask you to provide your personal information.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-4">How we use your information</h2>
        <p>
          We use the information we collect in various ways, including to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our website</li>
        </ul>
      </div>
    </div>
  );
}
