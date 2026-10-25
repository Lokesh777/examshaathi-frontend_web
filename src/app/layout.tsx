import type { Metadata, Viewport } from "next";
import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExamSaathi — Daily streak, topic banks & AI tutor for CET",
  description:
    "Rajasthan CET prep with daily streak challenges, shared AI topic question banks, topic readiness quizzes, pattern-true mocks, old papers, and a Hindi/English AI tutor.",
  authors: [{ name: "ExamSaathi" }],
  applicationName: "ExamSaathi",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://examshaathicom.vercel.app"),
  openGraph: {
    title: "ExamSaathi — AI CET preparation",
    description:
      "Daily streaks, shared topic banks, mocks, and a Hindi/English AI tutor for Rajasthan CET.",
    url: "https://examshaathicom.vercel.app",
    siteName: "ExamSaathi",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  // Lets env(safe-area-inset-*) work under the iPhone notch / home bar
  viewportFit: "cover",
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
