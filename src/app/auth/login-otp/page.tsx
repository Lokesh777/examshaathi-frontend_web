import { Suspense } from "react";
import { LoginOtpPage } from "@/views/auth/LoginOtpPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginOtpPage />
    </Suspense>
  );
}
