// Exam & topic API calls.
import { api } from "@/services/api/axiosInstance";
import { ENDPOINTS } from "@/services/api/endpoints";
import { unwrap } from "@/lib/normalizers";
import type { Envelope, Exam, Topic } from "@/types/api";

export async function fetchExams(): Promise<Exam[]> {
  const { data } = await api.get<Envelope<Exam[]>>(ENDPOINTS.exams.list);
  const exams = unwrap<Exam[]>(data);
  console.log("%c[EXAMS] loaded", "color:#0ea5e9;font-weight:bold", {
    raw: data,
    count: exams.length,
  });
  return exams;
}

export async function fetchTopicsForExam(examId: string): Promise<Topic[]> {
  const { data } = await api.get<Envelope<Topic[]>>(ENDPOINTS.exams.topics(examId));
  const topics = unwrap<Topic[]>(data);
  console.log("%c[TOPICS] loaded", "color:#0ea5e9;font-weight:bold", { examId, raw: data, count: topics.length });
  return topics;
}
