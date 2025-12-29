import { Link } from "react-router-dom";
import { Trophy, Target, Users, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const values = [
  {
    icon: Target,
    title: "Doğruluk",
    description: "Her tahminimiz veri odaklı analizlere ve AI algoritmalarına dayanır.",
  },
  {
    icon: Users,
    title: "Topluluk",
    description: "50.000+ kullanıcıdan oluşan aktif ve destekleyici bir topluluk.",
  },
  {
    icon: Zap,
    title: "İnovasyon",
    description: "En son teknolojilerle sürekli gelişen bir platform.",
  },
];

const team = [
  {
    name: "Ahmet Yılmaz",
    role: "CEO & Kurucu",
    avatar: "A",
  },
  {
    name: "Mehmet Kaya",
    role: "CTO",
    avatar: "M",
  },
  {
    name: "Elif Demir",
    role: "Baş Analist",
    avatar: "E",
  },
  {
    name: "Can Özkan",
    role: "AI Mühendisi",
    avatar: "C",
  },
];

const milestones = [
  { year: "2022", title: "Kuruluş", description: "SENTIO fikri doğdu ve ilk prototip geliştirildi." },
  { year: "2023", title: "10K Kullanıcı", description: "Platform 10.000 aktif kullanıcıya ulaştı." },
  { year: "2024", title: "AI Entegrasyonu", description: "Gelişmiş AI algoritmaları platforma entegre edildi." },
  { year: "2024", title: "50K Kullanıcı", description: "Topluluk 50.000 üyeyi aştı." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Hikayemiz</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground mb-6">
            Futbol Tahminlerini <span className="text-gradient">Dönüştürüyoruz</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            2022'de küçük bir ekip olarak başladık. Bugün 50.000'den fazla kullanıcıya 
            AI destekli tahmin hizmeti sunuyoruz.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display text-foreground mb-6">
                Misyonumuz
              </h2>
              <p className="text-muted-foreground mb-6">
                Futbol tutkunlarına en doğru ve güvenilir tahminleri sunarak, 
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
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-3xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-muted rounded-2xl">
                  <p className="text-4xl font-display text-foreground mb-2">50K+</p>
                  <p className="text-sm text-muted-foreground">Kullanıcı</p>
                </div>
                <div className="text-center p-6 bg-muted rounded-2xl">
                  <p className="text-4xl font-display text-foreground mb-2">%78</p>
                  <p className="text-sm text-muted-foreground">Başarı Oranı</p>
                </div>
                <div className="text-center p-6 bg-muted rounded-2xl">
                  <p className="text-4xl font-display text-foreground mb-2">1M+</p>
                  <p className="text-sm text-muted-foreground">Tahmin</p>
                </div>
                <div className="text-center p-6 bg-muted rounded-2xl">
                  <p className="text-4xl font-display text-foreground mb-2">15+</p>
                  <p className="text-sm text-muted-foreground">Lig</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display text-foreground mb-4">
              Değerlerimiz
            </h2>
            <p className="text-muted-foreground">Her gün bizi yönlendiren prensipler</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display text-foreground mb-4">
              Yolculuğumuz
            </h2>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="w-20 shrink-0 text-right">
                  <span className="text-lg font-bold text-primary">{milestone.year}</span>
                </div>
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-primary absolute -left-2" />
                  {idx < milestones.length - 1 && (
                    <div className="absolute left-0 top-4 w-0.5 h-full bg-border -translate-x-1/2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display text-foreground mb-4">
              Ekibimiz
            </h2>
            <p className="text-muted-foreground">ProTahmin'i yaratan insanlar</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-primary-foreground">
                  {member.avatar}
                </div>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display text-foreground mb-4">
            Topluluğumuza Katılın
          </h2>
          <p className="text-muted-foreground mb-8">
            50.000+ futbol tutkunuyla birlikte daha akıllı tahminler yapın.
          </p>
          <Link to="/auth">
            <Button size="lg" className="h-14 px-8 rounded-xl gradient-primary text-primary-foreground">
              Ücretsiz Başla
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
