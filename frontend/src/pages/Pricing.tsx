import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Zap, Crown, Star, HelpCircle, ArrowRight, Sparkles } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Başlangıç için ideal",
    price: { monthly: 0, yearly: 0 },
    icon: Zap,
    popular: false,
    features: [
      { text: "Günlük 3 tahmin", included: true },
      { text: "Temel istatistikler", included: true },
      { text: "E-posta bildirimleri", included: true },
      { text: "Topluluk erişimi", included: true },
      { text: "VIP tahminler", included: false },
      { text: "AI destekli analiz", included: false },
      { text: "Canlı destek", included: false },
      { text: "API erişimi", included: false },
    ],
    cta: "Ücretsiz Başla",
  },
  {
    id: "pro",
    name: "Pro",
    description: "En popüler seçim",
    price: { monthly: 99, yearly: 990 },
    icon: Crown,
    popular: true,
    features: [
      { text: "Sınırsız tahmin", included: true },
      { text: "Gelişmiş istatistikler", included: true },
      { text: "Anlık bildirimler", included: true },
      { text: "Topluluk erişimi", included: true },
      { text: "VIP tahminler", included: true },
      { text: "AI destekli analiz", included: true },
      { text: "7/24 canlı destek", included: true },
      { text: "API erişimi", included: false },
    ],
    cta: "Pro'ya Yükselt",
  },
  {
    id: "elite",
    name: "Elite",
    description: "Profesyoneller için",
    price: { monthly: 199, yearly: 1990 },
    icon: Star,
    popular: false,
    features: [
      { text: "Sınırsız tahmin", included: true },
      { text: "Premium istatistikler", included: true },
      { text: "Özel bildirimler", included: true },
      { text: "VIP topluluk", included: true },
      { text: "VIP+ tahminler", included: true },
      { text: "Gelişmiş AI analiz", included: true },
      { text: "Öncelikli destek", included: true },
      { text: "API erişimi", included: true },
    ],
    cta: "Elite'e Yükselt",
  },
];

const faqs = [
  {
    question: "Ücretsiz deneme süresi var mı?",
    answer: "Evet! Pro ve Elite planlarımız için 7 günlük ücretsiz deneme süresi sunuyoruz. Kredi kartı bilgisi gerekmez.",
  },
  {
    question: "İstediğim zaman iptal edebilir miyim?",
    answer: "Elbette. Aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal ettiğinizde dönem sonuna kadar erişiminiz devam eder.",
  },
  {
    question: "Planlar arasında geçiş yapabilir miyim?",
    answer: "Evet, istediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. Fark tutarı günlük olarak hesaplanır.",
  },
  {
    question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
    answer: "Visa, Mastercard, American Express ve Papara ile ödeme yapabilirsiniz.",
  },
  {
    question: "Tahminler ne kadar doğru?",
    answer: "Son 12 ayda ortalama %78 başarı oranına ulaştık. Tüm tahminler AI algoritmalarımız ve uzman analizleriyle desteklenir.",
  },
  {
    question: "Mobil uygulama var mı?",
    answer: "Web sitemiz tamamen mobil uyumludur. Native iOS ve Android uygulamaları yakında geliyor!",
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 brutalist-border bg-card shadow-brutalist-sm mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-display-bold uppercase tracking-wider">Basit & Şeffaf Fiyatlandırma</span>
          </div>

          <h1 className="brutalist-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Size Uygun <span className="text-gradient">Planı</span> Seçin
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            7 gün ücretsiz deneme ile başlayın. Kredi kartı gerekmez.
          </p>

          {/* Billing Toggle - Brutalist Style */}
          <div className="inline-flex items-center brutalist-border bg-card shadow-brutalist-sm">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-3 text-sm font-display uppercase tracking-wider transition-all ${!isYearly ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-3 text-sm font-display uppercase tracking-wider transition-all flex items-center gap-2 ${isYearly ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Yıllık
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-white font-bold">
                -17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative animate-slide-up ${plan.popular
                    ? "glass-card-premium rounded-2xl p-8 border-2 border-primary glow-primary scale-105 z-10"
                    : "glass-card-premium rounded-2xl p-8 card-hover"
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="brutalist-border bg-primary text-white px-4 py-2 text-xs font-display-bold uppercase tracking-wider shadow-brutalist-sm">
                      En Popüler
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-14 h-14 flex items-center justify-center mb-4 ${plan.popular ? "gradient-primary shadow-glow-primary" : "bg-muted"
                    }`}>
                    <plan.icon className={`w-7 h-7 ${plan.popular ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="text-2xl font-display text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-display-bold text-foreground">
                      ₺{isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-muted-foreground text-lg">/{isYearly ? "yıl" : "ay"}</span>
                    )}
                  </div>
                  {plan.price.monthly === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">Sonsuza kadar ücretsiz</p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 ${feature.included ? "text-foreground" : "text-muted-foreground/40"
                        }`}
                    >
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-current" />
                      )}
                      <span className={`text-sm ${!feature.included ? "line-through" : ""}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link to="/auth">
                  {plan.popular ? (
                    <button className="btn-brutalist w-full h-12">
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2 inline-block" />
                    </button>
                  ) : (
                    <button className="btn-brutalist-outline w-full h-12">
                      {plan.cta}
                    </button>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="brutalist-heading text-3xl md:text-4xl text-foreground mb-4">
              Sıkça Sorulan <span className="text-gradient">Sorular</span>
            </h2>
            <p className="text-muted-foreground">
              Aklınıza takılan soruların yanıtları
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card-premium rounded-2xl p-6 card-hover animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 gradient-primary flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-foreground mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
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
