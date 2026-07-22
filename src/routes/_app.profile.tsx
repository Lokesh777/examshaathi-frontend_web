import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Check, GraduationCap, Loader2, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme";
import { useExam } from "@/lib/exam-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, clear } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { exams, selectedExam, isLoading, select } = useExam();

  const logout = async () => {
    qc.clear();
    await clear();
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

      <Card className="p-0">
        <div className="flex items-center gap-3 px-5 py-4">
          <GraduationCap className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Exam</div>
            <div className="text-xs text-muted-foreground">
              Switch the exam you're preparing for. Saved on this device.
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
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <div className="flex-1">
            <div className="text-sm font-semibold">Appearance</div>
            <div className="text-xs text-muted-foreground">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </div>
          </div>
        </button>
      </Card>

      <Button variant="destructive" className="w-full" onClick={logout}>
        <LogOut className="mr-2 h-4 w-4" /> Log out
      </Button>
    </div>
  );
}