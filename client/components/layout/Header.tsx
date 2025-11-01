import { Link, useLocation } from "react-router-dom";
import { Brain, BarChart3, UploadCloud, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/hooks/role";

export function Header() {
  const { role, setRole } = useRole();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/80">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-cyan-400/20 blur-md rounded-lg" />
            <div className="relative h-8 w-8 grid place-content-center rounded-lg bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground">
              <Brain className="h-5 w-5" />
            </div>
          </div>
          <span className="font-extrabold tracking-tight text-lg">AutoGrade AI</span>
        </Link>

      <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" label="Home" active={location.pathname === "/"} />
          <NavLink to="/dashboard" label="Dashboard" active={location.pathname.startsWith("/dashboard")} />
        </nav>

        <div className="flex items-center gap-3">
          <Select value={role} onValueChange={(v: "faculty" | "admin") => setRole(v)}>
            <SelectTrigger className="w-[140px] bg-card">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="faculty">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Faculty
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Admin
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Auth controls */}
          <AuthControls />

          <Button asChild>
            <Link to="/#upload" className="inline-flex items-center gap-2">
              <UploadCloud className="h-4 w-4" /> New Upload
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={
        "text-sm transition-colors " +
        (active ? "text-foreground" : "text-muted-foreground hover:text-foreground")
      }
    >
      {label}
    </Link>
  );
}
