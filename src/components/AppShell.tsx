import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Crest } from "./Crest";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth, type AppRole } from "@/lib/auth";

interface NavItem {
  to: string;
  label: string;
}

const NAV: Record<AppRole, NavItem[]> = {
  admin: [
    { to: "/admin", label: "Overview" },
    { to: "/admin/users", label: "Users & Roles" },
    { to: "/admin/academics", label: "Subjects & Students" },
    { to: "/admin/config", label: "Mark Limits" },
  ],
  hod: [
    { to: "/hod", label: "Approvals" },
    { to: "/hod/reports", label: "Department Reports" },
  ],
  faculty: [
    { to: "/faculty", label: "My Classes" },
    { to: "/faculty/reports", label: "Reports" },
  ],
  student: [{ to: "/student", label: "My Marks" }],
};

export function AppShell({
  role,
  children,
  title,
  subtitle,
  actions,
}: {
  role: AppRole;
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const items = NAV[role];
  const roleLabel: Record<AppRole, string> = {
    admin: "Administrator",
    hod: "Head of Department",
    faculty: "Faculty",
    student: "Student",
  };

  return (
    <div className="min-h-screen bg-mist-gradient">
      <header className="sticky top-0 z-30 border-b border-border bg-crest-gradient text-primary-foreground shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link to="/" className="hover:opacity-90">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-white/10 ring-1 ring-white/20">
                  <span className="font-display text-lg font-semibold">V</span>
                </div>
                <div className="leading-tight">
                  <div className="font-display text-base font-semibold tracking-tight">
                    VEMU Institute of Technology
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                    Mid Marks System · {roleLabel[role]}
                  </div>
                </div>
              </div>
            </Link>
            <nav className="hidden gap-1 md:flex">
              {items.map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  className="rounded-md px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                  activeProps={{
                    className:
                      "rounded-md px-3 py-1.5 text-sm bg-white/15 text-white",
                  }}
                >
                  {i.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs text-white/70 sm:block">
              <div className="text-white">{auth.email}</div>
              <div>{roleLabel[role]}</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={async () => {
                await auth.signOut();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {actions}
        </div>
        {children}
      </main>

      <footer className="border-t border-border bg-background/60 py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} VEMU Institute of Technology (Autonomous) ·
          Mid Marks System
        </div>
      </footer>
    </div>
  );
}

export { Crest };
