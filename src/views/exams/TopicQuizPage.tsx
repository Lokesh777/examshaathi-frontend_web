"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/navigation";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  Loader2,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { GenerateTopicQuestionsDialog } from "@/components/GenerateTopicQuestionsDialog";
import {
  deleteQuestion,
  deleteQuiz,
  fetchTopicQuiz,
  listTopicBankQuestions,
  listTopicQuizzes,
} from "@/services/quizzes/quizService";
import { fetchTopicsForExam } from "@/services/exams/examService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BankQuestionSummary, RealPaper } from "@/types/api";

export function TopicQuizPage() {
  const { examId, topicId } = useParams() as { examId: string; topicId: string };
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const qc = useQueryClient();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showBank, setShowBank] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const topicsQ = useQuery({
    queryKey: ["topics", examId],
    queryFn: () => fetchTopicsForExam(examId),
    staleTime: 60_000,
  });
  const topic = topicsQ.data?.find((t) => t._id === topicId);
  const topicName = topic?.name;
  const bankCount = topic?.questionCount ?? 0;
  const emptyBank = bankCount === 0;

  const quizzesQ = useQuery({
    queryKey: ["topic-quizzes", examId, topicId],
    queryFn: () => listTopicQuizzes(examId, topicId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
  const quizzes = quizzesQ.data ?? [];

  const bankQ = useQuery({
    queryKey: ["topic-bank", examId, topicId, isAdmin ? "all" : "mine"],
    queryFn: () => listTopicBankQuestions(examId, topicId),
    enabled: showBank,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!highlightId) return;
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlightId, quizzes.length]);

  const createM = useMutation({
    mutationFn: () => fetchTopicQuiz(examId, topicId),
    onSuccess: async (quiz) => {
      const quizId = quiz.quizId ? String(quiz.quizId) : null;
      await qc.invalidateQueries({ queryKey: ["topic-quizzes", examId, topicId] });
      await quizzesQ.refetch();
      if (!quizId) {
        toast.error("Quiz was created but could not be listed");
        return;
      }
      setHighlightId(quizId);
      toast.success("Quiz created — open it from the list below");
    },
    onError: (e: unknown) => {
      toast.error((e as { message?: string })?.message ?? "Could not create quiz");
    },
  });

  const onGenerated = async () => {
    await qc.invalidateQueries({ queryKey: ["topics", examId] });
    await qc.invalidateQueries({ queryKey: ["topic-bank", examId, topicId] });
    setShowBank(true);
    toast.message("Questions added to the bank", {
      description: "Create a quiz below when you want to practise. You can delete questions you created.",
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-start gap-3">
        <Link
          to="/exams/$examId/topics"
          params={{ examId }}
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border hover:bg-secondary"
          aria-label="Back to topics"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight">
            {topicName ?? "Topic"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {topic?.patternSection ? `${topic.patternSection} · ` : null}
            {emptyBank
              ? "Bank empty — add questions first"
              : `${bankCount} question${bankCount === 1 ? "" : "s"} in bank`}
          </p>
        </div>
      </div>

      <Card className="space-y-3 p-4">
        <div>
          <div className="text-sm font-semibold">1. Add questions (optional)</div>
          <p className="text-xs text-muted-foreground">
            AI fills the shared bank. This does not start a quiz.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={() => setGenerateOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {emptyBank ? "Generate questions" : "Generate more"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="gap-1.5"
            onClick={() => setShowBank((v) => !v)}
          >
            {showBank ? "Hide bank" : isAdmin ? "Manage bank" : "My generated questions"}
          </Button>
        </div>
      </Card>

      {showBank && (
        <BankQuestionsPanel
          examId={examId}
          topicId={topicId}
          isAdmin={isAdmin}
          loading={bankQ.isLoading}
          error={bankQ.isError}
          questions={bankQ.data ?? []}
          onRetry={() => bankQ.refetch()}
          onDeleted={async () => {
            await qc.invalidateQueries({ queryKey: ["topic-bank", examId, topicId] });
            await qc.invalidateQueries({ queryKey: ["topics", examId] });
          }}
        />
      )}

      <Card className="space-y-3 p-4">
        <div>
          <div className="text-sm font-semibold">2. Create a quiz</div>
          <p className="text-xs text-muted-foreground">
            Creates a practice set and lists it below. Open it from the list when ready.
          </p>
        </div>
        <Button
          type="button"
          className="w-full gap-1.5 sm:w-auto"
          disabled={emptyBank || createM.isPending}
          onClick={() => createM.mutate()}
        >
          {createM.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Create quiz
        </Button>
      </Card>

      <div ref={listRef}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Your quizzes — start from here
          </h2>
          {quizzes.length > 0 && (
            <span className="text-[11px] text-muted-foreground">{quizzes.length} quiz(zes)</span>
          )}
        </div>

        {quizzesQ.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : quizzesQ.isError ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Couldn&apos;t load quizzes.{" "}
            <button
              type="button"
              onClick={() => quizzesQ.refetch()}
              className="font-semibold text-primary hover:underline"
            >
              Retry
            </button>
          </Card>
        ) : quizzes.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Play className="h-5 w-5" />
            </div>
            <div className="mt-3 font-bold">No quizzes yet</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap “Create quiz” above — it appears here with Attempts: 0.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {quizzes.map((q) => {
              const id = String(q.quizId ?? q._id);
              return (
                <TopicQuizCard
                  key={id}
                  paper={q}
                  examId={examId}
                  highlighted={highlightId === id}
                  canDelete={Boolean(q.canDelete || q.isOwner || isAdmin)}
                  onDeleted={async () => {
                    await qc.invalidateQueries({ queryKey: ["topic-quizzes", examId, topicId] });
                    if (highlightId === id) setHighlightId(null);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      <GenerateTopicQuestionsDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        examId={examId}
        targets={[{ topicId, topicName }]}
        defaultCount={10}
        onGenerated={onGenerated}
      />
    </div>
  );
}

function TopicQuizCard({
  paper,
  examId,
  highlighted,
  canDelete,
  onDeleted,
}: {
  paper: RealPaper;
  examId: string;
  highlighted?: boolean;
  canDelete?: boolean;
  onDeleted?: () => void;
}) {
  const quizId = (paper.quizId ?? paper._id) as string;
  const attempts = paper.attempts ?? (paper.attempted ? 1 : 0);
  const status = attempts > 0 ? "Attempted" : "Not attempted";
  const statusColor =
    attempts > 0 ? "bg-success/15 text-success" : "bg-warning/15 text-warning-foreground";
  const created = paper.createdAt ? new Date(paper.createdAt).toLocaleString() : "";
  const score =
    paper.lastScorePercent ?? paper.bestScorePercent ?? paper.lastScore ?? paper.bestScore;

  const deleteM = useMutation({
    mutationFn: () => deleteQuiz(quizId),
    onSuccess: () => {
      toast.success("Quiz deleted");
      onDeleted?.();
    },
    onError: (e: unknown) => {
      toast.error((e as { message?: string })?.message ?? "Delete failed");
    },
  });

  return (
    <Card
      className={`p-4 transition hover:shadow-md ${
        highlighted ? "border-primary ring-2 ring-primary/30" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Play className="h-4 w-4 fill-current" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{paper.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            {created && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {created}
              </span>
            )}
            {paper.totalQuestions != null && <span>{paper.totalQuestions} Qs</span>}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor}`}>
              {status}
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-foreground">
              Attempts: {attempts}
            </span>
            {typeof score === "number" && (
              <span className="font-semibold text-foreground">Last: {Math.round(score)}%</span>
            )}
          </div>
          {highlighted && (
            <p className="mt-1 text-[11px] font-medium text-primary">
              Just created — tap Start quiz to begin
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to="/exams/$examId/quiz/$quizId"
          params={{ examId, quizId }}
          className="min-w-[120px] flex-1"
        >
          <Button className="w-full" size="sm">
            <Play className="mr-2 h-3.5 w-3.5 fill-current" />
            {attempts > 0 ? "Re-attempt" : "Start quiz"}
          </Button>
        </Link>
        <Link to="/leaderboard/$quizId" params={{ quizId }} className="min-w-[120px] flex-1">
          <Button variant="outline" className="w-full" size="sm">
            <Trophy className="mr-2 h-3.5 w-3.5" />
            Leaderboard
          </Button>
        </Link>
        {canDelete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            disabled={deleteM.isPending}
            onClick={() => {
              if (!window.confirm("Delete this quiz and its attempts?")) return;
              deleteM.mutate();
            }}
          >
            {deleteM.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}

function BankQuestionsPanel({
  isAdmin,
  loading,
  error,
  questions,
  onRetry,
  onDeleted,
}: {
  examId: string;
  topicId: string;
  isAdmin: boolean;
  loading: boolean;
  error: boolean;
  questions: BankQuestionSummary[];
  onRetry: () => void;
  onDeleted: () => void;
}) {
  return (
    <Card className="space-y-3 p-4">
      <div>
        <div className="text-sm font-semibold">
          {isAdmin ? "Question bank" : "Questions you generated"}
        </div>
        <p className="text-xs text-muted-foreground">
          {isAdmin
            ? "Admin can delete any bank question (including AI / default)."
            : "You can delete questions you generated. Older items without an owner need an admin."}
        </p>
      </div>
      {loading ? (
        <Skeleton className="h-20 w-full" />
      ) : error ? (
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load.{" "}
          <button type="button" className="font-semibold text-primary" onClick={onRetry}>
            Retry
          </button>
        </p>
      ) : questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isAdmin ? "No questions in this topic bank." : "You haven’t generated any questions here yet."}
        </p>
      ) : (
        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {questions.map((q) => (
            <BankQuestionRow
              key={q._id}
              question={q}
              canDelete={Boolean(isAdmin || q.isOwner)}
              onDeleted={onDeleted}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

function BankQuestionRow({
  question,
  canDelete,
  onDeleted,
}: {
  question: BankQuestionSummary;
  canDelete: boolean;
  onDeleted: () => void;
}) {
  const deleteM = useMutation({
    mutationFn: () => deleteQuestion(question._id),
    onSuccess: () => {
      toast.success("Question deleted");
      onDeleted();
    },
    onError: (e: unknown) => {
      toast.error((e as { message?: string })?.message ?? "Delete failed");
    },
  });

  return (
    <li className="flex items-start gap-2 rounded-lg border border-border p-2.5">
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-xs font-medium">{question.questionText}</div>
        <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
          {question.questionType && <span>{question.questionType}</span>}
          {question.source && <span>· {question.source}</span>}
        </div>
      </div>
      {canDelete && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 text-destructive"
          disabled={deleteM.isPending}
          onClick={() => {
            if (!window.confirm("Delete this question from the shared bank?")) return;
            deleteM.mutate();
          }}
        >
          {deleteM.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </li>
  );
}
