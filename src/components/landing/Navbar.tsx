import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const links = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

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
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">ExamSaathi</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
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

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
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
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}