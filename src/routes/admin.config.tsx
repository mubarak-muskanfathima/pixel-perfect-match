import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/admin/config")({
  component: () => (
    <Placeholder
      role="admin"
      title="Mark Limits"
      subtitle="Configure mid exam, assignment, and total internal mark limits."
    />
  ),
});
