import type { Metadata } from "next";
import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExamSaathi — AI-powered CET Preparation",
  description:
    "Crack CET, SSC, banking and more with an AI tutor, adaptive mock tests, previous papers and topic-wise quizzes.",
  authors: [{ name: "ExamSaathi" }],
  themeColor: "#4f46e5",
  openGraph: {
    title: "ExamSaathi — AI-powered CET Preparation",
    description:
      "Crack CET, SSC, banking and more with an AI tutor, adaptive mock tests, previous papers and topic-wise quizzes.",
    type: "website",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ece27fb8-3280-4ebc-9f1a-a4c875eebb0d/id-preview-9996ecd5--efdef429-481b-40b7-9f8c-8ba1d989f052.lovable.app-1784727127777.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExamSaathi — AI-powered CET Preparation",
    description:
      "Crack CET, SSC, banking and more with an AI tutor, adaptive mock tests, previous papers and topic-wise quizzes.",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ece27fb8-3280-4ebc-9f1a-a4c875eebb0d/id-preview-9996ecd5--efdef429-481b-40b7-9f8c-8ba1d989f052.lovable.app-1784727127777.png",
    ],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
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
