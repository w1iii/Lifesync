"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  connectedServices?: string[];
}

const NAV = [
  { href: "/", icon: "grid_view", label: "Dashboard" },
  { href: "/calendar", icon: "calendar_today", label: "Calendar" },
  { href: "/health", icon: "favorite", label: "Health" },
  { href: "/insights", icon: "insights", label: "Insights" },
] as const;

export default function Sidebar({ connectedServices = [] }: Props) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-4 top-24 bottom-4 w-20 flex flex-col items-center py-8 gap-8 z-40 bg-surface-container-low/60 backdrop-blur-2xl rounded-xl border border-white/20 shadow-xl shadow-secondary/5">
      <div className="flex flex-col items-center gap-6">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative p-3 rounded-full transition-all duration-300 ${
                active
                  ? "bg-secondary/15 text-secondary shadow-lg shadow-secondary/10 scale-110"
                  : "text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-white/10 hover:scale-105"
              }`}
            >
              {active && <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-secondary rounded-full" />}
              <span
                className="material-symbols-outlined transition-all duration-300"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col items-center gap-4">
        <Link href="/privacy" className="material-symbols-outlined text-on-surface-variant/50 hover:text-primary transition-colors">shield</Link>
        <Link href="/help" className="material-symbols-outlined text-on-surface-variant/50 hover:text-primary transition-colors">help</Link>
      </div>
    </aside>
  );
}
