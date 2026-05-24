import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <Placeholder
      role="admin"
      title="Users & Roles"
      subtitle="Manage staff and student accounts, assign roles."
    />
  ),
});
