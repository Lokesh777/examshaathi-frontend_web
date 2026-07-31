import {
  BarChart3,
  FileText,
  Infinity as InfinityIcon,
  MessagesSquare,
  Rocket,
  Trophy,
} from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  {
    icon: InfinityIcon,
    title: "Unlimited Practice Questions",
    body: "AI-generated questions for every topic, so you never run out of practice material.",
  },
  {
    icon: FileText,
    title: "Full-Length Mock Papers",
    body: "Real paper mocks matched to the exact exam pattern — same sections, same question counts.",
  },
  {
    icon: MessagesSquare,
    title: "Instant Doubt Solving (Chat)",
    body: "Ask a question and get an instant, topic-scoped answer — powered by AI that remembers what's already been answered.",
  },
  {
    icon: Trophy,
    title: "Leaderboard & Ranking",
    body: "See where you stand — Top 50 leaderboard for every quiz, plus your own rank always visible.",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    body: "Every attempt is saved, so you can see how you're improving over time.",
  },
  {
    icon: Rocket,
    title: "Built for Every Exam (coming soon)",
    body: "Starting with CET 12th Level, expanding to every competitive government exam.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need between today and exam day
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            One place to practice, test, ask and measure — no scattered PDFs, no guesswork.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <article className="h-full rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-card)]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}