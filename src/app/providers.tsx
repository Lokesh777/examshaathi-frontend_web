"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/store/authStore";
import { ThemeProvider } from "@/lib/theme";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{ classNames: { toast: "font-sans" } }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
