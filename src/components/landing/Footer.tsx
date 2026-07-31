import { Link } from "@/lib/navigation";
import { GraduationCap, Linkedin, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="scroll-mt-20 border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">ExamSaathi</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Your AI study partner for competitive exams.
          </p>
        </div>

        <nav aria-label="Quick links">
          <h2 className="text-sm font-semibold">Quick Links</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li>
              <a href="#features" className="transition-colors hover:text-foreground">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="transition-colors hover:text-foreground">
                How It Works
              </a>
            </li>
            <li>
              <Link to="/auth" className="transition-colors hover:text-foreground">
                Login
              </Link>
            </li>
            <li>
              <Link to="/auth/register" className="transition-colors hover:text-foreground">
                Signup
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
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
                href="https://wa.me/917065667959"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4 text-primary" />
                WhatsApp: +91 70656 67959
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
  );
}