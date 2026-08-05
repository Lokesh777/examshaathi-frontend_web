"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileJson, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImportModeSelect } from "./ImportModeSelect";
import { ImportPreviewTable } from "./ImportPreviewTable";
import {
  fetchOfficialCatalog,
  importQuestions,
  validateImport,
} from "@/services/admin/adminImportService";
import type {
  AdminExamProfile,
  CatalogLinkMode,
  ImportMode,
  ImportValidateResponse,
  Topic,
} from "@/types/api";
import { Link } from "@/lib/navigation";

const needsFormTopic = (mode: ImportMode) =>
  mode === "topic-wise" || mode === "bank-manual" || mode === "bank-ai";

const parseJsonSetCode = (raw: string) => {
  try {
    const p = JSON.parse(raw);
    return {
      setCode: p.paper_code || p.setCode || p.paperCode || null,
      year: p.year || (p.exam_date && String(p.exam_date).match(/(\d{4})/)?.[1]) || null,
    };
  } catch {
    return { setCode: null, year: null };
  }
};

export function JsonImportPanel({
  examId,
  profile,
  topics,
}: {
  examId: string;
  profile: AdminExamProfile;
  topics: Topic[];
}) {
  const [raw, setRaw] = useState("");
  const [mode, setMode] = useState<ImportMode>("official-paper");
  const [useAi, setUseAi] = useState(false);
  const [autoAssignTopics, setAutoAssignTopics] = useState(true);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("2024");
  const [bankTopicId, setBankTopicId] = useState(topics[0]?._id || "");
  const [preview, setPreview] = useState<ImportValidateResponse | null>(null);
  const [lastQuizId, setLastQuizId] = useState<string | null>(null);
  const [lastCatalogId, setLastCatalogId] = useState<string | null>(null);
  const [catalogLinkMode, setCatalogLinkMode] = useState<CatalogLinkMode>("auto");
  const [catalogId, setCatalogId] = useState("");
  const [questionPdfUrl, setQuestionPdfUrl] = useState("");
  const [answerKeyPdfUrl, setAnswerKeyPdfUrl] = useState("");
  const qc = useQueryClient();

  const catalogQ = useQuery({
    queryKey: ["admin-catalog", examId],
    queryFn: () => fetchOfficialCatalog(examId),
    enabled: mode === "official-paper",
  });

  const jsonMeta = useMemo(() => parseJsonSetCode(raw), [raw]);

  useEffect(() => {
    if (mode !== "official-paper" || catalogLinkMode !== "existing" || !catalogId) return;
    const item = catalogQ.data?.find((c) => c.catalogId === catalogId);
    if (!item) return;
    if (item.questionPdfUrl) setQuestionPdfUrl(item.questionPdfUrl);
    if (item.answerKeyPdfUrl) setAnswerKeyPdfUrl(item.answerKeyPdfUrl);
    if (!title && item.title) setTitle(item.title);
    if (item.year) setYear(String(item.year));
  }, [catalogId, catalogQ.data, catalogLinkMode, mode, title]);

  const formTopic = needsFormTopic(mode);

  const metadata = {
    ...(formTopic && bankTopicId ? { topicId: bankTopicId, defaultTopicId: bankTopicId } : {}),
    title: title || undefined,
    year: year ? Number(year) : jsonMeta.year ? Number(jsonMeta.year) : undefined,
    setCode: jsonMeta.setCode || undefined,
    createQuiz: mode === "topic-wise",
    catalogLinkMode: mode === "official-paper" ? catalogLinkMode : undefined,
    catalogId: catalogLinkMode === "existing" ? catalogId || undefined : undefined,
    questionPdfUrl: catalogLinkMode === "new" ? questionPdfUrl || undefined : undefined,
    answerKeyPdfUrl: catalogLinkMode === "new" ? answerKeyPdfUrl || undefined : undefined,
  };

  const validateM = useMutation({
    mutationFn: () =>
      validateImport(examId, {
        raw,
        mode,
        useAiNormalize: useAi,
        autoAssignTopics,
        metadata,
      }),
    onSuccess: (data) => {
      setPreview(data);
      const extra =
        data.topicsAutoAssigned ? " (topics assigned by AI)" : "";
      if (data.validCount === data.totalCount) {
        toast.success(`Validated: ${data.validCount}/${data.totalCount} OK${extra}`);
      } else {
        toast.warning(`Validated: ${data.validCount}/${data.totalCount} OK — see errors below`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const importM = useMutation({
    mutationFn: () =>
      importQuestions(examId, {
        mode,
        raw,
        useAiNormalize: useAi,
        autoAssignTopics,
        metadata,
      }),
    onSuccess: (data) => {
      setLastQuizId(data.quizId);
      setLastCatalogId(data.catalogId ?? null);
      qc.invalidateQueries({ queryKey: ["official-papers", examId] });
      qc.invalidateQueries({ queryKey: ["admin-catalog", examId] });
      qc.invalidateQueries({ queryKey: ["real-papers", examId] });
      const catalogMsg = data.catalogId
        ? data.catalogCreated
          ? " · new catalogue entry created"
          : " · linked to catalogue"
        : "";
      toast.success(`Imported ${data.inserted} questions${catalogMsg}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result || ""));
    reader.readAsText(file);
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FileJson className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">JSON / Text Import</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        {profile.optionCount} options · {profile.defaultPattern} pattern · {profile.examSlug}
      </p>

      <ImportModeSelect value={mode} onChange={setMode} />

      {(mode === "official-paper" || mode === "real-paper") && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Quiz title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Rajasthan CET (Senior Secondary Level) 2024"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} type="number" />
          </div>
        </div>
      )}

      {mode === "official-paper" && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs font-semibold text-foreground">Official paper catalogue</p>
          <div className="space-y-1.5">
            <Label>Link mode</Label>
            <Select
              value={catalogLinkMode}
              onValueChange={(v) => setCatalogLinkMode(v as CatalogLinkMode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  Auto-match by paper_code / set (e.g. Q13 → existing catalogue)
                </SelectItem>
                <SelectItem value="existing">Link to existing catalogue entry</SelectItem>
                <SelectItem value="new">Create new catalogue entry (with PDF links)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {catalogLinkMode === "existing" && (
            <div className="space-y-1.5">
              <Label>Catalogue entry</Label>
              <Select value={catalogId} onValueChange={setCatalogId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Q13, Q14, …" />
                </SelectTrigger>
                <SelectContent>
                  {(catalogQ.data ?? []).map((c) => (
                    <SelectItem key={c.catalogId} value={c.catalogId}>
                      {c.year} · Set {c.setCode || "—"} · {c.status}
                      {c.title ? ` — ${c.title.slice(0, 40)}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {catalogQ.isLoading && (
                <p className="text-[10px] text-muted-foreground">Loading catalogue…</p>
              )}
            </div>
          )}

          {catalogLinkMode === "new" && (
            <div className="grid gap-3 sm:grid-cols-1">
              <div className="space-y-1.5">
                <Label>Question paper PDF URL</Label>
                <Input
                  value={questionPdfUrl}
                  onChange={(e) => setQuestionPdfUrl(e.target.value)}
                  placeholder="https://rsmssb.rajasthan.gov.in/download_file?downloadFileId=2612"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Answer key PDF URL</Label>
                <Input
                  value={answerKeyPdfUrl}
                  onChange={(e) => setAnswerKeyPdfUrl(e.target.value)}
                  placeholder="https://rsmssb.rajasthan.gov.in/download_file?downloadFileId=2609"
                />
              </div>
            </div>
          )}

          {catalogLinkMode === "auto" && jsonMeta.setCode && (
            <p className="text-[11px] text-muted-foreground">
              JSON set code: <strong>{jsonMeta.setCode}</strong>
              {jsonMeta.year ? ` · year ${jsonMeta.year}` : ""} — will match catalogue on import
            </p>
          )}
        </div>
      )}

      {formTopic && (
        <div className="space-y-1.5">
          <Label>Topic for all questions in this import</Label>
          <Select value={bankTopicId} onValueChange={setBankTopicId}>
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t, i) => (
                <SelectItem key={t._id} value={t._id}>
                  {i + 1}. {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Used for topic-wise / bank imports. Per-question topic in JSON still overrides this.
          </p>
        </div>
      )}

      {(mode === "official-paper" || mode === "real-paper") && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Supported paper formats</p>
          <p>
            <strong>Standard:</strong> <code className="text-[10px]">questionText</code>,{" "}
            <code className="text-[10px]">options</code> array, <code className="text-[10px]">correctAnswer</code>
          </p>
          <p>
            <strong>CET export:</strong> <code className="text-[10px]">question</code>,{" "}
            <code className="text-[10px]">options: {"{A,B,C,D}"}</code>,{" "}
            <code className="text-[10px]">correct_answer</code>, <code className="text-[10px]">paper_code</code>,{" "}
            <code className="text-[10px]">exam_name</code>
          </p>
          <p>
            Topics: per-question <code className="text-[10px]">topicName</code> /{" "}
            <code className="text-[10px]">topicNumber</code>, root{" "}
            <code className="text-[10px]">defaultTopicName</code>, or enable{" "}
            <strong>AI assign topics</strong> below.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>JSON or raw text</Label>
        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={10}
          placeholder={`{
  "paper_code": "Q13",
  "exam_name": "CET (12th Level) 2024",
  "exam_date": "22-10-2024",
  "questions": [{
    "q_no": 1,
    "question": "...",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "correct_answer": "D",
    "topicName": "कम्प्यूटर"
  }]
}`}
          className="font-mono text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={useAi} onCheckedChange={(v) => setUseAi(Boolean(v))} />
          AI normalize (raw text only)
        </label>
        {(mode === "official-paper" || mode === "real-paper") && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={autoAssignTopics}
              onCheckedChange={(v) => setAutoAssignTopics(Boolean(v))}
            />
            AI assign topics (when JSON has no topicName)
          </label>
        )}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
          <Upload className="h-4 w-4" />
          Upload .json
          <input type="file" accept=".json,.txt" className="hidden" onChange={onFile} />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => validateM.mutate()} disabled={!raw.trim() || validateM.isPending}>
          {validateM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Validate
        </Button>
        <Button onClick={() => importM.mutate()} disabled={!raw.trim() || importM.isPending}>
          {importM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Import
        </Button>
      </div>

      {preview && (
        <>
          {preview.detectedFormat === "cet-paper-export" && (
            <p className="text-xs text-muted-foreground">
              Detected CET paper export format
              {preview.topicsAutoAssigned ? " · topics assigned by AI" : ""}
            </p>
          )}
          {preview.catalogMatch && (
            <p className="text-xs text-success">
              Will update catalogue: Set {preview.catalogMatch.setCode} ({preview.catalogMatch.year})
              {preview.catalogMatch.hasQuiz ? " — replaces existing quiz" : ""}
            </p>
          )}
          {mode === "official-paper" &&
            catalogLinkMode === "auto" &&
            !preview.catalogMatch &&
            jsonMeta.setCode && (
              <p className="text-xs text-warning-foreground">
                No catalogue match for Set {jsonMeta.setCode}. Use &quot;Create new&quot; with PDF
                URLs or pick an existing entry.
              </p>
            )}
          <ImportPreviewTable
            rows={preview.preview}
            validCount={preview.validCount}
            totalCount={preview.totalCount}
          />
        </>
      )}

      {(lastQuizId || lastCatalogId) && (
        <p className="text-sm space-y-1">
          {lastQuizId && (
            <span>
              Quiz created —{" "}
              <Link
                to="/exams/$examId/quiz/$quizId"
                params={{ examId, quizId: lastQuizId }}
                className="font-semibold text-primary hover:underline"
              >
                Play now
              </Link>
            </span>
          )}
          {lastCatalogId && (
            <span className="block text-xs text-muted-foreground">
              Catalogue updated — visible on{" "}
              <Link
                to="/exams/$examId/old-papers"
                params={{ examId }}
                className="font-semibold text-primary hover:underline"
              >
                Official Papers
              </Link>
            </span>
          )}
        </p>
      )}
    </Card>
  );
}
