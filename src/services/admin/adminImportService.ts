import { api } from "@/services/api/axiosInstance";
import { ENDPOINTS } from "@/services/api/endpoints";
import type {
  AdminExamProfile,
  GenerateResult,
  ImportMode,
  ImportResult,
  ImportValidateResponse,
  OfficialPaperCatalogItem,
  QuestionType,
} from "@/types/api";

export const fetchAdminProfile = async (examId: string) => {
  const { data } = await api.get<{ success: boolean; data: AdminExamProfile }>(
    ENDPOINTS.admin.profile(examId)
  );
  return data.data;
};

export const fetchOfficialCatalog = async (examId: string) => {
  const { data } = await api.get<{ success: boolean; data: OfficialPaperCatalogItem[] }>(
    ENDPOINTS.admin.catalog(examId)
  );
  return data.data;
};

export const validateImport = async (
  examId: string,
  body: {
    raw: string;
    mode?: ImportMode;
    useAiNormalize?: boolean;
    autoAssignTopics?: boolean;
    metadata?: Record<string, unknown>;
  }
) => {
  const { data } = await api.post<{ success: boolean; data: ImportValidateResponse }>(
    ENDPOINTS.admin.validateImport(examId),
    body
  );
  return data.data;
};

export const importQuestions = async (
  examId: string,
  body: {
    mode: ImportMode;
    raw?: string;
    questions?: unknown[];
    useAiNormalize?: boolean;
    autoAssignTopics?: boolean;
    metadata?: Record<string, unknown>;
  }
) => {
  const { data } = await api.post<{ success: boolean; data: ImportResult }>(
    ENDPOINTS.admin.import(examId),
    body
  );
  return data.data;
};

export const generateQuestions = async (
  examId: string,
  body: { topicId: string; count: number; questionType: QuestionType | "auto" }
) => {
  const { data } = await api.post<{ success: boolean; data: GenerateResult }>(
    ENDPOINTS.admin.generate(examId),
    body
  );
  return data.data;
};
