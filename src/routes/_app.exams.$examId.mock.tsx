import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Check,
  Clock,
  FileText,
  Loader2,
  Pencil,
  Play,
  Plus,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { api, normalizeRealPapers, type RealPaper } from "@/lib/api";
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
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/_app/exams/$examId/mock")({
  component: MockDashboard,
});

function estimateMinutes(qs: number) {
  return Math.round(qs * 1.25);
}

function MockDashboard() {
  const { examId } = Route.useParams();
  const { selectedExam } = useExam();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [warnOpen, setWarnOpen] = useState(false);

  const totalQuestions = selectedExam?.pattern?.totalQuestions ?? 150;

  const listQ = useQuery({
    queryKey: ["real-papers", examId],
    queryFn: () => api.listRealPapers(examId),
    refetchOnWindowFocus: false,
  });
  const papers = normalizeRealPapers(listQ.data);

  const createM = useMutation({
    mutationFn: (title: string) =>
      api.createRealPaper(examId, {
        title,
        userId: user?.id ?? user?._id,
      }),
    onSuccess: (paper) => {
      qc.invalidateQueries({ queryKey: ["real-papers", examId] });
      const quizId = paper.quizId ?? paper._id;
      navigate({
        to: "/exams/$examId/quiz/$quizId",
        params: { examId, quizId },
      });
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
            <div className="text-[10px] uppercase tracking-wider opacity-90">
              Real Paper
            </div>
            <h1 className="truncate text-lg font-bold">
              {selectedExam?.name ?? "Full Mock"}
            </h1>
            <p className="mt-0.5 text-xs opacity-90">
              {totalQuestions} questions · {estimateMinutes(totalQuestions)} min
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
          <StatCard
            label="Last Score"
            value={stats.best != null ? `${stats.best}%` : "—"}
          />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Your Mock Papers
        </h2>
        {listQ.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : listQ.isError ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Couldn't load your papers.{" "}
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
              You still have a mock paper you haven't attempted. Try it first
              for the best practice — or generate a new one anyway.
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
    </div>
  );
}

function calcStats(papers: RealPaper[]) {
  const generated = papers.length;
  const completed = papers.filter((p) => p.attempted).length;
  const pending = generated - completed;
  const scores = papers
    .map(
      (p) =>
        p.bestScorePercent ??
        p.lastScorePercent ??
        p.bestScore ??
        p.lastScore,
    )
    .filter((s): s is number => typeof s === "number");
  const best = scores.length ? Math.round(Math.max(...scores)) : null;
  return { generated, completed, pending, best };
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-3">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
        <FileText className="h-7 w-7" />
      </div>
      <div className="mt-3 font-bold">No mock papers yet</div>
      <p className="mt-1 text-sm text-muted-foreground">
        Generate your first AI-built mock paper to get started.
      </p>
    </Card>
  );
}

function PaperCard({ paper, examId }: { paper: RealPaper; examId: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(paper.title);
  const quizId = (paper.quizId ?? paper._id) as string;

  const rename = useMutation({
    mutationFn: (title: string) => api.renameQuiz(quizId, title),
    onSuccess: () => {
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["real-papers", examId] });
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message ?? "Rename failed";
      toast.error(msg);
    },
  });

  const status = paper.attempted ? "Completed" : "Not attempted";
  const statusColor = paper.attempted
    ? "bg-success/15 text-success"
    : "bg-warning/15 text-warning-foreground";
  const created = paper.createdAt ? new Date(paper.createdAt).toLocaleString() : "";
  const bestNum =
    paper.bestScorePercent ??
    paper.lastScorePercent ??
    paper.bestScore ??
    paper.lastScore ??
    null;

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
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor}`}
            >
              {status}
            </span>
            {paper.attempts != null && paper.attempts > 0 && (
              <span>{paper.attempts} attempts</span>
            )}
            {bestNum != null && (
              <span className="font-semibold text-foreground">
                Best: {Math.round(bestNum)}%
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to="/exams/$examId/quiz/$quizId"
          params={{ examId, quizId }}
          className="min-w-[140px] flex-1"
        >
          <Button className="w-full" size="sm">
            <Play className="mr-2 h-3.5 w-3.5" />
            {paper.attempted ? "Re-attempt" : "Open Test"}
          </Button>
        </Link>
        <Link
          to="/leaderboard/$quizId"
          params={{ quizId }}
          className="min-w-[140px] flex-1"
        >
          <Button variant="outline" className="w-full" size="sm">
            <Trophy className="mr-2 h-3.5 w-3.5" />
            Leaderboard
          </Button>
        </Link>
      </div>
    </Card>
  );
}