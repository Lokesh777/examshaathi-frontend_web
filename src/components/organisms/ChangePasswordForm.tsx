import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/atoms/Spinner";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { FormField } from "@/components/molecules/FormField";
import { PasswordStrengthHint } from "@/components/molecules/PasswordStrengthHint";
import { OtpInputGroup } from "@/components/molecules/OtpInputGroup";
import { authApi } from "@/api/authApi";
import { useApiAction } from "@/hooks/useApiAction";
import { useAuth } from "@/lib/auth-store";
import { isStrongEnough } from "@/utils/validators";
import { OTP_LENGTH } from "@/constants/auth";
import { toast } from "sonner";

/**
 * Two-step, step-up protected change password:
 * 1. current + new password  -> backend emails an OTP
 * 2. same payload + otp      -> password changes, all other sessions die
 */
export function ChangePasswordForm() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const { clear } = useAuth();

  const reset = () => {
    setStep("form");
    setCurrent("");
    setNext("");
    setConfirm("");
    setOtp("");
  };

  const { run, loading, fieldErrors } = useApiAction(authApi.changePassword, {
    onSuccess: (res) => {
      if (res?.otpRequired) {
        setStep("otp");
        toast.success("We sent a verification code to your email.");
        return;
      }
      toast.success("Password changed. Signing you out of other devices.");
      reset();
      void clear().then(() => window.location.assign("/auth"));
    },
  });

  const mismatch = confirm.length > 0 && confirm !== next;

  if (step === "otp") {
    return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          run({ currentPassword: current, newPassword: next, otp });
        }}
      >
        <p className="text-sm text-muted-foreground">
          Enter the {OTP_LENGTH}-digit code we emailed you to confirm this change.
        </p>
        <OtpInputGroup value={otp} onChange={setOtp} invalid={Boolean(fieldErrors.otp)} disabled={loading} />
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={reset}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading || otp.length < OTP_LENGTH}>
            {loading && <Spinner className="mr-2" />}
            Confirm change
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (mismatch) return toast.error("Passwords do not match.");
        if (!isStrongEnough(next)) return toast.error("Please choose a stronger password.");
        run({ currentPassword: current, newPassword: next });
      }}
    >
      <FormField id="current-password" label="Current password" error={fieldErrors.currentPassword}>
        <PasswordInput
          id="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Enter your current password"
          autoComplete="current-password"
          required
        />
      </FormField>

      <FormField
        id="next-password"
        label="New password"
        error={fieldErrors.newPassword}
        hint={<PasswordStrengthHint value={next} />}
      >
        <PasswordInput
          id="next-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          required
        />
      </FormField>

      <FormField
        id="confirm-new-password"
        label="Confirm new password"
        error={mismatch ? "Passwords do not match" : undefined}
      >
        <PasswordInput
          id="confirm-new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          required
        />
      </FormField>

      <Button type="submit" className="h-11 w-full font-semibold" disabled={loading}>
        {loading && <Spinner className="mr-2" />}
        Change password
      </Button>
    </form>
  );
}