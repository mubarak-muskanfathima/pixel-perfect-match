import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/faculty/reports")({
  component: () => (
    <Placeholder role="faculty" title="Class & subject reports" />
  ),
});
