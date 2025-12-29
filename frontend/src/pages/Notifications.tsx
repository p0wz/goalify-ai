import { AppLayout } from "@/components/layout/AppLayout";
import { Bell, CheckCircle2, Trophy, TrendingUp, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    type: "win",
    title: "Tahmin Kazandı! 🎉",
    description: "Galatasaray vs Fenerbahçe maçındaki tahmininiz doğru çıktı.",
    time: "5 dakika önce",
    read: false
  },
  {
    id: 2,
    type: "prediction",
    title: "Yeni VIP Tahmin",
    description: "Barcelona vs Real Madrid için yeni bir VIP tahmin eklendi.",
    time: "1 saat önce",
    read: false
  },
  {
    id: 3,
    type: "match",
    title: "Maç Başlıyor",
    description: "Manchester City vs Liverpool maçı 30 dakika sonra başlayacak.",
    time: "2 saat önce",
    read: true
  },
  {
    id: 4,
    type: "premium",
    title: "Premium Avantajları",
    description: "Premium üyeliğinizle bugün 5 VIP tahmine erişebilirsiniz.",
    time: "5 saat önce",
    read: true
  },
  {
    id: 5,
    type: "win",
    title: "Seri Başarı!",
    description: "Son 5 tahmininizi doğru tahmin ettiniz. Tebrikler!",
    time: "1 gün önce",
    read: true
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "win":
      return <Trophy className="w-5 h-5 text-win" />;
    case "prediction":
      return <TrendingUp className="w-5 h-5 text-primary" />;
    case "match":
      return <Bell className="w-5 h-5 text-accent" />;
    case "premium":
      return <Star className="w-5 h-5 text-accent" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

const Notifications = () => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display mb-2">Bildirimler</h1>
          <p className="text-muted-foreground">{unreadCount} okunmamış bildirim</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
            <CheckCircle2 className="w-4 h-4" />
            Tümünü Okundu İşaretle
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-destructive bg-destructive/10 rounded-xl hover:bg-destructive/20 transition-colors">
            <Trash2 className="w-4 h-4" />
            Temizle
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <div 
            key={notification.id}
            className={cn(
              "glass-card-premium rounded-2xl p-5 card-hover animate-slide-up",
              !notification.read && "border-primary/30 bg-primary/5"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                notification.type === "win" && "bg-win/10",
                notification.type === "prediction" && "bg-primary/10",
                notification.type === "match" && "bg-accent/10",
                notification.type === "premium" && "bg-accent/10"
              )}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium">{notification.title}</h3>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Notifications;
