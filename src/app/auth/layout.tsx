import { AuthGate } from "@/layouts/AuthGate";

export const metadata = {
  title: "Sign in — ExamSaathi",
  description:
    "Sign in or create your ExamSaathi account to access AI tutoring, topic quizzes and full-length mock tests.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
