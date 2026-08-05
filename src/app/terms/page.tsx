import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/atoms/BrandMark";

export const metadata: Metadata = {
  title: "Terms of Use — ExamSaathi",
  description: "Terms for using ExamSaathi practice, mocks, and AI Tutor.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold">
        <BrandMark className="h-8 w-8 rounded-lg" />
        ExamSaathi
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 4 August 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Service</h2>
          <p>
            ExamSaathi provides exam practice tools (topic quizzes, daily challenges, mocks, old
            papers, and AI tutoring). Features may change as we improve the product.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Accounts</h2>
          <p>
            You are responsible for keeping your login secure and for activity under your account.
            Provide accurate registration information.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Acceptable use</h2>
          <p>
            Do not abuse generation/chat rate limits, attempt to attack the service, scrape content
            at scale, share account access in ways that harm other students, or upload illegal
            content via contact forms.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Content accuracy</h2>
          <p>
            AI-generated questions and tutor answers can contain errors. Use ExamSaathi as a study
            aid alongside official syllabus and trusted materials — not as the sole source of truth
            for exam answers.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Availability</h2>
          <p>
            We aim for reliable uptime but do not guarantee uninterrupted access. Maintenance or
            third-party outages (hosting, AI APIs) may occur.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Contact</h2>
          <p>
            <a className="text-primary hover:underline" href="mailto:lokeshdevgan777@gmail.com">
              lokeshdevgan777@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
