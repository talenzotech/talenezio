import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeWordmark } from "@/components/ThemeWordmark";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  GraduationCap,
  Sparkles,
  Target,
  UserCheck,
  Users,
} from "lucide-react";
import { isLocalDemoSession } from "@/lib/auth/local-demo";
import { safeNextPath } from "@/lib/auth/redirect";
import { hasSupabaseAuthCookie } from "@/lib/auth/current-user";

const features = [
  {
    title: "Industry-Focused Skill Tests",
    description:
      "Assess your knowledge in Technology, Finance, Digital Marketing and AI to identify your strengths and areas for improvement.",
    href: "/tests",
    icon: Target,
    accent: "bg-blue-600",
    tint: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  {
    title: "ATS-Friendly Resume Builder",
    description:
      "Create professional, recruiter-friendly resumes that showcase your skills, experience and potential.",
    href: "/resume-builder",
    icon: FileText,
    accent: "bg-emerald-500",
    tint: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    title: "Internship Opportunities",
    description:
      "Explore opportunities to gain practical experience, develop valuable skills and take your first steps into the professional world.",
    href: "/services",
    icon: GraduationCap,
    accent: "bg-amber-500",
    tint: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    title: "Expert-Led Career Support",
    description:
      "Get practical interview preparation and focused career guidance built around your next opportunity.",
    href: "/career",
    icon: BriefcaseBusiness,
    accent: "bg-purple-600",
    tint: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  },
  {
    title: "LinkedIn Profile Optimization",
    description:
      "Strengthen your professional presence with an optimized LinkedIn profile, compelling content ideas and a personal brand that stands out.",
    href: "/services/linkedin-optimization",
    icon: UserCheck,
    accent: "bg-sky-600",
    tint: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  },
];

const boxItems = [
  {
    num: "1",
    title: "Skill Assessments",
    href: "/tests",
    icon: Target,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
  },
  {
    num: "2",
    title: "Resume Building",
    href: "/resume-builder",
    icon: FileText,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  {
    num: "3",
    title: "Internship Opportunities",
    href: "/services",
    icon: GraduationCap,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
  },
  {
    num: "4",
    title: "Expert-Led Career Support",
    href: "/career",
    icon: BriefcaseBusiness,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/50",
  },
  {
    num: "5",
    title: "LinkedIn Optimization",
    href: "/services/linkedin-optimization",
    icon: UserCheck,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/50",
  },
];

const proofPoints = [
  "ATS-friendly resume builder",
  "Industry-focused skill tests",
  "Expert-led career support",
];

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{
    code?: string;
    flow?: string;
    next?: string;
    error?: string;
    error_description?: string;
  }>;
}) {
  const params = await searchParams;
  if (params?.code || params?.error) {
    const callbackQuery = new URLSearchParams();
    if (params.code) callbackQuery.set("code", params.code);
    if (params.error) callbackQuery.set("error", params.error);
    if (params.error_description) callbackQuery.set("error_description", params.error_description);
    callbackQuery.set("flow", params.flow || "oauth");
    callbackQuery.set("next", safeNextPath(params.next, "/dashboard"));
    redirect(`/auth/callback?${callbackQuery.toString()}`);
  }

  const isDemo = await isLocalDemoSession();
  const isAuthenticated = isDemo || await hasSupabaseAuthCookie();

  const getDestination = (targetPath: string) => {
    if (isAuthenticated) return targetPath;
    return `/login?next=${encodeURIComponent(targetPath)}`;
  };

  return (
    <main className="overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      <section className="relative isolate border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.16),_transparent_42%),radial-gradient(circle_at_15%_35%,_rgba(168,85,247,0.12),_transparent_35%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.22),_transparent_42%),radial-gradient(circle_at_15%_35%,_rgba(126,34,206,0.18),_transparent_35%)]" />

        {/* Navbar */}
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Talenezio home">
            <ThemeWordmark />
            <span className="text-xl font-bold tracking-tight">Talenezio</span>
          </Link>

          <div className="flex items-center gap-3 text-sm font-semibold sm:gap-6">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:text-blue-400"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:text-blue-400"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-8 sm:py-24 lg:grid-cols-12 lg:gap-8">
          <div className="max-w-2xl lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur-xs dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              Career Acceleration Platform
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-none">
              Evaluate your skills. <br />
              Build a stronger profile. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
                Land better opportunities.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Talenezio helps students and job seekers test their knowledge,
              create professional resumes and access practical career support to
              move forward with confidence.
            </p>

            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Link
                href={getDestination("/tests")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700"
              >
                Take a Skill Assessment <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href={getDestination("/resume-builder")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800"
              >
                Build ATS-Friendly Resume
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-gray-500 dark:text-gray-400">
              {proofPoints.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-3xl border border-gray-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-gray-800 dark:bg-gray-900/80">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5 dark:border-gray-800">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    What We Offer
                  </p>
                  <h2 className="mt-1 text-xl font-bold">5 Core Career Pathways</h2>
                </div>
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="mt-6 space-y-4">
                {boxItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={getDestination(item.href)}
                      className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-blue-100 hover:bg-blue-50/40 dark:border-gray-800/80 dark:bg-gray-800/40 dark:hover:border-blue-900/60 dark:hover:bg-blue-950/20"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${item.bg} ${item.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Path {item.num}
                          </p>
                          <h3 className="font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-blue-400" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400">
            Platform Capabilities
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything you need to advance your career.
          </h2>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
            A practical suite of tools designed to help you prepare, showcase
            your strengths and find the right professional direction.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={getDestination(feature.href)}
                className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
              >
                <div
                  className={`mb-8 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${feature.accent}`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {feature.title}
                </h3>
                <p className="mt-3 min-h-20 leading-7 text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
                <span className="mt-7 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  Explore feature <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Band */}
      <section className="bg-gray-900 py-16 text-white dark:bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:flex-row sm:items-center sm:px-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              A stronger career starts with one focused step.
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Create your free account and start with the tool that will make the
              biggest difference today.
            </p>
          </div>
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-gray-900 transition-colors hover:bg-blue-50"
          >
            Join Talenezio <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
