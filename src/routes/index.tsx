import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { roleHome, type AppRole } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.session.user.id);
    const list = (roles ?? []).map((r) => r.role as AppRole);
    const priority: AppRole[] = ["admin", "hod", "faculty", "student"];
    const primary = priority.find((p) => list.includes(p)) ?? null;
    throw redirect({ to: roleHome(primary) });
  },
  component: () => null,
});
