"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/navigation";

/** Redirects signed-in users away from auth screens. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isReady && user) navigate({ to: "/exams", replace: true });
  }, [isReady, user, navigate]);

  return children;
}
