"use client";

import { Link } from "@/lib/navigation";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Archive,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Play,
  RefreshCw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchAiCapabilities,
  fetchOfficialPapers,
  fetchSyncJobStatus,
  extractImageQuestions,
  startOfficialPaperExtractSync,
  startOfficialPaperLinkSync,
} from "@/services/officialPapers/officialPaperService";
import type {
  AiCapabilities,
  OfficialPaper,
  ProviderAttempt,
  SyncJobStatus,
  SyncStageLog,
} from "@/types/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExam } from "@/lib/exam-context";
import { useAuth } from "@/hooks/useAuth";

type SyncPhase = "fetch_links" | "extract";

export function OldPapersPage() {
  const { examId } = useParams() as { examId: string };
  const { selectedExam } = useExam();
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = user?.role === "admin";
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<SyncPhase | null>(null);

  const listQ = useQuery({
    queryKey: ["official-papers", examId],
    queryFn: () => fetchOfficialPapers(examId),
    refetchOnWindowFocus: false,
  });

  /** Poll only GET /official-papers/admin/sync/:jobId — not the full papers list */
  const syncJobQ = useQuery({
    queryKey: ["official-paper-sync-job", activeJobId],
    queryFn: () => fetchSyncJobStatus(activeJobId!),
    enabled: Boolean(activeJobId),
    refetchInterval: (query) =>
      query.state.data?.status === "running" ? 2000 : false,
    refetchOnWindowFocus: false,
  });

  const syncJob = syncJobQ.data ?? null;

  const capabilitiesQ = useQuery({
    queryKey: ["official-papers-capabilities", examId],
    queryFn: () => fetchAiCapabilities(examId),
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const linkSyncM = useMutation({
    mutationFn: () => startOfficialPaperLinkSync(examId),
    onSuccess: (res) => {
      setActiveJobId(res.jobId);
      setActivePhase("fetch_links");
      if (res.alreadyRunning) toast.info("Link sync already running…");
      else toast.success("Phase 1 started — fetching PDF links from RSMSSB");
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message ?? "Link sync failed to start";
      toast.error(msg);
    },
  });

  const extractSyncM = useMutation({
    mutationFn: (options?: {
      catalogId?: string;
      extractAll?: boolean;
      provider?: string;
      publishOnly?: boolean;
      fillMissing?: boolean;
    }) => startOfficialPaperExtractSync(examId, options),
    onSuccess: (res, variables) => {
      setActiveJobId(res.jobId);
      setActivePhase("extract");
      if (res.alreadyRunning) toast.info("Sync already running — polling live progress…");
      else if (variables?.fillMissing) toast.success("Syncing remaining questions (merge with DB)…");
      else if (variables?.publishOnly) toast.success("Publishing quiz from saved paperData…");
      else if (variables?.provider) {
        toast.success(`Extracting with ${PROVIDER_LABELS[variables.provider] ?? variables.provider}`);
      } else if (variables?.extractAll) toast.success("Extracting all pending papers one by one");
      else if (variables?.catalogId) toast.success("Extracting this paper…");
      else toast.success("Extracting next pending paper…");
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message ?? "Extract sync failed to start";
      toast.error(msg);
    },
  });

  const imageExtractM = useMutation({
    mutationFn: (catalogId: string) => extractImageQuestions(catalogId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["official-papers", examId] });
      toast.success(`Image extract: +${res.extracted} questions (${res.merged} total in DB)`);
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message ?? "Image extract failed";
      toast.error(msg);
    },
  });

  useEffect(() => {
    if (!activeJobId || !syncJob) return;
    if (syncJob.status === "running") return;

    const finishedJob = syncJob;
    setActiveJobId(null);
    setActivePhase(null);
    qc.invalidateQueries({ queryKey: ["official-papers", examId] });

    if (finishedJob.status === "completed") {
      const phaseLabel =
        finishedJob.phase === "fetch_links" ? "Link fetch" : "Extract";
      toast.success(
        `${phaseLabel} done — ${finishedJob.progress.published} published, ${finishedJob.progress.failed} failed`,
      );
    } else {
      toast.error(finishedJob.errors?.[0] ?? "Sync failed");
    }
  }, [activeJobId, syncJob?.status, syncJob, examId, qc]);

  const papers = listQ.data ?? [];
  const syncing =
    linkSyncM.isPending ||
    extractSyncM.isPending ||
    imageExtractM.isPending ||
    activeJobId !== null;

  const byYear = papers.reduce<Record<number, OfficialPaper[]>>((acc, p) => {
    const y = p.year;
    if (!acc[y]) acc[y] = [];
    acc[y].push(p);
    return acc;
  }, {});
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  const linkedCount = papers.filter((p) => p.status === "linked").length;
  const extractedCount = papers.filter((p) => p.status === "extracted").length;
  const publishedCount = papers.filter((p) => p.status === "published").length;
  const failedCount = papers.filter((p) => p.status === "failed").length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card
        className="p-5 text-primary-foreground"
        style={{ background: "var(--gradient-hero, var(--color-primary))" }}
      >
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20">
            <Archive className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider opacity-90">Old Papers</div>
            <h1 className="truncate text-lg font-bold">
              {selectedExam?.name ?? "Official CET Papers"}
            </h1>
            <p className="mt-0.5 text-xs opacity-90">
              Real Rajasthan RSSB previous-year papers · 120 min · CET marking
            </p>
          </div>
        </div>
        {isAdmin && (
          <div className="mt-4 space-y-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => linkSyncM.mutate()}
              disabled={syncing}
            >
              {syncing && activePhase === "fetch_links" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Phase 1 — Fetch paper links
            </Button>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => extractSyncM.mutate({ extractAll: true })}
                disabled={syncing || linkedCount + failedCount === 0}
              >
                {syncing && activePhase === "extract" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Phase 2 — Extract all ({linkedCount + failedCount})
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => extractSyncM.mutate({})}
                disabled={syncing || linkedCount + failedCount === 0}
              >
                Extract next paper
              </Button>
            </div>
            <p className="text-[10px] opacity-80">
              Extract all runs every pending paper sequentially. Or click Extract on any single card.
              After success you get Solve — extract is removed for that paper.
            </p>
          </div>
        )}
      </Card>

      {isAdmin && capabilitiesQ.data && (
        <AiProvidersPanel
          capabilities={capabilitiesQ.data}
          syncing={syncing}
          onExtractWithProvider={(provider) => extractSyncM.mutate({ provider })}
        />
      )}

      {syncing && syncJob && (
        <SyncProgressPanel
          job={syncJob}
          phase={activePhase ?? syncJob.phase}
          jobId={activeJobId}
        />
      )}

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Official Papers
          </h2>
          {papers.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {publishedCount} quiz · {extractedCount} in DB · {linkedCount} linked · {failedCount} failed
            </span>
          )}
        </div>
        {listQ.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : listQ.isError ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Couldn't load papers.{" "}
            <button
              onClick={() => listQ.refetch()}
              className="font-semibold text-primary hover:underline"
            >
              Retry
            </button>
          </Card>
        ) : papers.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Archive className="h-7 w-7" />
            </div>
            <div className="mt-3 font-bold">No official papers yet</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin
                ? "Run Phase 1 to fetch PDF links, then Phase 2 to build quizzes."
                : "Official papers will appear here once your admin syncs them."}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {years.map((year) => (
              <div key={year}>
                <h3 className="mb-2 text-sm font-bold text-foreground">{year}</h3>
                <div className="space-y-3">
                  {byYear[year].map((p) => (
                    <OfficialPaperCard
                      key={p.catalogId ?? p.quizId ?? `${p.year}-${p.setCode}`}
                      paper={p}
                      examId={examId}
                      isAdmin={isAdmin}
                      syncing={syncing}
                      livePaper={
                        syncJob?.livePaper?.catalogId === p.catalogId
                          ? syncJob.livePaper
                          : undefined
                      }
                      onPublishFromCache={() =>
                        extractSyncM.mutate({ catalogId: p.catalogId, publishOnly: true })
                      }
                      onExtractImageQuestions={() =>
                        paper.catalogId && imageExtractM.mutate(paper.catalogId)
                      }
                      onFillMissing={() =>
                        extractSyncM.mutate({
                          catalogId: p.catalogId,
                          provider: "ocr",
                          fillMissing: true,
                        })
                      }
                      onExtractWithProvider={(provider) =>
                        extractSyncM.mutate({ catalogId: p.catalogId, provider })
                      }
                      extractingCatalogId={
                        syncing && syncJob?.currentPaper === p.title ? p.catalogId : null
                      }
                      extractingImage={imageExtractM.isPending && imageExtractM.variables === p.catalogId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AiProvidersPanel({
  capabilities,
  syncing,
  onExtractWithProvider,
}: {
  capabilities: AiCapabilities;
  syncing?: boolean;
  onExtractWithProvider: (provider: string) => void;
}) {
  return (
    <Card className="p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Choose AI for extraction
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Click a provider to extract the next pending paper with that model only (failures are
        saved). Poppler: {capabilities.popplerConfigured ? "ready" : "missing — OCR uses pdf text + Tesseract"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {capabilities.providers.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={syncing || !p.available}
            onClick={() => onExtractWithProvider(p.id)}
            className={`rounded-lg border px-2.5 py-1.5 text-left text-[10px] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
              p.available
                ? "border-primary/40 bg-primary/10 text-foreground hover:bg-primary/15"
                : "border-muted bg-muted/40 text-muted-foreground"
            }`}
          >
            <div className="font-semibold">{p.label}</div>
            <div className="opacity-80">{p.model}</div>
            <div className="mt-0.5 text-[9px] opacity-70">Click to extract next paper</div>
            {!p.available && p.reason && (
              <div className="mt-0.5 text-destructive">{p.reason}</div>
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}

function ModelBadge({ label, model }: { label?: string | null; model?: string | null }) {
  if (!label && !model) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-800 dark:text-violet-200">
      <Sparkles className="h-3 w-3" />
      {label ?? "AI"} · {model ?? "…"}
    </span>
  );
}

function SyncProgressPanel({
  job,
  phase,
  jobId,
}: {
  job: SyncJobStatus;
  phase?: string | null;
  jobId?: string | null;
}) {
  const phaseLabel =
    phase === "fetch_links" || job.phase === "fetch_links"
      ? "Phase 1 — Fetching links"
      : "Phase 2 — AI extract";

  const pageProgress = job.livePaper?.pageProgress ?? job.pageProgress;
  const pagePct =
    pageProgress && pageProgress.total > 0
      ? Math.round((pageProgress.current / pageProgress.total) * 100)
      : 0;

  return (
    <Card className="p-4 text-sm">
      <div className="flex items-center gap-2 font-medium text-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {phaseLabel}
        {jobId && (
          <span className="text-[10px] text-muted-foreground">job {jobId.slice(-8)}</span>
        )}
        {job.currentStage && (
          <span className="text-xs text-muted-foreground">· {job.currentStage}</span>
        )}
      </div>
      {pageProgress && pageProgress.total > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              PDF pages parsed: {pageProgress.current}/{pageProgress.total}
            </span>
            <span>{pagePct}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${pagePct}%` }}
            />
          </div>
          {pageProgress.questionsFound != null && pageProgress.questionsFound > 0 && (
            <div className="mt-1 text-xs text-foreground">
              {pageProgress.questionsFound} questions extracted so far
            </div>
          )}
        </div>
      )}
      {job.progress?.total > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Papers: {job.progress.completed}/{job.progress.total} · Published:{" "}
          {job.progress.published} · Failed: {job.progress.failed}
        </div>
      )}
      {job.currentPaper && (
        <div className="mt-1 truncate text-xs font-medium text-foreground">
          Paper: {job.currentPaper}
        </div>
      )}
      {(job.activeProvider || job.activeModel) && (
        <div className="mt-2">
          <ModelBadge
            label={PROVIDER_LABELS[job.activeProvider ?? ""] ?? job.activeProvider}
            model={job.activeModel}
          />
        </div>
      )}
      {job.errors && job.errors.length > 0 && (
        <div className="mt-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
          {job.errors.slice(-3).join(" · ")}
        </div>
      )}
      {job.livePaper?.stageLogs && job.livePaper.stageLogs.length > 0 && (
        <StageLogList logs={job.livePaper.stageLogs} max={12} />
      )}
      {job.stageLogs && job.stageLogs.length > 0 && (
        <StageLogList logs={job.stageLogs} max={30} />
      )}
    </Card>
  );
}

function StageLogList({ logs, max = 20 }: { logs: SyncStageLog[]; max?: number }) {
  const visible = logs.slice(-max);
  return (
    <div className="mt-3 max-h-48 overflow-y-auto rounded-md border bg-muted/30 p-2 font-mono text-[10px] leading-relaxed">
      {visible.map((log, i) => (
        <div
          key={`${log.at}-${i}`}
          className={
            log.level === "error"
              ? "text-destructive"
              : log.level === "warn"
                ? "text-warning-foreground"
                : "text-muted-foreground"
          }
        >
          <span className="opacity-60">{new Date(log.at).toLocaleTimeString()}</span>
          {" "}
          <span className="font-semibold">[{log.stage}]</span>
          {log.provider && (
            <span className="text-violet-600 dark:text-violet-300">
              [{PROVIDER_LABELS[log.provider] ?? log.provider}]
            </span>
          )}
          {log.message}
        </div>
      ))}
    </div>
  );
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
  ollama: "Ollama",
  ocr: "Groq+OCR",
  "pdf-parse": "Groq",
};

function ProviderAttemptsList({ attempts }: { attempts: ProviderAttempt[] }) {
  if (!attempts.length) return null;
  return (
    <div className="mt-2 rounded-md border bg-muted/20 p-2">
      <div className="text-[10px] font-bold uppercase text-muted-foreground">Provider attempts</div>
      <div className="mt-1 space-y-1">
        {attempts.slice(-8).map((a, i) => (
          <div
            key={`${a.at}-${i}`}
            className={`text-[10px] ${a.success ? "text-success" : "text-destructive"}`}
          >
            <span className="font-semibold">
              {PROVIDER_LABELS[a.provider] ?? a.provider} · {a.model}
            </span>
            {" · "}
            {a.stage}
            {a.success ? ` · OK (${a.questionCount ?? 0} items)` : ` · FAILED: ${a.error}`}
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  linked: { label: "PDF linked", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  extracting: {
    label: "Extracting…",
    className: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  },
  extracted: {
    label: "In DB",
    className: "bg-violet-500/15 text-violet-800 dark:text-violet-200",
  },
  published: { label: "Quiz ready", className: "bg-success/15 text-success" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive" },
};

function OfficialPaperCard({
  paper,
  examId,
  isAdmin,
  syncing,
  onExtractWithProvider,
  onPublishFromCache,
  onFillMissing,
  onExtractImageQuestions,
  extractingCatalogId,
  extractingImage,
  livePaper,
}: {
  paper: OfficialPaper;
  examId: string;
  isAdmin: boolean;
  syncing?: boolean;
  onExtractWithProvider?: (provider: string) => void;
  onPublishFromCache?: () => void;
  onFillMissing?: () => void;
  onExtractImageQuestions?: () => void;
  extractingCatalogId?: string | null;
  extractingImage?: boolean;
  livePaper?: SyncJobStatus["livePaper"];
}) {
  const mins = paper.durationMinutes ?? 120;
  const attemptStatus = paper.attempted ? "Completed" : "Not attempted";
  const attemptColor = paper.attempted
    ? "bg-success/15 text-success"
    : "bg-warning/15 text-warning-foreground";
  const score = paper.lastScorePercent ?? paper.lastScore;
  const syncStatus = paper.status ?? "published";
  const badge = STATUS_BADGE[syncStatus] ?? STATUS_BADGE.pending;
  const canStart = syncStatus === "published" && paper.quizId;
  const isThisExtracting =
    syncStatus === "extracting" || (extractingCatalogId && paper.catalogId === extractingCatalogId);
  const canExtract =
    isAdmin &&
    onExtractWithProvider &&
    !canStart &&
    !isThisExtracting &&
    (syncStatus === "linked" || syncStatus === "failed" || syncStatus === "pending" || syncStatus === "extracted");
  const canPublishFromCache =
    isAdmin && onPublishFromCache && syncStatus === "extracted" && !isThisExtracting && !syncing;
  const canFillMissing =
    isAdmin &&
    onFillMissing &&
    (syncStatus === "extracted" || syncStatus === "failed") &&
    !isThisExtracting &&
    !syncing &&
    (paper.stats?.missingCount != null && paper.stats.missingCount > 0 ||
      (paper.totalQuestions != null && paper.totalQuestions < 150));
  const pageProgress = livePaper?.pageProgress ?? paper.pageProgress;
  const pagePct =
    pageProgress && pageProgress.total > 0
      ? Math.round((pageProgress.current / pageProgress.total) * 100)
      : 0;

  return (
    <Card className="p-4 transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{paper.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            {paper.setCode && <span>Set {paper.setCode}</span>}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
              {badge.label}
            </span>
            {syncStatus === "published" && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {mins} min · {paper.totalQuestions ?? "—"} Qs
              </span>
            )}
            {syncStatus === "extracted" && paper.totalQuestions != null && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {paper.totalQuestions} Qs in DB
              </span>
            )}
            {syncStatus === "published" && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${attemptColor}`}>
                {attemptStatus}
              </span>
            )}
            {score != null && (
              <span className="font-semibold text-foreground">Last: {Math.round(score)}%</span>
            )}
            {isThisExtracting && (
              <ModelBadge
                label={PROVIDER_LABELS[paper.activeProvider ?? ""] ?? paper.extractionLabel}
                model={paper.activeModel ?? paper.extractionModel}
              />
            )}
            {syncStatus === "published" && paper.extractionLabel && (
              <span className="text-[10px] text-muted-foreground">
                via {paper.extractionLabel} · {paper.extractionModel}
              </span>
            )}
          </div>
          {paper.currentStage && syncStatus !== "published" && (
            <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
              {isThisExtracting && <Loader2 className="h-3 w-3 animate-spin" />}
              Stage: {livePaper?.currentStage ?? paper.currentStage}
            </div>
          )}
          {isThisExtracting && pageProgress && pageProgress.total > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Page {pageProgress.current}/{pageProgress.total}</span>
                <span>{pagePct}%</span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${pagePct}%` }}
                />
              </div>
              {pageProgress.questionsFound != null && pageProgress.questionsFound > 0 && (
                <div className="mt-0.5 text-[10px] text-foreground">
                  {pageProgress.questionsFound} questions so far
                </div>
              )}
            </div>
          )}
          {isAdmin && paper.errorMessage && (
            <div className="mt-1 text-[10px] text-destructive">{paper.errorMessage}</div>
          )}
        </div>
      </div>

      {(paper.questionPdfUrl || paper.answerKeyPdfUrl) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {paper.questionPdfUrl && (
            <a
              href={paper.questionPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Official question paper
            </a>
          )}
          {paper.answerKeyPdfUrl && (
            <a
              href={paper.answerKeyPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Answer key
            </a>
          )}
        </div>
      )}

      {isAdmin && paper.stageLogs && paper.stageLogs.length > 0 && (
        <div className="mt-2">
          <StageLogList logs={paper.stageLogs} max={8} />
        </div>
      )}

      {isAdmin && paper.providerAttempts && paper.providerAttempts.length > 0 && (
        <ProviderAttemptsList attempts={paper.providerAttempts} />
      )}

      {canFillMissing && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 text-xs"
            disabled={syncing}
            onClick={() => onFillMissing?.()}
          >
            Sync remaining questions (~{150 - (paper.totalQuestions ?? 0)} missing)
          </Button>
          {onExtractImageQuestions && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              disabled={syncing || extractingImage}
              onClick={() => onExtractImageQuestions?.()}
            >
              {extractingImage ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              Extract image/diagram questions
            </Button>
          )}
        </div>
      )}

      {canPublishFromCache && (
        <div className="mt-3">
          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={syncing}
            onClick={() => onPublishFromCache?.()}
          >
            Publish quiz from saved data
          </Button>
        </div>
      )}

      {(canExtract || isThisExtracting) && onExtractWithProvider && (
        <div className="mt-3">
          <div className="mb-1 text-[10px] font-semibold text-muted-foreground">
            Extract this paper with:
          </div>
          <div className="flex flex-wrap gap-1">
            {["gemini", "openai", "ollama", "ocr"].map((id) => (
              <Button
                key={id}
                size="sm"
                variant="outline"
                className="h-7 text-[10px]"
                disabled={syncing || isThisExtracting}
                onClick={() => onExtractWithProvider(id)}
              >
                {PROVIDER_LABELS[id]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {canStart && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/exams/$examId/quiz/$quizId"
            params={{ examId, quizId: paper.quizId! }}
            className="min-w-[140px] flex-1"
          >
            <Button className="w-full" size="sm">
              <Play className="mr-2 h-3.5 w-3.5" />
              {paper.attempted ? "Solve again" : "Solve"}
            </Button>
          </Link>
          <Link
            to="/leaderboard/$quizId"
            params={{ quizId: paper.quizId! }}
            className="min-w-[140px] flex-1"
          >
            <Button variant="outline" className="w-full" size="sm">
              <Trophy className="mr-2 h-3.5 w-3.5" />
              Leaderboard
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
