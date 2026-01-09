import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Over", href: "#" },
  { label: "Functies", href: "#" },
  { label: "Prijzen", href: "#" },
  { label: "Contact", href: "#" },
];

export function FeatureInfoBar() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-foreground">Bouwbioloog</span>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-sm hidden sm:flex"
            >
              Aanmelden
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-sm"
            >
              <span className="hidden sm:inline">Gratis registreren</span>
              <span className="sm:hidden">Start</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
