import { api } from "@/services/api/axiosInstance";
import { ENDPOINTS } from "@/services/api/endpoints";
import type {
  ContactCategory,
  ContactSource,
  ContactSubmitResult,
  FeedbackListResponse,
} from "@/types/api";

export async function submitContactForm(input: {
  name: string;
  email: string;
  category: ContactCategory;
  subject: string;
  message: string;
  source: ContactSource;
  screenshot?: File | null;
}): Promise<ContactSubmitResult> {
  const form = new FormData();
  form.append("name", input.name);
  form.append("email", input.email);
  form.append("category", input.category);
  form.append("subject", input.subject);
  form.append("message", input.message);
  form.append("source", input.source);
  if (input.screenshot) form.append("screenshot", input.screenshot);

  const { data } = await api.post<{ success: boolean; data: ContactSubmitResult }>(
    ENDPOINTS.contact.submit,
    form,
    {
      transformRequest: [
        (body, headers) => {
          if (headers && typeof (headers as { delete?: (k: string) => void }).delete === "function") {
            (headers as { delete: (k: string) => void }).delete("Content-Type");
          } else if (headers) {
            delete (headers as Record<string, unknown>)["Content-Type"];
          }
          return body;
        },
      ],
    }
  );
  return data.data;
}

export async function fetchAdminFeedback(params?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<FeedbackListResponse> {
  const { data } = await api.get<{ success: boolean; data: FeedbackListResponse }>(
    ENDPOINTS.contact.adminList,
    { params }
  );
  return data.data;
}

export async function deleteAdminFeedback(ids: string[]): Promise<{ deleted: number }> {
  const { data } = await api.post<{ success: boolean; data: { deleted: number } }>(
    ENDPOINTS.contact.adminDelete,
    { ids }
  );
  return data.data;
}
