"use client";

import { Link } from "@/lib/navigation";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, MessageCircle, Trophy } from "lucide-react";
import { fetchTopicsForExam } from "@/services/exams/examService";
import type { Topic } from "@/types/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExam } from "@/lib/exam-context";

export function TopicsPage() {
  const { examId } = useParams() as { examId: string };
  const { selectedExam } = useExam();
  const totalQs = selectedExam?.pattern?.totalQuestions ?? 150;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["topics", examId],
    queryFn: () => fetchTopicsForExam(examId),
    staleTime: Infinity,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Practise topic-wise or take a full mock.
        </p>
      </div>

      {/* Full Mock CTA */}
      <Link to="/exams/$examId/mock" params={{ examId }} className="block">
        <Card
          className="flex items-center gap-4 border-primary/30 p-5 text-primary-foreground shadow-md"
          style={{ background: "var(--gradient-hero, var(--color-primary))" }}
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold">Full Mock Paper</div>
            <div className="text-xs opacity-90">Real-exam simulation • {totalQs} questions</div>
          </div>
        </Card>
      </Link>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Couldn't load topics.{" "}
          <button onClick={() => refetch()} className="font-semibold text-primary hover:underline">
            Retry
          </button>
        </Card>
      ) : !data?.length ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Topics coming soon.</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((t) => (
            <Card key={t._id} className="flex flex-col gap-3 p-4">
              <div className="min-w-0">
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
              </div>
              <div className="flex gap-2">
                <Link
                  to="/exams/$examId/topic-quiz/$topicId"
                  params={{ examId, topicId: t._id }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Practice
                </Link>
                <Link
                  to="/exams/$examId/chat"
                  params={{ examId }}
                  search={{ topicId: t._id }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Ask AI
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
