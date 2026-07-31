import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/atoms/Spinner";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { FormField } from "@/components/molecules/FormField";
import { PasswordStrengthHint } from "@/components/molecules/PasswordStrengthHint";
import { authApi } from "@/api/authApi";
import { useApiAction } from "@/hooks/useApiAction";
import { isStrongEnough } from "@/utils/validators";
import { setPendingEmail } from "@/lib/pending-email";
import { toast } from "sonner";

export function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const submittedEmailRef = useRef("");
  const navigate = useNavigate();

  const { run, loading, fieldErrors } = useApiAction(authApi.register, {
    onSuccess: () => {
      toast.success("Account created — verify your email to continue");
      const email = submittedEmailRef.current;
      navigate({ to: "/auth/verify-email", search: { email } });
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isStrongEnough(form.password)) {
          toast.error("Please choose a stronger password.");
          return;
        }
        const submittedForm = { ...form, email: form.email.trim() };
        submittedEmailRef.current = submittedForm.email;
        setPendingEmail(submittedForm.email);
        run(submittedForm);
      }}
    >
      <FormField id="name" label="Name" error={fieldErrors.name}>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Lokesh Kumar"
          autoComplete="name"
          required
        />
      </FormField>

      <FormField id="email" label="Email" error={fieldErrors.email}>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </FormField>

      <FormField
        id="password"
        label="Password"
        error={fieldErrors.password}
        hint={<PasswordStrengthHint value={form.password} />}
      >
        <PasswordInput
          id="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
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
        Create account
      </Button>
    </form>
  );
}