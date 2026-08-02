import { api } from "@/services/api/axiosInstance";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { AiCapabilities, OfficialPaper, SyncJobStatus } from "@/types/api";

export async function fetchOfficialPapers(examId: string): Promise<OfficialPaper[]> {
  const { data } = await api.get<{ success: boolean; data: OfficialPaper[] }>(
    ENDPOINTS.officialPapers.list(examId),
  );
  return data.data ?? [];
}

export async function startOfficialPaperLinkSync(examId: string): Promise<{
  jobId: string;
  alreadyRunning?: boolean;
  phase?: string;
}> {
  const { data } = await api.post<{
    success: boolean;
    jobId: string;
    alreadyRunning?: boolean;
    phase?: string;
  }>(ENDPOINTS.officialPapers.syncLinks(examId));
  return { jobId: data.jobId, alreadyRunning: data.alreadyRunning, phase: data.phase };
}

export async function startOfficialPaperExtractSync(
  examId: string,
  options?: {
    catalogId?: string;
    extractAll?: boolean;
    provider?: string;
    publishOnly?: boolean;
    forceReExtract?: boolean;
    publishQuiz?: boolean;
    fillMissing?: boolean;
  },
): Promise<{
  jobId: string;
  alreadyRunning?: boolean;
  phase?: string;
}> {
  const body = options
    ? {
        catalogId: options.catalogId,
        extractAll: options.extractAll,
        provider: options.provider,
        publishOnly: options.publishOnly,
        forceReExtract: options.forceReExtract,
        publishQuiz: options.publishQuiz,
        fillMissing: options.fillMissing,
      }
    : undefined;
  const { data } = await api.post<{
    success: boolean;
    jobId: string;
    alreadyRunning?: boolean;
    phase?: string;
  }>(ENDPOINTS.officialPapers.syncExtract(examId), body);
  return { jobId: data.jobId, alreadyRunning: data.alreadyRunning, phase: data.phase };
}

export async function fetchAiCapabilities(examId: string): Promise<AiCapabilities> {
  const { data } = await api.get<{ success: boolean; capabilities: AiCapabilities }>(
    ENDPOINTS.officialPapers.syncCapabilities(examId),
  );
  return data.capabilities;
}

/** Legacy — same as link sync */
export async function startOfficialPaperSync(examId: string) {
  const { data } = await api.post<{
    success: boolean;
    jobId: string;
    alreadyRunning?: boolean;
  }>(ENDPOINTS.officialPapers.sync(examId));
  return { jobId: data.jobId, alreadyRunning: data.alreadyRunning };
}

export async function extractImageQuestions(
  catalogId: string,
  qNos?: number[],
): Promise<{ extracted: number; merged: number }> {
  const { data } = await api.post<{
    success: boolean;
    extracted: number;
    merged: number;
  }>(ENDPOINTS.officialPapers.extractImageQuestions(catalogId), {
    qNos,
  });
  return { extracted: data.extracted, merged: data.merged };
}

export async function fetchSyncJobStatus(jobId: string): Promise<SyncJobStatus> {
  const { data } = await api.get<{ success: boolean; job: SyncJobStatus }>(
    ENDPOINTS.officialPapers.syncStatus(jobId),
  );
  return data.job;
}
