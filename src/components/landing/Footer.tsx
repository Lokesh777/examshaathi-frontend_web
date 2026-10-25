"use client";

import { useState } from "react";
import Link from "next/link";
import { Linkedin, Mail, MessageSquarePlus, Send } from "lucide-react";
import { BrandMark } from "@/components/atoms/BrandMark";
import { ContactFormDialog } from "@/components/landing/ContactFormDialog";
import type { ContactCategory, ContactSource } from "@/types/api";

export function Footer() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [source, setSource] = useState<ContactSource>("contact");
  const [category, setCategory] = useState<ContactCategory>("general");

  const openForm = (nextSource: ContactSource, nextCategory: ContactCategory) => {
    setSource(nextSource);
    setCategory(nextCategory);
    setDialogOpen(true);
  };

  return (
    <>
      <footer id="contact" className="scroll-mt-20 border-t border-border bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <BrandMark className="h-9 w-9 rounded-xl" />
              <span className="text-lg font-bold tracking-tight">ExamSaathi</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Daily streaks, shared topic banks, pattern-true mocks, and an AI tutor for CET and
              more.
            </p>
          </div>

          <nav aria-label="Quick links">
            <h2 className="text-sm font-semibold">Quick Links</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/guide" className="transition-colors hover:text-foreground">
                  CET 12th Level Guide
                </Link>
              </li>
              <li>
                <a href="/#features" className="transition-colors hover:text-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="/#faq" className="transition-colors hover:text-foreground">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="transition-colors hover:text-foreground">
                  How It Works
                </a>
              </li>
              <li>
                <Link href="/auth" className="transition-colors hover:text-foreground">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="transition-colors hover:text-foreground">
                  Signup
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-foreground">
                  Terms
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => openForm("contact", "general")}
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Send className="h-4 w-4 text-primary" />
                  Contact us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openForm("feedback", "feedback")}
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <MessageSquarePlus className="h-4 w-4 text-primary" />
                  Feedback
                </button>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/lokeshkumar777/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4 text-primary" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="mailto:lokeshdevgan777@gmail.com"
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  lokeshdevgan777@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <span>© 2026 ExamSaathi. All rights reserved.</span>
            <span>Made in Rajasthan 🇮🇳</span>
          </div>
        </div>
      </footer>

      <ContactFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultSource={source}
        defaultCategory={category}
      />
    </>
  );
}
