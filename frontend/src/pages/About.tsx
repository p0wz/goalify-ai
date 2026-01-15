import { Link } from "react-router-dom";
import { Trophy, Target, Users, Zap, ArrowRight, CheckCircle2, Sparkles, Brain, Shield, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const values = [
  {
    icon: Target,
    title: "Doğruluk",
    description: "Her analiz, veri odaklı yaklaşım ve AI algoritmalarına dayanır.",
  },
  {
    icon: Zap,
    title: "İnovasyon",
    description: "En son teknolojilerle sürekli gelişen bir platform.",
  },
  {
    icon: Shield,
    title: "Güvenilirlik",
    description: "Şeffaf metodoloji ve tutarlı analiz kalitesi.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 brutalist-border bg-card shadow-brutalist-sm mb-6">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-display-bold uppercase tracking-wider">Hakkımızda</span>
          </div>
          <h1 className="brutalist-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            Futbol Analizlerinde <span className="text-gradient">Yeni Nesil</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            SENTIO PICKS, yapay zeka ve veri biliminin gücünü kullanarak
            futbol severlere detaylı analizler sunan bir platformdur.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="brutalist-heading text-3xl md:text-4xl text-foreground mb-6">
                Misyonumuz
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Futbol tutkunlarına güvenilir ve veri odaklı analizler sunarak,
                bilinçli kararlar almalarına yardımcı olmak. Yapay zeka ve
                veri biliminin gücünü kullanarak, herkes için erişilebilir
                profesyonel analizler sağlıyoruz.
              </p>
              <div className="space-y-4">
                {[
                  "Veri odaklı, şeffaf analizler",
                  "Sürekli gelişen AI algoritmaları",
                  "Kullanıcı odaklı tasarım",
                  "Güvenilir ve güvenli platform",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Card */}
            <div className="glass-card-premium rounded-2xl p-8">
              <div className="space-y-6">
                {[
                  { icon: Brain, title: "AI Analizi", desc: "Gelişmiş makine öğrenimi modelleri" },
                  { icon: BarChart3, title: "Detaylı İstatistikler", desc: "Kapsamlı maç ve takım verileri" },
                  { icon: Users, title: "Topluluk", desc: "Deneyim paylaşımı ve etkileşim" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-12 h-12 gradient-primary flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="brutalist-heading text-3xl md:text-4xl text-foreground mb-4">
              <span className="text-gradient">Değerlerimiz</span>
            </h2>
            <p className="text-muted-foreground">Her gün bizi yönlendiren prensipler</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div key={value.title} className="glass-card-premium rounded-2xl p-8 text-center card-hover animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="w-16 h-16 gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-display text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="gradient-premium rounded-3xl p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display-bold text-white mb-4 uppercase">
                Platforma Katılın
              </h2>
              <p className="text-white/80 mb-8">
                AI destekli futbol analizleriyle tanışın.
              </p>
              <Link to="/auth">
                <button className="h-14 px-10 bg-white text-primary font-display-bold uppercase tracking-wider border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all">
                  Ücretsiz Başla
                  <ArrowRight className="w-5 h-5 ml-2 inline-block" />
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

export default About;
