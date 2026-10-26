import React from 'react'

export function MotivationBanner() {
  return (
    <div className="relative mt-12 w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#2B66F5] via-[#4F68F5] to-[#8057F3] px-6 py-5 sm:px-8 sm:py-6 text-white shadow-lg shadow-indigo-500/10">
      {/* Subtle organic wavy background accents matching the design */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Left corner wave */}
        <svg
          className="absolute -bottom-2 -left-4 h-24 w-48 text-white/[0.08]"
          viewBox="0 0 200 100"
          fill="currentColor"
        >
          <path d="M0 40 Q 50 15, 100 50 T 200 35 L 200 100 L 0 100 Z" />
        </svg>
        <svg
          className="absolute -bottom-4 -left-2 h-20 w-40 text-white/[0.06]"
          viewBox="0 0 180 90"
          fill="currentColor"
        >
          <path d="M0 30 Q 60 5, 110 40 T 180 25 L 180 90 L 0 90 Z" />
        </svg>

        {/* Right corner wave */}
        <svg
          className="absolute -bottom-3 -right-4 h-24 w-48 text-white/[0.08]"
          viewBox="0 0 200 100"
          fill="currentColor"
        >
          <path d="M0 60 Q 60 20, 120 55 T 200 30 L 200 100 L 0 100 Z" />
        </svg>
        <svg
          className="absolute -bottom-5 -right-2 h-20 w-40 text-white/[0.06]"
          viewBox="0 0 180 90"
          fill="currentColor"
        >
          <path d="M0 50 Q 70 10, 130 45 T 180 20 L 180 90 L 0 90 Z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Icon + Divider + Text */}
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
          {/* People Icon with 3 Radiance Burst Rays */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              width="46"
              height="46"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
              aria-hidden="true"
            >
              {/* 3 Radiance burst lines above heads */}
              <line x1="22" y1="3" x2="22" y2="8" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="29" y1="5" x2="26" y2="9.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="15" y1="5" x2="18" y2="9.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />

              {/* Primary User (Front) */}
              <circle cx="16" cy="20" r="5" stroke="white" strokeWidth="2.2" />
              <path
                d="M8 35 C8 28, 12 26, 16 26 C20 26, 24 28, 24 35"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Secondary User (Back) */}
              <circle cx="26" cy="18" r="4" stroke="white" strokeWidth="2.2" />
              <path
                d="M24 26 C26 25, 29 25, 31 27 C33 29, 34 32, 34 35"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Vertical Separator */}
          <div className="hidden sm:block h-10 w-[1.5px] bg-white/30 shrink-0" />

          {/* Text Content */}
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-normal leading-snug">
              Your career journey doesn&apos;t have to be a solo journey.
            </h3>
            <p className="mt-0.5 text-xs sm:text-sm text-white/85 font-normal">
              We&apos;re here to guide, support and help you achieve your goals.
            </p>
          </div>
        </div>

        {/* Right Side: Script "Together We Grow" with Flourish Underline */}
        <div className="shrink-0 self-end md:self-center text-right">
          <div className="inline-block transform -rotate-6 select-none text-right">
            <span
              className="block italic text-2xl sm:text-3xl font-bold text-white leading-tight tracking-wide drop-shadow-sm"
              style={{
                fontFamily:
                  "Caveat, 'Segoe Print', 'Brush Script MT', 'Bradley Hand', 'Comic Sans MS', cursive, sans-serif",
              }}
            >
              Together
              <br />
              We Grow
            </span>
            <svg
              viewBox="0 0 110 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-24 sm:w-28 h-4 ml-auto text-white/90 mt-1"
              aria-hidden="true"
            >
              <path
                d="M 12 7 Q 60 15 104 6"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
