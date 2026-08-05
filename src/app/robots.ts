import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/exams/", "/auth/", "/result", "/profile", "/leaderboard/"],
    },
    sitemap: "https://examshaathicom.vercel.app/sitemap.xml",
  };
}
