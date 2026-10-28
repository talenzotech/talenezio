const sections = [
  ['introduction', '1. Introduction'],
  ['information-we-collect', '2. Information We Collect'],
  ['how-we-use-your-information', '3. How We Use Your Information'],
  ['legal-basis-for-processing', '4. Legal Basis for Processing'],
  ['how-we-share-your-information', '5. How We Share Your Information'],
  ['resumes-certificates-and-professional-information', '6. Resumes, Certificates and Professional Information'],
  ['cookies-and-similar-technologies', '7. Cookies and Similar Technologies'],
  ['data-retention', '8. Data Retention'],
  ['data-security', '9. Data Security'],
  ['your-privacy-rights', '10. Your Privacy Rights'],
  ['childrens-privacy', "11. Children's Privacy"],
  ['third-party-websites-and-services', '12. Third-Party Websites and Services'],
  ['marketing-communications', '13. Marketing Communications'],
  ['contact-us-and-privacy-grievances', '14. Contact Us and Privacy Grievances'],
  ['your-acknowledgment', '15. Your Acknowledgment'],
] as const

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
      <header className="border-b border-zinc-200 pb-10 dark:border-zinc-800">
        <h1 className="text-4xl font-semibold tracking-tight text-[#0f0c24] dark:text-zinc-100 sm:text-5xl">Privacy Policy</h1>
        <p className="mt-5 text-sm text-zinc-500 dark:text-zinc-400">Last Updated: 26 October 2026</p>
      </header>

      <nav aria-label="Privacy policy contents" className="border-b border-zinc-200 py-10 dark:border-zinc-800">
        <h2 className="mb-5 text-sm font-semibold text-[#0f0c24] dark:text-zinc-100">Contents</h2>
        <ol className="grid gap-x-8 gap-y-2 text-sm leading-6 sm:grid-cols-2">
          {sections.map(([id, title]) => (
            <li key={id}>
              <a href={`#${id}`} className="rounded-sm text-zinc-600 underline-offset-4 transition-colors hover:text-[#554FE8] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8057F3] dark:text-zinc-300 dark:hover:text-indigo-300">
                {title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 sm:text-base [&_h2]:scroll-mt-24 [&_h2]:border-t [&_h2]:border-zinc-200 [&_h2]:pb-1 [&_h2]:pt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[#0f0c24] [&_h2]:dark:border-zinc-800 [&_h2]:dark:text-zinc-100 [&_h2:first-child]:border-t-0 [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#0f0c24] [&_h3]:dark:text-zinc-100 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul_ul]:list-[circle] [&_a]:break-words [&_a]:text-[#554FE8] [&_a]:underline [&_a]:underline-offset-4 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-[#8057F3] [&_a]:dark:text-indigo-300">
        <h2 id="introduction">1. Introduction</h2>
        <p>Welcome to Talenezio.</p>
        <p>Talenezio is a career development platform designed to help students, freshers and professionals develop their skills, prepare for employment and improve their professional profiles.</p>
        <p>This Privacy Policy explains how Talenezio collects, uses, stores, shares and protects your personal information when you visit our website, create an account or use our services.</p>
        <p>We respect your privacy and are committed to handling your personal information responsibly and in accordance with applicable data protection and privacy laws in India.</p>
        <p>By using our website or services, you acknowledge that you have had the opportunity to read this Privacy Policy.</p>

        <h2 id="information-we-collect">2. Information We Collect</h2>
        <p>Depending on how you use Talenezio, we may collect the following categories of information.</p>
        <h3>A. Personal and Account Information</h3>
        <p>When you register or create an account, we may collect:</p>
        <ul><li>Full name</li><li>Email address</li><li>Phone number, if requested</li><li>Account login credentials and authentication information</li><li>Other information you voluntarily provide during registration</li></ul>
        <p>Passwords, where used, should be stored using appropriate secure hashing methods rather than in plain text.</p>
        <h3>B. Educational and Professional Information</h3>
        <p>To provide career-related services, we may collect information such as:</p>
        <ul><li>Educational qualifications</li><li>College or university details</li><li>Work experience and internship history</li><li>Skills, certifications and achievements</li><li>Career interests and employment preferences</li><li>Resume information and professional profile details</li><li>Information voluntarily shared during career guidance sessions</li></ul>
        <p>You should avoid submitting sensitive personal information unless it is genuinely necessary for the service and requested through an appropriate process.</p>
        <h3>C. Skill Assessment Information</h3>
        <p>When you participate in a Talenezio skill assessment, we may collect:</p>
        <ul><li>Assessment category and test details</li><li>Your answers and assessment responses</li><li>Scores and completion status</li><li>Assessment history</li><li>Certificate details and certificate identification numbers, where applicable</li></ul>
        <p>We use this information to calculate results, maintain assessment records, generate certificates where offered and improve our assessment services.</p>
        <h3>D. Payment Information</h3>
        <p>When you purchase a paid service, we may collect information needed to process and verify your transaction, such as:</p>
        <ul><li>Transaction reference or payment confirmation</li><li>Purchased service or package</li><li>Payment amount and transaction status</li><li>Billing information, where required</li></ul>
        <p>Payments may be processed through third-party payment providers. We do not intend to store complete payment card details or payment authentication credentials on our own systems. The information handled by a payment provider is subject to its own privacy policy and security practices.</p>
        <h3>E. Technical and Usage Information</h3>
        <p>When you access our website, certain information may be collected automatically, depending on the technologies we use:</p>
        <ul><li>IP address</li><li>Browser and device information</li><li>Operating system</li><li>Pages visited and features used</li><li>Access dates and times</li><li>Technical logs, error reports and security-related information</li><li>Cookies and similar technologies, where enabled</li></ul>
        <p>We use this information for website operation, troubleshooting, security, performance monitoring and service improvement.</p>

        <h2 id="how-we-use-your-information">3. How We Use Your Information</h2>
        <p>Talenezio may use your information for the following purposes:</p>
        <ul><li>To create and manage user accounts.</li><li>To provide access to free and paid services.</li><li>To conduct skill assessments and display assessment results.</li><li>To generate and verify certificates where applicable.</li><li>To help users create and improve resumes.</li><li>To provide career guidance, interview preparation and LinkedIn optimization.</li><li>To communicate about registrations, purchases, bookings, service updates and support requests.</li><li>To process and verify payments and eligible refunds.</li><li>To maintain website security and prevent fraud, cheating or unauthorized access.</li><li>To understand how users interact with our platform and improve our services.</li><li>To comply with legal obligations and respond to lawful requests.</li><li>To send promotional emails, updates or offers where permitted by law and subject to applicable consent and opt-out requirements.</li></ul>
        <p>We will not use personal information for purposes incompatible with the purposes disclosed to users unless we have an appropriate lawful basis to do so.</p>

        <h2 id="legal-basis-for-processing">4. Legal Basis for Processing</h2>
        <p>Where applicable under Indian data protection law, Talenezio will process personal information on an appropriate legal basis, including consent or other grounds permitted by law.</p>
        <p>Where consent is required, we will seek it through an appropriate process. Users may withdraw consent in accordance with applicable law, although this may affect our ability to provide certain services.</p>
        <p>Withdrawing consent does not invalidate processing lawfully completed before the withdrawal.</p>

        <h2 id="how-we-share-your-information">5. How We Share Your Information</h2>
        <p>Talenezio does not sell users&apos; personal information as a business practice.</p>
        <h3>A. Service Providers</h3>
        <p>We may share limited information with trusted service providers who help us operate the platform, such as:</p>
        <ul><li>Website hosting and infrastructure providers</li><li>Authentication and account management providers</li><li>Payment processing providers</li><li>Email and communication services</li><li>Analytics, security and technical support providers</li></ul>
        <p>These providers should receive only the information reasonably necessary to perform their services and should be subject to appropriate contractual, confidentiality and security requirements.</p>
        <h3>B. Employers and Third-Party Opportunities</h3>
        <p>Where users apply for an internship, job or other opportunity, relevant information may be shared with the employer or opportunity provider when necessary and appropriately authorized.</p>
        <p>We will explain the relevant information-sharing process where applicable. Users should review the privacy practices of external employers and platforms before submitting applications.</p>
        <h3>C. Legal and Security Requirements</h3>
        <p>We may disclose information where required by applicable law, a valid legal process or a competent authority, or where reasonably necessary to protect the rights, security and safety of users, Talenezio or others.</p>
        <h3>D. Business Transfers</h3>
        <p>If Talenezio undergoes a merger, acquisition, restructuring or transfer of business assets, personal information may be transferred as part of that transaction, subject to applicable law and appropriate safeguards.</p>

        <h2 id="resumes-certificates-and-professional-information">6. Resumes, Certificates and Professional Information</h2>
        <p>Users may upload resumes, enter career information or generate professional documents using Talenezio.</p>
        <ul><li>Users are responsible for reviewing the accuracy of information they submit.</li><li>Resumes and professional information will be used to provide the relevant services.</li><li>We will not make a user&apos;s resume publicly available without an appropriate authorization or other lawful basis.</li><li>Certificate verification information may be accessible to authorized persons or through a verification feature if Talenezio introduces one.</li><li>We will disclose the scope of any public certificate-verification feature before or when it is introduced.</li></ul>
        <p>Users should avoid including unnecessary sensitive information in resumes or other documents.</p>

        <h2 id="cookies-and-similar-technologies">7. Cookies and Similar Technologies</h2>
        <p>Talenezio may use cookies and similar technologies to:</p>
        <ul><li>Keep users signed in.</li><li>Maintain essential website functionality.</li><li>Remember user preferences.</li><li>Understand website performance.</li><li>Improve user experience.</li><li>Measure promotional performance, where applicable.</li></ul>
        <p>Essential cookies may be necessary for the website to function. Where required by law, we will obtain consent before using non-essential cookies or similar technologies.</p>
        <p>Users may manage cookies through available website settings or their browser settings. Disabling certain cookies may affect some website features.</p>

        <h2 id="data-retention">8. Data Retention</h2>
        <p>Talenezio retains personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including providing services, maintaining records, resolving disputes, enforcing agreements and meeting legal obligations.</p>
        <p>Retention periods may vary depending on the type of information and the purpose for which it is collected.</p>
        <p>When information is no longer required, we will take appropriate steps to delete it or anonymize it, subject to applicable legal requirements and legitimate record-retention needs.</p>
        <p>Deleting an account may not immediately remove information that must be retained by law or that is required for legitimate security, fraud-prevention or dispute-resolution purposes.</p>

        <h2 id="data-security">9. Data Security</h2>
        <p>Talenezio takes reasonable technical and organizational measures to protect personal information against unauthorized access, disclosure, alteration, loss or misuse.</p>
        <p>Depending on the systems used, these measures may include access controls, encryption where appropriate, secure authentication, protected hosting and monitoring for suspicious activity.</p>
        <p>However, no website, digital platform or method of electronic transmission can be guaranteed to be completely secure.</p>
        <p>Users should keep their login credentials confidential and promptly notify us if they suspect unauthorized access to their accounts.</p>
        <p>If a personal data breach occurs, Talenezio will take appropriate steps in accordance with applicable law, including notifying affected users and relevant authorities where required.</p>

        <h2 id="your-privacy-rights">10. Your Privacy Rights</h2>
        <p>Subject to applicable law, users may have the right to:</p>
        <ul><li>Request information about personal data being processed.</li><li>Request correction or updating of inaccurate or incomplete information.</li><li>Request deletion of personal information where legally applicable.</li><li>Withdraw consent where processing is based on consent.</li><li>Raise concerns about the handling of their personal information.</li><li>Seek available grievance redressal or other remedies under applicable law.</li></ul>
        <p>Certain information may need to be retained where legally required or where another lawful basis applies.</p>
        <p>To exercise your rights, please contact us using the details in the Contact Us section below. We may need to verify your identity before processing a request.</p>

        <h2 id="childrens-privacy">11. Children&apos;s Privacy</h2>
        <p>Talenezio is primarily intended for students, freshers and professionals seeking career development services.</p>
        <p>If a user is under 18, we will handle their personal information in accordance with applicable requirements relating to children and parental or guardian consent.</p>
        <p>Where required by law, we will obtain verifiable parental or guardian consent before processing a child&apos;s personal data and will apply any other required safeguards.</p>
        <p>We do not knowingly seek to collect children&apos;s personal information in violation of applicable law.</p>

        <h2 id="third-party-websites-and-services">12. Third-Party Websites and Services</h2>
        <p>Our website may contain links to external websites, including LinkedIn, employer websites, payment services and other career-related platforms.</p>
        <p>Talenezio does not control the privacy practices of these external services. When you leave our website or interact with a third-party service, its privacy policy and terms may apply.</p>
        <p>We encourage users to review those policies before sharing personal information with third parties.</p>

        <h2 id="marketing-communications">13. Marketing Communications</h2>
        <p>Talenezio may send information about services, career resources, new features, events or promotional offers where permitted by law.</p>
        <p>Users may opt out of promotional communications through the unsubscribe option, where available, or by contacting us.</p>
        <p>Opting out of promotional communications will not necessarily stop essential service-related messages, such as account security notifications, purchase confirmations or important changes to our services.</p>

        <h2 id="contact-us-and-privacy-grievances">14. Contact Us and Privacy Grievances</h2>
        <p>If you have questions about this Privacy Policy, wish to exercise your privacy rights or want to raise a concern about the handling of their personal information, please contact:</p>
        <p>Talenezio<br />Email: <a href="mailto:taleneziocontact@gmail.com">taleneziocontact@gmail.com</a><br />Website: <a href="https://talenezio.com">talenezio.com</a></p>
        <p>Please describe your request clearly. We may request additional information to verify your identity and protect your account.</p>
        <p>Talenezio will handle privacy-related complaints in accordance with applicable law and any applicable grievance-redressal requirements.</p>

        <h2 id="your-acknowledgment">15. Your Acknowledgment</h2>
        <p>By using Talenezio, you acknowledge that you have had the opportunity to read this Privacy Policy and understand how your personal information may be handled as described here.</p>
        <p>Where consent is legally required for a particular activity, this acknowledgment does not replace the need to obtain that consent.</p>
        <p>Your privacy matters to us. Talenezio is committed to handling your information responsibly while helping you take the next step in your career.</p>
      </article>
    </main>
  )
}
