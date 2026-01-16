import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { User, Bell, Shield, Palette, Globe, Moon, Sun, Crown, LogOut } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

const Settings = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('tr');

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
    }

    // Load saved preferences
    const savedNotifs = localStorage.getItem('notificationsEnabled');
    if (savedNotifs !== null) setNotificationsEnabled(savedNotifs === 'true');

    const savedLang = localStorage.getItem('language');
    if (savedLang) setLanguage(savedLang);
  }, []);

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notificationsEnabled', String(newValue));
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Get display info from user data
  const displayName = user?.name || user?.email?.split('@')[0] || 'Kullanıcı';
  const displayEmail = user?.email || '';
  const isPremium = user?.plan === 'pro';

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="brutalist-heading text-2xl">Ayarlar</h1>
        <p className="text-sm text-muted-foreground mt-1">Hesap ve uygulama tercihlerinizi yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card-premium rounded-2xl p-6">
          <div className="text-center">
            <div className="w-20 h-20 gradient-primary flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-xl font-display mb-1">{displayName}</h3>
            <p className="text-muted-foreground text-sm mb-4">{displayEmail}</p>

            <div className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-display uppercase tracking-wider ${isPremium ? 'gradient-accent text-white' : 'bg-muted text-muted-foreground'}`}>
              <Crown className="w-4 h-4" />
              {isPremium ? 'Premium' : 'Free'}
            </div>

            {!isPremium && (
              <Link to="/premium" className="block mt-4">
                <button className="btn-brutalist w-full h-10 text-sm">
                  Premium'a Geç
                </button>
              </Link>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hesap Durumu</span>
              <span className="font-display text-green-500">Aktif</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Üyelik</span>
              <span className="font-display">{isPremium ? 'Premium' : 'Ücretsiz'}</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme */}
          <div className="glass-card-premium rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display uppercase tracking-wider text-sm">Görünüm</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 gradient-primary flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-display">Tema</p>
                    <p className="text-sm text-muted-foreground">Açık veya koyu tema</p>
                  </div>
                </div>
                <div className="flex brutalist-border shadow-brutalist-sm">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2 flex items-center gap-2 transition-colors ${resolvedTheme === 'light' ? 'bg-primary text-white' : 'bg-card hover:bg-muted'}`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-display">Açık</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2 flex items-center gap-2 transition-colors ${resolvedTheme === 'dark' ? 'bg-primary text-white' : 'bg-card hover:bg-muted'}`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-display">Koyu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card-premium rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display uppercase tracking-wider text-sm">Bildirimler</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-display">Push Bildirimleri</p>
                    <p className="text-sm text-muted-foreground">Tahmin sonuçları ve güncellemeler</p>
                  </div>
                </div>
                <button
                  onClick={toggleNotifications}
                  className={`relative w-14 h-8 rounded-full transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="glass-card-premium rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display uppercase tracking-wider text-sm">Dil</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-display">Uygulama Dili</p>
                    <p className="text-sm text-muted-foreground">Arayüz dili</p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="px-4 py-2 bg-card brutalist-border shadow-brutalist-sm font-display text-sm focus:outline-none"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security / Logout */}
          <div className="glass-card-premium rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display uppercase tracking-wider text-sm">Güvenlik</h3>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-display">Şifre</p>
                  <p className="text-sm text-muted-foreground">Son değişiklik: Bilinmiyor</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full p-4 flex items-center gap-4 hover:bg-destructive/10 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-destructive/20 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-display text-destructive">Çıkış Yap</p>
                  <p className="text-sm text-muted-foreground">Hesabınızdan çıkış yapın</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
