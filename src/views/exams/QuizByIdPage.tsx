"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { QuizPlayer } from "@/components/quiz-player";
import { fetchQuizById } from "@/services/quizzes/quizService";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function QuizByIdPage() {
  const { quizId } = useParams() as { quizId: string };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["quiz-by-id", quizId],
    queryFn: () => fetchQuizById(quizId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="text-center text-xs text-muted-foreground">Loading your mock paper…</div>
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  if (isError || !data?.questions?.length)
    return (
      <Card className="mx-auto max-w-md p-6 text-center text-sm text-muted-foreground">
        Couldn't load this mock paper.{" "}
        <button onClick={() => refetch()} className="font-semibold text-primary hover:underline">
          Retry
        </button>
      </Card>
    );
  return <QuizPlayer quiz={data} paperTitle={data.title} />;
}
