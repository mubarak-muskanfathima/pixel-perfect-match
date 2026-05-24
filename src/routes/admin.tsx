import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/admin")({
  component: () => (
    <Placeholder
      role="admin"
      title="Administrator overview"
      subtitle="Institution-wide controls for the Mid Marks System."
    />
  ),
});
