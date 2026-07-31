import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/atoms/Spinner";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { FormField } from "@/components/molecules/FormField";
import { PasswordStrengthHint } from "@/components/molecules/PasswordStrengthHint";
import { useApiAction } from "@/hooks/useApiAction";
import { useAuth } from "@/hooks/useAuth";
import { isStrongEnough } from "@/utils/validators";
import { toast } from "sonner";

/** POST /user/update-password — old password + new password, no OTP. */
export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const { changePassword } = useAuth();

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const { run, loading, fieldErrors } = useApiAction(changePassword, {
    onSuccess: () => {
      toast.success("Password updated.");
      reset();
    },
  });

  const mismatch = confirm.length > 0 && confirm !== next;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (mismatch) return toast.error("Passwords do not match.");
        if (!isStrongEnough(next)) return toast.error("Please choose a stronger password.");
        run({ password: current, newPassword: next });
      }}
    >
      <FormField id="current-password" label="Current password" error={fieldErrors.password}>
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