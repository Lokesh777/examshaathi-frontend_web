"use client";

import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/organisms/AuthShell";
import { OtpVerificationForm } from "@/components/organisms/OtpVerificationForm";
import { useApiAction } from "@/hooks/useApiAction";
import { clearPendingEmail, getPendingEmail } from "@/lib/pending-email";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/navigation";

export function VerifyEmailPage() {
  const search = useSearchParams();
  const email = (search.get("email") || getPendingEmail()).trim();
  const navigate = useNavigate();
  const { verifyEmailOtp, resendEmailOtp } = useAuth();

  const { run, loading, fieldErrors } = useApiAction(verifyEmailOtp, {
    onSuccess: (res) => {
      clearPendingEmail();
      if (res?.accessToken && res.data) {
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
          await resendEmailOtp({ email }).catch(() => null);
          toast.success("A new code is on its way.");
        }}
      />
    </AuthShell>
  );
}
