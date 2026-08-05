"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { fetchTopicChatHistory, sendTopicChatMessage } from "@/services/chat/chatService";
import type { ChatMessage } from "@/types/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MAX_LEN = 500;

export function ChatPage() {
  const { examId, topicId } = useParams() as { examId: string; topicId: string };
  const qc = useQueryClient();
  const key = ["chat", examId, topicId] as const;
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchTopicChatHistory(examId, topicId),
  });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, sending]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

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
      const res = await sendTopicChatMessage(examId, topicId, msg);
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
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/12 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">AI Tutor</div>
          <div className="text-[11px] text-muted-foreground">Topic doubts · exam-ready answers</div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading chat…</div>
        ) : !data?.length ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 px-5 py-8 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-primary" />
            <div className="mt-2 text-sm font-semibold">Ask anything about this topic</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Concepts, tricks, or past-paper style doubts — in Hindi or English.
            </div>
          </div>
        ) : (
          data.map((m, i) => <Bubble key={i} m={m} />)
        )}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background pt-3">
        <div className="relative flex items-end rounded-2xl border border-border bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
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
            placeholder="Ask a doubt…"
            className="min-h-11 max-h-40 flex-1 resize-none rounded-2xl bg-transparent px-3 py-2.5 pr-12 text-sm outline-none"
          />
          <Button
            onClick={() => void send()}
            disabled={sending || !input.trim()}
            size="icon"
            className="absolute bottom-1.5 right-1.5 h-8 w-8 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="pb-2 pt-1 text-right text-[10px] text-muted-foreground">
          {input.length}/{MAX_LEN}
        </div>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        }`}
        aria-hidden
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-md bg-primary text-primary-foreground"
            : "rounded-tl-md border border-border bg-card"
        }`}
      >
        <div className="whitespace-pre-wrap">{m.content}</div>
      </div>
    </div>
  );
}
