import { Check, X } from "lucide-react";
import { scorePassword } from "@/utils/validators";

const BAR = ["bg-destructive", "bg-destructive", "bg-warning", "bg-primary", "bg-success"];

export function PasswordStrengthHint({ value }: { value: string }) {
  const { score, label, checks } = scorePassword(value);
  if (!value) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-1.5 flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-full flex-1 rounded-full ${
                i < score ? BAR[score] : "bg-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((c) => (
          <li
            key={c.label}
            className={`flex items-center gap-1.5 text-[11px] ${
              c.ok ? "text-muted-foreground" : "text-muted-foreground/70"
            }`}
          >
            {c.ok ? (
              <Check className="h-3 w-3 text-primary" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}