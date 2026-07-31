"use client";

import { AuthShell } from "@/components/organisms/AuthShell";
import { ForgotPasswordForm } from "@/components/organisms/ForgotPasswordForm";

export function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot password"
      subtitle="We'll email you a one-time code to reset it."
      backTo="/auth"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
