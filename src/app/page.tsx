import Image from "next/image";
import Link from "next/link";
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
import { createClient } from "@/utils/supabase/server";
import { isLocalDemoSession } from "@/lib/auth/local-demo";

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
    href: "/career",
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
    href: "/career",
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

export default async function Home() {
  const isDemo = await isLocalDemoSession();
  let user = null;
  if (!isDemo) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      user = null;
    }
  }
  const isAuthenticated = Boolean(user || isDemo);

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
            <Image
              src="/talenezio-wordmark-transparent.png?v=3"
              alt="Talenezio Logo"
              width={180}
              height={40}
              priority
              className="h-9 w-auto sm:h-10 object-contain"
              style={{ width: 'auto' }}
            />
            <span className="text-xl font-bold tracking-tight">Talenezio</span>
          </Link>

          <div className="flex items-center gap-3 text-sm font-semibold sm:gap-6">
            <Link
              href={getDestination('/tests')}
              className="hidden text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 sm:inline"
            >
              Skill tests
            </Link>
            <Link
              href={getDestination('/resume-builder')}
              className="hidden text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 sm:inline"
            >
              Resume Building
            </Link>
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

        {/* Hero Section with balanced laptop spacing */}
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-8 sm:px-8 sm:pb-16 sm:pt-10 md:gap-14 md:pb-16 md:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              <span>Your next opportunity starts here</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-950 dark:text-white sm:text-5xl md:text-6xl lg:text-[4rem]">
              Your Career Journey Starts Here.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400 sm:text-lg sm:leading-8">
              From skill assessments to professional resumes and career support, Talenezio helps you prepare for what is next.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={getDestination('/resume-builder')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Start building your future
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href={getDestination('/tests')}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-bold text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:text-blue-400"
              >
                Explore free tests
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              {proofPoints.map((point) => (
                <span key={point} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {point}
                </span>
              ))}
            </div>
          </div>

          {/* Starting Box */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-blue-500/10 blur-2xl dark:bg-blue-500/15" />
            <div className="relative rounded-[2rem] border border-gray-200 bg-white p-6 shadow-2xl shadow-blue-900/10 dark:border-gray-800 dark:bg-gray-900 sm:p-7">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white">
                    Everything You Need to Move Forward.
                  </h2>
                  <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Your career, your next big step.
                  </p>
                </div>
                <div className="ml-3 shrink-0 rounded-2xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-2.5">
                {boxItems.map((item) => {
                  return (
                    <Link
                      key={item.num}
                      href={getDestination(item.href)}
                      className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-3 transition-all hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm dark:border-gray-800/80 dark:bg-gray-950/60 dark:hover:border-blue-900 dark:hover:bg-blue-950/30"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${item.bg} ${item.color}`}
                        >
                          {item.num}
                        </div>
                        <p className="text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                          {item.title}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600 dark:text-gray-500" />
                    </Link>
                  );
                })}

                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3.5 text-white shadow-lg shadow-blue-500/20">
                  <div className="shrink-0 rounded-xl bg-white/15 p-2">
                    <Users className="h-4 w-4" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold leading-tight">
                    You don&apos;t have to figure out your career alone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section with corrected laptop spacing */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-8 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Everything in one place</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Build confidence at every step.</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">From your first resume draft to your final interview, Talenezio helps you turn preparation into momentum.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={getDestination(feature.href)}
                className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
              >
                <div className={`mb-8 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${feature.accent}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">{feature.title}</h3>
                <p className="mt-3 min-h-20 leading-7 text-gray-600 dark:text-gray-400">{feature.description}</p>
                <span className={`mt-7 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${feature.tint}`}>
                  Explore feature <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-4 mb-20 overflow-hidden rounded-[2rem] bg-gray-900 px-6 py-14 text-white shadow-2xl shadow-gray-900/20 dark:bg-blue-950 sm:mx-8 sm:px-12 lg:mx-auto lg:max-w-7xl lg:px-16">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-300">Your unfair advantage</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">A stronger career starts with one focused step.</h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">Create your free account and start with the tool that will make the biggest difference today.</p>
          </div>
          <Link href={isAuthenticated ? '/dashboard' : '/register'} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-gray-900 transition-colors hover:bg-blue-50">
            Join Talenezio <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
