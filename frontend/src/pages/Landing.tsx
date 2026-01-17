import { Link } from "react-router-dom";
import {
  TrendingUp, Shield, BarChart3, Users,
  ArrowRight, ChevronRight, Crown,
  Target, Brain, Bell, Award, Zap, Clock, Lock, Check
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/components/LanguageProvider";

const Landing = () => {
  const { t, language } = useLanguage();

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

  const premiumFeatures = [
    {
      icon: Target,
      title: t.premium.highConfidence,
      description: t.premium.highConfidenceDesc,
    },
    {
      icon: Zap,
      title: t.premium.valuePicks,
      description: t.premium.valuePicksDesc,
    },
    {
      icon: BarChart3,
      title: t.premium.matchAnalysis,
      description: t.premium.matchAnalysisDesc,
    },
    {
      icon: Bell,
      title: t.premium.instantNotifs,
      description: t.premium.instantNotifsDesc,
    },
    {
      icon: Clock,
      title: t.premium.earlyOdds,
      description: t.premium.earlyOddsDesc,
    },
    {
      icon: Brain,
      title: t.premium.aiModel,
      description: t.premium.aiModelDesc,
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

      {/* PREMIUM FEATURES SECTION */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 gradient-accent text-white mb-6 shadow-brutalist-sm">
              <Crown className="w-5 h-5" />
              <span className="text-sm font-display-bold uppercase tracking-wider">Premium</span>
            </div>
            <h2 className="brutalist-heading text-4xl md:text-5xl text-foreground mb-4">
              {language === 'tr' ? 'Premium' : 'Premium'} <span className="text-gradient">{language === 'tr' ? 'Avantajları' : 'Benefits'}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.premium.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {premiumFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card-premium rounded-2xl p-6 card-hover group animate-slide-up border border-accent/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Preview */}
          <div className="max-w-lg mx-auto">
            <div className="gradient-premium rounded-2xl p-8 text-center shadow-2xl">
              <div className="mb-6">
                <span className="text-5xl font-display-bold text-white">
                  {language === 'tr' ? '₺199' : '$9.90'}
                </span>
                <span className="text-white/60 ml-2">{t.premium.perMonth}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {[
                  t.premium.securePayment,
                  t.premium.instantActivation,
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white" />
                    <span className="text-sm text-white/80">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/premium">
                <button className="h-14 px-10 bg-white text-primary font-display-bold uppercase tracking-wider border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all">
                  {t.premium.upgradeNow}
                  <ArrowRight className="w-5 h-5 ml-3 inline-block" />
                </button>
              </Link>
              <p className="text-sm text-white/50 mt-4">{t.premium.cancelAnytime}</p>
            </div>
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

      {/* TRUST INDICATORS */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-display">SSL {language === 'tr' ? 'Korumalı' : 'Protected'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-display">GDPR {language === 'tr' ? 'Uyumlu' : 'Compliant'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-display">24/7 {language === 'tr' ? 'Erişim' : 'Access'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-display">{language === 'tr' ? 'Anında Aktivasyon' : 'Instant Activation'}</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
