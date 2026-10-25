import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  CircleSlash,
  Clock,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FaqList } from "@/components/landing/Faq";
import {
  CET_PATTERN,
  CET_STATS,
  CET_SUBJECTS,
  EXAM_DAY_TIPS,
  FAQS,
  STUDY_PLAN,
} from "@/content/cetGuide";

export const metadata: Metadata = {
  title: "CET 12th Level 2026 Guide — Pattern, Syllabus & Option E Rule | ExamSaathi",
  description:
    "Rajasthan CET 12th Level 2026: 120 questions, 240 marks, 150 minutes, 1/3 negative marking. Subject-wise question split, the option E rule, a 4-week study plan and exam-day strategy.",
  alternates: { canonical: "/guide" },
  openGraph: {
    title: "Rajasthan CET 12th Level 2026 — Complete Guide",
    description:
      "Pattern, subject-wise questions, the option E rule and a free 4-week plan.",
    url: "/guide",
    type: "article",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const toc = [
  { id: "pattern", label: "Pattern" },
  { id: "option-e", label: "Option E rule" },
  { id: "subjects", label: "Subjects" },
  { id: "plan", label: "4-week plan" },
  { id: "exam-day", label: "Exam day" },
  { id: "faq", label: "FAQ" },
];

export default function GuidePage() {
  return (
    <div className="min-h-dvh bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />

      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-4xl px-4 pt-10 pb-8 sm:px-6 md:pt-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BookOpenCheck className="h-3.5 w-3.5" /> Free study guide · 2026 pattern
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Rajasthan CET 12th Level: the complete guide
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Everything you need before you start practising — the exam pattern, how many
              questions come from each subject, the option E rule that decides who gets
              disqualified, and a 4-week plan you can follow on ExamSaathi for free.
            </p>

            {/* Jump links — scroll sideways on phones */}
            <nav
              aria-label="On this page"
              className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {toc.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  {t.label}
                </a>
              ))}
            </nav>
          </div>
        </section>

        <div className="mx-auto w-full max-w-4xl space-y-14 px-4 py-10 sm:px-6 md:py-14">
          {/* Pattern */}
          <section id="pattern" className="scroll-mt-20">
            <SectionTitle eyebrow="Exam at a glance" title="CET 12th Level pattern (2026)" />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CET_STATS.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                  <div className="text-2xl font-bold tabular-nums text-primary">{s.value}</div>
                  <div className="mt-0.5 text-xs font-medium text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Conducted offline (OMR) by the {CET_PATTERN.conductedBy}. Each question carries{" "}
              {CET_PATTERN.marksPerQuestion} marks, so a wrong answer costs about 0.67 marks. The CET
              score is a qualifying gate for Rajasthan&apos;s 12th-level recruitments — the main
              exams for each post are held separately.
            </p>
          </section>

          {/* Option E */}
          <section id="option-e" className="scroll-mt-20">
            <SectionTitle eyebrow="Most important rule" title="Option E — skip safely" />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Every question has five options. A–D are answers; <b className="text-foreground">E</b>{" "}
              means &quot;प्रश्न का प्रयास नहीं किया गया&quot; (question not attempted). How you
              skip a question changes your score:
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <RuleCard
                icon={CheckCircle2}
                tone="success"
                title="Right answer"
                body="+2 marks"
              />
              <RuleCard
                icon={CircleSlash}
                tone="primary"
                title="Marked option E"
                body="0 marks — no penalty. This is the safe way to skip."
              />
              <RuleCard
                icon={XCircle}
                tone="destructive"
                title="Wrong answer or all 5 blank"
                body="−1/3 of the marks (≈ −0.67)"
              />
            </div>
            <div className="mt-4 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <p className="leading-relaxed">
                <b>Disqualification:</b> if more than {CET_PATTERN.blankDisqualifyPercent}% of
                questions (more than 12 of 120) have no bubble filled at all, the candidate is
                disqualified. Always mark at least option E.
              </p>
            </div>
          </section>

          {/* Subjects */}
          <section id="subjects" className="scroll-mt-20">
            <SectionTitle
              eyebrow="Syllabus"
              title="13 subjects, question by question"
            />
            <p className="mt-3 text-sm text-muted-foreground">
              Rajasthan-specific subjects (history, culture, geography, polity, economy) make up 47
              of the 120 questions — that is where your preparation pays back most.
            </p>
            <ul className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {CET_SUBJECTS.map((s) => (
                <li key={s.en} className="flex items-start gap-3 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-bold tabular-nums text-primary">
                    {s.questions}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold leading-snug">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.en} · {s.questions} Q · {s.questions * 2} marks
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.tip}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Plan */}
          <section id="plan" className="scroll-mt-20">
            <SectionTitle eyebrow="Free plan" title="A 4-week plan you can start today" />
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {STUDY_PLAN.map((w) => (
                <li key={w.week} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <CalendarDays className="h-4 w-4" /> {w.week}
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold">{w.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {w.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          {/* Exam day */}
          <section id="exam-day" className="scroll-mt-20">
            <SectionTitle eyebrow="Strategy" title="On exam day" />
            <ol className="mt-5 space-y-3">
              {EXAM_DAY_TIPS.map((tip, i) => (
                <li key={tip} className="flex gap-3 rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> 150 min ÷ 120 questions ≈ 75 seconds per question.
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-20">
            <SectionTitle eyebrow="Questions" title="Frequently asked" />
            <FaqList className="mt-5" />
          </section>

          {/* CTA */}
          <section className="rounded-3xl border border-primary/30 bg-primary/10 p-6 text-center sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight">Practise it, don&apos;t just read it</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Start your daily streak, take topic quizzes and full mocks with the real option E
              marking — free.
            </p>
            <Link
              href="/auth/register"
              className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Start practising free <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Based on the RSSB 2026 notification. Rules can change — always confirm the latest
              notification on{" "}
              <a
                href={CET_PATTERN.officialSite}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                rssb.rajasthan.gov.in
              </a>
              .
            </span>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>
      <h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

const toneClasses = {
  success: "border-success/30 bg-success/10 text-success",
  primary: "border-primary/30 bg-primary/10 text-primary",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
} as const;

function RuleCard({
  icon: Icon,
  tone,
  title,
  body,
}: {
  icon: typeof CheckCircle2;
  tone: keyof typeof toneClasses;
  title: string;
  body: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <Icon className="h-5 w-5" />
      <div className="mt-2 text-sm font-semibold text-foreground">{title}</div>
      <div className="mt-0.5 text-sm text-muted-foreground">{body}</div>
    </div>
  );
}
