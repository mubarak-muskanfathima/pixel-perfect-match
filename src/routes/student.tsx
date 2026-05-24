import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/student")({
  component: () => (
    <Placeholder
      role="student"
      title="My marks"
      subtitle="View your subject-wise internal marks."
    />
  ),
});
