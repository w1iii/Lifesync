"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const NAV = [
  { href: "/", icon: "grid_view", label: "Dashboard" },
  { href: "/inbox", icon: "mail", label: "Inbox" },
  { href: "/calendar", icon: "calendar_today", label: "Calendar" },
  { href: "/health", icon: "favorite", label: "Health" },
  { href: "/insights", icon: "insights", label: "Insights" },
] as const;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut(auth);
    } catch {
      // Firebase not configured — still navigate away
    }
    router.push("/login");
  };

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop py-4 bg-surface/40 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="font-headline-lg text-headline-lg font-light tracking-tighter text-primary">
        LifeSync AI
      </div>
      <nav className="hidden md:flex items-center gap-3">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative p-3 rounded-full transition-all duration-300 ${
              isActive(item.href)
                ? "bg-secondary/15 text-secondary shadow-lg shadow-secondary/10 scale-110"
                : "text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-white/10 hover:scale-105"
            }`}
          >
            <span
              className="material-symbols-outlined transition-all duration-300"
              style={isActive(item.href) ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface-bright/50 transition-all duration-300 rounded-full relative">
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </button>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
            <Image
              alt="User Profile Avatar"
              className="w-10 h-10 rounded-full border-2 border-white/40 cursor-pointer hover:opacity-80 transition-opacity"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtrgyTHfdeqPhCwwwkI5OWmr40LjFIJmKGdzizK_v6r0cgGqd9JUdQPO4qyDxr9qwVR8dN7SfzbN_qq_FQlDQR1n24AJrJGVE_2SDfHjvT0lRrhlgji90ckWabH7Vj2xZ8WFPzMHA9I1O_QVeiMaY9sebeH9-eOtf7EA_2tJtHUtawKZSzUR5ooPcaYRoS1ueRwhiqAUXdE7_Cys3Ct5VL5x7sQSaKWxTwNdNzAEXF9Gi0soV90dd-CUhH8k5SIhNsFVtum4CNZD4"
              width={40}
              height={40}
            />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 glass-card rounded-xl overflow-hidden shadow-xl shadow-secondary/10 border border-white/20">
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 hover:bg-white/30 transition-colors font-label-sm text-label-sm text-primary"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-lg">settings</span>
                Settings
              </Link>
              <div className="h-px bg-white/10 mx-3" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 hover:bg-white/30 transition-colors font-label-sm text-label-sm text-error"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
