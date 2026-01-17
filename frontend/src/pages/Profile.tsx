import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Calendar, CreditCard, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/components/LanguageProvider";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

const Profile = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
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
        toast.error(language === 'tr' ? "Profil yüklenemedi" : "Could not load profile");
        if (res.status === 401) navigate('/login');
      }
    } catch (err) {
      toast.error(language === 'tr' ? "Bağlantı hatası" : "Connection error");
    }
    setLoading(false);
  };

  if (loading) return null;

  const t = {
    profile: language === 'tr' ? 'Profil' : 'Profile',
    admin: language === 'tr' ? 'Yönetici' : 'Admin',
    user: language === 'tr' ? 'Kullanıcı' : 'User',
    membershipType: language === 'tr' ? 'Üyelik Tipi' : 'Membership Type',
    proMember: language === 'tr' ? 'PRO Üyelik' : 'PRO Membership',
    freePlan: language === 'tr' ? 'Ücretsiz Plan' : 'Free Plan',
    active: language === 'tr' ? 'Aktif' : 'Active',
    status: language === 'tr' ? 'Durum' : 'Status',
    unlimitedAccess: language === 'tr' ? 'Sınırsız Erişim' : 'Unlimited Access',
    limitedAccess: language === 'tr' ? 'Kısıtlı Erişim' : 'Limited Access',
    joinDate: language === 'tr' ? 'Katılım Tarihi' : 'Join Date',
    upgradeToPro: language === 'tr' ? "PRO'ya Geçin" : 'Upgrade to PRO',
    upgradeDesc: language === 'tr'
      ? 'Tüm analizlere sınırsız erişim ve özel AI promptları için Pro üyeliğe yükseltin.'
      : 'Upgrade to Pro for unlimited access to all analyses and exclusive AI prompts.',
    upgrade: language === 'tr' ? 'Yükselt' : 'Upgrade',
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 brutalist-border bg-card shadow-brutalist-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-display uppercase tracking-wider">{t.profile}</span>
        </div>

        {/* Profile Card */}
        <div className="glass-card-premium rounded-2xl p-8 animate-slide-up">
          {/* Avatar & Info */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 gradient-primary mx-auto flex items-center justify-center mb-4 shadow-glow-primary">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-display text-foreground mb-2">{user?.email}</h2>
            <Badge
              variant="outline"
              className={`${user?.role === 'admin'
                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                : 'bg-primary/10 text-primary border-primary/20'
                } font-display uppercase tracking-wider`}
            >
              {user?.role === 'admin' ? t.admin : t.user}
            </Badge>
          </div>

          {/* Info Items */}
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.membershipType}</p>
                  <p className="font-display text-foreground">{user?.plan === 'pro' ? t.proMember : t.freePlan}</p>
                </div>
              </div>
              {user?.plan === 'pro' && (
                <Badge className="gradient-accent text-white font-display uppercase">{t.active}</Badge>
              )}
            </div>

            <div className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.status}</p>
                  <p className="font-display text-foreground">
                    {user?.plan === 'pro' ? t.unlimitedAccess : t.limitedAccess}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.joinDate}</p>
                  <p className="font-display text-foreground">2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade CTA for Free users */}
          {user?.plan !== 'pro' && (
            <div className="mt-8 gradient-premium rounded-2xl p-6 text-center">
              <h3 className="font-display-bold text-xl text-white mb-2 uppercase">{t.upgradeToPro}</h3>
              <p className="text-white/80 text-sm mb-4">
                {t.upgradeDesc}
              </p>
              <Link to="/premium">
                <button className="h-12 px-8 bg-white text-primary font-display-bold uppercase tracking-wider border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all">
                  {t.upgrade}
                  <ArrowRight className="w-4 h-4 ml-2 inline-block" />
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
