"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitContactForm } from "@/services/contact/contactService";
import type { ContactCategory, ContactSource } from "@/types/api";

const CATEGORY_OPTIONS: { value: ContactCategory; label: string }[] = [
  { value: "feedback", label: "Product feedback" },
  { value: "bug", label: "Bug / issue" },
  { value: "feature_request", label: "Feature request" },
  { value: "career", label: "Career / hiring" },
  { value: "investor", label: "Investor / partnership interest" },
  { value: "partnership", label: "Business partnership" },
  { value: "general", label: "General contact" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefills category + source when opened from footer */
  defaultSource?: ContactSource;
  defaultCategory?: ContactCategory;
  /** Prefill from logged-in profile */
  defaultName?: string;
  defaultEmail?: string;
};

export function ContactFormDialog({
  open,
  onOpenChange,
  defaultSource = "contact",
  defaultCategory = "general",
  defaultName = "",
  defaultEmail = "",
}: Props) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [category, setCategory] = useState<ContactCategory>(defaultCategory);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCategory(defaultCategory);
      setName(defaultName || "");
      setEmail(defaultEmail || "");
    }
  }, [open, defaultCategory, defaultName, defaultEmail]);

  const reset = () => {
    setName(defaultName || "");
    setEmail(defaultEmail || "");
    setSubject("");
    setMessage("");
    setFile(null);
    setCategory(defaultCategory);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await submitContactForm({
        name,
        email,
        category,
        subject,
        message,
        source: defaultSource,
        screenshot: file,
      });
      toast.success(res.message || "Thanks — we received your message.");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    defaultSource === "feedback" ? "Send feedback" : "Contact us";
  const description =
    defaultSource === "feedback"
      ? "Tell us what works, what’s broken, or what you’d like next. Optional screenshot welcome."
      : "Investors, careers, partnerships, or anything else — leave a message and we’ll get back to you.";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!submitting) onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as ContactCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-subject">Subject</Label>
            <Input
              id="contact-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              minLength={3}
              placeholder="Short summary"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
              rows={5}
              placeholder="Write your message…"
              className="resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-shot">Screenshot (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="contact-shot"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="cursor-pointer text-xs file:mr-2"
              />
              {file && (
                <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                  <Upload className="h-3 w-3" />
                  {file.name.slice(0, 18)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">PNG/JPG up to 5MB.</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
