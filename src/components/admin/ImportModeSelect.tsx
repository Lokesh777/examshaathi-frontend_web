import type { ImportMode } from "@/types/api";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MODES: { value: ImportMode; label: string }[] = [
  { value: "official-paper", label: "Official paper → Official Papers tab (catalogue + PDF links)" },
  { value: "real-paper", label: "Mock paper → Mock tab (personal practice set)" },
  { value: "topic-wise", label: "Topic bank (+ optional quiz)" },
  { value: "bank-manual", label: "Question bank only (manual)" },
  { value: "bank-ai", label: "Question bank only (AI tagged)" },
];

export function ImportModeSelect({
  value,
  onChange,
}: {
  value: ImportMode;
  onChange: (v: ImportMode) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Import mode</Label>
      <Select value={value} onValueChange={(v) => onChange(v as ImportMode)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODES.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
