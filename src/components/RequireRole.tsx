import type { AppRole } from "@/lib/auth";
import { useAuth } from "@/lib/auth";
import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function RequireRole({
  role,
  children,
}: {
  role: AppRole;
  children: ReactNode;
}) {
  const auth = useAuth();
  if (auth.loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist-gradient">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!auth.session) return <Navigate to="/login" />;
  if (!auth.roles.includes(role)) {
    return <Navigate to="/onboarding" />;
  }
  return <>{children}</>;
}
