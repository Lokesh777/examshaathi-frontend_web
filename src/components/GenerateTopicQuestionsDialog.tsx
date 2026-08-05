"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateTopicQuestions, type GenerateMode } from "@/services/quizzes/quizService";

const MODE_OPTIONS: { value: GenerateMode; label: string; hint: string }[] = [
  {
    value: "normal",
    label: "Normal",
    hint: "Direct MCQs in the classic pattern",
  },
  {
    value: "new",
    label: "New Pattern",
    hint: "Statement, matching, assertion-reason, chronology",
  },
  {
    value: "mixed",
    label: "Mixed",
    hint: "Half normal + half new pattern",
  },
];

export type GenerateTarget = {
  topicId: string;
  topicName?: string;
  /** How many to request for this topic (capped server-side at 20). */
  count?: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  /** Single topic, or several (mock shortfall fill). */
  targets: GenerateTarget[];
  defaultCount?: number;
  title?: string;
  description?: string;
  /** Called after all targets succeed. */
  onGenerated?: (totalInserted: number) => void;
};

export function GenerateTopicQuestionsDialog({
  open,
  onOpenChange,
  examId,
  targets,
  defaultCount = 10,
  title = "Generate questions",
  description = "New AI questions are added to the shared bank for everyone.",
  onGenerated,
}: Props) {
  const [mode, setMode] = useState<GenerateMode>("normal");
  const [count, setCount] = useState(() => Math.min(20, Math.max(10, defaultCount)));
  const [pending, setPending] = useState(false);

  const multi = targets.length > 1;
  const primaryName = targets[0]?.topicName;

  const handleSubmit = async () => {
    if (!targets.length) return;
    setPending(true);
    let totalInserted = 0;
    try {
      for (const t of targets) {
        const n = Math.min(20, Math.max(10, t.count ?? count));
        const res = await generateTopicQuestions(examId, t.topicId, { mode, count: n });
        totalInserted += res.inserted ?? 0;
      }
      toast.success(
        totalInserted > 0
          ? `Added ${totalInserted} question${totalInserted === 1 ? "" : "s"} to the bank`
          : "No new questions were inserted — try again",
      );
      onOpenChange(false);
      onGenerated?.(totalInserted);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "Generation failed";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
            {primaryName && !multi ? (
              <span className="mt-1 block font-medium text-foreground">{primaryName}</span>
            ) : null}
            {multi ? (
              <span className="mt-1 block text-foreground">
                Filling {targets.length} short topics
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="space-y-2">
            <Label>Pattern mode</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as GenerateMode)}
              className="gap-2"
              disabled={pending}
            >
              {MODE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value={opt.value} className="mt-0.5" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{opt.hint}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {!multi && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Count</Label>
                <span className="text-sm font-semibold tabular-nums">{count}</span>
              </div>
              <Slider
                min={10}
                max={20}
                step={1}
                value={[count]}
                onValueChange={(v) => setCount(v[0] ?? 10)}
                disabled={pending}
              />
              <p className="text-[11px] text-muted-foreground">Minimum 10, up to 20 questions</p>
            </div>
          )}

          {multi && (
            <p className="text-[11px] text-muted-foreground">
              Each short topic will generate up to its deficit (max 20).
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !targets.length}>
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
