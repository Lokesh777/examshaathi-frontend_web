import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { api, unwrap, type Exam } from "./api";
import { useAuth } from "./auth-store";

const KEY = "examsaathi.selectedExamId";

type ExamState = {
  exams: Exam[];
  selectedExam: Exam | null;
  isLoading: boolean;
  isError: boolean;
  select: (id: string) => void;
  refetch: () => void;
};

const Ctx = createContext<ExamState | null>(null);

export function ExamProvider({ children }: { children: ReactNode }) {
  // Only fetch once auth boot finished AND we actually hold a bearer token,
  // otherwise the request goes out without Authorization and 401s.
  const { accessToken, isReady } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => unwrap<Exam[]>(await api.exams()),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    enabled: isReady && Boolean(accessToken),
  });
  const exams = useMemo(() => data ?? [], [data]);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(KEY);
  });

  // Reconcile selection when the exam list changes. Depend on a stable
  // key derived from ids so a new array reference with the same contents
  // does not re-trigger the effect (and prevents render↔effect loops).
  const examIdsKey = useMemo(() => exams.map((e) => e._id).join("|"), [exams]);

  useEffect(() => {
    if (!exams.length) return;
    if (exams.length === 1) {
      const only = exams[0]._id;
      setSelectedId((prev) => {
        if (prev === only) return prev;
        try { localStorage.setItem(KEY, only); } catch { /* ignore */ }
        return only;
      });
      return;
    }
    setSelectedId((prev) => {
      if (prev && !exams.some((e) => e._id === prev)) {
        try { localStorage.removeItem(KEY); } catch { /* ignore */ }
        return null;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examIdsKey]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
  }, []);

  const stableRefetch = useCallback(() => { void refetch(); }, [refetch]);

  const selectedExam = useMemo(
    () => exams.find((e) => e._id === selectedId) ?? null,
    [exams, selectedId],
  );

  const value = useMemo(
    () => ({
      exams,
      selectedExam,
      // While auth boot is pending the query is disabled — keep showing loading
      // instead of an empty list.
      isLoading: isLoading || !isReady || (isReady && !accessToken && !isError),
      isError,
      select,
      refetch: stableRefetch,
    }),
    [exams, selectedExam, isLoading, isError, isReady, accessToken, select, stableRefetch],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExam() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useExam must be used within ExamProvider");
  return ctx;
}