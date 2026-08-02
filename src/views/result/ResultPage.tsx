"use client";

import { CheckCircle2, XCircle, Trophy, ChevronDown, Clock, FileText } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionMedia } from "@/components/question-media";
import { getLastAttempt } from "@/lib/result-store";
import { Link, Navigate } from "@/lib/navigation";
import type { AttemptResult } from "@/types/api";

export function ResultPage() {
  const attempt = getLastAttempt();
  if (!attempt) return <Navigate to="/exams" replace />;

  const pct = Math.round(attempt.scorePercent);
  const correct = attempt.results.filter((r) => r.isCorrect).length;
  const wrong = attempt.results.filter((r) => !r.isCorrect && r.selectedOption != null).length;
  const skipped = attempt.results.filter((r) => r.selectedOption == null).length;
  const badge = performanceBadge(pct);
  const timeStr =
    attempt.timeTakenSeconds != null ? formatDuration(attempt.timeTakenSeconds) : null;
  const dateStr = attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {(attempt.paperTitle || timeStr || dateStr || attempt.attemptNumber) && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {attempt.paperTitle && (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                {attempt.paperTitle}
              </span>
            )}
            {dateStr && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {dateStr}
              </span>
            )}
            {timeStr && (
              <span>
                Time taken: <span className="font-semibold text-foreground">{timeStr}</span>
              </span>
            )}
            {attempt.attemptNumber != null && <span>Attempt #{attempt.attemptNumber}</span>}
          </div>
        </Card>
      )}

      <Card className="p-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="mt-3 text-2xl font-bold">You scored {pct}%</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {attempt.score} / {attempt.totalQuestions} correct
        </p>
        <div
          className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
        >
          {badge.label}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <Stat label="Correct" value={correct} tint="text-success" />
          <Stat label="Wrong" value={wrong} tint="text-destructive" />
          <Stat label="Skipped" value={skipped} tint="text-muted-foreground" />
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link to="/leaderboard/$quizId" params={{ quizId: attempt.quizId }}>
            <Button variant="outline" className="w-full sm:w-auto">
              See leaderboard
            </Button>
          </Link>
          <Link to="/exams">
            <Button className="w-full sm:w-auto">Back to exams</Button>
          </Link>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-bold">Review</h2>
        <div className="space-y-2">
          {attempt.results.map((r, i) => (
            <ReviewItem key={r.questionId} index={i} r={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

function performanceBadge(pct: number) {
  if (pct >= 85) return { label: "Excellent", className: "bg-success/15 text-success" };
  if (pct >= 70) return { label: "Good", className: "bg-primary/15 text-primary" };
  if (pct >= 50) return { label: "Average", className: "bg-warning/15 text-warning-foreground" };
  return { label: "Needs Improvement", className: "bg-destructive/15 text-destructive" };
}

function formatDuration(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
}

function Stat({ label, value, tint }: { label: string; value: number; tint: string }) {
  return (
    <div className="rounded-lg bg-secondary p-3">
      <div className={`text-lg font-bold ${tint}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ReviewItem({ index, r }: { index: number; r: AttemptResult }) {
  const [open, setOpen] = useState(false);
  const letterMode = r.answerMode === "letter" || (r.optionMedia?.length ?? 0) > 0;

  return (
    <Card className="p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 text-left"
      >
        <span className="mt-0.5 shrink-0">
          {r.isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">Q{index + 1}</div>
          <div className="text-sm font-semibold">{r.questionText}</div>
          {r.questionMedia?.url && (
            <QuestionMedia
              url={r.questionMedia.url}
              alt={r.questionMedia.alt || "Question diagram"}
              className="mt-2"
            />
          )}
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
          {r.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const optionImage = r.optionMedia?.find((m) => m.letter === letter);
            const isCorrect =
              letterMode
                ? r.correctAnswer === letter || r.correctAnswer === opt
                : opt === r.correctAnswer;
            const isSelected =
              letterMode
                ? r.selectedOption === letter || r.selectedOption === opt
                : opt === r.selectedOption;
            return (
              <div
                key={i}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  isCorrect
                    ? "border-success/40 bg-success/10 text-success"
                    : isSelected
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-border text-muted-foreground"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="font-bold">{letter}.</span>
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
                    <span>{opt}</span>
                  )}
                </div>
                {isCorrect && " ✓"}
                {isSelected && !isCorrect && " (your answer)"}
              </div>
            );
          })}
          {r.explanation && (
            <div className="rounded-lg bg-secondary/60 p-3 text-xs">
              <div className="mb-1 font-semibold">Explanation</div>
              {r.explanation}
            </div>
          )}
          {r.referenceLinks?.length > 0 && (
            <div className="text-xs">
              <div className="mb-1 font-semibold">Sources</div>
              <ul className="space-y-1">
                {r.referenceLinks.map((l, i) => (
                  <li key={i}>
                    <a
                      href={l}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-primary hover:underline"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
