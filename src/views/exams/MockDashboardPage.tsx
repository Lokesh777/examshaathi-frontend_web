"use client";

import { Link, useNavigate } from "@/lib/navigation";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, Clock, FileText, Loader2, Pencil, Play, Plus, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  createRealPaper,
  deleteQuiz,
  fetchRealPapers,
  renameQuiz,
} from "@/services/quizzes/quizService";
import { GenerateTopicQuestionsDialog } from "@/components/GenerateTopicQuestionsDialog";
import type { GenerateTarget } from "@/components/GenerateTopicQuestionsDialog";
import { normalizeRealPapers } from "@/lib/normalizers";
import { userId, type BankShortfall, type RealPaper } from "@/types/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExam } from "@/lib/exam-context";
import { useAuth } from "@/hooks/useAuth";

function estimateMinutes(qs: number) {
  return Math.round(qs * 1.25);
}

function shortfallTargets(shortfalls: BankShortfall[]): GenerateTarget[] {
  const byTopic = new Map<string, GenerateTarget>();
  for (const s of shortfalls) {
    const id = s.topicId ? String(s.topicId) : "";
    if (!id) continue;
    const deficit = s.deficit ?? Math.max(0, s.needed - s.available);
    const count = Math.min(20, Math.max(10, deficit || 10));
    const prev = byTopic.get(id);
    if (!prev || (prev.count ?? 0) < count) {
      byTopic.set(id, {
        topicId: id,
        topicName: s.topic,
        count,
      });
    }
  }
  return Array.from(byTopic.values());
}

export function MockDashboard() {
  const { examId } = useParams() as { examId: string };
  const { selectedExam } = useExam();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [warnOpen, setWarnOpen] = useState(false);
  const [shortfalls, setShortfalls] = useState<BankShortfall[]>([]);
  const [fillOpen, setFillOpen] = useState(false);
  const [pendingTitle, setPendingTitle] = useState<string | null>(null);

  const totalQuestions = selectedExam?.pattern?.totalQuestions ?? 120;
  const durationMinutes =
    selectedExam?.pattern?.durationMinutes ?? estimateMinutes(totalQuestions);

  const listQ = useQuery({
    queryKey: ["real-papers", examId],
    queryFn: () => fetchRealPapers(examId),
    refetchOnWindowFocus: false,
  });
  const papers = normalizeRealPapers(listQ.data);

  const fillTargets = useMemo(() => shortfallTargets(shortfalls), [shortfalls]);

  const openCreatedPaper = (paper: { quizId?: string; _id?: string }) => {
    const quizId = paper.quizId ?? paper._id;
    if (!quizId) return;
    navigate({
      to: "/exams/$examId/quiz/$quizId",
      params: { examId, quizId },
    });
  };

  const createM = useMutation({
    mutationFn: (title: string) =>
      createRealPaper(examId, {
        title,
        userId: userId(user),
      }),
    onSuccess: (paper) => {
      qc.invalidateQueries({ queryKey: ["real-papers", examId] });
      const gaps = paper.shortfalls?.filter((s) => (s.deficit ?? s.needed - s.available) > 0) ?? [];
      if (gaps.length > 0 && shortfallTargets(gaps).length > 0) {
        setShortfalls(gaps);
        setPendingTitle(paper.title ?? null);
        setFillOpen(true);
        toast.message("Question bank is short for some topics", {
          description: "Generate questions to fill the bank, then create a fuller mock.",
        });
        return;
      }
      openCreatedPaper(paper);
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message ?? "Failed to create mock paper";
      toast.error(msg);
    },
  });

  const nextTitle = () => `Mock Paper ${papers.length + 1}`;
  const hasUnattempted = papers.some((p) => !p.attempted);

  const handleGenerate = () => {
    if (hasUnattempted) setWarnOpen(true);
    else createM.mutate(nextTitle());
  };

  const stats = calcStats(papers);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card
        className="p-5 text-primary-foreground"
        style={{ background: "var(--gradient-hero, var(--color-primary))" }}
      >
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider opacity-90">Mock Papers</div>
            <h1 className="truncate text-lg font-bold">{selectedExam?.name ?? "Practice mock"}</h1>
            <p className="mt-0.5 text-xs opacity-90">
              AI-built from your question bank · {totalQuestions} Qs · ~
              {durationMinutes} min
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          className="mt-4 w-full"
          onClick={handleGenerate}
          disabled={createM.isPending}
        >
          {createM.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Generate New Mock Paper
        </Button>
      </Card>

      {papers.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Generated" value={stats.generated} />
          <StatCard label="Completed" value={stats.completed} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Last Score" value={stats.best != null ? `${stats.best}%` : "—"} />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Your mock papers
        </h2>
        {listQ.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : listQ.isError ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Couldn&apos;t load your papers.{" "}
            <button
              onClick={() => listQ.refetch()}
              className="font-semibold text-primary hover:underline"
            >
              Retry
            </button>
          </Card>
        ) : papers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {papers.map((p) => {
              const id = p.quizId ?? p._id ?? p.title;
              return <PaperCard key={id} paper={p} examId={examId} />;
            })}
          </div>
        )}
      </div>

      <Dialog open={warnOpen} onOpenChange={setWarnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unattempted paper found</DialogTitle>
            <DialogDescription>
              You still have a mock paper you haven&apos;t attempted. Try it first for the best
              practice — or generate a new one anyway.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setWarnOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setWarnOpen(false);
                createM.mutate(nextTitle());
              }}
            >
              Generate Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GenerateTopicQuestionsDialog
        open={fillOpen}
        onOpenChange={(open) => {
          setFillOpen(open);
          if (!open) setShortfalls([]);
        }}
        examId={examId}
        targets={fillTargets}
        title="Generate to fill bank"
        description="Some topics don't have enough questions for a full mock. Pick a pattern mode — we'll fill the short topics, then create a new mock."
        onGenerated={() => {
          setShortfalls([]);
          const title = pendingTitle
            ? `${pendingTitle} (full)`
            : nextTitle();
          setPendingTitle(null);
          createM.mutate(title);
        }}
      />
    </div>
  );
}

