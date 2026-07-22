import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Loader2, Send, Sparkles, ChevronLeft, ChevronRight, Bot, User } from "lucide-react";
import { api, unwrap, type ChatMessage, type Topic } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const searchSchema = z.object({ topicId: z.string().optional() });

export const Route = createFileRoute("/_app/exams/$examId/chat")({
  validateSearch: searchSchema,
  component: ChatTabPage,
});

const MAX_LEN = 500;

function ChatTabPage() {
  const { examId } = Route.useParams();
  const { topicId: topicIdFromSearch } = Route.useSearch();
  const navigate = Route.useNavigate();

  const topicsQuery = useQuery({
    queryKey: ["topics", examId],
    queryFn: async () => unwrap<Topic[]>(await api.topics(examId)),
    staleTime: Infinity,
  });
  const topics = topicsQuery.data ?? [];

  // Default topic = search param, else first topic
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

  return (
    <div className="fixed inset-x-0 top-14 bottom-16 z-30 flex flex-col bg-background md:bottom-0">
      {/* Sticky topic switcher — compact on mobile, roomier on desktop */}
      <div className="shrink-0 border-b border-border bg-card px-3 py-2 sm:px-6 sm:py-3">
        {topicsQuery.isLoading ? (
          <div className="text-xs text-muted-foreground">Loading topics…</div>
        ) : topics.length > 0 ? (
          <div className="mx-auto flex max-w-3xl items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => goTo(activeIdx - 1)}
              disabled={activeIdx <= 0}
              aria-label="Previous topic"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary disabled:opacity-40 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <div className="truncate text-xs font-semibold sm:text-base">
                {activeTopic?.name ?? "—"}
              </div>
              <div className="text-[10px] text-muted-foreground sm:text-xs">
                Topic {activeIdx + 1} of {topics.length}
              </div>
            </div>
            <button
              type="button"
              onClick={() => goTo(activeIdx + 1)}
              disabled={activeIdx >= topics.length - 1}
              aria-label="Next topic"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary disabled:opacity-40 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      {activeTopic ? (
        <ChatThread key={activeTopic._id} examId={examId} topic={activeTopic} />
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <Card className="p-6 text-center text-sm text-muted-foreground">
            {topicsQuery.isLoading ? "Loading…" : "No topics available yet."}
          </Card>
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
    queryFn: async () => (await api.chatHistory(examId, topic._id)).history,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea: expands with content up to ~8 visible lines, then scrolls
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 224; // px, ~8 lines of text-sm/leading-relaxed + padding
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
  }, [input]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, sending]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setSending(true);
    setInput("");
    qc.setQueryData<ChatMessage[]>(key, (prev) => [
      ...(prev ?? []),
      { role: "user", content: msg },
    ]);
    try {
      const res = await api.chatSend(examId, topic._id, msg);
      qc.setQueryData<ChatMessage[]>(key, (prev) => [
        ...(prev ?? []),
        { role: "assistant", content: res.answer, sources: res.sources },
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-6">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Loading chat…
          </div>
        ) : !data?.length ? (
          <Card className="p-6 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <div className="mt-2 text-sm font-semibold">
              Ask anything about {topic.name}
            </div>
            <div className="text-xs text-muted-foreground">
              Concepts, formulas, past-paper questions…
            </div>
          </Card>
        ) : (
          data.map((m, i) => <Bubble key={i} m={m} />)
        )}
        {sending && (
          <div className="flex items-start gap-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="shrink-0 border-t border-border bg-background px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:px-6 sm:pt-3 sm:pb-3">
        <div className="relative mx-auto flex max-w-3xl items-end rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={`Ask about ${topic.name}…`}
            className="min-h-12 max-h-56 flex-1 resize-none overflow-y-auto rounded-2xl bg-transparent px-4 py-3 pr-14 text-sm leading-relaxed outline-none transition-[height] duration-150 ease-out"
            style={{ height: "auto" }}
          />
          <Button
            onClick={send}
            disabled={sending || !input.trim()}
            size="icon"
            className="absolute bottom-1.5 right-1.5 h-9 w-9 rounded-xl"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mx-auto mt-1 flex max-w-3xl items-center justify-between px-1 text-[10px] text-muted-foreground">
          <span>Enter to send · Shift+Enter for newline</span>
          <span>{input.length}/{MAX_LEN}</span>
        </div>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  return (
    <div
      className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary"
        }`}
        aria-hidden
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm border border-border bg-card"
        }`}
      >
        <div className="whitespace-pre-wrap">{m.content}</div>
        {!isUser && m.sources && m.sources.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-border/60 pt-2 text-xs">
            <div className="font-semibold text-muted-foreground">Sources</div>
            {m.sources.map((s, i) => {
              let host = s;
              try { host = new URL(s).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
              return (
                <a
                  key={i}
                  href={s}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-primary hover:underline"
                >
                  {host}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}