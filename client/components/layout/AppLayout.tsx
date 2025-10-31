import { Outlet, Link, useLocation } from "react-router-dom";
import { Header } from "./Header";

export default function AppLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-card/50">
        <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center gap-3 justify-between">
          <p>
            © {new Date().getFullYear()} AutoGrade AI. All rights reserved.
          </p>
          <nav className="flex items-center gap-6">
            <Link to="/" className={linkClass(location.pathname === "/")}>
              Home
            </Link>
            <Link
              to="/dashboard"
              className={linkClass(location.pathname.startsWith("/dashboard"))}
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function linkClass(active: boolean) {
  return (
    "text-muted-foreground hover:text-foreground transition-colors " +
    (active ? "text-foreground" : "")
  );
}
