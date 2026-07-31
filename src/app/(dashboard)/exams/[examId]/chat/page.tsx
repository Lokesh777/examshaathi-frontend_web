import { Suspense } from "react";
import { ChatTabPage } from "@/views/exams/ChatTabPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ChatTabPage />
    </Suspense>
  );
}
