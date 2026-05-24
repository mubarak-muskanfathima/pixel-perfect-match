import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/hod/reports")({
  component: () => (
    <Placeholder role="hod" title="Department reports" />
  ),
});
