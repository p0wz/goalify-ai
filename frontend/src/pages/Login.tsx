import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, ArrowRight, Trophy, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

const Login = () => {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            toast.error("Lütfen tüm alanları doldurun");
            return;
        }

        setLoading(true);

        try {
            const endpoint = isRegistering ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success && data.token) {
                localStorage.setItem("token", data.token);
                toast.success(isRegistering ? "Kayıt başarılı!" : "Giriş başarılı!");
                navigate("/admin");
            } else {
                setError(data.error || (isRegistering ? "Kayıt başarısız" : "Giriş başarısız"));
                toast.error(data.error || (isRegistering ? "Kayıt başarısız" : "Giriş başarısız"));
            }
        } catch (err: any) {
            setError(err.message || "Bağlantı hatası");
            toast.error("Sunucu ile bağlantı kurulamadı");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Gradient Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 gradient-premium animate-gradient" />
                <div className="absolute inset-0 bg-grid opacity-20" />

                {/* Decorative Elements */}
                <div className="absolute top-20 left-20 w-32 h-32 border-4 border-white/20 rounded-full animate-float" />
                <div className="absolute bottom-32 right-20 w-24 h-24 border-4 border-white/20 animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/3 right-32 w-16 h-16 bg-white/10 backdrop-blur-sm animate-float" style={{ animationDelay: '2s' }} />

                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    {/* Logo */}
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 shadow-2xl">
                        <Trophy className="w-10 h-10" />
                    </div>

                    <h1 className="text-5xl font-display-bold mb-2 uppercase">SENTIO</h1>
                    <p className="text-2xl font-display tracking-[0.3em] mb-8">PICKS</p>

                    <p className="text-xl text-white/80 text-center max-w-md">
                        AI destekli futbol tahmin platformu ile kazanmaya başla
                    </p>

                    {/* Stats */}
                    <div className="flex gap-8 mt-12">
                        <div className="text-center">
                            <p className="text-3xl font-display-bold">50K+</p>
                            <p className="text-sm text-white/60 uppercase tracking-wider">Kullanıcı</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-display-bold">%78</p>
                            <p className="text-sm text-white/60 uppercase tracking-wider">Başarı</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-display-bold">1M+</p>
                            <p className="text-sm text-white/60 uppercase tracking-wider">Tahmin</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-pattern opacity-50" />

                <div className="w-full max-w-md relative z-10 animate-slide-up">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary shadow-brutalist-sm mb-4">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-display-bold text-gradient">SENTIO PICKS</h1>
                    </div>

                    {/* Form Card */}
                    <div className="glass-card-premium rounded-2xl p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-display text-foreground mb-2">
                                {isRegistering ? "Hesap Oluştur" : "Giriş Yap"}
                            </h2>
                            <p className="text-muted-foreground">
                                {isRegistering ? "Ücretsiz hesabınızı oluşturun" : "Hesabınıza giriş yapın"}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ornek@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">Şifre</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-12 pr-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <button
                                type="submit"
                                className="btn-brutalist w-full h-12 text-base"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        İşleniyor...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        {isRegistering ? "Kayıt Ol" : "Giriş Yap"}
                                        <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {isRegistering ? (
                                    <>Zaten hesabın var mı? <span className="font-medium text-primary">Giriş Yap</span></>
                                ) : (
                                    <>Hesabınız yok mu? <span className="font-medium text-primary">Kayıt Ol</span></>
                                )}
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                ← Ana Sayfaya Dön
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
