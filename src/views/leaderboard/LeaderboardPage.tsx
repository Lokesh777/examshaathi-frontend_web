"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { fetchQuizLeaderboard } from "@/services/quizzes/quizService";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardPage() {
  const { quizId } = useParams() as { quizId: string };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["leaderboard", quizId],
    queryFn: () => fetchQuizLeaderboard(quizId),
  });

  if (isLoading)
    return (
      <div className="mx-auto max-w-2xl space-y-2">
        <Skeleton className="h-20 w-full rounded-2xl" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  if (isError || !data)
    return (
      <Card className="mx-auto max-w-md p-6 text-center text-sm text-muted-foreground">
        Couldn't load leaderboard.{" "}
        <button onClick={() => refetch()} className="font-semibold text-primary hover:underline">
          Retry
        </button>
      </Card>
    );

  const myUserId = data.myAttempt?.userId;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="flex items-center gap-4 p-5">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Trophy className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">Your rank</div>
          <div className="text-lg font-bold">
            {data.myRank ? `#${data.myRank}` : "You haven't attempted this quiz yet"}
          </div>
          {data.myAttempt && (
            <div className="text-xs text-muted-foreground">
              {data.myAttempt.score}/{data.myAttempt.totalQuestions} •{" "}
              {Math.round(data.myAttempt.scorePercent)}%
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-muted-foreground">Participants</div>
          <div className="text-lg font-bold">{data.totalParticipants}</div>
        </div>
      </Card>

      <Card className="divide-y divide-border p-0">
        {data.top50.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Be the first to attempt this quiz.
          </div>
        )}
        {data.top50.map((row, i) => {
          const mine = myUserId && row.userId === myUserId;
          return (
            <div
              key={row.userId}
              className={`flex items-center gap-3 px-4 py-3 ${mine ? "bg-primary/5" : ""}`}
            >
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  i < 3 ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {row.name} {mine && <span className="text-primary">(you)</span>}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {row.score}/{row.totalQuestions} • {Math.round(row.scorePercent)}%
                </div>
              </div>
              <div className="shrink-0 text-xs text-muted-foreground">
                {Math.round(row.timeTakenSeconds)}s
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
