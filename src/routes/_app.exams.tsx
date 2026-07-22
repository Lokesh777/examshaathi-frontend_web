import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useExam } from "@/lib/exam-context";

export const Route = createFileRoute("/_app/exams")({
  component: ExamsLayout,
});

function ExamsLayout() {
  const { selectedExam } = useExam();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Only redirect at the bare /exams path; nested child routes render via <Outlet />.
  if (pathname === "/exams" && selectedExam) {
    return (
      <Navigate
        to="/exams/$examId/topics"
        params={{ examId: selectedExam._id }}
        replace
      />
    );
  }
  return <Outlet />;
}