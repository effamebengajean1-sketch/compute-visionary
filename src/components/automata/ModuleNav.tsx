// CompilLab — Navigation entre les modules.
import { Link } from "@tanstack/react-router";
import { Workflow, Regex } from "lucide-react";

export function ModuleNav() {
  return (
    <nav className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <Link
        to="/"
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-background [&.active]:text-foreground [&.active]:shadow-sm"
        activeOptions={{ exact: true }}
      >
        <Workflow className="h-4 w-4" /> Automates
      </Link>
      <Link
        to="/regex"
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-background [&.active]:text-foreground [&.active]:shadow-sm"
      >
        <Regex className="h-4 w-4" /> Expressions régulières
      </Link>
    </nav>
  );
}
