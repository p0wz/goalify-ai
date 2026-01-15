import { Link } from "react-router-dom";
import {
  Trophy, TrendingUp, Zap, Shield, BarChart3, Users,
  ArrowRight, CheckCircle2, Star, ChevronRight,
  Target, Brain, Bell, Award, Flame, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const features = [
  {
    icon: Brain,
    title: "AI Destekli Analiz",
    description: "Yapay zeka algoritmalarımız binlerce veri noktasını analiz ederek en doğru tahminleri sunar."
  },
  {
    icon: TrendingUp,
    title: "Yüksek Başarı Oranı",
    description: "%78 ortalama başarı oranıyla sektörün en güvenilir tahmin platformuyuz."
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
    title: "Uzman Topluluk",
    description: "50.000+ aktif üyeden oluşan uzman topluluğumuza katılın."
  },
];

const stats = [
  { value: "50K+", label: "Aktif Kullanıcı", icon: Users },
  { value: "%78", label: "Başarı Oranı", icon: Target },
  { value: "1M+", label: "Tahmin", icon: Flame },
  { value: "4.9", label: "Kullanıcı Puanı", icon: Star },
];

const testimonials = [
  {
    name: "Ahmet Yılmaz",
    role: "Pro Üye - 2 Yıl",
    avatar: "A",
    content: "SENTIO PICKS sayesinde bahis stratejimi tamamen değiştirdim. AI destekli analizler gerçekten işe yarıyor.",
    rating: 5,
  },
  {
    name: "Mehmet Kaya",
    role: "Elite Üye - 1 Yıl",
    avatar: "M",
    content: "Daha önce birçok platform denedim ama hiçbiri bu kadar doğru tahminler sunmadı. Kesinlikle tavsiye ederim.",
    rating: 5,
  },
  {
    name: "Emre Demir",
    role: "Pro Üye - 6 Ay",
    avatar: "E",
    content: "Canlı maç takibi ve anlık bildirimler harika. Artık hiçbir fırsatı kaçırmıyorum.",
    rating: 5,
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Ücretsiz Kayıt Ol",
    description: "Hemen ücretsiz hesabınızı oluşturun ve platforma erişin.",
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
    title: "Kazanmaya Başla",
    description: "Doğru tahminlerle kazanç oranınızı artırın.",
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
            {/* Badge - Brutalist Style */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 brutalist-border bg-card shadow-brutalist-sm mb-8 animate-slide-up">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-display-bold uppercase tracking-wider">AI Destekli Futbol Tahmin Platformu</span>
            </div>

            {/* Hero Heading - Massive Brutalist Typography */}
            <h1 className="text-hero text-foreground mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <span className="block">SENTIO</span>
              <span className="block text-gradient-premium">PICKS</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-slide-up font-light" style={{ animationDelay: '200ms' }}>
              Yapay zeka destekli analizler, gerçek zamanlı istatistikler ve uzman tahminleriyle
              <span className="text-foreground font-medium"> futbol bahislerinde avantaj</span> elde edin.
            </p>

            {/* CTA Buttons - Brutalist Style */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <Link to="/auth">
                <button className="btn-brutalist h-14 px-10 text-lg rounded-none">
                  Ücretsiz Başla
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

          {/* Stats Grid - Glassmorphic Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 animate-slide-up" style={{ animationDelay: '400ms' }}>
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="glass-card-premium rounded-2xl p-6 text-center card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl md:text-4xl font-display-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
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
              En gelişmiş teknolojiler ve uzman analizleriyle desteklenen özelliklerimiz
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
              3 basit adımda profesyonel tahminlere ulaşın
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

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS - Glassmorphic
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="brutalist-heading text-4xl md:text-5xl text-foreground mb-4">
              Kullanıcılarımız <span className="text-gradient">Ne Diyor</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Binlerce memnun kullanıcımızdan bazıları
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="glass-card-premium rounded-2xl p-8 card-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground text-lg mb-8 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-display text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-display text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA SECTION - Gradient Heavy + Brutalist
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="gradient-premium rounded-3xl p-16 text-center relative overflow-hidden shadow-2xl">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-10" />
            <div className="absolute top-10 right-10 w-32 h-32 border-4 border-white/20 rounded-full" />
            <div className="absolute bottom-10 left-10 w-24 h-24 border-4 border-white/20" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display-bold text-white mb-6 uppercase">
                Hemen Başla
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                7 gün ücretsiz deneme ile tüm premium özelliklere erişin.
                Kredi kartı gerekmez.
              </p>
              <Link to="/auth">
                <button className="h-16 px-12 bg-white text-primary font-display-bold uppercase tracking-wider text-lg border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all">
                  Ücretsiz Deneyin
                  <ArrowRight className="w-6 h-6 ml-3 inline-block" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
