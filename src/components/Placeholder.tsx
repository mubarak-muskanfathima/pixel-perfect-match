import { AppShell } from "@/components/AppShell";
import { RequireRole } from "@/components/RequireRole";
import type { AppRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";

export function Placeholder({
  role,
  title,
  subtitle,
  body,
}: {
  role: AppRole;
  title: string;
  subtitle?: string;
  body?: string;
}) {
  return (
    <RequireRole role={role}>
      <AppShell role={role} title={title} subtitle={subtitle}>
        <Card className="p-10 text-center">
          <div className="mx-auto max-w-md">
            <h2 className="font-display text-xl">Coming together</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {body ??
                "This section of the system is being built. The core data model, authentication, and role routing are already wired up."}
            </p>
          </div>
        </Card>
      </AppShell>
    </RequireRole>
  );
}
