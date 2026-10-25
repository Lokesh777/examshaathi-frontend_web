import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { FAQS } from "@/content/cetGuide";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

/** Native <details> accordion — works without JS and is indexable. */
export function FaqList({ className }: { className?: string }) {
  return (
    <div className={cn("divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card", className)}>
      {FAQS.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 text-left text-[15px] font-semibold sm:px-5 [&::-webkit-details-marker]:hidden">
            <span className="flex-1">{f.q}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions students ask</h2>
          <p className="mt-3 text-muted-foreground">
            New to CET? Read the{" "}
            <Link href="/guide" className="font-semibold text-primary hover:underline">
              free CET 12th Level guide
            </Link>{" "}
            for the full pattern, subjects and a 4-week plan.
          </p>
        </Reveal>
        <FaqList className="mt-8" />
      </div>
    </section>
  );
}

/** Landing teaser that sends readers to the full /guide page. */
export function GuideTeaser() {
  const items = [
    { k: "120 Q · 240 marks", v: "2½ hours, 13 subjects" },
    { k: "Option E = no penalty", v: "Fully blank = −1/3 marks" },
    { k: "> 10% blank", v: "Disqualified — never leave it empty" },
  ];
  return (
    <section className="border-t border-border bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:py-20">
        <Reveal>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Free guide</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            CET 12th Level 2026, explained in 5 minutes
          </h2>
          <p className="mt-3 text-muted-foreground">
            Subject-wise question split, the option E rule most students get wrong, and a 4-week
            plan you can follow inside ExamSaathi.
          </p>
          <Link
            href="/guide"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Read the guide <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <Reveal delay={80}>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.k} className="rounded-2xl border border-border bg-card p-4">
                <div className="font-semibold">{i.k}</div>
                <div className="text-sm text-muted-foreground">{i.v}</div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
