import { useNavigate } from "react-router-dom";
import { User, Settings, Trophy, TrendingUp, Crown, ChevronRight, Bell, Shield, LogOut, CreditCard, Star, Award, Zap } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const navigate = useNavigate();

  const user = {
    name: "Ahmet Yılmaz",
    email: "ahmet@email.com",
    plan: "Pro",
    joinDate: "Ocak 2024",
    avatar: null,
  };

  const stats = [
    { label: "Toplam Tahmin", value: "156", icon: TrendingUp, color: "text-primary", bgColor: "bg-primary/10" },
    { label: "Başarı Oranı", value: "78%", icon: Trophy, color: "text-green-500", bgColor: "bg-green-500/10" },
    { label: "Kazanç", value: "+₺4,520", icon: CreditCard, color: "text-accent", bgColor: "bg-accent/10" },
  ];

  const achievements = [
    { icon: Star, label: "İlk Tahmin", completed: true },
    { icon: Trophy, label: "5 Seri", completed: true },
    { icon: Award, label: "50 Tahmin", completed: true },
    { icon: Zap, label: "Pro Üye", completed: true },
  ];

  const menuItems = [
    { icon: Crown, label: "Premium Üyelik", action: () => navigate("/premium"), badge: user.plan, badgeColor: "bg-primary/15 text-primary" },
    { icon: Bell, label: "Bildirimler", action: () => navigate("/notifications"), badge: "3", badgeColor: "bg-accent/15 text-accent" },
    { icon: Shield, label: "Gizlilik & Güvenlik", action: () => {} },
    { icon: Settings, label: "Ayarlar", action: () => navigate("/settings") },
  ];

  const handleLogout = () => {
    navigate("/auth");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Profil</h1>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-3 py-1 rounded-full bg-accent text-accent-foreground font-bold">
                  {user.plan}
                </span>
                <span className="text-xs text-muted-foreground">Üye: {user.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-muted/50 rounded-2xl p-4 text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bgColor} mb-2`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">BAŞARILAR</h3>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              {achievements.map((achievement, idx) => {
                const Icon = achievement.icon;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      achievement.completed ? 'bg-primary' : 'bg-muted'
                    }`}>
                      <Icon className={`w-6 h-6 ${achievement.completed ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <span className="text-xs text-muted-foreground text-center">{achievement.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Premium Banner */}
        <button
          onClick={() => navigate("/premium")}
          className="w-full rounded-2xl p-5 relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-accent"
        >
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-white text-lg">Elite'e Yükselt</p>
              <p className="text-sm text-white/80">AI destekli analizler ve daha fazlası</p>
            </div>
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Menu */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${item.badgeColor || 'bg-muted text-muted-foreground'}`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-14 rounded-2xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Çıkış Yap
        </Button>
      </div>
    </AppLayout>
  );
};

export default Profile;
