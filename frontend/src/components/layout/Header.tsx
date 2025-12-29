import { Bell, Search, User, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 px-6">
      <div className="h-full flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Maç, takım veya lig ara..."
              className="w-full pl-10 pr-4 py-2 bg-secondary rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <Link
            to="/notifications"
            className="p-2.5 rounded-xl hover:bg-secondary transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
          </Link>
          
          <Link
            to="/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Ahmet Yılmaz</p>
              <p className="text-xs text-muted-foreground">Premium Üye</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
