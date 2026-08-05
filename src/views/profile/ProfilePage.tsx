"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  GraduationCap,
  KeyRound,
  Loader2,
  LogOut,
  MonitorSmartphone,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/lib/theme";
import { useExam } from "@/lib/exam-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/organisms/ChangePasswordForm";
import { AdminFeedbackPanel } from "@/components/profile/AdminFeedbackPanel";
import { ProfileSupportPanel } from "@/components/profile/ProfileSupportPanel";
import { useNavigate } from "@/lib/navigation";

type ProfileTab = "account" | "support" | "inbox";

function parseTab(raw: string | null, isAdmin: boolean): ProfileTab {
  if (raw === "support") return "support";
  if (raw === "inbox" && isAdmin) return "inbox";
  return "account";
}

export function ProfilePage() {
  const { user, logout, logoutAllDevices } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const { exams, selectedExam, isLoading, select } = useExam();
  const [pending, setPending] = useState<"one" | "all" | null>(null);
  const isAdmin = user?.role === "admin";
  const [tab, setTab] = useState<ProfileTab>(() =>
    parseTab(searchParams.get("tab"), isAdmin)
  );

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab"), isAdmin));
  }, [searchParams, isAdmin]);

  const selectTab = (next: ProfileTab) => {
    setTab(next);
    navigate({
      to: "/profile",
      search: next === "account" ? undefined : { tab: next },
      replace: true,
    });
  };

  const handleLogout = async () => {
    setPending("one");
    qc.clear();
    await logout();
    navigate({ to: "/auth", replace: true });
  };

  const handleLogoutAll = async () => {
    setPending("all");
    qc.clear();
    await logoutAllDevices();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card className="flex items-center gap-4 p-5">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {(user?.name ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-lg font-bold">{user?.name}</div>
          <div className="truncate text-sm text-muted-foreground">{user?.email}</div>
        </div>
      </Card>

      <div className="flex gap-1 rounded-full border border-border bg-secondary/60 p-1">
        <TabButton active={tab === "account"} onClick={() => selectTab("account")}>
          Account
        </TabButton>
        <TabButton active={tab === "support"} onClick={() => selectTab("support")}>
          Support
        </TabButton>
        {isAdmin && (
          <TabButton active={tab === "inbox"} onClick={() => selectTab("inbox")}>
            Inbox
          </TabButton>
        )}
      </div>

      {tab === "support" ? (
        <ProfileSupportPanel userName={user?.name} userEmail={user?.email} />
      ) : tab === "inbox" && isAdmin ? (
        <AdminFeedbackPanel />
      ) : (
        <>
          <Card className="p-0">
            <div className="flex items-center gap-3 px-5 py-4">
              <GraduationCap className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Exam</div>
                <div className="text-xs text-muted-foreground">
                  Switch the exam you&apos;re preparing for. Saved on this device.
                </div>
              </div>
            </div>
            <div className="divide-y divide-border border-t border-border">
              {isLoading ? (
                <div className="flex items-center gap-2 px-5 py-4 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading exams…
                </div>
              ) : exams.length === 0 ? (
                <div className="px-5 py-4 text-xs text-muted-foreground">
                  No exams available yet.
                </div>
              ) : (
                exams.map((e) => {
                  const active = selectedExam?._id === e._id;
                  return (
                    <button
                      key={e._id}
                      type="button"
                      onClick={() => {
                        select(e._id);
                        navigate({
                          to: "/exams/$examId/topics",
                          params: { examId: e._id },
                        });
                      }}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-secondary/60"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{e.name}</div>
                        {e.slug && (
                          <div className="text-xs text-muted-foreground">{e.slug}</div>
                        )}
                      </div>
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="divide-y divide-border p-0">
            <button
              type="button"
              onClick={toggle}
              className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-secondary/60"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <div className="flex-1">
                <div className="text-sm font-semibold">Appearance</div>
                <div className="text-xs text-muted-foreground">
                  {theme === "dark" ? "Dark mode" : "Light mode"}
                </div>
              </div>
            </button>
          </Card>

          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <KeyRound className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-semibold">Change password</div>
                <div className="text-xs text-muted-foreground">
                  Enter your current password and pick a new one.
                </div>
              </div>
            </div>
            <ChangePasswordForm />
          </Card>

          <div className="space-y-3">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
              disabled={pending !== null}
            >
              {pending === "one" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Log out
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogoutAll}
              disabled={pending !== null}
            >
              {pending === "all" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MonitorSmartphone className="mr-2 h-4 w-4" />
              )}
              Log out from all devices
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
