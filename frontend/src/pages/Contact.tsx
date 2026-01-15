import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { toast } from "@/hooks/use-toast";

const contactInfo = [
  {
    icon: Mail,
    title: "E-posta",
    value: "destek@sentiopicks.com",
    description: "7/24 e-posta desteği",
  },
  {
    icon: Phone,
    title: "Telefon",
    value: "+90 212 555 0123",
    description: "Hafta içi 09:00 - 18:00",
  },
  {
    icon: MapPin,
    title: "Adres",
    value: "İstanbul, Türkiye",
    description: "Maslak, Sarıyer",
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Mesajınız Alındı",
      description: "En kısa sürede size dönüş yapacağız.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 brutalist-border bg-card shadow-brutalist-sm mb-6">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-display-bold uppercase tracking-wider">İletişim</span>
          </div>
          <h1 className="brutalist-heading text-4xl md:text-5xl text-foreground mb-4">
            Bizimle <span className="text-gradient">İletişime</span> Geçin
          </h1>
          <p className="text-lg text-muted-foreground">
            Sorularınız, önerileriniz veya geri bildirimleriniz için bize ulaşın.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, idx) => (
              <div
                key={info.title}
                className="glass-card-premium rounded-2xl p-6 text-center card-hover animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="w-12 h-12 gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display text-foreground mb-1">{info.title}</h3>
                <p className="text-primary font-display mb-1">{info.value}</p>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <div className="glass-card-premium rounded-2xl p-8">
              <h2 className="brutalist-heading text-2xl text-foreground mb-6">
                Mesaj Gönderin
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-display text-foreground mb-2 block uppercase tracking-wider">
                      Ad Soyad *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Adınız"
                      className="h-12 bg-secondary/30 border-border/50 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-display text-foreground mb-2 block uppercase tracking-wider">
                      E-posta *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ornek@email.com"
                      className="h-12 bg-secondary/30 border-border/50 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-display text-foreground mb-2 block uppercase tracking-wider">
                    Konu
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Mesajınızın konusu"
                    className="h-12 bg-secondary/30 border-border/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-display text-foreground mb-2 block uppercase tracking-wider">
                    Mesaj *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Mesajınızı yazın..."
                    rows={5}
                    className="bg-secondary/30 border-border/50 focus:border-primary resize-none"
                  />
                </div>
                <button type="submit" className="btn-brutalist w-full h-12">
                  <Send className="w-4 h-4 mr-2 inline-block" />
                  Gönder
                </button>
              </form>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="brutalist-heading text-2xl text-foreground mb-6">
                Hızlı Yanıtlar
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "Yanıt süresi ne kadar?",
                    a: "E-posta mesajlarına genellikle 24 saat içinde yanıt veriyoruz. Pro ve Elite üyelerimize öncelikli destek sağlıyoruz."
                  },
                  {
                    q: "Canlı destek var mı?",
                    a: "Pro ve Elite üyelerimiz için 7/24 canlı destek hattımız mevcuttur. Dashboard üzerinden erişebilirsiniz."
                  },
                  {
                    q: "Teknik sorunlar için ne yapmalıyım?",
                    a: "Teknik sorunlarınız için destek@sentiopicks.com adresine detaylı bir açıklama ile e-posta gönderebilirsiniz."
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="glass-card-premium rounded-xl p-5 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    <h3 className="font-display text-foreground mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 gradient-primary flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-display text-foreground">Çalışma Saatleri</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pazartesi - Cuma</span>
                    <span className="font-display text-foreground">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cumartesi</span>
                    <span className="font-display text-foreground">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pazar</span>
                    <span className="font-display text-foreground">Kapalı</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
