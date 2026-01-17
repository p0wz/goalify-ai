import { Radio, Clock, Sparkles, Construction } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/components/LanguageProvider";

const Live = () => {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 gradient-primary flex items-center justify-center shadow-glow-primary">
                <Radio className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="brutalist-heading text-2xl">{t.live.title}</h1>
              <p className="text-sm text-muted-foreground">{t.live.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="glass-card-premium rounded-2xl p-12 text-center">
          <div className="w-24 h-24 gradient-accent mx-auto flex items-center justify-center mb-6 shadow-glow-primary">
            <Construction className="w-12 h-12 text-white" />
          </div>

          <h2 className="brutalist-heading text-3xl md:text-4xl mb-4">
            <span className="text-gradient">{t.live.comingSoon}</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
            {t.live.comingSoonDesc}
          </p>

          <div className="flex items-center justify-center gap-6">
            <div className="glass-card rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t.live.realTime}</p>
              <p className="font-display text-foreground">{t.live.liveScore}</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Sparkles className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t.live.aiSupported}</p>
              <p className="font-display text-foreground">{t.live.liveAnalysis}</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Live;
