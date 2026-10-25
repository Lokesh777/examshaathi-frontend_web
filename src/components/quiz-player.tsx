import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, Timer, AlertTriangle, X, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { submitQuizAttempt } from "@/services/quizzes/quizService";
import type { QuizFetchResponse, SubmitAnswer } from "@/types/api";
import { setLastAttempt } from "@/lib/result-store";
import { QuestionMedia } from "@/components/question-media";
import Image from "next/image";

function Pagination({
  total,
  current,
  onSelect,
  answers,
  questions,
}: {
  total: number;
  current: number;
  onSelect: (i: number) => void;
  answers: Record<string, string | null>;
  questions: { _id: string }[];
}) {
  // Build compact page list with ellipses: 1 … c-1 c c+1 … total
  const pages: (number | "…")[] = [];
  const add = (n: number) => pages.push(n);
  const window = 1;
  const first = 0;
  const last = total - 1;
  const start = Math.max(first + 1, current - window);
  const end = Math.min(last - 1, current + window);
  add(first);
  if (start > first + 1) pages.push("…");
  for (let i = start; i <= end; i++) add(i);
  if (end < last - 1) pages.push("…");
  if (last > first) add(last);

  return (
    <div className="mx-1 flex flex-1 items-center justify-center gap-1 overflow-x-auto">
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-1 text-xs text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onSelect(p)}
            aria-current={p === current ? "page" : undefined}
            className={`grid h-8 min-w-8 place-items-center rounded-md px-2 text-xs font-semibold transition ${
              p === current
                ? "bg-primary text-primary-foreground"
                : answers[questions[p]?._id] != null
                  ? "bg-success/15 text-success hover:bg-success/25"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            {p + 1}
          </button>
        ),
      )}
    </div>
  );
}

function QuestionPalette({
  palette,
  onSelect,
  large,
}: {
  palette: { i: number; answered: boolean; current: boolean }[];
  onSelect: (i: number) => void;
  large?: boolean;
}) {
  return (
    <div className={`grid gap-1.5 ${large ? "grid-cols-6 sm:grid-cols-10" : "grid-cols-5"}`}>
      {palette.map((p) => (
        <button
          key={p.i}
          type="button"
          onClick={() => onSelect(p.i)}
          aria-current={p.current ? "step" : undefined}
          className={`${large ? "h-11" : "h-8"} rounded-md text-xs font-semibold tabular-nums transition ${
            p.current
              ? "bg-primary text-primary-foreground"
              : p.answered
                ? "bg-success/15 text-success"
                : "bg-secondary text-muted-foreground hover:bg-secondary/70"
          }`}
        >
          {p.i + 1}
        </button>
      ))}
    </div>
  );
}

const MIN_PER_Q = 1.25;
const timerKey = (quizId: string) => `examsaathi.quizStart.${quizId}`;

function formatHMS(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
}

export function QuizPlayer({
  quiz,
  paperTitle,
}: {
  quiz: QuizFetchResponse;
  paperTitle?: string;
}) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);

  const total = quiz.questions.length;
  const totalSeconds = useMemo(() => {
    if (quiz.durationMinutes != null && quiz.durationMinutes > 0) {
      return quiz.durationMinutes * 60;
    }
    return Math.round(total * MIN_PER_Q) * 60;
  }, [total, quiz.durationMinutes]);

  // Resume-protected start time (per quizId, in localStorage).
  const [startedAt] = useState<number>(() => {
    if (typeof window === "undefined") return Date.now();
    try {
      const raw = localStorage.getItem(timerKey(quiz.quizId));
      if (raw) {
        const parsed = JSON.parse(raw) as { startAt: number };
        if (parsed?.startAt) return parsed.startAt;
      }
    } catch {
      /* ignore */
    }
    const now = Date.now();
    try {
      localStorage.setItem(
        timerKey(quiz.quizId),
        JSON.stringify({ startAt: now, totalSeconds }),
      );
    } catch {
      /* ignore */
    }
    return now;
  });

  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const elapsedSec = Math.floor((now - startedAt) / 1000);
  const remainingSec = Math.max(0, totalSeconds - elapsedSec);
  const timeUp = remainingSec === 0;

  const [autoDialog, setAutoDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [exitDialog, setExitDialog] = useState(false);
  const [switchWarn, setSwitchWarn] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const switchCountRef = useRef(0);

  // Enter fullscreen when the quiz mounts
  useEffect(() => {
    const el = document.documentElement;
    const req = el.requestFullscreen?.bind(el);
    if (req) {
      req().catch(() => {
        /* user gesture may be required; ignore */
      });
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {
          /* ignore */
        });
      }
    };
  }, []);

  // Intercept browser back button
  useEffect(() => {
    window.history.pushState({ quizGuard: true }, "");
    const onPop = () => {
      if (submittedRef.current) return;
      setExitDialog(true);
      // Re-push so subsequent back presses are also intercepted
      window.history.pushState({ quizGuard: true }, "");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect tab/app switching and warn
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden" && !submittedRef.current) {
        switchCountRef.current += 1;
        setSwitchWarn(true);
        toast.warning(
          `Don't switch tabs — this may affect your credit (${switchCountRef.current})`,
        );
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Warn before leaving mid-quiz
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [answers]);

  const q = quiz.questions[idx];
  const answered = Object.values(answers).filter((v) => v != null).length;
  const shortfall = quiz.shortfalls?.length ?? 0;

  const pick = (opt: string) => {
    if (timeUp) return;
    setAnswers((prev) => ({ ...prev, [q._id]: prev[q._id] === opt ? null : opt }));
  };

  const submittedRef = useRef(false);
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const submit = useCallback(
    async (opts: { auto?: boolean } = {}) => {
      if (submittedRef.current || submitting) return;
      submittedRef.current = true;
      setSubmitting(true);
      const timeTakenSeconds = Math.round((Date.now() - startedAt) / 1000);
      const payload: { answers: SubmitAnswer[]; timeTakenSeconds: number } = {
        answers: quiz.questions.map((qq) => ({
          questionId: qq._id,
          selectedOption: answersRef.current[qq._id] ?? null,
        })),
        timeTakenSeconds,
      };
      try {
        const res = await submitQuizAttempt(quiz.quizId, payload);
        setLastAttempt(quiz.quizId, res, {
          paperTitle: paperTitle ?? quiz.title,
          timeTakenSeconds,
        });
        try { localStorage.removeItem(timerKey(quiz.quizId)); } catch { /* ignore */ }
        navigate({ to: "/result" });
      } catch (err) {
        const msg = (err as { message?: string }).message ?? "Submission failed";
        toast.error(`${msg}. Your answers are saved — try again.`);
        submittedRef.current = false;
        setSubmitting(false);
        if (opts.auto) setAutoDialog(false);
      }
    },
    [navigate, paperTitle, quiz, startedAt, submitting],
  );

  // Auto-submit when timer hits zero
  useEffect(() => {
    if (timeUp && !submittedRef.current) {
      setAutoDialog(true);
      void submit({ auto: true });
    }
  }, [timeUp, submit]);

  const palette = useMemo(
    () =>
      quiz.questions.map((qq, i) => ({
        i,
        answered: answers[qq._id] != null,
        current: i === idx,
      })),
    [quiz.questions, answers, idx],
  );

  const tone =
    remainingSec <= 60
      ? "border-destructive text-destructive animate-pulse"
      : remainingSec <= 5 * 60
        ? "border-destructive text-destructive"
        : remainingSec <= 10 * 60
          ? "border-warning text-warning-foreground"
          : "border-border text-foreground";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex min-h-full w-full max-w-5xl min-w-0 flex-col px-4 sm:px-6">
      {/* One compact sticky header: exit · title · timer · progress */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/95 px-4 pt-3 pb-2.5 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setExitDialog(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-secondary/60"
            aria-label="Exit quiz"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">
              {paperTitle ?? quiz.title ?? "Quiz"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Q {idx + 1}/{total} · {answered} answered
            </div>
          </div>
          <div
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-sm font-bold tabular-nums ${tone}`}
            aria-live="polite"
          >
            <Timer className="h-3.5 w-3.5" />
            {formatHMS(remainingSec)}
          </div>
        </div>
        <Progress value={((idx + 1) / total) * 100} className="mt-2.5 h-1" />
      </div>

      <div className="grid flex-1 gap-6 py-4 sm:py-6 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="min-w-0 space-y-4">
        {shortfall > 0 && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
            This mock has only {total} questions so far — some topic banks are still being filled.
          </div>
        )}

        <Card className="p-4 sm:p-5">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>{q.difficulty}</span>
            {q.questionType && q.questionType !== "direct" && (
              <span className="rounded bg-secondary px-1.5 py-0.5 normal-case text-[10px]">
                {q.questionType.replace(/_/g, " ")}
              </span>
            )}
          </div>
          <div className="whitespace-pre-wrap text-base font-semibold leading-relaxed">
            {q.questionText}
          </div>
          {q.questionMedia?.url && (
            <QuestionMedia
              url={q.questionMedia.url}
              alt={q.questionMedia.alt || "Question diagram"}
              className="mt-3"
            />
          )}
          <div className="mt-4 space-y-2">
            {q.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const optionImage = q.optionMedia?.find((m) => m.letter === letter);
              const pickValue =
                q.answerMode === "letter" || q.optionMedia?.length
                  ? letter
                  : opt;
              const selected = answers[q._id] === pickValue;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(pickValue)}
                  disabled={timeUp}
                  className={`flex min-h-12 w-full items-start gap-3 rounded-xl border p-3 text-left text-[15px] leading-snug transition active:scale-[0.99] sm:text-sm ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-secondary/40"
                  } ${timeUp ? "opacity-60" : ""}`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 min-w-0">
                    {optionImage?.url ? (
                      <span className="block overflow-hidden rounded-md border bg-muted/20">
                        <Image
                          src={optionImage.url}
                          alt={optionImage.alt || `Option ${letter}`}
                          width={320}
                          height={160}
                          loading="lazy"
                          className="h-auto w-full max-h-40 object-contain"
                          unoptimized
                        />
                      </span>
                    ) : (
                      opt
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

      </div>

      {/* Palette (desktop sidebar) */}
      <Card className="hidden h-fit p-4 lg:sticky lg:top-24 lg:block">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Questions
        </div>
        <QuestionPalette palette={palette} onSelect={setIdx} />
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => setConfirmDialog(true)}
          disabled={submitting}
        >
          Submit paper
        </Button>
      </Card>
      </div>

      {/* Sticky action bar — thumb-reachable on phones */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+0.625rem)] backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-11 shrink-0 px-3"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            aria-label="Previous question"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </Button>
          <div className="hidden min-w-0 flex-1 overflow-x-auto sm:block">
            <Pagination
              total={total}
              current={idx}
              onSelect={(i) => setIdx(i)}
              answers={answers}
              questions={quiz.questions}
            />
          </div>
          <Button
            variant="secondary"
            className="h-11 min-w-0 flex-1 gap-2 sm:hidden"
            onClick={() => setPaletteOpen(true)}
          >
            <LayoutGrid className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {idx + 1} / {total}
            </span>
          </Button>
          {idx < total - 1 ? (
            <Button
              className="h-11 shrink-0 px-4"
              onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="h-11 shrink-0 px-4"
              onClick={() => setConfirmDialog(true)}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          )}
        </div>
      </div>

      {/* Palette (mobile bottom sheet) */}
      <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
        <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <SheetHeader className="text-left">
            <SheetTitle>Jump to question</SheetTitle>
            <SheetDescription>
              {answered} answered · {total - answered} left
            </SheetDescription>
          </SheetHeader>
          <div className="mt-2 mb-3 flex gap-4 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-success/30" /> Answered</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-secondary" /> Not answered</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary" /> Current</span>
          </div>
          <QuestionPalette
            palette={palette}
            onSelect={(i) => {
              setIdx(i);
              setPaletteOpen(false);
            }}
            large
          />
          <Button
            className="mt-4 h-11 w-full"
            onClick={() => {
              setPaletteOpen(false);
              setConfirmDialog(true);
            }}
            disabled={submitting}
          >
            Submit paper ({answered}/{total})
          </Button>
        </SheetContent>
      </Sheet>

      <Dialog open={autoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time's up</DialogTitle>
            <DialogDescription>
              Submitting your paper with your current answers…
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialog} onOpenChange={(o) => !submitting && setConfirmDialog(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning-foreground" />
              Submit your paper?
            </DialogTitle>
            <DialogDescription>
              Once submitted, you can't change your answers. Please review before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-secondary/40 p-3 text-center text-xs">
            <div>
              <div className="text-lg font-bold">{total}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success">{answered}</div>
              <div className="text-muted-foreground">Answered</div>
            </div>
            <div>
              <div className="text-lg font-bold text-destructive">{total - answered}</div>
              <div className="text-muted-foreground">Unanswered</div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog(false)} disabled={submitting}>
              Keep editing
            </Button>
            <Button onClick={() => submit()} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exitDialog} onOpenChange={setExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Leave the quiz?
            </DialogTitle>
            <DialogDescription>
              If you leave now, your attempt <b>will not be saved or recorded</b>.
              You'll lose all your current answers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setExitDialog(false)}>
              Stay in quiz
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                submittedRef.current = true;
                try { localStorage.removeItem(timerKey(quiz.quizId)); } catch { /* ignore */ }
                if (document.fullscreenElement) {
                  document.exitFullscreen?.().catch(() => {});
                }
                navigate({ to: "/exams" });
              }}
            >
              Leave without saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={switchWarn} onOpenChange={setSwitchWarn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Don't switch tabs
            </DialogTitle>
            <DialogDescription>
              Switching tabs or apps during a quiz is tracked and may affect
              your credibility score. Please stay on this screen until you
              submit. (Warnings: {switchCountRef.current})
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSwitchWarn(false)}>Got it, continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}