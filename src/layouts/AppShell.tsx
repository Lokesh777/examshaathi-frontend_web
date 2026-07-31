"use client";

import { useEffect } from "react";
import {
  BookOpen,
  FileText,
  Loader2,
  LogOut,
  MessageCircle,
  Moon,
  Sun,
  UserCircle,
} from "lucide-react";
import { BrandMark } from "@/components/atoms/BrandMark";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/lib/theme";
import { ExamProvider, useExam } from "@/lib/exam-context";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate, useRouterState } from "@/lib/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isReady, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const qc = useQueryClient();

  useEffect(() => {
    if (isReady && !user) navigate({ to: "/auth", replace: true });
  }, [isReady, user, navigate]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <BrandMark className="h-12 w-12 rounded-2xl bg-primary/10 text-primary" iconClassName="h-6 w-6" />
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <div className="text-xs">Loading your workspace…</div>
      </div>
    );
  }

  const handleLogout = async () => {
    qc.clear();
    await logout();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <ExamProvider>
      <ExamShell theme={theme} toggleTheme={toggle} onLogout={handleLogout}>
        {children}
      </ExamShell>
    </ExamProvider>
  );
}

function ExamShell({
  theme,
  toggleTheme,
  onLogout,
  children,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const { selectedExam, exams, isLoading, isError, select, refetch } = useExam();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const needPicker = !isLoading && exams.length > 1 && !selectedExam;
  const isExamRoute = pathname.startsWith("/exams");

  return (
    <div className="relative flex min-h-screen flex-col">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <BrandMark className="h-8 w-8 rounded-lg" iconClassName="h-4 w-4" />
            <div className="min-w-0">
              {selectedExam ? (
                <>
                  <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    Preparing for
                  </div>
                  <div className="truncate text-sm font-bold leading-tight">{selectedExam.name}</div>
                </>
              ) : (
                <div className="truncate text-base font-bold tracking-tight">ExamSaathi</div>
              )}
            </div>
          </Link>

          {selectedExam && selectedExam.syllabusStatus === "ready" && (
            <nav className="ml-4 hidden items-center gap-1 rounded-full border border-border bg-secondary/60 p-1 md:flex">
              <NavPill to="/exams/$examId/topics" examId={selectedExam._id} icon={BookOpen} label="Topics" pathname={pathname} match="topics" />
              <NavPill to="/exams/$examId/mock" examId={selectedExam._id} icon={FileText} label="Real Paper" pathname={pathname} match="mock" />
              <NavPill to="/exams/$examId/chat" examId={selectedExam._id} icon={MessageCircle} label="AI Tutor" pathname={pathname} match="chat" />
            </nav>
          )}

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-lg hover:bg-secondary/60"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-lg hover:bg-secondary/60"
                  aria-label="Account menu"
                >
                  <UserCircle className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  Account
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={onLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-6">
          {!isExamRoute ? (
            children
          ) : isLoading ? (
            <ExamStatus label="Loading your exam…" spin />
          ) : isError ? (
            <ExamStatus
              label="Couldn't reach the server. It may be waking up (up to 30s)."
              actionLabel="Retry"
              onAction={refetch}
            />
          ) : needPicker ? (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Choose an exam</h2>
              {exams.map((e) => (
                <button
                  key={e._id}
                  onClick={() => select(e._id)}
                  className="w-full rounded-xl border border-border bg-card p-4 text-left hover:border-primary/50"
                >
                  <div className="font-bold">{e.name}</div>
                </button>
              ))}
            </div>
          ) : selectedExam && selectedExam.syllabusStatus !== "ready" ? (
            <ExamStatus
              label={`Setting up ${selectedExam.name}… syllabus is still being prepared.`}
              actionLabel="Refresh"
              onAction={refetch}
            />
          ) : (
            children
          )}
        </main>

        {selectedExam && selectedExam.syllabusStatus === "ready" && (
          <nav className="sticky bottom-0 z-40 h-16 border-t border-border bg-background md:hidden">
            <div className="mx-auto grid h-full max-w-6xl grid-cols-3">
              <BottomTab to="/exams/$examId/topics" examId={selectedExam._id} icon={BookOpen} label="Topics" pathname={pathname} match="topics" />
              <BottomTab to="/exams/$examId/mock" examId={selectedExam._id} icon={FileText} label="Real Paper" pathname={pathname} match="mock" />
              <BottomTab to="/exams/$examId/chat" examId={selectedExam._id} icon={MessageCircle} label="AI Tutor" pathname={pathname} match="chat" />
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

function ExamStatus({
  label,
  spin,
  actionLabel,
  onAction,
}: {
  label: string;
  spin?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="mx-auto mt-10 max-w-md p-6 text-center">
      {spin && <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />}
      <p className="text-sm text-muted-foreground">{label}</p>
      {actionLabel && (
        <button onClick={onAction} className="mt-4 text-sm font-semibold text-primary hover:underline">
          {actionLabel}
        </button>
      )}
    </Card>
  );
}

function isTabActive(pathname: string, examId: string, match: string) {
  return pathname.startsWith(`/exams/${examId}/${match}`);
}

function BottomTab({
  to,
  examId,
  icon: Icon,
  label,
  pathname,
  match,
}: {
  to: "/exams/$examId/topics" | "/exams/$examId/mock" | "/exams/$examId/chat";
  examId: string;
  icon: typeof BookOpen;
  label: string;
  pathname: string;
  match: string;
}) {
  const active = isTabActive(pathname, examId, match);
  return (
    <Link
      to={to}
      params={{ examId }}
      className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

function NavPill({
  to,
  examId,
  icon: Icon,
  label,
  pathname,
  match,
}: {
  to: "/exams/$examId/topics" | "/exams/$examId/mock" | "/exams/$examId/chat";
  examId: string;
  icon: typeof BookOpen;
  label: string;
  pathname: string;
  match: string;
}) {
  const active = isTabActive(pathname, examId, match);
  return (
    <Link
      to={to}
      params={{ examId }}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
