import { useState } from "react";
import { Check, Crown, Zap, Star, Shield, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  icon: React.ReactNode;
  popular: boolean;
  features: PlanFeature[];
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Starter",
    price: 49,
    period: "/ay",
    description: "Başlangıç için ideal",
    icon: <Zap className="w-6 h-6" />,
    popular: false,
    features: [
      { text: "Günlük 5 tahmin", included: true },
      { text: "Temel istatistikler", included: true },
      { text: "Maç bildirimleri", included: true },
      { text: "VIP tahminler", included: false },
      { text: "Canlı destek", included: false },
      { text: "API erişimi", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    period: "/ay",
    description: "En popüler seçim",
    icon: <Crown className="w-6 h-6" />,
    popular: true,
    features: [
      { text: "Sınırsız tahmin", included: true },
      { text: "Gelişmiş istatistikler", included: true },
      { text: "Anlık bildirimler", included: true },
      { text: "VIP tahminler", included: true },
      { text: "7/24 canlı destek", included: true },
      { text: "API erişimi", included: false },
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 199,
    period: "/ay",
    description: "Profesyoneller için",
    icon: <Star className="w-6 h-6" />,
    popular: false,
    features: [
      { text: "Sınırsız tahmin", included: true },
      { text: "AI destekli analiz", included: true },
      { text: "Özel bildirimler", included: true },
      { text: "VIP+ tahminler", included: true },
      { text: "Öncelikli destek", included: true },
      { text: "API erişimi", included: true },
    ],
  },
];

const Premium = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [isYearly, setIsYearly] = useState(false);

  const handlePurchase = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    toast({
      title: "Ödeme Sayfasına Yönlendiriliyorsunuz",
      description: `${plan?.name} planı seçildi - ₺${isYearly ? (plan?.price || 0) * 10 : plan?.price}${isYearly ? "/yıl" : "/ay"}`,
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 brutalist-border bg-card shadow-brutalist-sm mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-display-bold uppercase tracking-wider">%20 İndirim - Sınırlı Süre</span>
          </div>
          <h2 className="brutalist-heading text-3xl md:text-4xl text-foreground mb-2">
            Premium'a <span className="text-gradient">Yükselt</span>
          </h2>
          <p className="text-muted-foreground">
            Daha fazla tahmin, daha yüksek kazanç
          </p>
        </div>

        {/* Billing Toggle - Brutalist */}
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
              <span className="text-xs px-2 py-0.5 bg-accent text-white font-bold">-20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {plans.map((plan, idx) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`text-left animate-slide-up ${selectedPlan === plan.id
                  ? plan.popular
                    ? "glass-card-premium rounded-2xl p-6 border-2 border-accent glow-accent"
                    : "glass-card-premium rounded-2xl p-6 border-2 border-primary glow-primary"
                  : "glass-card-premium rounded-2xl p-6 card-hover"
                }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="inline-flex items-center gap-1 px-3 py-1.5 brutalist-border bg-accent text-white text-xs font-display-bold uppercase tracking-wider shadow-brutalist-sm mb-4">
                  <Crown className="w-3 h-3" />
                  En Popüler
                </div>
              )}

              <div className="mb-4">
                <div className={`w-12 h-12 flex items-center justify-center mb-3 ${plan.popular ? "gradient-accent" : "gradient-primary"
                  } shadow-glow-primary`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-display text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-display-bold text-foreground">
                    ₺{isYearly ? plan.price * 10 : plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {isYearly ? "/yıl" : plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, fidx) => (
                  <div
                    key={fidx}
                    className={`flex items-center gap-2 text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/40"
                      }`}
                  >
                    {feature.included ? (
                      <div className="w-5 h-5 bg-green-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 border border-muted-foreground/30" />
                    )}
                    <span className={!feature.included ? "line-through" : ""}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Selection indicator */}
              <div className={`mt-6 flex items-center justify-center gap-2 py-3 transition-colors ${selectedPlan === plan.id
                  ? plan.popular
                    ? "bg-accent/20 text-accent"
                    : "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
                }`}>
                {selectedPlan === plan.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-display">Seçildi</span>
                  </>
                ) : (
                  <span className="text-sm">Seçmek için tıkla</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-md mx-auto text-center">
          <button
            onClick={handlePurchase}
            className="btn-brutalist w-full h-14 text-lg"
          >
            Şimdi Başla
            <ArrowRight className="w-5 h-5 ml-2 inline-block" />
          </button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Shield className="w-4 h-4" />
              <span>Güvenli Ödeme</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Zap className="w-4 h-4" />
              <span>Anında Aktivasyon</span>
            </div>
          </div>

          <p className="text-muted-foreground text-xs mt-4">
            İstediğiniz zaman iptal edebilirsiniz. İlk 7 gün ücretsiz deneme.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Premium;
