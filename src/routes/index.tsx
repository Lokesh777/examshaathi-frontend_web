import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, isReady } = useAuth();
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  return <Navigate to={user ? "/exams" : "/auth"} replace />;
}