import { Reveal } from "./Reveal";

const stats = [
  { value: "Daily", label: "20-Q streak challenge" },
  { value: "10–20", label: "Questions per generate" },
  { value: "HI + EN", label: "AI Tutor languages" },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3 sm:px-6">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80} className="text-center">
            <div className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
