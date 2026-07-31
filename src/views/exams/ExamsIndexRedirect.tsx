"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useExam } from "@/lib/exam-context";

/** `/exams` always forwards to the user's selected exam topics view. */
export function ExamsIndexRedirect() {
  const { selectedExam, isLoading } = useExam();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && selectedExam) {
      router.replace(`/exams/${selectedExam._id}/topics`);
    }
  }, [isLoading, selectedExam, router]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-xs">Opening your exam…</p>
    </div>
  );
}
