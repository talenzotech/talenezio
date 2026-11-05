'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Inbox,
  LayoutDashboard,
  Users,
} from 'lucide-react';

const icons = {
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  clipboard: ClipboardCheck,
  creditCard: CreditCard,
  inbox: Inbox,
  layout: LayoutDashboard,
  users: Users,
} as const;

type IconName = keyof typeof icons;

export default function AdminNavigation({ items }: { items: ReadonlyArray<{ href: string; label: string; icon: IconName }> }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 overflow-y-auto p-4 lg:flex-1 lg:flex-col" aria-label="Admin navigation">
      {items.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));
        const Icon = icons[icon];
        return (
          <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${active ? 'bg-blue-50 font-semibold text-blue-700' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Icon className={`h-[18px] w-[18px] ${active ? 'text-blue-600' : 'text-slate-400'}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
