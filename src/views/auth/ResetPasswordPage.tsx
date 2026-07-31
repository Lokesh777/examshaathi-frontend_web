"use client";

import { useSearchParams } from "next/navigation";
import { getPendingEmail } from "@/lib/pending-email";
import { AuthShell } from "@/components/organisms/AuthShell";
import { ResetPasswordForm } from "@/components/organisms/ResetPasswordForm";

export function ResetPasswordPage() {
  const search = useSearchParams();
  const resolved = search.get("email") || getPendingEmail();
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Enter the code we emailed you and choose a new password."
      backTo="/auth/forgot-password"
    >
      <ResetPasswordForm email={resolved} />
    </AuthShell>
  );
}
