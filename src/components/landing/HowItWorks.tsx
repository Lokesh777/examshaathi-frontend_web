import { Reveal } from "./Reveal";

const steps = [
  { title: "Pick Your Exam", body: "Choose your exam and see the full topic list." },
  { title: "Practice by Topic", body: "Get fresh AI-generated questions for any topic, anytime." },
  {
    title: "Take Full Mock Papers",
    body: "Simulate the real exam with pattern-matched mock tests.",
  },
  {
    title: "Compete & Improve",
    body: "Check your rank on the leaderboard and track your growth.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Four steps from “where do I start?” to “I know exactly where I stand.”
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <li className="relative h-full rounded-2xl border border-border bg-card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}