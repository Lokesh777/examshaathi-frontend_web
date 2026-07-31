import type { Metadata, Viewport } from "next";
import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExamSaathi — AI-powered CET Preparation",
  description:
    "Crack CET, SSC, banking and more with an AI tutor, adaptive mock tests, previous papers and topic-wise quizzes.",
  authors: [{ name: "ExamSaathi" }],
  applicationName: "ExamSaathi",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('examsaathi.theme');var d=t==='light'?false:true;document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark');}})();",
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AppProviders>
          <div className="min-h-screen bg-background text-foreground">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
