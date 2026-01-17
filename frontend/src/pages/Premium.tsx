import { useState } from "react";
import { Check, Crown, Shield, Zap, ArrowRight, TrendingUp, Target, Bell, BarChart3, Clock, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/components/LanguageProvider";

const Premium = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { t, language } = useLanguage();

  const features = [
    { icon: TrendingUp, text: t.premium.highConfidence, desc: t.premium.highConfidenceDesc },
    { icon: Target, text: t.premium.valuePicks, desc: t.premium.valuePicksDesc },
    { icon: BarChart3, text: t.premium.matchAnalysis, desc: t.premium.matchAnalysisDesc },
    { icon: Bell, text: t.premium.instantNotifs, desc: t.premium.instantNotifsDesc },
    { icon: Clock, text: t.premium.earlyOdds, desc: t.premium.earlyOddsDesc },
    { icon: Shield, text: t.premium.aiModel, desc: t.premium.aiModelDesc },
  ];

  // Prices
  const monthlyTRY = 199;
  const monthlyUSD = 9.90;
  const yearlyDiscount = 0.15;

  const yearlyTRY = Math.round(monthlyTRY * 12 * (1 - yearlyDiscount));
  const yearlyUSD = (monthlyUSD * 12 * (1 - yearlyDiscount)).toFixed(2);

  const handlePurchase = () => {
    const price = isYearly
      ? (language === 'tr' ? `₺${yearlyTRY}/yıl` : `$${yearlyUSD}/year`)
      : (language === 'tr' ? `₺${monthlyTRY}/ay` : `$${monthlyUSD}/month`);
    toast({
      title: language === 'tr' ? "Ödeme Sayfasına Yönlendiriliyorsunuz" : "Redirecting to Payment",
      description: `Premium ${isYearly
        ? (language === 'tr' ? 'Yıllık' : 'Yearly')
        : (language === 'tr' ? 'Aylık' : 'Monthly')
        } Plan - ${price}`,
    });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 brutalist-border bg-card shadow-brutalist-sm mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-display-bold uppercase tracking-wider">
              {language === 'tr' ? 'Premium Üyelik' : 'Premium Membership'}
            </span>
          </div>
          <h2 className="brutalist-heading text-3xl md:text-4xl text-foreground mb-2">
            SENTIO <span className="text-gradient">PICKS</span> Premium
          </h2>
          <p className="text-muted-foreground">
            {t.premium.subtitle}
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
              {t.premium.monthly}
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-3 font-display uppercase tracking-wider transition-colors flex items-center gap-2 ${isYearly ? "bg-primary text-white" : "bg-card hover:bg-muted"
                }`}
            >
              {t.premium.yearly}
              <span className="text-xs px-2 py-0.5 bg-accent text-white font-bold">{t.premium.discount}</span>
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
                <p className="text-sm text-muted-foreground">
                  {language === 'tr' ? 'Tam erişim' : 'Full access'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-4xl font-display-bold text-foreground">
                  {language === 'tr' ? `₺${isYearly ? yearlyTRY : monthlyTRY}` : `$${isYearly ? yearlyUSD : monthlyUSD}`}
                </span>
                <span className="text-muted-foreground">
                  /{isYearly ? (language === 'tr' ? "yıl" : "year") : (language === 'tr' ? "ay" : "month")}
                </span>
              </div>
              {language === 'tr' && (
                <p className="text-xs text-muted-foreground">
                  veya ${isYearly ? yearlyUSD : monthlyUSD}/{isYearly ? "yıl" : "ay"}
                </p>
              )}
            </div>
          </div>

          {isYearly && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 text-center">
              <p className="text-green-500 font-display">
                {language === 'tr'
                  ? `%15 tasarruf! Yıllık ₺${monthlyTRY * 12 - yearlyTRY} indirim`
                  : `15% savings! $${(monthlyUSD * 12 - parseFloat(yearlyUSD)).toFixed(2)} yearly discount`
                }
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
            {t.premium.upgradeNow}
            <ArrowRight className="w-5 h-5 ml-2 inline-block" />
          </button>
        </div>

        {/* Trust & Info */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Shield className="w-4 h-4" />
              <span>{t.premium.securePayment}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Zap className="w-4 h-4" />
              <span>{t.premium.instantActivation}</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            {t.premium.cancelAnytime}
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Premium;
