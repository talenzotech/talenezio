import Link from "next/link";
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const features = [
  {
    title: "Build a resume that gets noticed",
    description:
      "Create an ATS-friendly resume with guided sections, useful templates, and an instant print-ready preview.",
    href: "/resume-builder",
    icon: FileText,
    accent: "bg-emerald-500",
    tint: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    title: "Prove what you know",
    description:
      "Test your skills across AI, technology, finance, and digital marketing with certificates to show for it.",
    href: "/tests",
    icon: Target,
    accent: "bg-blue-600",
    tint: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  {
    title: "Prepare with people who have done it",
    description:
      "Get practical interview preparation and focused career guidance built around your next opportunity.",
    href: "/services/counseling",
    icon: BriefcaseBusiness,
    accent: "bg-purple-600",
    tint: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  },
];

const proofPoints = [
  "ATS-friendly resume builder",
  "Industry-focused skill tests",
  "Expert-led career support",
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      <section className="relative isolate border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.16),_transparent_42%),radial-gradient(circle_at_15%_35%,_rgba(168,85,247,0.12),_transparent_35%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.22),_transparent_42%),radial-gradient(circle_at_15%_35%,_rgba(126,34,206,0.18),_transparent_35%)]" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="Talenzo home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-500/20">
              T
            </span>
            <span className="text-xl font-bold tracking-tight">Talenzo</span>
          </Link>

          <div className="flex items-center gap-3 text-sm font-semibold sm:gap-6">
            <Link
              href="/tests"
              className="hidden text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 sm:inline"
            >
              Skill tests
            </Link>
            <Link
              href="/services/counseling"
              className="hidden text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 sm:inline"
            >
              Career support
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:text-blue-400"
            >
              Sign in
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 pb-20 pt-14 sm:px-8 md:pb-28 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              <span>Your next opportunity starts here</span>
            </div>

            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-950 dark:text-white sm:text-6xl lg:text-7xl">
              Turn your potential into a career you are proud of.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400 sm:text-xl">
              Talenzo gives ambitious professionals the tools, practice, and guidance to move from unsure to job-ready.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Start building your future
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/tests"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-bold text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:text-blue-400"
              >
                Explore free tests
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              {proofPoints.map((point) => (
                <span key={point} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-blue-500/10 blur-2xl dark:bg-blue-500/15" />
            <div className="relative rounded-[2rem] border border-gray-200 bg-white p-6 shadow-2xl shadow-blue-900/10 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Your career toolkit</p>
                  <h2 className="mt-1 text-2xl font-bold">Make progress visible.</h2>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                  <Award className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-semibold">Career readiness</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">82%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-blue-600 to-purple-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                    <FileText className="mb-5 h-5 w-5 text-emerald-500" />
                    <p className="text-2xl font-bold">01</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Resume ready</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                    <Target className="mb-5 h-5 w-5 text-purple-500" />
                    <p className="text-2xl font-bold">04</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Skills to prove</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-blue-600 p-4 text-white shadow-lg shadow-blue-500/20">
                  <div className="rounded-xl bg-white/15 p-2">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">You do not have to figure it out alone.</p>
                    <p className="mt-1 text-sm text-blue-100">Practice, improve, and keep moving.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-24">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Everything in one place</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Build confidence at every step.</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">From your first resume draft to your final interview, Talenzo helps you turn preparation into momentum.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
              >
                <div className={`mb-8 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${feature.accent}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">{feature.title}</h3>
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
          <Link href="/register" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-gray-900 transition-colors hover:bg-blue-50">
            Join Talenzo <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
