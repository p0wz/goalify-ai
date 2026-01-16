import { Link } from "react-router-dom";
import {
  TrendingUp, Shield, BarChart3, Users,
  ArrowRight, ChevronRight,
  Target, Brain, Bell, Award
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const features = [
  {
    icon: Brain,
    title: "AI Destekli Analiz",
    description: "Yapay zeka algoritmalarımız binlerce veri noktasını analiz ederek tahminler sunar."
  },
  {
    icon: TrendingUp,
    title: "Gerçek Zamanlı Veriler",
    description: "Canlı maç istatistikleri ve anlık oran değişimleri ile her zaman güncel kalın."
  },
  {
    icon: Bell,
    title: "Anlık Bildirimler",
    description: "Önemli maçlar ve tahminler için anlık mobil ve web bildirimleri alın."
  },
  {
    icon: Shield,
    title: "Güvenli Platform",
    description: "256-bit SSL şifreleme ve GDPR uyumlu veri koruma ile güvendesiniz."
  },
  {
    icon: BarChart3,
    title: "Detaylı İstatistikler",
    description: "Takım performansları, kafa kafaya istatistikler ve form analizleri."
  },
  {
    icon: Users,
    title: "Topluluk",
    description: "Diğer kullanıcılarla etkileşime geçin ve deneyimlerinizi paylaşın."
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Kayıt Ol",
    description: "Hesabınızı oluşturun ve platforma erişin.",
    icon: Users,
  },
  {
    step: "02",
    title: "Tahminleri İncele",
    description: "AI destekli tahminlerimizi ve detaylı analizleri inceleyin.",
    icon: Target,
  },
  {
    step: "03",
    title: "Analiz Et",
    description: "Kararlarınızı veriye dayalı analizlerle destekleyin.",
    icon: Award,
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION - Brutalist + Gradient Heavy
      ═══════════════════════════════════════════════════════════════ */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/15 rounded-full blur-[120px] animate-gradient" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[100px] animate-gradient" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Hero Heading - Massive Brutalist Typography */}
            <h1 className="text-hero text-foreground mb-8 animate-slide-up">
              <span className="block">SENTIO</span>
              <span className="block text-gradient-premium">PICKS</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-slide-up font-light" style={{ animationDelay: '100ms' }}>
              Yapay zeka destekli analizler, gerçek zamanlı istatistikler ve detaylı maç verileriyle
              <span className="text-foreground font-medium"> bilinçli kararlar</span> alın.
            </p>

            {/* CTA Buttons - Brutalist Style */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/auth">
                <button className="btn-brutalist h-14 px-10 text-lg rounded-none">
                  Kayıt Ol
                  <ArrowRight className="w-5 h-5 ml-3 inline-block" />
                </button>
              </Link>
              <Link to="/pricing">
                <button className="btn-brutalist-outline h-14 px-10 text-lg rounded-none">
                  Planları Gör
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES SECTION - Glassmorphic Cards
      ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="brutalist-heading text-4xl md:text-5xl text-foreground mb-4">
              Neden <span className="text-gradient">SENTIO PICKS</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              En gelişmiş teknolojiler ve detaylı analizlerle desteklenen özelliklerimiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card-premium rounded-2xl p-8 card-hover group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-glow-primary">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-display text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS - Brutalist Steps
      ═══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="brutalist-heading text-4xl md:text-5xl text-foreground mb-4">
              Nasıl <span className="text-gradient">Çalışır</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              3 basit adımda profesyonel analizlere ulaşın
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="glass-card-premium rounded-2xl p-10 text-center card-hover">
                  {/* Step Number - Brutalist */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="brutalist-border bg-primary text-white px-4 py-2 font-display-bold text-lg shadow-brutalist-sm">
                      {step.step}
                    </span>
                  </div>

                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mt-4 mb-6 shadow-glow-primary">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-display text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-primary" />
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

export default Landing;
