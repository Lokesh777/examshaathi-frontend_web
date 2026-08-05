"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteAdminFeedback,
  fetchAdminFeedback,
} from "@/services/contact/contactService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ContactSubmission } from "@/types/api";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function SubmissionRow({
  item,
  selected,
  onToggle,
  onDeleteOne,
  deleting,
}: {
  item: ContactSubmission;
  selected: boolean;
  onToggle: () => void;
  onDeleteOne: () => void;
  deleting: boolean;
}) {
  return (
    <div className="space-y-2 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 h-4 w-4 accent-primary"
          aria-label={`Select ${item.subject}`}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
              {item.category.replace("_", " ")}
            </span>
            <span className="text-[10px] text-muted-foreground">{item.source}</span>
            {!item.sheetSynced && (
              <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">
                sheet pending
              </span>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground">
              {formatDate(item.createdAt)}
            </span>
          </div>
          <div className="text-sm font-semibold">{item.subject}</div>
          <div className="text-xs text-muted-foreground">
            {item.name} · {item.email}
          </div>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
            {item.message}
          </p>
          {item.screenshotUrl ? (
            <div className="space-y-1.5">
              <a
                href={item.screenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg border border-border bg-muted/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.screenshotUrl}
                  alt={`Screenshot from ${item.name}`}
                  className="max-h-48 w-full object-contain"
                  loading="lazy"
                />
              </a>
              <a
                href={item.screenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Open full image <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={deleting}
          onClick={onDeleteOne}
          aria-label="Delete this message"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function AdminFeedbackPanel() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const q = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: () => fetchAdminFeedback({ limit: 50 }),
  });

  const items = q.data?.items ?? [];
  const allIds = useMemo(() => items.map((i) => i._id), [items]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  const deleteM = useMutation({
    mutationFn: (ids: string[]) => deleteAdminFeedback(ids),
    onSuccess: (data) => {
      toast.success(`Deleted ${data.deleted} item${data.deleted === 1 ? "" : "s"}`);
      setSelected(new Set());
      void qc.invalidateQueries({ queryKey: ["admin-feedback"] });
    },
    onError: (e: Error) => toast.error(e.message || "Delete failed"),
  });

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  };

  const confirmDelete = (ids: string[]) => {
    if (!ids.length) return;
    const ok = window.confirm(
      ids.length === 1
        ? "Delete this inbox message?"
        : `Delete ${ids.length} selected messages?`
    );
    if (!ok) return;
    deleteM.mutate(ids);
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-start gap-3 px-5 py-4">
        <MessageSquare className="mt-0.5 h-4 w-4 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Feedback & contact</div>
          <div className="text-xs text-muted-foreground">
            Inbox from the contact form. Screenshots upload via ImageKit when configured.
          </div>
          {q.data && q.data.imageKitReady === false && (
            <div className="mt-1 text-[10px] text-destructive">
              IMAGEKIT_PRIVATE_KEY missing — new screenshots cannot upload until you add it
              to backend .env.
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {q.data?.spreadsheetUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={q.data.spreadsheetUrl} target="_blank" rel="noreferrer">
                Open sheet
              </a>
            </Button>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="flex items-center gap-3 border-t border-border bg-secondary/40 px-4 py-2">
          <label className="flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 accent-primary"
            />
            Select all
          </label>
          <span className="text-[10px] text-muted-foreground">
            {selected.size} selected
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="ml-auto"
            disabled={selected.size === 0 || deleteM.isPending}
            onClick={() => confirmDelete([...selected])}
          >
            {deleteM.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Delete selected
          </Button>
        </div>
      )}

      <div className="max-h-[28rem] overflow-y-auto border-t border-border">
        {q.isLoading ? (
          <div className="flex items-center gap-2 px-5 py-8 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
          </div>
        ) : q.isError ? (
          <div className="px-5 py-6 text-center text-xs text-destructive">
            {(q.error as Error)?.message || "Failed to load feedback."}
          </div>
        ) : !items.length ? (
          <div className="px-5 py-8 text-center text-xs text-muted-foreground">
            No submissions yet.
          </div>
        ) : (
          items.map((item) => (
            <SubmissionRow
              key={item._id}
              item={item}
              selected={selected.has(item._id)}
              onToggle={() => toggleOne(item._id)}
              onDeleteOne={() => confirmDelete([item._id])}
              deleting={deleteM.isPending}
            />
          ))
        )}
      </div>

      {typeof q.data?.total === "number" && q.data.total > 0 && (
        <div className="border-t border-border px-5 py-2 text-[10px] text-muted-foreground">
          Showing {items.length} of {q.data.total}
        </div>
      )}
    </Card>
  );
}
