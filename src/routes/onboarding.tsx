import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Crest } from "@/components/Crest";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const auth = useAuth();
  return (
    <div className="grid min-h-screen place-items-center bg-mist-gradient p-6">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <Crest className="mb-6" />
        <h1 className="font-display text-2xl font-semibold">Awaiting role assignment</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account ({auth.email}) is active, but no role has been assigned yet.
          Please contact your administrator.
        </p>
        <Button className="mt-6 w-full" variant="outline" onClick={auth.signOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
