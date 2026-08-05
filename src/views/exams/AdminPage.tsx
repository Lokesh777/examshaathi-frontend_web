"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Shield, Loader2 } from "lucide-react";
import { useNavigate } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { fetchAdminProfile } from "@/services/admin/adminImportService";
import { fetchTopicsForExam } from "@/services/exams/examService";
import { JsonImportPanel } from "@/components/admin/JsonImportPanel";
import { AiGeneratePanel } from "@/components/admin/AiGeneratePanel";
import { ManualQuizForm } from "@/components/admin/ManualQuizForm";

export function AdminPage() {
  const { examId } = useParams() as { examId: string };
  const { user, isReady } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isReady && user && !isAdmin) {
      navigate({ to: "/exams/$examId/topics", params: { examId }, replace: true });
    }
  }, [isReady, user, isAdmin, examId, navigate]);

  const profileQ = useQuery({
    queryKey: ["admin-profile", examId],
    queryFn: () => fetchAdminProfile(examId),
    enabled: isAdmin,
  });

  const topicsQ = useQuery({
    queryKey: ["topics", examId],
    queryFn: () => fetchTopicsForExam(examId),
    enabled: isAdmin,
  });

  if (!isReady || !isAdmin) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (profileQ.isLoading || topicsQ.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (profileQ.isError || !profileQ.data) {
    const msg =
      profileQ.error instanceof Error
        ? profileQ.error.message
        : "Could not reach the server.";
    return (
      <p className="text-center text-sm text-destructive">
        Failed to load admin profile. {msg}
      </p>
    );
  }

  const topics = topicsQ.data || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Import, generate, and create quizzes for {profileQ.data.examName}
          </p>
        </div>
      </div>

      <JsonImportPanel examId={examId} profile={profileQ.data} topics={topics} />
      <AiGeneratePanel examId={examId} profile={profileQ.data} topics={topics} />
      <ManualQuizForm examId={examId} profile={profileQ.data} topics={topics} />
    </div>
  );
}
