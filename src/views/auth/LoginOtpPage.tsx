"use client";

import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/organisms/AuthShell";
import { OtpVerificationForm } from "@/components/organisms/OtpVerificationForm";
import { authApi } from "@/api/authApi";
import { useApiAction } from "@/hooks/useApiAction";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/navigation";

export function LoginOtpPage() {
  const search = useSearchParams();
  const email = search.get("email") ?? "";
  const tempSessionId = search.get("tempSessionId") ?? "";
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
