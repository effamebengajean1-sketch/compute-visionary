// CompilLab — Navigation entre les modules.
import { Link } from "@tanstack/react-router";
import { Home, Workflow, Regex } from "lucide-react";

const linkClass =
  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-background [&.active]:text-foreground [&.active]:shadow-sm";

export function ModuleNav() {
  return (
    <nav className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <Link to="/" className={linkClass} activeOptions={{ exact: true }}>
        <Home className="h-4 w-4" /> Accueil
      </Link>
      <Link to="/atelier" className={linkClass}>
        <Workflow className="h-4 w-4" /> Automates
      </Link>
      <Link to="/regex" className={linkClass}>
        <Regex className="h-4 w-4" /> Expressions régulières
      </Link>
    </nav>
  );
}
