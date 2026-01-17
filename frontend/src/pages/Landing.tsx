import { Link } from "react-router-dom";
import {
  TrendingUp, Shield, BarChart3, Users,
  ArrowRight, ChevronRight,
  Target, Brain, Bell, Award
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/components/LanguageProvider";

const Landing = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Brain,
      title: t.features.aiAnalysis,
      description: t.features.aiAnalysisDesc
    },
    {
      icon: TrendingUp,
      title: t.features.realTime,
      description: t.features.realTimeDesc
    },
    {
      icon: Bell,
      title: t.features.notifications,
      description: t.features.notificationsDesc
    },
    {
      icon: Shield,
      title: t.features.secure,
      description: t.features.secureDesc
    },
    {
      icon: BarChart3,
      title: t.features.stats,
      description: t.features.statsDesc
    },
    {
      icon: Users,
      title: t.features.community,
      description: t.features.communityDesc
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: t.howItWorks.step1,
      description: t.howItWorks.step1Desc,
      icon: Users,
    },
    {
      step: "02",
      title: t.howItWorks.step2,
      description: t.howItWorks.step2Desc,
      icon: Target,
    },
    {
      step: "03",
      title: t.howItWorks.step3,
      description: t.howItWorks.step3Desc,
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/15 rounded-full blur-[120px] animate-gradient" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[100px] animate-gradient" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Hero Heading */}
            <h1 className="text-hero text-foreground mb-8 animate-slide-up">
              <span className="block">{t.landing.heroTitle}</span>
              <span className="block text-gradient-premium">{t.landing.heroSubtitle}</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-slide-up font-light" style={{ animationDelay: '100ms' }}>
              {t.landing.heroDescription}
              <span className="text-foreground font-medium"> {t.landing.heroHighlight}</span>{t.landing.heroDescriptionEnd}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/auth">
                <button className="btn-brutalist h-14 px-10 text-lg rounded-none">
                  {t.landing.cta}
                  <ArrowRight className="w-5 h-5 ml-3 inline-block" />
                </button>
              </Link>
              <Link to="/pricing">
                <button className="btn-brutalist-outline h-14 px-10 text-lg rounded-none">
                  {t.landing.viewPlans}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="brutalist-heading text-4xl md:text-5xl text-foreground mb-4">
              {t.landing.whyUs} <span className="text-gradient">SENTIO PICKS</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.landing.featuresDesc}
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

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="brutalist-heading text-4xl md:text-5xl text-foreground mb-4">
              {t.landing.howItWorks} <span className="text-gradient">{t.landing.howItWorksHighlight}</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.landing.howItWorksDesc}
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
