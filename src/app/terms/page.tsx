const sections = [
  ['about-talenezio', '1. About Talenezio'],
  ['eligibility', '2. Eligibility'],
  ['user-accounts-and-registration', '3. User Accounts and Registration'],
  ['skill-assessments-and-certificates', '4. Skill Assessments and Certificates'],
  ['resume-builder', '5. Resume Builder'],
  ['internship-opportunities-and-career-resources', '6. Internship Opportunities and Career Resources'],
  ['career-guidance-and-interview-preparation', '7. Career Guidance and Interview Preparation'],
  ['linkedin-optimization', '8. LinkedIn Optimization'],
  ['fees-payments-and-refunds', '9. Fees, Payments and Refunds'],
  ['acceptable-use', '10. Acceptable Use'],
  ['intellectual-property', '11. Intellectual Property'],
  ['user-content-and-information', '12. User Content and Information'],
  ['third-party-websites-and-services', '13. Third-Party Websites and Services'],
  ['website-availability-and-changes', '14. Website Availability and Changes'],
  ['limitation-of-liability', '15. Limitation of Liability'],
  ['privacy-and-data-protection', '16. Privacy and Data Protection'],
  ['suspension-and-termination', '17. Suspension and Termination'],
  ['changes-to-these-terms', '18. Changes to These Terms'],
  ['governing-law-and-dispute-resolution', '19. Governing Law and Dispute Resolution'],
  ['contact-information', '20. Contact Information'],
  ['acceptance-of-terms', '21. Acceptance of Terms'],
] as const

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
      <header className="border-b border-zinc-200 pb-10 dark:border-zinc-800">
      <h1 className="text-4xl font-semibold tracking-tight text-[#0f0c24] dark:text-zinc-100 sm:text-5xl">
        Terms and Conditions
      </h1>
      <p className="mt-5 text-sm text-zinc-500 dark:text-zinc-400">Last Updated: 26 October 2026</p>
      </header>

      <nav aria-label="Terms and conditions contents" className="border-b border-zinc-200 py-10 dark:border-zinc-800">
        <h2 className="mb-5 text-sm font-semibold text-[#0f0c24] dark:text-zinc-100">Contents</h2>
        <ol className="grid gap-x-8 gap-y-2 text-sm leading-6 sm:grid-cols-2">
          {sections.map(([id, title]) => (
            <li key={id}>
              <a href={`#${id}`} className="rounded-sm text-zinc-600 underline-offset-4 transition-colors hover:text-[#554FE8] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8057F3] dark:text-zinc-300 dark:hover:text-indigo-300">{title}</a>
            </li>
          ))}
        </ol>
      </nav>
      <article className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 sm:text-base [&_h2]:scroll-mt-24 [&_h2]:border-t [&_h2]:border-zinc-200 [&_h2]:pb-1 [&_h2]:pt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[#0f0c24] [&_h2]:dark:border-zinc-800 [&_h2]:dark:text-zinc-100 [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#0f0c24] [&_h3]:dark:text-zinc-100 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul_ul]:list-[circle] [&_a]:break-words [&_a]:text-[#554FE8] [&_a]:underline [&_a]:underline-offset-4 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-[#8057F3] [&_a]:dark:text-indigo-300">
        <p>Welcome to Talenezio. These Terms and Conditions govern your access to and use of the Talenezio website, platform and services. By accessing our website, creating an account or using any of our services, you agree to these Terms and Conditions.</p>
        <p>Please read them carefully before using the platform.</p>

        <h2 id="about-talenezio">1. About Talenezio</h2>
        <p>Talenezio is a career development platform designed to help students, freshers and professionals improve their skills, prepare for employment and develop their professional profiles.</p>
        <p>Our services may include:</p>
        <ul><li>Skill assessments and online tests</li><li>Resume building</li><li>Internship opportunities and career-related resources</li><li>Career guidance and counselling</li><li>Interview preparation and mock interviews</li><li>LinkedIn profile optimization</li><li>Other career development services introduced in the future</li></ul>

        <h2 id="eligibility">2. Eligibility</h2>
        <p>By using Talenezio, you confirm that:</p>
        <ul><li>You are at least 18 years old, or you have the consent of a parent or legal guardian where required.</li><li>The information you provide during registration is accurate and up to date.</li><li>You will use the platform for lawful purposes.</li><li>You will comply with these Terms and Conditions and all applicable laws.</li></ul>
        <p>If you are under 18, you should use paid services only with the involvement and consent of a parent or legal guardian where legally required.</p>

        <h2 id="user-accounts-and-registration">3. User Accounts and Registration</h2>
        <p>Certain features of Talenezio may require you to create an account.</p>
        <p>You agree to:</p>
        <ul><li>Provide accurate registration details.</li><li>Keep your login credentials confidential.</li><li>Avoid sharing your account with unauthorized individuals.</li><li>Notify us if you suspect unauthorized access to your account.</li><li>Avoid creating accounts using false identities or another person&apos;s information without permission.</li></ul>
        <p>Talenezio reserves the right to suspend or restrict accounts involved in fraudulent activity, misuse or violations of these Terms, subject to applicable law.</p>

        <h2 id="skill-assessments-and-certificates">4. Skill Assessments and Certificates</h2>
        <p>Talenezio may offer free and paid skill assessments in areas such as Technology, Software Engineering, Finance, Digital Marketing and Artificial Intelligence.</p>
        <ul><li>Each assessment may have its own question count, format, time limit and eligibility requirements.</li><li>Users must complete assessments independently and must not engage in cheating, impersonation or unauthorized sharing of answers.</li><li>Certificates, where offered, reflect the results recorded by our platform under the applicable assessment rules.</li><li>Certificates are not academic degrees, government qualifications, professional licences or guarantees of employment.</li><li>A certificate does not guarantee that an employer will recognize it or that a candidate will be selected for a job or internship.</li><li>Talenezio may update assessment questions, formats, scoring methods and certificate designs to improve the platform.</li><li>Users must not forge, alter or misrepresent Talenezio certificates or assessment results.</li></ul>
        <p>Talenezio aims to maintain accurate assessment records but does not guarantee that every assessment is free from technical errors or interruptions.</p>

        <h2 id="resume-builder">5. Resume Builder</h2>
        <p>Talenezio may provide tools and resources to help users create and improve their resumes.</p>
        <ul><li>Users are responsible for ensuring that the information in their resumes is truthful and accurate.</li><li>Talenezio does not guarantee that a resume will pass every Applicant Tracking System (ATS) or meet every employer&apos;s requirements.</li><li>Users are responsible for reviewing and verifying their final resumes before submitting them to employers.</li><li>Users must not use our tools to create resumes containing fabricated qualifications, employment history, achievements or credentials.</li></ul>
        <p>Resume templates and suggestions are intended to assist users and should be adapted to their individual needs.</p>

        <h2 id="internship-opportunities-and-career-resources">6. Internship Opportunities and Career Resources</h2>
        <p>Talenezio may publish, promote or facilitate access to internship opportunities, job-related resources and career information.</p>
        <ul><li>The availability of opportunities may change without notice.</li><li>Applications may be subject to additional requirements established by employers or other third parties.</li><li>Talenezio does not guarantee internships, job offers, interviews, placements, salaries or employment outcomes.</li><li>Selection decisions are made by the relevant employer or organization unless explicitly stated otherwise.</li><li>Users are responsible for verifying opportunity details and communicating professionally with recruiters.</li><li>Talenezio is not responsible for decisions made by third-party employers or for disputes arising directly between users and those employers, except where applicable law provides otherwise.</li></ul>
        <p>Any opportunity presented directly by Talenezio will be subject to its separately communicated terms, where applicable.</p>

        <h2 id="career-guidance-and-interview-preparation">7. Career Guidance and Interview Preparation</h2>
        <p>Talenezio may offer career counselling, interview preparation, mock interviews and related services. These services are intended to provide educational support, practical guidance and professional development assistance.</p>
        <ul><li>Advice is based on the information available to us and the scope of the service purchased.</li><li>Users are responsible for their own career decisions.</li><li>We do not guarantee interview success, job placement, salary increases, admission to educational institutions or any specific professional outcome.</li><li>Users should provide accurate information about their goals, experience and qualifications to receive relevant guidance.</li><li>Session duration, scheduling, deliverables and other service-specific conditions will be communicated where applicable.</li></ul>
        <p>Career guidance is not a substitute for legal, financial, medical or other regulated professional advice.</p>

        <h2 id="linkedin-optimization">8. LinkedIn Optimization</h2>
        <p>Talenezio may provide LinkedIn profile reviews, profile optimization, banner or display-picture assistance, content suggestions and other professional branding services.</p>
        <ul><li>Users must provide accurate information about their experience, qualifications and achievements.</li><li>Talenezio will not knowingly create or promote false professional claims.</li><li>Any content created for users should be reviewed and approved by them before publication.</li><li>Deliverables, timelines, content quantities and revision limits will depend on the selected package.</li><li>Talenezio does not guarantee profile views, followers, engagement, recruiter responses, interviews or job offers.</li></ul>
        <p>Users remain responsible for complying with LinkedIn&apos;s terms, policies and professional standards.</p>

        <h2 id="fees-payments-and-refunds">9. Fees, Payments and Refunds</h2>
        <p>Some Talenezio services may be offered free of charge, while others may require payment.</p>
        <ul><li>Applicable prices and service details will be displayed or communicated before purchase.</li><li>Users must provide accurate payment information and complete the payment process through the available payment methods.</li><li>Applicable taxes, if any, will be communicated where required.</li><li>Paid services will be provided according to the description of the purchased package.</li><li>Refunds, cancellations, rescheduling and service adjustments will be governed by the applicable service-specific policy and applicable law.</li><li>Nothing in these Terms excludes a refund or remedy that a user is legally entitled to receive.</li></ul>
        <p>Where a service-specific refund policy applies, users should review it before completing their purchase. Talenezio will handle eligible refund requests in accordance with the stated policy and applicable consumer protection laws.</p>

        <h2 id="acceptable-use">10. Acceptable Use</h2>
        <p>Users agree not to:</p>
        <ul><li>Use the platform for unlawful, fraudulent or misleading activities.</li><li>Cheat on assessments or manipulate assessment results.</li><li>Copy, reproduce, distribute or commercially exploit Talenezio content without authorization.</li><li>Attempt to gain unauthorized access to the website, its accounts or systems.</li><li>Introduce malicious software, disrupt services or interfere with platform security.</li><li>Impersonate another person or submit false information.</li><li>Harass, threaten, defame or violate the rights of other users.</li><li>Misuse certificates, logos, trademarks or other Talenezio materials.</li><li>Use automated tools to scrape, extract or reproduce platform content without authorization.</li></ul>
        <p>Talenezio may investigate suspected violations and take proportionate action, including restricting access or suspending accounts, subject to applicable law.</p>

        <h2 id="intellectual-property">11. Intellectual Property</h2>
        <p>Unless otherwise stated, the Talenezio name, logo, website design, original content, assessment materials, branding, graphics and other platform materials are owned by Talenezio or used under appropriate authorization.</p>
        <p>Users may access these materials for their intended personal career development purposes.</p>
        <p>Users must not reproduce, modify, distribute, sell or commercially exploit Talenezio intellectual property without prior written permission, except where permitted by law.</p>
        <p>Users retain rights in their original personal information and content, subject to the permissions necessary to provide the services they request.</p>

        <h2 id="user-content-and-information">12. User Content and Information</h2>
        <p>Users may submit personal details, resumes, career preferences, profile information, assessment responses and other materials while using Talenezio.</p>
        <p>Users confirm that they have the right to submit such materials and that doing so does not unlawfully violate another person&apos;s rights.</p>
        <p>Talenezio will handle personal information in accordance with its Privacy Policy and applicable data protection laws.</p>
        <p>We will use submitted information only for disclosed purposes and other purposes permitted by applicable law. Any additional use of user content, such as promotional use of identifiable information, will require an appropriate lawful basis and consent where required.</p>

        <h2 id="third-party-websites-and-services">13. Third-Party Websites and Services</h2>
        <p>Talenezio may include links to or integrations with third-party websites, employers, payment providers, recruitment platforms or other services. These third parties operate under their own terms and privacy policies. Talenezio does not control all third-party content, practices or availability.</p>
        <p>Users should review the relevant third-party terms before sharing information or engaging with external services. Nothing in this section limits any responsibility that Talenezio may have under applicable law.</p>

        <h2 id="website-availability-and-changes">14. Website Availability and Changes</h2>
        <p>We aim to maintain a reliable and useful platform. However, Talenezio does not guarantee uninterrupted access or error-free operation at all times.</p>
        <p>Access may occasionally be affected by maintenance, updates, technical failures, security issues or circumstances beyond our reasonable control.</p>
        <p>Talenezio may modify, add, suspend or discontinue features or services as needed, subject to applicable law and any commitments already made to users.</p>

        <h2 id="limitation-of-liability">15. Limitation of Liability</h2>
        <p>To the extent permitted by applicable law, Talenezio will not be liable for indirect or consequential losses arising from the use of the platform, including losses resulting from missed opportunities, employment decisions or third-party actions.</p>
        <p>Talenezio does not guarantee the accuracy or completeness of every career resource, assessment result, recommendation or third-party listing.</p>
        <p>Nothing in these Terms excludes or limits liability where such exclusion or limitation is prohibited by law, including applicable consumer rights and remedies.</p>

        <h2 id="privacy-and-data-protection">16. Privacy and Data Protection</h2>
        <p>Your use of Talenezio is also governed by our <a href="/privacy">Privacy Policy</a>, which explains how we collect, use, store, process and protect personal information.</p>
        <p>By using the platform, you acknowledge that you have had the opportunity to review the Privacy Policy. Talenezio will process personal information in accordance with the applicable data protection requirements and the disclosures provided to users.</p>

        <h2 id="suspension-and-termination">17. Suspension and Termination</h2>
        <p>Users may stop using Talenezio at any time. Talenezio may suspend or terminate access where reasonably necessary due to violations of these Terms, fraud, security concerns or legal requirements.</p>
        <p>Where appropriate and legally required, we will provide notice or an opportunity to resolve the issue. Termination does not remove rights or obligations that arose before termination, including applicable payment, refund, privacy or dispute-resolution obligations.</p>

        <h2 id="changes-to-these-terms">18. Changes to These Terms</h2>
        <p>Talenezio may update these Terms and Conditions to reflect changes in its services, operations, technology or legal requirements. The updated version will be published on the website with a revised &quot;Last Updated&quot; date.</p>
        <p>Where required by law, users will be notified of material changes or asked to provide renewed consent. Continued use of the platform after an update takes effect will be subject to the updated Terms to the extent permitted by law.</p>

        <h2 id="governing-law-and-dispute-resolution">19. Governing Law and Dispute Resolution</h2>
        <p>These Terms and Conditions will be governed by the applicable laws of India.</p>
        <p>Users and Talenezio will attempt to resolve disputes amicably where reasonably possible. If a dispute cannot be resolved informally, it may be referred to the competent courts or other appropriate dispute-resolution forum in accordance with applicable law.</p>
        <p>Nothing in this section limits a consumer&apos;s statutory rights or access to a forum available under applicable law.</p>

        <h2 id="contact-information">20. Contact Information</h2>
        <p>For questions, concerns or requests relating to these Terms and Conditions, please contact:</p>
        <p>Talenezio<br />Email: <a href="mailto:taleneziocontact@gmail.com">taleneziocontact@gmail.com</a><br />Website: <a href="https://talenezio.com">talenezio.com</a></p>
        <p>Please include a clear description of your query so that we can direct it to the appropriate person.</p>

        <h2 id="acceptance-of-terms">21. Acceptance of Terms</h2>
        <p>By registering for an account, accessing restricted features or using Talenezio&apos;s services, you acknowledge that you have read and understood these Terms and Conditions and agree to comply with them, subject to applicable law.</p>
        <p>If you do not agree with these Terms, please discontinue use of the relevant services.</p>
      </article>
    </main>
  )
}
