import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GraduationCap, Loader2, Eye, EyeOff } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { setUser, user, isReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isReady && user) navigate({ to: "/exams", replace: true });
  }, [isReady, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const res =
        mode === "login"
          ? await api.login({ email: form.email, password: form.password })
          : await api.register(form);
      if (!res.success || !res.data) throw new Error(res.message ?? "Auth failed");
      setUser(res.data);
      toast.success(mode === "login" ? "Welcome back!" : "Account created");
      navigate({ to: "/exams", replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { errors?: { field: string; message: string }[]; message?: string } | undefined;
        if (body?.errors?.length) {
          const map: Record<string, string> = {};
          body.errors.forEach((e) => (map[e.field] = e.message));
          setFieldErrors(map);
        }
        toast.error(body?.message ?? err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background">
      {/* Decorative brand backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, var(--color-primary) 0%, transparent 65%), radial-gradient(45% 45% at 85% 20%, var(--color-accent) 0%, transparent 60%)",
          maskImage: "linear-gradient(180deg, black, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, black, transparent)",
        }}
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/30">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">ExamSaathi</div>
            <div className="text-xs text-muted-foreground">Your AI study partner</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to continue your prep."
            : "Start with topic-wise quizzes and full-length mocks."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {mode === "register" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Lokesh Kumar"
              autoComplete="name"
              required
            />
            {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={mode === "login" ? "Enter your password" : "Minimum 6 characters"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
        </div>

        <Button type="submit" size="lg" className="mt-2 h-12 w-full text-base font-semibold shadow-md" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {mode === "login" ? (
          <>New here? <span className="font-semibold text-primary">Create an account</span></>
        ) : (
          <>Already have an account? <span className="font-semibold text-primary">Sign in</span></>
        )}
      </button>

        <p className="mt-auto pt-10 text-center text-[11px] text-muted-foreground">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}