import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/components/LanguageProvider";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

const Auth = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            navigate('/predictions');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      toast.error(language === 'tr' ? "Lütfen tüm alanları doldurun" : "Please fill in all fields");
      return;
    }

    if (!isLogin && !name) {
      toast.error(language === 'tr' ? "Lütfen adınızı girin" : "Please enter your name");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
      const body = isLogin
        ? { email, password }
        : { email, password, name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        toast.success(isLogin
          ? (language === 'tr' ? "Giriş başarılı!" : "Login successful!")
          : (language === 'tr' ? "Kayıt başarılı!" : "Registration successful!")
        );
        navigate("/predictions");
      } else {
        setError(data.error || (isLogin
          ? (language === 'tr' ? "Giriş başarısız" : "Login failed")
          : (language === 'tr' ? "Kayıt başarısız" : "Registration failed")
        ));
        toast.error(data.error || (isLogin
          ? (language === 'tr' ? "Giriş başarısız" : "Login failed")
          : (language === 'tr' ? "Kayıt başarısız" : "Registration failed")
        ));
      }
    } catch (err: any) {
      setError(language === 'tr' ? "Sunucu ile bağlantı kurulamadı" : "Could not connect to server");
      toast.error(language === 'tr' ? "Sunucu ile bağlantı kurulamadı" : "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary glow-primary mb-4">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">SENTIO PICKS</h1>
          </Link>
          <p className="text-muted-foreground mt-2">
            {language === 'tr' ? 'AI Destekli Futbol Tahmin Platformu' : 'AI-Powered Football Prediction Platform'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-secondary/50 rounded-xl">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${isLogin
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {t.auth.login}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${!isLogin
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {t.auth.register}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t.auth.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12 h-14 bg-secondary/50 border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder={t.auth.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 bg-secondary/50 border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t.auth.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-14 bg-secondary/50 border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 gradient-primary text-primary-foreground font-semibold rounded-xl text-lg glow-primary"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {language === 'tr' ? 'İşleniyor...' : 'Processing...'}
                </span>
              ) : (
                <>
                  {isLogin ? t.auth.login : t.auth.register}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← {language === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          {language === 'tr' ? 'Devam ederek' : 'By continuing, you agree to our'}{" "}
          <Link to="/terms" className="text-primary hover:underline">
            {language === 'tr' ? 'Kullanım Şartları' : 'Terms of Service'}
          </Link>
          {" "}{language === 'tr' ? 've' : 'and'}{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            {language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
          </Link>
          {language === 'tr' ? "'nı kabul etmiş olursunuz." : '.'}
        </p>
      </div>
    </div>
  );
};

export default Auth;
