import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function Crest({ className }: { className?: string }) {
  return (
    <div className={"flex items-center gap-3 " + (className ?? "")}>
      <div className="grid h-10 w-10 place-items-center rounded-md bg-crest-gradient text-primary-foreground shadow-sm">
        <GraduationCap className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-base font-semibold tracking-tight">
          VEMU Institute
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Mid Marks System
        </div>
      </div>
    </div>
  );
}

export function CrestLink() {
  return (
    <Link to="/" className="hover:opacity-90">
      <Crest />
    </Link>
  );
}
