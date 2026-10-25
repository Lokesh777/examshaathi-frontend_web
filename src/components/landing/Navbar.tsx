"use client";

import { Link } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandMark } from "@/components/atoms/BrandMark";
import { AuthActionsSkeleton } from "@/components/landing/AuthActionsSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// Absolute "/#…" hashes so the links also work from /guide
const links = [
  { label: "CET Guide", href: "/guide" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const { user, isAuthenticated, isReady } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md transition-shadow",
        scrolled ? "border-b border-border shadow-sm" : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <BrandMark className="h-9 w-9 rounded-xl" />
          <span className="text-lg font-bold tracking-tight">ExamSaathi</span>
        </Link>

        <div className="hidden items-center gap-6 lg:gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex min-h-9 items-center gap-2">
          {!isReady ? (
            <AuthActionsSkeleton />
          ) : isAuthenticated ? (
            <>
              <span className="hidden items-center gap-2 sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                  {(user?.name ?? "U").slice(0, 1).toUpperCase()}
                </span>
                <span className="text-sm font-medium">{user?.name}</span>
              </span>
              <Link
                to="/exams"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden sm:inline">Go to Dashboard</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:inline-flex"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <span className="sm:hidden">Start free</span>
                <span className="hidden sm:inline">Get Started Free</span>
              </Link>
            </>
          )}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[82vw] max-w-xs">
              <SheetHeader className="text-left">
                <SheetTitle>ExamSaathi</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              {isReady && !isAuthenticated && (
                <div className="mt-6 grid gap-2">
                  <Link
                    to="/auth"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-border text-sm font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}