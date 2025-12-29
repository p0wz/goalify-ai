import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

const Login = () => {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

                <Card className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">GoalSniper Admin</CardTitle>
                        <CardDescription className="text-center">
                            {isRegistering ? "Yeni hesap oluşturun" : "Yönetici paneline giriş yapın"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@goalifyai.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-4 h-12 bg-secondary/50 border-input rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Şifre</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                </div>
                        </div>
                    </div>
                    );
};

                    export default Login;
