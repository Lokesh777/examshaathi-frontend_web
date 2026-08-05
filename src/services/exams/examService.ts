// Exam & topic API calls.
import { api } from "@/services/api/axiosInstance";
import { ENDPOINTS } from "@/services/api/endpoints";
import { unwrap } from "@/lib/normalizers";
import type { Envelope, Exam, Topic } from "@/types/api";

export async function fetchExams(): Promise<Exam[]> {
  const { data } = await api.get<Envelope<Exam[]>>(ENDPOINTS.exams.list);
  return unwrap<Exam[]>(data);
}

export async function fetchTopicsForExam(examId: string): Promise<Topic[]> {
  const { data } = await api.get<Envelope<Topic[]>>(ENDPOINTS.exams.topics(examId));
  return unwrap<Topic[]>(data);
}
