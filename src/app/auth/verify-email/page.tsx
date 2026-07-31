import { Suspense } from "react";
import { VerifyEmailPage } from "@/views/auth/VerifyEmailPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPage />
    </Suspense>
  );
}
