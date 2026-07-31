import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Reveal } from "./Reveal";

export function CtaBanner() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <div
          className="flex flex-col items-center gap-6 rounded-3xl px-6 py-12 text-center"
          style={{ background: "var(--gradient-hero)" }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to start practicing?
          </h2>
          {isAuthenticated ? (
            <Link
              to="/exams"
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.02]"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.02]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </Reveal>
    </section>
  );
}