"use client";

import { useState } from "react";
import { Bug, Linkedin, Mail, MessageSquarePlus, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactFormDialog } from "@/components/landing/ContactFormDialog";
import type { ContactCategory, ContactSource } from "@/types/api";

type Props = {
  userName?: string;
  userEmail?: string;
};

export function ProfileSupportPanel({ userName, userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<ContactSource>("feedback");
  const [category, setCategory] = useState<ContactCategory>("feedback");

  const openForm = (nextSource: ContactSource, nextCategory: ContactCategory) => {
    setSource(nextSource);
    setCategory(nextCategory);
    setOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <Card className="space-y-3 p-5">
          <div>
            <div className="text-sm font-semibold">Need help or want to talk?</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              You can reach us without leaving the app. Send feedback, report a bug, or
              contact us about careers, partnerships, or anything else.
            </p>
          </div>

          <div className="grid gap-2">
            <Button
              type="button"
              className="h-auto justify-start gap-3 px-4 py-3"
              onClick={() => openForm("feedback", "feedback")}
            >
              <MessageSquarePlus className="h-4 w-4 shrink-0" />
              <span className="text-left">
                <span className="block text-sm font-semibold">Send feedback</span>
                <span className="block text-[11px] font-normal opacity-90">
                  Ideas, suggestions, or what to improve
                </span>
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 px-4 py-3"
              onClick={() => openForm("feedback", "bug")}
            >
              <Bug className="h-4 w-4 shrink-0" />
              <span className="text-left">
                <span className="block text-sm font-semibold">Report a bug</span>
                <span className="block text-[11px] font-normal text-muted-foreground">
                  Something broken? Attach a screenshot if you can
                </span>
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 px-4 py-3"
              onClick={() => openForm("contact", "general")}
            >
              <Send className="h-4 w-4 shrink-0" />
              <span className="text-left">
                <span className="block text-sm font-semibold">Contact us</span>
                <span className="block text-[11px] font-normal text-muted-foreground">
                  Careers, investors, partnerships, or general
                </span>
              </span>
            </Button>
          </div>
        </Card>

        <Card className="divide-y divide-border p-0">
          <a
            href="mailto:lokeshdevgan777@gmail.com"
            className="flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/60"
          >
            <Mail className="h-4 w-4 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Email</div>
              <div className="truncate text-xs text-muted-foreground">
                lokeshdevgan777@gmail.com
              </div>
            </div>
          </a>
          <a
            href="https://www.linkedin.com/in/lokeshkumar777/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/60"
          >
            <Linkedin className="h-4 w-4 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">LinkedIn</div>
              <div className="text-xs text-muted-foreground">Connect with the founder</div>
            </div>
          </a>
        </Card>
      </div>

      <ContactFormDialog
        open={open}
        onOpenChange={setOpen}
        defaultSource={source}
        defaultCategory={category}
        defaultName={userName}
        defaultEmail={userEmail}
      />
    </>
  );
}
