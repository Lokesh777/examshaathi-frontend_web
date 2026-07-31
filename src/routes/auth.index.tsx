import { Link, createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "@/components/organisms/AuthShell";
import { LoginForm } from "@/components/organisms/LoginForm";

export const Route = createFileRoute("/auth/")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your prep.">
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/auth/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}