import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/atoms/Spinner";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { FormField } from "@/components/molecules/FormField";
import { authApi, type AuthSuccess } from "@/api/authApi";
import { useApiAction } from "@/hooks/useApiAction";
import { useAuth } from "@/lib/auth-store";
import { isEmailUnverifiedError } from "@/utils/formatError";
import { setPendingEmail } from "@/lib/pending-email";
import { toast } from "sonner";

export function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const { run, loading, fieldErrors } = useApiAction(authApi.login, {
    onSuccess: (res) => {
      if (res && "otpRequired" in res && res.otpRequired) {
        toast.success(res.message ?? "OTP sent to your email");
        setPendingEmail(form.email);
        navigate({
          to: "/auth/login-otp",
          search: { email: form.email, tempSessionId: res.tempSessionId },
        });
        return;
      }
      const ok = res as AuthSuccess;
      setSession(ok.data, ok.accessToken);
      toast.success("Welcome back!");
      navigate({ to: "/exams", replace: true });
    },
    onError: (error) => {
      if (isEmailUnverifiedError(error)) {
        toast.info("Please verify your email to continue.");
        setPendingEmail(form.email);
        navigate({ to: "/auth/verify-email", search: { email: form.email } });
        return true;
      }
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(form);
      }}
    >
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

      <FormField id="password" label="Password" error={fieldErrors.password}>
        <PasswordInput
          id="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
      </FormField>

      <div className="flex justify-end">
        <Link
          to="/auth/forgot-password"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full text-base font-semibold shadow-md"
        disabled={loading}
      >
        {loading && <Spinner className="mr-2" />}
        Sign in
      </Button>
    </form>
  );
}