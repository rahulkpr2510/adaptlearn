"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface NavLinkItem {
  href: string;
  label: string;
  requiresAuth?: boolean;
}

interface UserData {
  id: string;
  email: string;
  fullName: string | null;
  subscriptionTier: string;
  points: number;
  currentStreak: number;
}

const PUBLIC_LINKS: NavLinkItem[] = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
];

const AUTH_LINKS: NavLinkItem[] = [
  { href: "/dashboard", label: "Dashboard", requiresAuth: true },
  { href: "/quiz", label: "Practice", requiresAuth: true },
  { href: "/leaderboard", label: "Leaderboard", requiresAuth: true },
];

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavLinkItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-white/20 bg-white/10 text-white"
          : "border-transparent text-neutral-300 hover:border-white/15 hover:bg-white/5 hover:text-white"
      }`}
    >
      {item.label}
    </Link>
  );
}

function UserMenu({ user, onSignOut }: { user: UserData; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  
  const initials = user.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-line/80 bg-surface-strong/80 px-2 py-1.5 transition hover:border-white/20"
      >
        <div className="flex items-center gap-1.5 text-xs text-ink-soft">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
            </svg>
            {user.currentStreak}
          </span>
          <span className="text-line">|</span>
          <span>{user.points.toLocaleString()} pts</span>
        </div>
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-line bg-surface-strong/95 backdrop-blur-xl shadow-xl overflow-hidden"
            >
              <div className="p-3 border-b border-line">
                <p className="text-sm font-medium truncate">{user.fullName || 'User'}</p>
                <p className="text-xs text-ink-soft truncate">{user.email}</p>
                {user.subscriptionTier !== 'free' && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-brand/20 text-brand">
                    {user.subscriptionTier}
                  </span>
                )}
              </div>
              <div className="p-1.5">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition"
                >
                  <svg className="w-4 h-4 text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition"
                >
                  <svg className="w-4 h-4 text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition"
                >
                  <svg className="w-4 h-4 text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Billing
                </Link>
              </div>
              <div className="p-1.5 border-t border-line">
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition w-full text-left text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SiteNavbarClient({ user }: { user: UserData | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = user ? [...PUBLIC_LINKS.filter(l => l.href !== '/pricing'), ...AUTH_LINKS] : PUBLIC_LINKS;

  function isActive(href: string): boolean {
    const hrefPath = href.split("?")[0] ?? href;
    if (hrefPath === "/") return pathname === "/";
    return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.92, opacity: 0.85 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="grid h-9 w-9 place-content-center rounded-xl border border-white/15 bg-gradient-to-br from-white/20 to-white/5"
          >
            <span className="text-sm font-semibold text-foreground">AL</span>
          </motion.div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wide text-foreground">
              AdaptLearn
            </p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Adaptive Learning Platform
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <UserMenu user={user} onSignOut={handleSignOut} />
          ) : (
            <>
              <Link
                href="/auth/login"
                className="btn-secondary rounded-lg px-4 py-2 text-sm font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="btn-primary rounded-lg px-4 py-2 text-sm font-medium"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((state) => !state)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line/90 bg-surface-strong/80 text-white md:hidden"
          aria-label="Toggle navigation"
        >
          <span className="text-sm font-semibold tracking-[-0.08em]">
            {mobileOpen ? "X" : "|||"}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-line/80 bg-background/90 md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
              {navLinks.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  onNavigate={closeMobileMenu}
                />
              ))}

              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm">
                      <span className="text-ink-soft">Signed in as</span>
                      <span className="font-medium truncate">{user.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        closeMobileMenu();
                      }}
                      className="btn-secondary rounded-lg px-3 py-2 text-sm font-semibold text-red-400"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={closeMobileMenu}
                      className="btn-secondary rounded-lg px-3 py-2 text-sm font-semibold text-center"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/sign-up"
                      onClick={closeMobileMenu}
                      className="btn-primary rounded-lg px-3 py-2 text-sm font-semibold text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
