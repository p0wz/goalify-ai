import { useEffect, useState } from "react";
import { Bell, User, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

export const Header = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setUser(data.user);
        })
        .catch(() => { });

      // Check for unread notifications
      const lastRead = localStorage.getItem('lastNotificationRead');
      const lastNotif = localStorage.getItem('lastNotification');
      if (lastNotif && (!lastRead || lastNotif > lastRead)) {
        setHasUnread(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Get display name from email or name
  const displayName = user?.name || user?.email?.split('@')[0] || (language === 'tr' ? 'Kullanıcı' : 'User');
  const planLabel = user?.plan === 'pro' ? 'Premium' : (language === 'tr' ? 'Ücretsiz' : 'Free');

  return (
    <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 px-6">
      <div className="h-full flex items-center justify-end gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <Link
          to="/notifications"
          onClick={() => {
            localStorage.setItem('lastNotificationRead', new Date().toISOString());
            setHasUnread(false);
          }}
          className="p-2.5 rounded-xl hover:bg-secondary transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
          )}
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{planLabel}</p>
          </div>
        </Link>
      </div>
    </header>
  );
};
