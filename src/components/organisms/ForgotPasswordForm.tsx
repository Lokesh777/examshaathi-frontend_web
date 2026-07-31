import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/atoms/Spinner";
import { FormField } from "@/components/molecules/FormField";
import { authApi } from "@/api/authApi";
import { useApiAction } from "@/hooks/useApiAction";
import { setPendingEmail } from "@/lib/pending-email";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const { run, loading, fieldErrors } = useApiAction(authApi.forgotPassword, {
    onSuccess: () => {
      // Neutral copy — never reveals whether the account exists.
      toast.success("If that email is registered, a reset code is on its way.");
      setPendingEmail(email);
      navigate({ to: "/auth/reset-password", search: { email } });
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run({ email });
      }}
    >
      <FormField id="email" label="Email" error={fieldErrors.email}>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </FormField>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full text-base font-semibold shadow-md"
        disabled={loading}
      >
        {loading && <Spinner className="mr-2" />}
        Send reset code
      </Button>
    </form>
  );
}