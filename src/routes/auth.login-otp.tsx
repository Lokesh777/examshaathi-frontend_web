import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthShell } from "@/components/organisms/AuthShell";
import { OtpVerificationForm } from "@/components/organisms/OtpVerificationForm";
import { authApi } from "@/api/authApi";
import { useApiAction } from "@/hooks/useApiAction";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/auth/login-otp")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
    tempSessionId: typeof search.tempSessionId === "string" ? search.tempSessionId : "",
  }),
  component: LoginOtpPage,
});

function LoginOtpPage() {
  const { email, tempSessionId } = Route.useSearch();
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const { run, loading, fieldErrors } = useApiAction(authApi.verifyLoginOtp, {
    onSuccess: (res) => {
      if (!res) return;
      setSession(res.data, res.accessToken);
      toast.success("Welcome back!");
      navigate({ to: "/exams", replace: true });
    },
  });

  return (
    <AuthShell
      title="Confirm it's you"
      subtitle="Two-step verification keeps your progress safe."
      backTo="/auth"
    >
      <OtpVerificationForm
        destination={email}
        submitLabel="Verify & sign in"
        loading={loading}
        error={fieldErrors.otp}
        disabled={!tempSessionId}
        onSubmit={(otp) => run({ tempSessionId, otp })}
      />
      {!tempSessionId && (
        <p className="mt-4 text-center text-xs text-destructive">
          This verification session expired. Please sign in again.
        </p>
      )}
    </AuthShell>
  );
}