function calcStats(papers: RealPaper[]) {
  const generated = papers.length;
  const completed = papers.filter((p) => p.attempted).length;
  const pending = generated - completed;
  const scores = papers
    .map((p) => p.bestScorePercent ?? p.lastScorePercent ?? p.bestScore ?? p.lastScore)
    .filter((s): s is number => typeof s === "number");
  const best = scores.length ? Math.round(Math.max(...scores)) : null;
  return { generated, completed, pending, best };
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-3">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </Card>
  );
}

export function EmptyState() {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
        <FileText className="h-7 w-7" />
      </div>
      <div className="mt-3 font-bold">No mock papers yet</div>
      <p className="mt-1 text-sm text-muted-foreground">
        Generate a practice mock from the question bank. For real RSSB papers with PDF links, use
        Official Papers.
      </p>
    </Card>
  );
}

function PaperCard({ paper, examId }: { paper: RealPaper; examId: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(paper.title);
  const quizId = (paper.quizId ?? paper._id) as string;
  const attempts = paper.attempts ?? (paper.attempted ? 1 : 0);

  const rename = useMutation({
    mutationFn: (title: string) => renameQuiz(quizId, title),
    onSuccess: () => {
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["real-papers", examId] });
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message ?? "Rename failed";
      toast.error(msg);
    },
  });

  const deleteM = useMutation({
    mutationFn: () => deleteQuiz(quizId),
    onSuccess: () => {
      toast.success("Mock paper deleted");
      qc.invalidateQueries({ queryKey: ["real-papers", examId] });
    },
    onError: (e: unknown) => {
      toast.error((e as { message?: string })?.message ?? "Delete failed");
    },
  });

  const status = attempts > 0 ? "Attempted" : "Not attempted";
  const statusColor =
    attempts > 0 ? "bg-success/15 text-success" : "bg-warning/15 text-warning-foreground";
  const created = paper.createdAt ? new Date(paper.createdAt).toLocaleString() : "";
  const bestNum =
    paper.bestScorePercent ?? paper.lastScorePercent ?? paper.bestScore ?? paper.lastScore ?? null;

  return (
    <Card className="p-4 transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8"
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => rename.mutate(name.trim() || paper.title)}
                disabled={rename.isPending}
              >
                {rename.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="truncate font-bold">{paper.title}</div>
              <button
                onClick={() => {
                  setName(paper.title);
                  setEditing(true);
                }}
                className="text-muted-foreground hover:text-primary"
                aria-label="Rename paper"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            {created && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {created}
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor}`}>
              {status}
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-foreground">
              Attempts: {attempts}
            </span>
            {bestNum != null && (
              <span className="font-semibold text-foreground">Best: {Math.round(bestNum)}%</span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to="/exams/$examId/quiz/$quizId"
          params={{ examId, quizId }}
          className="min-w-[120px] flex-1"
        >
          <Button className="w-full" size="sm">
            <Play className="mr-2 h-3.5 w-3.5" />
            {attempts > 0 ? "Re-attempt" : "Open Test"}
          </Button>
        </Link>
        <Link to="/leaderboard/$quizId" params={{ quizId }} className="min-w-[120px] flex-1">
          <Button variant="outline" className="w-full" size="sm">
            <Trophy className="mr-2 h-3.5 w-3.5" />
            Leaderboard
          </Button>
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          disabled={deleteM.isPending}
          onClick={() => {
            if (!window.confirm("Delete this mock paper and its attempts?")) return;
            deleteM.mutate();
          }}
        >
          {deleteM.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </Card>
  );
}
