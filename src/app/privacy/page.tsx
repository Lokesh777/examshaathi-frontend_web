import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/atoms/BrandMark";

export const metadata: Metadata = {
  title: "Privacy Policy — ExamSaathi",
  description: "How ExamSaathi collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold">
        <BrandMark className="h-8 w-8 rounded-lg" />
        ExamSaathi
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 4 August 2026</p>

      <div className="prose-sm mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">What we collect</h2>
          <p>
            Account details you provide (name, email), quiz attempts and scores, chat messages you
            send to AI Tutor, contact/feedback submissions (and optional screenshots), and basic
            technical logs needed to run the service securely.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">How we use it</h2>
          <p>
            To authenticate you, deliver practice quizzes and mocks, power AI tutoring and question
            generation, show leaderboards/progress, respond to support messages, and improve
            ExamSaathi.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">AI processing</h2>
          <p>
            Doubts and generation prompts may be sent to third-party AI providers (e.g. Groq) to
            produce answers and questions. Do not paste sensitive personal data into chat.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Cookies &amp; sessions</h2>
          <p>
            We use an HttpOnly refresh cookie for login sessions and store a short-lived access token
            in browser memory. Theme preference may be stored in localStorage.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Sharing</h2>
          <p>
            We do not sell your personal data. We use infrastructure and email/AI vendors solely to
            operate the product. Contact form data may be stored in our database and optionally
            synced to our support spreadsheet.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Contact</h2>
          <p>
            Questions about privacy:{" "}
            <a className="text-primary hover:underline" href="mailto:lokeshdevgan777@gmail.com">
              lokeshdevgan777@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
