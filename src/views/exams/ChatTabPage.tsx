"use client";

import { useNavigate } from "@/lib/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bot,
  User,
  BookOpen,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import { fetchTopicsForExam } from "@/services/exams/examService";
import { fetchTopicChatHistory, sendTopicChatMessage } from "@/services/chat/chatService";
import type { ChatMessage, Topic } from "@/types/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTopicContentLanguage } from "@/lib/topicLanguage";

const MAX_LEN = 500;

function suggestionChips(topic: Topic): string[] {
  const lang = getTopicContentLanguage(topic);
  const name = topic.name;
  if (lang === "english") {
    return [
      `Explain the key rule for "${name}" in simple words`,
      `Give 2 exam-style examples for ${name}`,
      `What mistakes do students make in ${name}?`,
    ];
  }
  return [
    `"${name}" को आसान भाषा में समझाओ`,
    `${name} से जुड़े 2 महत्वपूर्ण point बताओ`,
    `${name} में exam में अक्सर क्या पूछा जाता है?`,
  ];
}

export function ChatTabPage() {
  const { examId } = useParams() as { examId: string };
  const topicIdFromSearch = useSearchParams().get("topicId") ?? undefined;
  const navigate = useNavigate();

  const topicsQuery = useQuery({
    queryKey: ["topics", examId],
    queryFn: () => fetchTopicsForExam(examId),
    staleTime: Infinity,
  });
  const topics = topicsQuery.data ?? [];

  const activeTopicId = topicIdFromSearch ?? topics[0]?._id;

  useEffect(() => {
    if (!topicIdFromSearch && topics[0]?._id) {
      navigate({ search: { topicId: topics[0]._id }, replace: true });
    }
  }, [topicIdFromSearch, topics, navigate]);

  const activeTopic = useMemo(
    () => topics.find((t) => t._id === activeTopicId) ?? null,
    [topics, activeTopicId],
  );

  const activeIdx = topics.findIndex((t) => t._id === activeTopicId);
  const goTo = (i: number) => {
    if (i < 0 || i >= topics.length) return;
    navigate({ search: { topicId: topics[i]._id }, replace: true });
  };

  const lang = activeTopic ? getTopicContentLanguage(activeTopic) : null;

  return (
    <div className="fixed inset-x-0 top-14 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex flex-col bg-background md:bottom-0">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      <header className="relative shrink-0 border-b border-border/80 bg-card/90 px-3 py-2.5 backdrop-blur-sm sm:px-6 sm:py-3">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold tracking-tight">AI Tutor</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  Exam-ready doubts · topic-aware answers
                </div>
              </div>
            </div>
            {lang && (
              <span className="shrink-0 rounded-md border border-border bg-background/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {lang === "english" ? "English" : "Hindi"}
              </span>
            )}
          </div>

          {topicsQuery.isLoading ? (
            <div className="text-xs text-muted-foreground">Loading topics…</div>
          ) : topics.length > 0 ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => goTo(activeIdx - 1)}
                disabled={activeIdx <= 0}
                aria-label="Previous topic"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Select topic</span>
                <select
                  value={activeTopicId ?? ""}
                  onChange={(e) =>
                    navigate({ search: { topicId: e.target.value }, replace: true })
                  }
                  className="h-9 w-full appearance-none truncate rounded-xl border border-border bg-background px-3 pr-8 text-xs font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 sm:text-sm"
                >
                  {topics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-muted-foreground" />
              </label>
              <button
                type="button"
                onClick={() => goTo(activeIdx + 1)}
                disabled={activeIdx >= topics.length - 1}
                aria-label="Next topic"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {activeTopic ? (
        <ChatThread key={activeTopic._id} examId={examId} topic={activeTopic} />
      ) : (
        <div className="relative flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            {topicsQuery.isLoading ? "Loading…" : "No topics available yet."}
          </div>
        </div>
      )}
    </div>
  );
}

function ChatThread({ examId, topic }: { examId: string; topic: Topic }) {
  const qc = useQueryClient();
  const key = ["chat", examId, topic._id] as const;
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchTopicChatHistory(examId, topic._id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chips = useMemo(() => suggestionChips(topic), [topic]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 224)}px`;
  }, [input]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, sending]);

  const send = async (raw?: string) => {
    const msg = (raw ?? input).trim();
    if (!msg || sending) return;
    setSending(true);
    setInput("");
    qc.setQueryData<ChatMessage[]>(key, (prev) => [
      ...(prev ?? []),
      { role: "user", content: msg },
    ]);
    try {
      const res = await sendTopicChatMessage(examId, topic._id, msg);
      qc.setQueryData<ChatMessage[]>(key, (prev) => [
        ...(prev ?? []),
        { role: "assistant", content: res.answer },
      ]);
    } catch (err) {
      toast.error((err as { message?: string }).message ?? "Chat failed");
      qc.setQueryData<ChatMessage[]>(key, (prev) => (prev ?? []).slice(0, -1));
      setInput(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 space-y-3.5 overflow-y-auto px-3 py-4 sm:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading chat…
          </div>
        ) : !data?.length ? (
          <EmptyTutorState topic={topic} chips={chips} onPick={(c) => send(c)} disabled={sending} />
        ) : (
          data.map((m, i) => <Bubble key={i} m={m} />)
        )}
        {sending && (
          <div className="flex items-start gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-border bg-card/90 px-3.5 py-2.5 text-xs text-muted-foreground shadow-sm">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/70" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/70 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/70 [animation-delay:300ms]" />
              </span>
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-border/80 bg-background/95 px-3 pt-2.5 pb-2 backdrop-blur-sm sm:px-6 sm:pt-3 sm:pb-3 md:pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        {!!data?.length && !sending && (
          <div className="mx-auto mb-2 flex max-w-3xl gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chips.slice(0, 2).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => send(c)}
                className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {c.length > 42 ? `${c.slice(0, 40)}…` : c}
              </button>
            ))}
          </div>
        )}
        <div className="relative mx-auto flex max-w-3xl items-end rounded-2xl border border-border bg-card shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={1}
            placeholder={`Ask about ${topic.name}…`}
            className="min-h-12 max-h-56 flex-1 resize-none overflow-y-auto rounded-2xl bg-transparent px-4 py-3 pr-14 text-sm leading-relaxed outline-none transition-[height] duration-150 ease-out"
          />
          <Button
            onClick={() => void send()}
            disabled={sending || !input.trim()}
            size="icon"
            className="absolute bottom-1.5 right-1.5 h-9 w-9 rounded-xl"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mx-auto mt-1.5 flex max-w-3xl items-center justify-between px-1 text-[10px] text-muted-foreground">
          <span>Enter send · Shift+Enter newline</span>
          <span>
            {input.length}/{MAX_LEN}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyTutorState({
  topic,
  chips,
  onPick,
  disabled,
}: {
  topic: Topic;
  chips: string[];
  onPick: (chip: string) => void;
  disabled: boolean;
}) {
  const lang = getTopicContentLanguage(topic);
  return (
    <div className="mx-auto max-w-md px-1 py-6 text-center sm:py-10">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/12 text-primary shadow-sm">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">Ask your tutor</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Doubts on <span className="font-medium text-foreground">{topic.name}</span>
        {topic.patternSection ? ` · ${topic.patternSection}` : ""}. Replies in{" "}
        {lang === "english" ? "English" : "Hindi"} when you ask in that language.
      </p>

      <ul className="mt-5 space-y-2 text-left text-xs text-muted-foreground">
        <li className="flex items-start gap-2 rounded-xl border border-border/70 bg-card/70 px-3 py-2">
          <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Short, exam-focused answers — not long lectures
        </li>
        <li className="flex items-start gap-2 rounded-xl border border-border/70 bg-card/70 px-3 py-2">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Ask in Hindi or English — tutor matches your language
        </li>
        <li className="flex items-start gap-2 rounded-xl border border-border/70 bg-card/70 px-3 py-2">
          <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Uses this topic&apos;s syllabus context for better accuracy
        </li>
      </ul>

      <div className="mt-5 flex flex-col gap-2">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => onPick(c)}
            className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm transition hover:border-primary/45 hover:bg-primary/5 disabled:opacity-50"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        }`}
        aria-hidden
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={`max-w-[min(85%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-tr-md bg-primary text-primary-foreground"
            : "rounded-tl-md border border-border bg-card/95"
        }`}
      >
        <div className="whitespace-pre-wrap">{m.content}</div>
      </div>
    </div>
  );
}
