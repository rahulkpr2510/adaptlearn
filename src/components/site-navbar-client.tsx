"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface NavLinkItem {
  href: string;
  label: string;
}

const PRIMARY_LINKS: NavLinkItem[] = [
  { href: "/", label: "Home" },
  { href: "/quiz", label: "Start Quiz" },
  { href: "/results?track=dsa", label: "Diagnosis" },
  { href: "/roadmap?track=dsa", label: "Roadmap" },
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

export function SiteNavbarClient() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string): boolean {
    const hrefPath = href.split("?")[0] ?? href;

    if (hrefPath === "/") {
      return pathname === "/";
    }

    if (hrefPath.startsWith("/quiz")) {
      return pathname.startsWith("/quiz");
    }

    return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
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
              Adaptive Learning System
            </p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Editorial Prep Workspace
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {PRIMARY_LINKS.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/quiz"
            className="btn-secondary rounded-lg px-3 py-2 text-xs font-semibold"
          >
            Explore Topics
          </Link>
          <Link
            href="/quiz?track=dsa&mode=follow-up"
            className="btn-primary rounded-lg px-3 py-2 text-xs font-semibold"
          >
            Run Follow-up
          </Link>
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
              {PRIMARY_LINKS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  onNavigate={closeMobileMenu}
                />
              ))}

              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                <Link
                  href="/quiz"
                  onClick={closeMobileMenu}
                  className="btn-secondary rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  Explore Topics
                </Link>
                <Link
                  href="/quiz?track=dsa&mode=follow-up"
                  onClick={closeMobileMenu}
                  className="btn-primary rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  Run Follow-up
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
