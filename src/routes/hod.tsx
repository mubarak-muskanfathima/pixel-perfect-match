import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/hod")({
  component: () => (
    <Placeholder
      role="hod"
      title="Pending approvals"
      subtitle="Review and approve mid mark submissions from faculty."
    />
  ),
});
