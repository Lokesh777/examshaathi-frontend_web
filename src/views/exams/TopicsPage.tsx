"use client";

import { useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/navigation";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  Flame,
  Loader2,
  MessageCircle,
  Play,
  Search,
  Trophy,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { fetchTopicsForExam } from "@/services/exams/examService";
import {
  fetchDailyStreak,
  startDailyChallenge,
} from "@/services/quizzes/quizService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useExam } from "@/lib/exam-context";
import type { Topic } from "@/types/api";

function ReadinessRing({ percent, size = 40 }: { percent: number; size?: number }) {
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, percent));
  const offset = c - (p / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset]"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[9px] font-bold tabular-nums">
        {p}%
      </span>
    </div>
  );
}

export function TopicsPage() {
  const { examId } = useParams() as { examId: string };
  const { selectedExam } = useExam();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["topics", examId],
    queryFn: () => fetchTopicsForExam(examId),
    staleTime: 30_000,
  });

  const streakQ = useQuery({
    queryKey: ["daily-streak", examId],
    queryFn: () => fetchDailyStreak(examId),
    staleTime: 30_000,
  });

  const dailyM = useMutation({
    mutationFn: () => startDailyChallenge(examId),
    onSuccess: (res) => {
      if (!res.quizId) {
        toast.error("Could not start daily challenge");
        return;
      }
      navigate({
        to: "/exams/$examId/quiz/$quizId",
        params: { examId, quizId: String(res.quizId) },
      });
    },
    onError: (e: unknown) => {
      toast.error((e as { message?: string })?.message ?? "Daily challenge unavailable");
    },
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((t) => {
      const name = (t.name || "").toLowerCase();
      const section = (t.patternSection || "").toLowerCase();
      return name.includes(q) || section.includes(q);
    });
  }, [data, query]);

  const streak = streakQ.data;
  const minsHint = selectedExam?.pattern
    ? Math.max(
        5,
        Math.round(
          (20 * (selectedExam.pattern.durationMinutes || 120)) /
            (selectedExam.pattern.totalQuestions || 120),
        ),
      )
    : 20;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your daily streak, then practise topic-wise quizzes.
        </p>
      </div>

      <Card
        className="overflow-hidden border-primary/25 p-0 text-primary-foreground shadow-md"
        style={{ background: "var(--gradient-hero, var(--color-primary))" }}
      >
        <div className="flex items-start gap-4 p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20">
            <Flame className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider opacity-90">Daily streak</div>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-bold tabular-nums">
                {streakQ.isLoading ? "…" : streak?.current ?? 0}
              </span>
              <span className="text-sm opacity-90">
                day{(streak?.current ?? 0) === 1 ? "" : "s"}
                {streak?.longest ? ` · best ${streak.longest}` : ""}
              </span>
            </div>
            <p className="mt-1 text-xs opacity-90">
              20 mixed questions from all subjects · ~{minsHint} min
              {streak?.completedToday ? " · done for today" : ""}
            </p>
          </div>
        </div>
        <div className="border-t border-white/15 px-5 py-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-1.5"
            disabled={dailyM.isPending}
            onClick={() => dailyM.mutate()}
          >
            {dailyM.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            {streak?.completedToday || streak?.attemptedToday
              ? "Open today's challenge"
              : "Start today's 20 questions"}
          </Button>
        </div>
      </Card>

      <Link
        to="/exams/$examId/mock"
        params={{ examId }}
        className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition hover:bg-secondary/50"
      >
        <Trophy className="h-4 w-4 text-primary" />
        <span className="min-w-0 flex-1 font-semibold">Mock papers</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      {!isLoading && !isError && !!data?.length && (
        <div>
          {/* Caption sits outside this box so the icons centre on the input */}
          <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics or sections…"
            className="h-11 pl-9 pr-9"
            aria-label="Search topics"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          </div>
          <div className="mt-1.5 text-[11px] text-muted-foreground">
            {query.trim()
              ? `${filtered.length} of ${data.length} topics`
              : `${data.length} topics · readiness after solving topic quizzes`}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Couldn&apos;t load topics.{" "}
          <button onClick={() => refetch()} className="font-semibold text-primary hover:underline">
            Retry
          </button>
        </Card>
      ) : !data?.length ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Topics coming soon.</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No topics match &ldquo;{query.trim()}&rdquo;.{" "}
          <button
            type="button"
            onClick={() => setQuery("")}
            className="font-semibold text-primary hover:underline"
          >
            Clear search
          </button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((t) => (
            <TopicCard key={t._id} topic={t} examId={examId} />
          ))}
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic: t, examId }: { topic: Topic; examId: string }) {
  const count = t.questionCount ?? 0;
  const ready = count > 0;
  const solved = t.quizzesSolved ?? 0;
  const target = t.readinessTarget ?? 5;
  const percent = t.readinessPercent ?? 0;
  const showProgress = Boolean(t.showProgress && solved >= 1);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-stretch">
        <Link
          to="/exams/$examId/topic-quiz/$topicId"
          params={{ examId, topicId: t._id }}
          className="min-w-0 flex-1 p-4 transition hover:bg-secondary/40"
        >
          <div className="flex items-start gap-3">
            {showProgress && <ReadinessRing percent={percent} />}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="truncate text-sm font-bold">{t.name}</div>
                {typeof t.weightage === "number" && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {t.weightage}%
                  </span>
                )}
              </div>
              {t.patternSection && (
                <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                  {t.patternSection}
                </div>
              )}
              <div className="mt-1.5 text-[11px] text-muted-foreground">
                {ready
                  ? `${count} in bank`
                  : "No questions yet · open to generate"}
                {showProgress
                  ? ` · ${solved}/${target} quizzes solved`
                  : ready
                    ? " · solve quizzes to build readiness"
                    : ""}
              </div>
              {showProgress && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </Link>
        <div className="flex flex-col items-center justify-center border-l border-border px-2">
          <Button
            asChild
            size="icon"
            variant={ready ? "default" : "outline"}
            className="h-10 w-10 rounded-full"
          >
            <Link
              to="/exams/$examId/topic-quiz/$topicId"
              params={{ examId, topicId: t._id }}
              aria-label={`Open ${t.name} quizzes`}
              title="Open topic quizzes"
            >
              {ready ? (
                <Play className="h-4 w-4 fill-current" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Link>
          </Button>
        </div>
      </div>
      <div className="border-t border-border px-4 py-2">
        <Link
          to="/exams/$examId/chat"
          params={{ examId }}
          search={{ topicId: t._id }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Ask AI
        </Link>
      </div>
    </Card>
  );
}
