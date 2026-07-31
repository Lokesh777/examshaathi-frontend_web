import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ExamSaathi" },
      {
        name: "description",
        content:
          "Sign in or create your ExamSaathi account to access AI tutoring, topic quizzes and full-length mock tests.",
      },
      { property: "og:title", content: "Sign in — ExamSaathi" },
      {
        property: "og:description",
        content:
          "Sign in or create your ExamSaathi account to access AI tutoring, topic quizzes and full-length mock tests.",
      },
    ],
  }),
  component: AuthLayout,
});

function AuthLayout() {
  const { user, isReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isReady && user) navigate({ to: "/exams", replace: true });
  }, [isReady, user, navigate]);

  return <Outlet />;
}