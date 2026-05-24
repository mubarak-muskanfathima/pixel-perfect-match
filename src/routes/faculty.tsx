import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/faculty")({
  component: () => (
    <Placeholder
      role="faculty"
      title="My classes"
      subtitle="Enter question-wise mid marks for your assigned subjects."
    />
  ),
});
