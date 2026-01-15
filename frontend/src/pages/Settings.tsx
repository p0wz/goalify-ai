import { AppLayout } from "@/components/layout/AppLayout";
import { User, Mail, Bell, Shield, Palette, Globe, ChevronRight, Camera, Sparkles, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const settingsSections = [
  {
    title: "Hesap",
    items: [
      { icon: User, label: "Profil Bilgileri", description: "Ad, e-posta ve fotoğraf" },
      { icon: Shield, label: "Güvenlik", description: "Şifre ve iki faktörlü doğrulama" },
      { icon: Mail, label: "E-posta Tercihleri", description: "Bildirim e-postaları" },
    ]
  },
  {
    title: "Uygulama",
    items: [
      { icon: Bell, label: "Bildirimler", description: "Push ve uygulama bildirimleri" },
      { icon: Globe, label: "Dil", description: "Uygulama dili" },
    ]
  }
];

const Settings = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <AppLayout>
      {/* Header Badge */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 brutalist-border bg-card shadow-brutalist-sm mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-display uppercase tracking-wider">Ayarlar</span>
        </div>
        <h1 className="brutalist-heading text-3xl mb-2">Hesap Ayarları</h1>
        <p className="text-muted-foreground">Hesap ve uygulama ayarlarınızı yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card-premium rounded-2xl p-6">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 gradient-primary flex items-center justify-center shadow-glow-primary">
                <User className="w-12 h-12 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-card brutalist-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-brutalist-sm">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-xl font-display mb-1">Ahmet Yılmaz</h3>
            <p className="text-muted-foreground mb-4">ahmet@email.com</p>

            <div className="inline-flex items-center gap-2 px-4 py-2 gradient-accent text-white text-sm font-display uppercase tracking-wider">
              Premium Üye
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Üyelik</span>
              <span className="font-display">Premium</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kayıt Tarihi</span>
              <span className="font-display">12 Ocak 2024</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Toplam Tahmin</span>
              <span className="font-display">247</span>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme Switcher */}
          <div className="glass-card-premium rounded-2xl overflow-hidden animate-slide-up">
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
                    <p className="text-sm text-muted-foreground">Açık veya koyu tema seçin</p>
                  </div>
                </div>
                <div className="flex brutalist-border shadow-brutalist-sm">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2 flex items-center gap-2 transition-colors ${resolvedTheme === 'light' ? 'bg-primary text-white' : 'bg-card hover:bg-muted'
                      }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-display">Açık</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2 flex items-center gap-2 transition-colors ${resolvedTheme === 'dark' ? 'bg-primary text-white' : 'bg-card hover:bg-muted'
                      }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-display">Koyu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {settingsSections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className={cn(
                "glass-card-premium rounded-2xl overflow-hidden animate-slide-up"
              )}
              style={{ animationDelay: `${(sectionIndex + 1) * 100}ms` }}
            >
              <div className="p-4 border-b border-border">
                <h3 className="font-display uppercase tracking-wider text-sm">{section.title}</h3>
              </div>

              <div className="divide-y divide-border">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
