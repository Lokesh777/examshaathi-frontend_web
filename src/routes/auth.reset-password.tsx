import { createFileRoute } from "@tanstack/react-router";
import { getPendingEmail } from "@/lib/pending-email";
import { AuthShell } from "@/components/organisms/AuthShell";
import { ResetPasswordForm } from "@/components/organisms/ResetPasswordForm";

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { email } = Route.useSearch();
  const resolved = email || getPendingEmail();
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Enter the code we emailed you and choose a new password."
      backTo="/auth/forgot-password"
    >
      <ResetPasswordForm email={resolved} />
    </AuthShell>
  );
}