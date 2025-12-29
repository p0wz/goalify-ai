import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Zap, Crown, Star, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Size Uygun <span className="text-gradient">Plan</span>ı Seçin
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            7 gün ücretsiz deneme ile başlayın. Kredi kartı gerekmez.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 bg-muted rounded-xl">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isYearly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isYearly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Yıllık
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                2 Ay Hediye
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative bg-card border rounded-3xl p-6 transition-all ${
                  plan.popular 
                    ? "border-primary shadow-lg shadow-primary/10 scale-105" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      En Popüler
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    plan.popular ? "gradient-primary" : "bg-muted"
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display text-foreground">
                      ₺{isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-muted-foreground">/{isYearly ? "yıl" : "ay"}</span>
                    )}
                  </div>
                  {plan.price.monthly === 0 && (
                    <p className="text-sm text-muted-foreground">Sonsuza kadar ücretsiz</p>
                  )}
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center gap-3 ${
                        feature.included ? "text-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-current shrink-0" />
                      )}
                      <span className={`text-sm ${!feature.included ? "line-through" : ""}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <Link to="/auth">
                  <Button 
                    className={`w-full h-12 rounded-xl ${
                      plan.popular 
                        ? "gradient-primary text-primary-foreground" 
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display text-foreground mb-4">
              Sıkça Sorulan <span className="text-gradient">Sorular</span>
            </h2>
            <p className="text-muted-foreground">
              Aklınıza takılan soruların yanıtları
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
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
