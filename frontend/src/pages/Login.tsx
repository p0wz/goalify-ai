import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            toast.error("Lütfen tüm alanları doldurun");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success && data.token) {
                localStorage.setItem("token", data.token);
                toast.success("Giriş başarılı!");
                navigate("/admin");
            } else {
                setError(data.error || "Giriş başarısız");
                toast.error(data.error || "Giriş başarısız");
            }
        } catch (err: any) {
            setError(err.message || "Bağlantı hatası");
            toast.error("Sunucu ile bağlantı kurulamadı");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary glow-primary mb-4">
                        <Zap className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Admin Girişi</h1>
                    <p className="text-muted-foreground mt-2">Goalify AI Yönetim Paneli</p>
                </div>

                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="admin@goalifyai.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-12 h-12 bg-secondary/50 border-input rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-12 h-12 bg-secondary/50 border-input rounded-xl"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 gradient-primary text-primary-foreground font-semibold rounded-xl text-lg glow-primary mt-4"
                        >
                            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
