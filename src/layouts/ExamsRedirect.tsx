"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useExam } from "@/lib/exam-context";

/** Redirects bare `/exams` to the selected exam's topics page. */
export function ExamsRedirect({ children }: { children: React.ReactNode }) {
  const { selectedExam } = useExam();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/exams" && selectedExam) {
      router.replace(`/exams/${selectedExam._id}/topics`);
    }
  }, [pathname, selectedExam, router]);

  return children;
}
