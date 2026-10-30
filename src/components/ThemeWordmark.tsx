import Image from 'next/image'

export function ThemeWordmark() {
  return (
    <span className="relative block h-[17px] w-[30px] shrink-0 overflow-hidden sm:h-[19px] sm:w-[33px]">
      <Image
        src="/talenezio-wordmark-light-mode.png"
        alt=""
        width={180}
        height={40}
        loading="eager"
        className="absolute max-w-none dark:hidden"
        style={{ width: '111.3%', height: '147.2%', left: '-5.6%', top: '-24.2%' }}
      />
      <Image
        src="/talenezio-wordmark-transparent.png?v=3"
        alt=""
        width={180}
        height={40}
        loading="eager"
        className="absolute hidden max-w-none dark:block"
        style={{ width: '119.2%', height: '214.4%', left: '-9.9%', top: '-60.9%' }}
      />
    </span>
  )
}
