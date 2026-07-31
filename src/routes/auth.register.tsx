import { Link, createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "@/components/organisms/AuthShell";
import { RegisterForm } from "@/components/organisms/RegisterForm";

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start with topic-wise quizzes and full-length mocks."
      backTo="/auth"
    >
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}