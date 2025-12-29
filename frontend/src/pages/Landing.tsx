import { Link } from "react-router-dom";
import { 
  Trophy, TrendingUp, Zap, Shield, BarChart3, Users, 
  ArrowRight, CheckCircle2, Star, Play, ChevronRight,
  Target, Brain, Bell, Award
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
  { value: "50K+", label: "Aktif Kullanıcı" },
  { value: "%78", label: "Başarı Oranı" },
  { value: "1M+", label: "Tahmin" },
  { value: "4.9", label: "Kullanıcı Puanı" },
];

const testimonials = [
  {
    name: "Ahmet Yılmaz",
    role: "Pro Üye - 2 Yıl",
    avatar: "A",
    content: "ProTahmin sayesinde bahis stratejimi tamamen değiştirdim. AI destekli analizler gerçekten işe yarıyor.",
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
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-slide-up">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">AI Destekli Futbol Tahmin Platformu</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-foreground mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Futbol Tahminlerinde{" "}
              <span className="text-gradient">Yeni Nesil</span>{" "}
              Deneyim
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
              Yapay zeka destekli analizler, gerçek zamanlı istatistikler ve uzman tahminleriyle 
              futbol bahislerinde avantaj elde edin.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <Link to="/auth">
                <Button size="lg" className="h-14 px-8 rounded-xl gradient-primary text-primary-foreground text-lg shadow-glow-primary">
                  Ücretsiz Başla
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl text-lg">
                <Play className="w-5 h-5 mr-2" />
                Nasıl Çalışır?
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 mt-12 animate-slide-up" style={{ animationDelay: '400ms' }}>
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image/Preview */}
          <div className="mt-16 relative animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="bg-card border border-border rounded-3xl p-4 shadow-2xl max-w-5xl mx-auto">
              <div className="bg-muted rounded-2xl aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <p className="text-muted-foreground">Dashboard Preview</p>
                </div>
              </div>
            </div>
            {/* Floating Cards */}
            <div className="absolute -left-8 top-1/4 hidden lg:block animate-float">
              <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Tahmin Kazandı!</p>
                    <p className="text-xs text-muted-foreground">+2.4x kazanç</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 bottom-1/4 hidden lg:block animate-float" style={{ animationDelay: '1s' }}>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">%78 Başarı</p>
                    <p className="text-xs text-muted-foreground">Son 30 gün</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              Neden <span className="text-gradient">ProTahmin</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              En gelişmiş teknolojiler ve uzman analizleriyle desteklenen özelliklerimiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-lg group"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              Nasıl <span className="text-gradient">Çalışır</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              3 basit adımda profesyonel tahminlere ulaşın
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="bg-card border border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
                  <div className="text-5xl font-display text-primary/20 mb-4">{step.step}</div>
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              Kullanıcılarımız <span className="text-gradient">Ne Diyor</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Binlerce memnun kullanıcımızdan bazıları
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="gradient-premium rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display text-white mb-4">
                Hemen Başlayın
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                7 gün ücretsiz deneme ile tüm premium özelliklere erişin. 
                Kredi kartı gerekmez.
              </p>
              <Link to="/auth">
                <Button size="lg" className="h-14 px-8 rounded-xl bg-white text-primary hover:bg-white/90 text-lg font-semibold">
                  Ücretsiz Deneyin
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
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
