import { Reveal } from "./Reveal";

/** Placeholder numbers — edit these as the product grows. */
const stats = [
  { value: "10,000+", label: "Questions Generated" },
  { value: "500+", label: "Students Practicing" },
  { value: "Growing", label: "Every Day" },
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