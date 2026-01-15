import { Link, useLocation } from "react-router-dom";
import { Trophy, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const navLinks = [
  { label: "Özellikler", href: "/#features" },
  { label: "Nasıl Çalışır", href: "/#how-it-works" },
  { label: "Fiyatlandırma", href: "/pricing" },
  { label: "Hakkımızda", href: "/about" },
  { label: "İletişim", href: "/contact" },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary flex items-center justify-center shadow-brutalist-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display-bold text-lg leading-none text-gradient">SENTIO</span>
              <span className="text-xs font-display uppercase tracking-widest text-muted-foreground">PICKS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
                {location.pathname === link.href && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 gradient-primary" />
                )}
              </Link>
            ))}
          </div>

          {/* Theme Toggle + CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </button>
            <Link to="/login">
              <Button variant="ghost" className="font-display">
                Giriş Yap
              </Button>
            </Link>
            <Link to="/auth">
              <button className="btn-brutalist h-10 px-6 text-sm">
                Ücretsiz Başla
              </button>
            </Link>
          </div>

          {/* Mobile: Theme Toggle + Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-t border-border">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block py-2 text-muted-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-3 border-t border-border">
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full font-display">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/auth" className="block">
                <button className="btn-brutalist w-full h-12">
                  Ücretsiz Başla
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
