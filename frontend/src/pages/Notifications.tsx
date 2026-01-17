import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Bell, CheckCircle2, Trophy, X, Clock, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

interface Notification {
  id: string;
  type: "won" | "lost" | "pending" | "refund";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/bets/approved`, { headers });
      const data = await res.json();

      if (data.success && data.bets) {
        // Convert settled bets to notifications
        const settledBets = data.bets
          .filter((bet: any) => bet.status !== 'PENDING')
          .slice(0, 20) // Last 20 results
          .map((bet: any) => {
            const isWon = bet.status === 'WON';
            const isLost = bet.status === 'LOST';

            return {
              id: bet.id,
              type: bet.status.toLowerCase(),
              title: isWon ? 'Tahmin Kazandı! 🎉' : isLost ? 'Tahmin Kaybetti' : 'Sonuç: ' + bet.status,
              description: `${bet.homeTeam} vs ${bet.awayTeam} - ${bet.market} ${bet.finalScore ? `(${bet.finalScore})` : ''}`,
              time: formatTime(bet.settledAt || bet.approvedAt),
              read: true, // Mark as read by default for now
            };
          });

        setNotifications(settledBets);

        // Update last notification time for header badge
        if (settledBets.length > 0) {
          localStorage.setItem('lastNotification', new Date().toISOString());
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Mark as read when visiting page
    localStorage.setItem('lastNotificationRead', new Date().toISOString());
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "won":
        return <Trophy className="w-5 h-5 text-green-500" />;
      case "lost":
        return <X className="w-5 h-5 text-red-500" />;
      case "refund":
        return <RefreshCw className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-accent" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "won":
        return "bg-green-500/10";
      case "lost":
        return "bg-red-500/10";
      case "refund":
        return "bg-yellow-500/10";
      default:
        return "bg-accent/10";
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="brutalist-heading text-2xl">Bildirimler</h1>
          <p className="text-sm text-muted-foreground mt-1">Tahmin sonuçları ve güncellemeler</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="flex items-center gap-2 px-4 py-2 text-destructive bg-destructive/10 rounded-xl hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!loading && notifications.length === 0 && (
        <div className="glass-card-premium rounded-2xl p-12 text-center">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-display text-foreground mb-2">Bildirim Yok</h3>
          <p className="text-muted-foreground">Tahmin sonuçları burada görünecek.</p>
        </div>
      )}

      {/* Notifications List */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className={cn(
                "glass-card-premium rounded-2xl p-5 card-hover animate-slide-up",
                notification.type === "won" && "border-green-500/20",
                notification.type === "lost" && "border-red-500/20"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", getIconBg(notification.type))}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-display text-foreground">{notification.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      )}
    </AppLayout>
  );
};

export default Notifications;
