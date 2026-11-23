'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'

type SameRouteLinkProps = Omit<ComponentProps<typeof Link>, 'href' | 'onNavigate'> & {
  href: string
}

export default function SameRouteLink({ href, ...props }: SameRouteLinkProps) {
  const pathname = usePathname()

  return (
    <Link
      {...props}
      href={href}
      onNavigate={(event) => {
        if (pathname === href) event.preventDefault()
      }}
    />
  )
}
