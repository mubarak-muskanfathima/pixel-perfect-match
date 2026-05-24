import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "hod" | "faculty" | "student";

export interface AuthState {
  session: Session | null;
  userId: string | null;
  email: string | null;
  roles: AppRole[];
  loading: boolean;
  primaryRole: AppRole | null;
}

const ROLE_PRIORITY: AppRole[] = ["admin", "hod", "faculty", "student"];

export function useAuth(): AuthState & {
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = useCallback(async (uid: string | null) => {
    if (!uid) {
      setRoles([]);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);
    setRoles((data ?? []).map((r) => r.role as AppRole));
  }, []);

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setSession(s);
      // Defer role fetch so we don't deadlock on auth callback
      setTimeout(() => {
        loadRoles(s?.user?.id ?? null);
      }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      loadRoles(data.session?.user?.id ?? null).finally(() => setLoading(false));
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadRoles]);

  const primaryRole =
    ROLE_PRIORITY.find((r) => roles.includes(r)) ?? null;

  return {
    session,
    userId: session?.user?.id ?? null,
    email: session?.user?.email ?? null,
    roles,
    primaryRole,
    loading,
    refresh: () => loadRoles(session?.user?.id ?? null),
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}

export function roleHome(role: AppRole | null): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "hod":
      return "/hod";
    case "faculty":
      return "/faculty";
    case "student":
      return "/student";
    default:
      return "/onboarding";
  }
}
