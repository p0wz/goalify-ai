import { AppLayout } from "@/components/layout/AppLayout";
import { User, Mail, Bell, Shield, Palette, Globe, ChevronRight, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

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
      { icon: Palette, label: "Görünüm", description: "Tema ve renk tercihleri" },
      { icon: Globe, label: "Dil", description: "Uygulama dili" },
    ]
  }
];

const Settings = () => {
  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display mb-2">Ayarlar</h1>
        <p className="text-muted-foreground">Hesap ve uygulama ayarlarınızı yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card-premium rounded-2xl p-6">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-12 h-12 text-primary-foreground" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-xl font-display mb-1">Ahmet Yılmaz</h3>
            <p className="text-muted-foreground mb-4">ahmet@email.com</p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-accent text-accent-foreground text-sm font-medium">
              Premium Üye
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Üyelik</span>
              <span className="font-medium">Premium</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kayıt Tarihi</span>
              <span className="font-medium">12 Ocak 2024</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Toplam Tahmin</span>
              <span className="font-medium">247</span>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <div 
              key={section.title}
              className={cn(
                "glass-card-premium rounded-2xl overflow-hidden animate-slide-up"
              )}
              style={{ animationDelay: `${sectionIndex * 100}ms` }}
            >
              <div className="p-4 border-b border-border">
                <h3 className="font-display">{section.title}</h3>
              </div>
              
              <div className="divide-y divide-border">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
