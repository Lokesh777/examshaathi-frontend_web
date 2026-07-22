import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { QuizPlayer } from "@/components/quiz-player";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/exams/$examId/topic-quiz/$topicId")({
  component: TopicQuizPage,
});

function TopicQuizPage() {
  const { examId, topicId } = Route.useParams();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["quiz", examId, topicId],
    queryFn: () => api.topicQuiz(examId, topicId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <QuizLoading />;
  if (isError || !data?.questions?.length)
    return (
      <Card className="glass mx-auto max-w-md p-6 text-center text-sm text-muted-foreground">
        <p>Couldn't load this quiz. The topic bank may still be filling up.</p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => refetch()}
            className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
          <Link
            to="/exams/$examId/topics"
            params={{ examId }}
            className="rounded-md border border-border px-4 py-2 text-xs font-semibold hover:bg-secondary/50"
          >
            Back to topics
          </Link>
        </div>
      </Card>
    );
  return <QuizPlayer quiz={data} paperTitle={data.title} />;
}

function QuizLoading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center">
      <Card className="glass w-full p-8 text-center">
        <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
          <span className="absolute inset-2 rounded-full bg-primary/20" />
          <Sparkles className="relative h-7 w-7 text-primary" />
        </div>
        <div className="text-base font-bold">Crafting your quiz</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Picking the right questions from this topic…
        </p>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          Just a moment
        </div>
      </Card>
    </div>
  );
}