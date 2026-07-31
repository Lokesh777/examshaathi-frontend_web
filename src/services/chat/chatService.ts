// AI tutor chat API calls.
import { api } from "@/services/api/axiosInstance";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ChatMessage, ChatSendResponse } from "@/types/api";

export async function fetchTopicChatHistory(
  examId: string,
  topicId: string,
): Promise<ChatMessage[]> {
  const { data } = await api.get<{ success: boolean; history: ChatMessage[] }>(
    ENDPOINTS.chat.topicChat(examId, topicId),
  );
  return data.history ?? [];
}

export async function sendTopicChatMessage(
  examId: string,
  topicId: string,
  message: string,
): Promise<ChatSendResponse> {
  const { data } = await api.post<ChatSendResponse>(
    ENDPOINTS.chat.topicChat(examId, topicId),
    { message },
  );
  return data;
}