import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/admin/academics")({
  component: () => (
    <Placeholder
      role="admin"
      title="Subjects & Students"
      subtitle="Departments, branches, semesters, sections, subjects, and student rosters."
    />
  ),
});
