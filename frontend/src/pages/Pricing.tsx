import { useState } from "react";
import { Check, Crown, Sparkles, ArrowRight, Shield, Zap, Clock, TrendingUp, Target, Bell, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const features = [
  { icon: TrendingUp, text: "Günün Yüksek Güven Tercihleri" },
  { icon: Target, text: "Günün Değer Tercihleri" },
  { icon: BarChart3, text: "Detaylı Maç Analizleri" },
  { icon: Bell, text: "Anlık Bildirimler" },
  { icon: Clock, text: "Erken Oran Değişim Uyarıları" },
  { icon: Shield, text: "AI Destekli Tahmin Modeli" },
];

const faqs = [
  {
    question: "Üyelik nasıl çalışıyor?",
    answer: "Premium üyelik ile tüm özelliklere sınırsız erişim elde edersiniz. İstediğiniz zaman iptal edebilirsiniz.",
  },
  {
    question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
    answer: "Visa, Mastercard, American Express ve Papara ile ödeme yapabilirsiniz.",
  },
  {
    question: "Yıllık planda indirim var mı?",
    answer: "Evet! Yıllık üyelikte %15 indirim uygulanır.",
  },
  {
    question: "Mobil uygulama var mı?",
    answer: "Web sitemiz tamamen mobil uyumludur. Native iOS ve Android uygulamaları da mevcuttur.",
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Prices
  const monthlyTRY = 199;
  const monthlyUSD = 9.90;
  const yearlyDiscount = 0.15; // 15% discount

  const yearlyTRY = Math.round(monthlyTRY * 12 * (1 - yearlyDiscount));
  const yearlyUSD = (monthlyUSD * 12 * (1 - yearlyDiscount)).toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 brutalist-border bg-card shadow-brutalist-sm mb-6">
            <Crown className="w-4 h-4 text-accent" />
            <span className="text-sm font-display-bold uppercase tracking-wider">Premium Üyelik</span>
          </div>
          <h1 className="brutalist-heading text-4xl md:text-5xl text-foreground mb-4">
            SENTIO <span className="text-gradient">PICKS</span> Premium
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI destekli futbol analizleri ve günlük tahminlere tam erişim
          </p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="pb-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center">
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
        </div>
      </section>

      {/* Pricing Card */}
      <section className="pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="glass-card-premium rounded-2xl p-8 border-2 border-accent glow-accent">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 gradient-accent text-white text-sm font-display-bold uppercase tracking-wider shadow-brutalist-sm mb-4">
                <Crown className="w-4 h-4" />
                Premium
              </div>

              {/* Price - Turkish */}
              <div className="mb-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-display-bold text-foreground">
                    ₺{isYearly ? yearlyTRY : monthlyTRY}
                  </span>
                  <span className="text-muted-foreground">
                    /{isYearly ? "yıl" : "ay"}
                  </span>
                </div>
                {isYearly && (
                  <p className="text-sm text-green-500 mt-1">
                    Aylık ₺{Math.round(yearlyTRY / 12)} (₺{monthlyTRY * 12 - yearlyTRY} tasarruf)
                  </p>
                )}
              </div>

              {/* Price - International */}
              <div className="text-sm text-muted-foreground">
                veya <span className="font-display">${isYearly ? yearlyUSD : monthlyUSD}</span>/{isYearly ? "yıl" : "ay"} (Uluslararası)
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/20 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link to="/premium">
              <button className="btn-brutalist w-full h-14 text-lg">
                Premium'a Geç
                <ArrowRight className="w-5 h-5 ml-2 inline-block" />
              </button>
            </Link>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Güvenli Ödeme</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Anında Aktivasyon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="brutalist-heading text-3xl text-foreground mb-4">
              Sık Sorulan <span className="text-gradient">Sorular</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-card-premium rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between"
                >
                  <span className="font-display text-foreground">{faq.question}</span>
                  <span className={`text-2xl text-primary transition-transform ${openFaq === idx ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
