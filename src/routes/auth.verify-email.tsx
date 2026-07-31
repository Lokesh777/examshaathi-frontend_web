import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthShell } from "@/components/organisms/AuthShell";
import { OtpVerificationForm } from "@/components/organisms/OtpVerificationForm";
import { authApi } from "@/api/authApi";
import { useApiAction } from "@/hooks/useApiAction";
import { clearPendingEmail, getPendingEmail } from "@/lib/pending-email";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const search = Route.useSearch();
  const email = (search.email || getPendingEmail()).trim();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const { run, loading, fieldErrors } = useApiAction(authApi.verifyEmail, {
    onSuccess: (res) => {
      clearPendingEmail();
      const token =
        res?.accessToken ??
        (res as { token?: string })?.token ??
        null;
      if (token && res?.data) {
        // Access token stays in memory; the refresh cookie rotates it later.
        setSession(res.data, token);
        toast.success("Email verified — you're signed in!");
        navigate({ to: "/exams", replace: true });
        return;
      }
      toast.success("Email verified. You can sign in now.");
      navigate({ to: "/auth", replace: true });
    },
  });

  return (
    <AuthShell
      title="Verify your email"
      subtitle="One quick step to secure your account."
      backTo="/auth"
    >
      <OtpVerificationForm
        destination={email}
        submitLabel="Verify email"
        loading={loading}
        error={fieldErrors.otp}
        disabled={!email}
        onSubmit={(otp) => {
          if (!email) {
            toast.error("Registration email is unavailable. Please register again.");
            return;
          }
          run({ email, otp });
        }}
        onResend={async () => {
          if (!email) {
            toast.error("Registration email is unavailable. Please register again.");
            return;
          }
          await authApi.resendEmailOtp({ email }).catch(() => null);
          toast.success("A new code is on its way.");
        }}
      />
    </AuthShell>
  );
}