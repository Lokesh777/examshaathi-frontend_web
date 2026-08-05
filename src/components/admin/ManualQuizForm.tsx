"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImportModeSelect } from "./ImportModeSelect";
import { importQuestions } from "@/services/admin/adminImportService";
import type { AdminExamProfile, ImportMode, QuestionType, Topic } from "@/types/api";
import { Link } from "@/lib/navigation";

type QuestionRow = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  questionType: QuestionType;
  topicId: string;
};

const emptyRow = (optionCount: number, topicId: string, fifthText: string): QuestionRow => ({
  questionText: "",
  options: Array.from({ length: optionCount }, (_, i) =>
    i === optionCount - 1 && optionCount === 5 ? fifthText : ""
  ),
  correctAnswer: "",
  explanation: "",
  questionType: "direct",
  topicId,
});

export function ManualQuizForm({
  examId,
  profile,
  topics,
}: {
  examId: string;
  profile: AdminExamProfile;
  topics: Topic[];
}) {
  const defaultTopic = topics[0]?._id || "";
  const [mode, setMode] = useState<ImportMode>("real-paper");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [rows, setRows] = useState<QuestionRow[]>([
    emptyRow(profile.optionCount, defaultTopic, profile.fifthOptionText),
  ]);
  const [lastQuizId, setLastQuizId] = useState<string | null>(null);

  const importM = useMutation({
    mutationFn: () =>
      importQuestions(examId, {
        mode,
        useAiNormalize: false,
        questions: rows.map((r) => ({
          questionText: r.questionText,
          options: r.options.filter(Boolean),
          correctAnswer: r.correctAnswer,
          explanation: r.explanation || "—",
          questionType: r.questionType,
          topicId: r.topicId,
        })),
        metadata: {
          title: title || "Manual Quiz",
          year: year ? Number(year) : undefined,
          topicId: rows[0]?.topicId,
          createQuiz: mode === "topic-wise",
        },
      }),
    onSuccess: (data) => {
      setLastQuizId(data.quizId);
      toast.success(`Created quiz with ${data.inserted} questions`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRow = (idx: number, patch: Partial<QuestionRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const updateOption = (rowIdx: number, optIdx: number, value: string) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r;
        const options = [...r.options];
        options[optIdx] = value;
        return { ...r, options };
      })
    );
  };

  return (
    <Card className="p-5 space-y-4">
      <h2 className="text-lg font-bold">Manual Quiz Builder</h2>

      <ImportModeSelect value={mode} onChange={setMode} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Quiz title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Practice Set 1" />
        </div>
        {(mode === "official-paper" || mode === "real-paper") && (
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} type="number" />
          </div>
        )}
      </div>

      <div className="space-y-6">
        {rows.map((row, idx) => (
          <div key={idx} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Question {idx + 1}</span>
              {rows.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRows((p) => p.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={row.questionType}
                  onValueChange={(v) => updateRow(idx, { questionType: v as QuestionType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {profile.questionTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Topic</Label>
                <Select
                  value={row.topicId}
                  onValueChange={(v) => updateRow(idx, { topicId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Question text</Label>
              <Textarea
                value={row.questionText}
                onChange={(e) => updateRow(idx, { questionText: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {row.options.map((opt, oi) => (
                <div key={oi} className="space-y-1">
                  <Label className="text-xs">
                    Option {String.fromCharCode(65 + oi)}
                  </Label>
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(idx, oi, e.target.value)}
                    readOnly={oi === profile.optionCount - 1 && profile.optionCount === 5}
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Correct answer (full text)</Label>
                <Input
                  value={row.correctAnswer}
                  onChange={(e) => updateRow(idx, { correctAnswer: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Explanation</Label>
                <Input
                  value={row.explanation}
                  onChange={(e) => updateRow(idx, { explanation: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setRows((p) => [
              ...p,
              emptyRow(profile.optionCount, defaultTopic, profile.fifthOptionText),
            ])
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add question
        </Button>
        <Button onClick={() => importM.mutate()} disabled={importM.isPending}>
          {importM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create quiz
        </Button>
      </div>

      {lastQuizId && (
        <p className="text-sm">
          <Link
            to="/exams/$examId/quiz/$quizId"
            params={{ examId, quizId: lastQuizId }}
            className="font-semibold text-primary hover:underline"
          >
            Play created quiz
          </Link>
        </p>
      )}
    </Card>
  );
}
