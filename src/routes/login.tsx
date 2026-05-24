import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Crest } from "@/components/Crest";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Sign in · VEMU Mid Marks" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-mist-gradient">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden bg-crest-gradient text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
          <Crest className="text-white [&_*]:text-white" />
          <div className="space-y-6">
            <h2 className="font-display text-4xl leading-tight">
              A trusted system for academic excellence.
            </h2>
            <p className="max-w-md text-white/80">
              Manage mid-term assessments, approvals, and reporting for the VEMU
              academic community — securely and transparently.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-6">
              {[
                ["Faculty", "Question-wise entry"],
                ["HOD", "Review & approve"],
                ["Student", "View internal marks"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-md border border-white/10 bg-white/5 p-3 backdrop-blur"
                >
                  <div className="text-xs uppercase tracking-wider text-white/60">
                    {k}
                  </div>
                  <div className="mt-1 text-sm font-medium">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-white/60">
            VEMU Institute of Technology (Autonomous)
          </div>
        </div>

        {/* Form */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <Crest />
            </div>
            <h1 className="font-display text-3xl font-semibold">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Access your dashboard with institutional credentials.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@vemu.org"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              First-time setup?{" "}
              <Link to="/signup" className="font-medium text-accent hover:underline">
                Create the initial admin account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
