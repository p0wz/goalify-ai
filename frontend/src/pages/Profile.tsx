import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        toast.error("Profil yüklenemedi");
        if (res.status === 401) navigate('/login');
      }
    } catch (err) {
      toast.error("Bağlantı hatası");
    }
    setLoading(false);
  };

  if (loading) return null;

  return (
    <AppLayout>
      <div className="space-y-6 animate-slide-up max-w-2xl mx-auto">
        <Card className="glass-card shadow-2xl border-white/10">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 rounded-full gradient-primary mx-auto flex items-center justify-center mb-4 shadow-glow-primary">
              <User className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">{user?.email}</CardTitle>
            <CardDescription>
              <Badge variant="outline" className={`mt-2 ${user?.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                {user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4">
              <div className="bg-secondary/30 p-4 rounded-xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Üyelik Tipi</p>
                    <p className="font-semibold">{user?.plan === 'pro' ? 'PRO Üyelik' : 'Ücretsiz Plan'}</p>
                  </div>
                </div>
                {user?.plan === 'pro' && <Badge className="gradient-accent text-white">AKTİF</Badge>}
              </div>

              <div className="bg-secondary/30 p-4 rounded-xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-win" />
                  <div>
                    <p className="text-sm text-muted-foreground">Durum</p>
                    <p className="font-semibold">
                      {user?.plan === 'pro' ? 'Sınırsız Erişim' : 'Kısıtlı Erişim'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 p-4 rounded-xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Katılım Tarihi</p>
                    <p className="font-semibold">2024</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade CTA for Free users */}
            {user?.plan !== 'pro' && (
              <div className="bg-gradient-to-r from-accent/20 to-purple-500/20 p-6 rounded-2xl border border-accent/20 text-center space-y-3">
                <h3 className="font-bold text-lg text-accent">PRO'ya Geçin</h3>
                <p className="text-sm text-muted-foreground">
                  Tüm analizlere sınırsız erişim ve özel AI promptları için Pro üyeliğe yükseltin.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
