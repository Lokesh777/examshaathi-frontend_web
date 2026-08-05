"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { generateQuestions } from "@/services/admin/adminImportService";
import { getTopicContentLanguage } from "@/lib/topicLanguage";
import type { AdminExamProfile, QuestionType, Topic } from "@/types/api";
import { ImportPreviewTable } from "./ImportPreviewTable";

export function AiGeneratePanel({
  examId,
  profile,
  topics,
}: {
  examId: string;
  profile: AdminExamProfile;
  topics: Topic[];
}) {
  const [topicId, setTopicId] = useState(topics[0]?._id || "");
  const [questionType, setQuestionType] = useState<QuestionType | "auto">("auto");
  const [count, setCount] = useState(5);
  const [preview, setPreview] = useState<
    {
      index: number;
      questionText: string;
      questionType: string;
      optionCount: number;
      valid: boolean;
      errors: string[];
    }[]
  >([]);

  const selectedTopic = useMemo(
    () => topics.find((t) => t._id === topicId) ?? null,
    [topics, topicId]
  );

  const contentLanguage = selectedTopic
    ? getTopicContentLanguage(selectedTopic)
    : "hindi";

  const topicsBySection = useMemo(() => {
    const map = new Map<string, Topic[]>();
    for (const t of topics) {
      const key = t.patternSection || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "hi"));
  }, [topics]);

  const generateM = useMutation({
    mutationFn: () =>
      generateQuestions(examId, { topicId, count, questionType }),
    onSuccess: (data) => {
      setPreview(
        data.preview.map((p, i) => ({
          index: i + 1,
          questionText: p.questionText,
          questionType: p.questionType,
          optionCount: p.options.length,
          valid: true,
          errors: [],
        }))
      );
      toast.success(`Generated ${data.inserted} questions`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patternLabel =
    profile.defaultPattern === "old" ? "official (old)" : "new";

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">AI Generate</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Generates {profile.optionCount}-option {patternLabel}-pattern questions into the bank
        for the topic you select. Language follows the topic (English topics → English
        questions; Hindi topics → Hindi).
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Topic</Label>
          <Select value={topicId} onValueChange={setTopicId}>
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {topicsBySection.map(([section, sectionTopics]) => (
                <SelectGroup key={section}>
                  <SelectLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {section}
                  </SelectLabel>
                  {sectionTopics.map((t) => {
                    const lang = getTopicContentLanguage(t);
                    return (
                      <SelectItem key={t._id} value={t._id}>
                        <span className="flex items-center gap-2">
                          <span className="truncate">{t.name}</span>
                          <span
                            className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-bold uppercase ${
                              lang === "english"
                                ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                : "bg-orange-500/15 text-orange-800 dark:text-orange-200"
                            }`}
                          >
                            {lang}
                          </span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          {selectedTopic && (
            <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs">
              <div className="font-semibold text-foreground">{selectedTopic.name}</div>
              {selectedTopic.patternSection && (
                <div className="mt-0.5 text-muted-foreground">
                  Section: {selectedTopic.patternSection}
                </div>
              )}
              <div className="mt-1 font-medium text-primary">
                Questions will be generated in{" "}
                <span className="uppercase">{contentLanguage}</span>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Question type</Label>
          <Select
            value={questionType}
            onValueChange={(v) => setQuestionType(v as QuestionType | "auto")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto mix (exam profile)</SelectItem>
              {profile.questionTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label} ({t.labelHi})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Count: {count}</Label>
        <Slider
          value={[count]}
          onValueChange={([v]) => setCount(v)}
          min={1}
          max={20}
          step={1}
        />
      </div>

      <Button
        onClick={() => generateM.mutate()}
        disabled={!topicId || generateM.isPending}
      >
        {generateM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate into bank
      </Button>

      {preview.length > 0 && (
        <ImportPreviewTable
          rows={preview}
          validCount={preview.length}
          totalCount={preview.length}
        />
      )}
    </Card>
  );
}
