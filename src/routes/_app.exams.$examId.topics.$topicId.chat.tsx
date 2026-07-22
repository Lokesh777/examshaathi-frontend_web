import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { api, type ChatMessage } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/exams/$examId/topics/$topicId/chat")({
  component: ChatPage,
});

const MAX_LEN = 500;

function ChatPage() {
  const { examId, topicId } = Route.useParams();
  const qc = useQueryClient();
  const key = ["chat", examId, topicId] as const;
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => (await api.chatHistory(examId, topicId)).history,
  });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, sending]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setSending(true);
    setInput("");
    // Optimistically append user message
    qc.setQueryData<ChatMessage[]>(key, (prev) => [
      ...(prev ?? []),
      { role: "user", content: msg },
    ]);
    try {
      const res = await api.chatSend(examId, topicId, msg);
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
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading chat…</div>
        ) : !data?.length ? (
          <Card className="p-6 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <div className="mt-2 text-sm font-semibold">Ask anything about this topic</div>
            <div className="text-xs text-muted-foreground">
              Concepts, formulas, past-paper questions…
            </div>
          </Card>
        ) : (
          data.map((m, i) => <Bubble key={i} m={m} />)
        )}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> AI is thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="sticky bottom-0 flex items-end gap-2 border-t border-border bg-background pt-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Ask a doubt…"
          className="max-h-32 flex-1 resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <Button onClick={send} disabled={sending || !input.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="pb-2 text-right text-[10px] text-muted-foreground">
        {input.length}/{MAX_LEN}
      </div>
    </div>
  );
}

function Bubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-card"
        }`}
      >
        <div className="whitespace-pre-wrap">{m.content}</div>
        {!isUser && m.sources && m.sources.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-border/60 pt-2 text-xs">
            <div className="font-semibold text-muted-foreground">Sources</div>
            {m.sources.map((s, i) => (
              <a
                key={i}
                href={s}
                target="_blank"
                rel="noreferrer"
                className="block break-all text-primary hover:underline"
              >
                {s}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}