import React from 'react'

export function DashboardHeroBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-[#DCE2FB] bg-[#EFF1FD] p-8 sm:p-10 lg:p-12 shadow-sm dark:border-gray-800 dark:bg-gray-900/90">
      <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left Column: Heading and Subtitle */}
        <div className="max-w-xl text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#554FE8] dark:text-indigo-400">
            YOUR CAREER SERVICES
          </p>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight leading-[1.14] text-[#0A1128] dark:text-white">
            Everything You Need to
            <br />
            Move Forward.
          </h1>

          <p className="mt-3 text-base sm:text-lg font-medium text-[#5B6B86] dark:text-slate-400">
            Your career, your next big step.
          </p>
        </div>

        {/* Right Column: Prominent Larger Illustration with Full Clearance */}
        <div className="flex w-full items-center justify-center lg:w-auto lg:shrink-0">
          <svg
            viewBox="0 0 660 230"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-auto w-full max-w-[560px] sm:max-w-[620px] lg:max-w-[680px] select-none"
            aria-label="Illustration: Stairs to career summit - Better Skills, Bigger Opportunities"
          >
            {/* Soft circular halo */}
            <circle cx="260" cy="120" r="105" fill="#E4E8FA" fillOpacity="0.85" />

            {/* Gentle winding trajectory curve line on the left */}
            <path
              d="M120 165 C145 145 160 170 180 140 C192 118 205 134 220 122"
              stroke="#818CF8"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Left Peach/Gold Sparkle Star */}
            <path
              d="M205 48 L207.5 55 L214 57 L207.5 59 L205 66 L202.5 59 L196 57 L202.5 55 Z"
              fill="#FBBF24"
            />

            {/* Right Lavender/Violet Sparkle Star */}
            <path
              d="M375 82 L377.5 89 L384 91 L377.5 93 L375 100 L372.5 93 L366 91 L372.5 89 Z"
              fill="#818CF8"
            />

            {/* Stairs Base / Cloud ground line */}
            <path
              d="M130 200 Q260 192 390 200"
              stroke="#D6DBF8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Ascending Stairs Blocks (Larger size) */}
            {/* Step 1 */}
            <rect x="190" y="160" width="36" height="40" rx="4" fill="#BAC1FB" />
            {/* Step 2 */}
            <rect x="222" y="130" width="36" height="70" rx="4" fill="#B3BBFA" />
            {/* Step 3 */}
            <rect x="254" y="100" width="36" height="100" rx="4" fill="#AAB3F8" />
            {/* Step 4 (Summit Pillar) */}
            <rect x="286" y="70" width="44" height="130" rx="5" fill="#9DA7F6" />

            {/* Summit Flagpole & Flag */}
            <line
              x1="308"
              y1="70"
              x2="308"
              y2="16"
              stroke="#3730A3"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="308" cy="16" r="3" fill="#3730A3" />
            <path
              d="M308 20 C328 15 334 30 354 24 L354 46 C334 52 328 37 308 42 Z"
              fill="#5E51EB"
            />

            {/* Cursive / Handwritten Script: Better Skills Bigger Opportunities with generous right margin */}
            <g transform="translate(415, 48) rotate(-7)">
              <text
                x="0"
                y="22"
                fontFamily="Caveat, 'Segoe Print', 'Brush Script MT', 'Bradley Hand', 'Comic Sans MS', cursive, sans-serif"
                fontSize="28"
                fontWeight="700"
                fontStyle="italic"
                fill="#554FE8"
                letterSpacing="0.02em"
              >
                Better
              </text>
              <text
                x="8"
                y="52"
                fontFamily="Caveat, 'Segoe Print', 'Brush Script MT', 'Bradley Hand', 'Comic Sans MS', cursive, sans-serif"
                fontSize="28"
                fontWeight="700"
                fontStyle="italic"
                fill="#554FE8"
                letterSpacing="0.02em"
              >
                Skills
              </text>
              <text
                x="14"
                y="82"
                fontFamily="Caveat, 'Segoe Print', 'Brush Script MT', 'Bradley Hand', 'Comic Sans MS', cursive, sans-serif"
                fontSize="28"
                fontWeight="700"
                fontStyle="italic"
                fill="#554FE8"
                letterSpacing="0.02em"
              >
                Bigger
              </text>
              <text
                x="0"
                y="112"
                fontFamily="Caveat, 'Segoe Print', 'Brush Script MT', 'Bradley Hand', 'Comic Sans MS', cursive, sans-serif"
                fontSize="28"
                fontWeight="700"
                fontStyle="italic"
                fill="#554FE8"
                letterSpacing="0.02em"
              >
                Opportunities
              </text>
              {/* Handwritten Underline Flourish */}
              <path
                d="M 10 124 Q 90 135 175 118"
                stroke="#554FE8"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
