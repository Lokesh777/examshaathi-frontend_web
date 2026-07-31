import { useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/atoms/Spinner";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { FormField } from "@/components/molecules/FormField";
import { PasswordStrengthHint } from "@/components/molecules/PasswordStrengthHint";
import { OtpInputGroup } from "@/components/molecules/OtpInputGroup";
import { useAuth } from "@/hooks/useAuth";
import { useApiAction } from "@/hooks/useApiAction";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import { isStrongEnough } from "@/utils/validators";
import { OTP_LENGTH } from "@/constants/auth";
import { toast } from "sonner";

export function ResetPasswordForm({ email }: { email: string }) {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();
  const { remaining, canResend, restart } = useOtpTimer();
  const { resetPassword, requestPasswordReset } = useAuth();

  const { run, loading, fieldErrors } = useApiAction(resetPassword, {
    onSuccess: (res) => {
      if (res?.accessToken && res.data) {
        toast.success("Password updated — you're signed in!");
        navigate({ to: "/exams", replace: true });
        return;
      }
      toast.success("Password updated. Please sign in again.");
      navigate({ to: "/auth", replace: true });
    },
  });

  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (mismatch) return toast.error("Passwords do not match.");
        if (!isStrongEnough(password)) return toast.error("Please choose a stronger password.");
        run({ email, otp, newPassword: password });
      }}
    >
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          We sent a {OTP_LENGTH}-digit code to{" "}
          <span className="font-semibold text-foreground">{email}</span>.
        </p>
        <OtpInputGroup value={otp} onChange={setOtp} invalid={Boolean(fieldErrors.otp)} disabled={loading} />
        {fieldErrors.otp && (
          <p className="text-center text-xs text-destructive">{fieldErrors.otp}</p>
        )}
      </div>

      <FormField
        id="new-password"
        label="New password"
        error={fieldErrors.newPassword}
        hint={<PasswordStrengthHint value={password} />}
      >
        <PasswordInput
          id="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          required
        />
      </FormField>

      <FormField
        id="confirm-password"
        label="Confirm new password"
        error={mismatch ? "Passwords do not match" : undefined}
      >
        <PasswordInput
          id="confirm-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          required
        />
      </FormField>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full text-base font-semibold shadow-md"
        disabled={loading || otp.length < OTP_LENGTH}
      >
        {loading && <Spinner className="mr-2" />}
        Reset password
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        {canResend ? (
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={async () => {
              await requestPasswordReset({ email }).catch(() => null);
              toast.success("A new code is on its way.");
              setOtp("");
              restart();
            }}
          >
            Resend code
          </button>
        ) : (
          <>Resend code in {remaining}s</>
        )}
      </div>
    </form>
  );
}