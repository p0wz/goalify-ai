import { useState } from "react";
import { Check, Crown, Shield, Zap, ArrowRight, TrendingUp, Target, Bell, BarChart3, Clock, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";

const features = [
  { icon: TrendingUp, text: "Günün Yüksek Güven Tercihleri", desc: "AI modelimizin en güvendiği günlük seçimler" },
  { icon: Target, text: "Günün Değer Tercihleri", desc: "Yüksek oran/değer oranına sahip fırsatlar" },
  { icon: BarChart3, text: "Detaylı Maç Analizleri", desc: "Takım formları, kafa kafaya istatistikler" },
  { icon: Bell, text: "Anlık Bildirimler", desc: "Maç başlamadan ve oran değişimlerinde uyarı" },
  { icon: Clock, text: "Erken Oran Değişim Uyarıları", desc: "Piyasa hareketlerini ilk sen gör" },
  { icon: Shield, text: "AI Destekli Tahmin Modeli", desc: "Sürekli öğrenen ve gelişen algoritmalar" },
];

const Premium = () => {
  const [isYearly, setIsYearly] = useState(false);

  // Prices
  const monthlyTRY = 199;
  const monthlyUSD = 9.90;
  const yearlyDiscount = 0.15; // 15% discount

  const yearlyTRY = Math.round(monthlyTRY * 12 * (1 - yearlyDiscount));
  const yearlyUSD = (monthlyUSD * 12 * (1 - yearlyDiscount)).toFixed(2);

  const handlePurchase = () => {
    const price = isYearly ? `₺${yearlyTRY}/yıl` : `₺${monthlyTRY}/ay`;
    toast({
      title: "Ödeme Sayfasına Yönlendiriliyorsunuz",
      description: `Premium ${isYearly ? 'Yıllık' : 'Aylık'} Plan - ${price}`,
    });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 brutalist-border bg-card shadow-brutalist-sm mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-display-bold uppercase tracking-wider">Premium Üyelik</span>
          </div>
          <h2 className="brutalist-heading text-3xl md:text-4xl text-foreground mb-2">
            SENTIO <span className="text-gradient">PICKS</span> Premium
          </h2>
          <p className="text-muted-foreground">
            Tüm premium özelliklere sınırsız erişim
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex brutalist-border shadow-brutalist-sm">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-3 font-display uppercase tracking-wider transition-colors ${!isYearly ? "bg-primary text-white" : "bg-card hover:bg-muted"
                }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-3 font-display uppercase tracking-wider transition-colors flex items-center gap-2 ${isYearly ? "bg-primary text-white" : "bg-card hover:bg-muted"
                }`}
            >
              Yıllık
              <span className="text-xs px-2 py-0.5 bg-accent text-white font-bold">-%15</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-card-premium rounded-2xl p-8 border-2 border-accent glow-accent mb-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 gradient-accent flex items-center justify-center shadow-glow-primary">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-display text-foreground">Premium</h3>
                <p className="text-sm text-muted-foreground">Tam erişim</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-4xl font-display-bold text-foreground">
                  ₺{isYearly ? yearlyTRY : monthlyTRY}
                </span>
                <span className="text-muted-foreground">/{isYearly ? "yıl" : "ay"}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                veya ${isYearly ? yearlyUSD : monthlyUSD}/{isYearly ? "yıl" : "ay"}
              </p>
            </div>
          </div>

          {isYearly && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 text-center">
              <p className="text-green-500 font-display">
                %15 tasarruf! Yıllık ₺{monthlyTRY * 12 - yearlyTRY} indirim
              </p>
            </div>
          )}

          {/* Features */}
          <div className="space-y-4 mb-8">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 glass-card rounded-xl animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="w-10 h-10 bg-accent/20 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-display text-foreground">{feature.text}</p>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
                <Check className="w-5 h-5 text-green-500 shrink-0 ml-auto" />
              </div>
            ))}
          </div>

          {/* CTA */}
          <button onClick={handlePurchase} className="btn-brutalist w-full h-14 text-lg">
            Premium'a Geç
            <ArrowRight className="w-5 h-5 ml-2 inline-block" />
          </button>
        </div>

        {/* Trust & Info */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Shield className="w-4 h-4" />
              <span>Güvenli Ödeme</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Zap className="w-4 h-4" />
              <span>Anında Aktivasyon</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            İstediğiniz zaman iptal edebilirsiniz.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Premium;
