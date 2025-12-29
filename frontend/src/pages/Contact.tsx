import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { toast } from "@/hooks/use-toast";

const contactInfo = [
  {
    icon: Mail,
    title: "E-posta",
    value: "destek@protahmin.com",
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
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">İletişim</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
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
            {contactInfo.map((info) => (
              <div 
                key={info.title}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                <p className="text-primary font-medium mb-1">{info.value}</p>
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
            <div className="bg-card border border-border rounded-3xl p-8">
              <h2 className="text-2xl font-display text-foreground mb-6">
                Mesaj Gönderin
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Ad Soyad *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Adınız"
                      className="h-12 rounded-xl bg-muted border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      E-posta *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ornek@email.com"
                      className="h-12 rounded-xl bg-muted border-border"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Konu
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Mesajınızın konusu"
                    className="h-12 rounded-xl bg-muted border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Mesaj *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Mesajınızı yazın..."
                    rows={5}
                    className="rounded-xl bg-muted border-border resize-none"
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl gradient-primary text-primary-foreground">
                  <Send className="w-4 h-4 mr-2" />
                  Gönder
                </Button>
              </form>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-display text-foreground mb-6">
                Hızlı Yanıtlar
              </h2>
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold text-foreground mb-2">
                    Yanıt süresi ne kadar?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    E-posta mesajlarına genellikle 24 saat içinde yanıt veriyoruz. 
                    Pro ve Elite üyelerimize öncelikli destek sağlıyoruz.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold text-foreground mb-2">
                    Canlı destek var mı?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Pro ve Elite üyelerimiz için 7/24 canlı destek hattımız mevcuttur. 
                    Dashboard üzerinden erişebilirsiniz.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold text-foreground mb-2">
                    Teknik sorunlar için ne yapmalıyım?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Teknik sorunlarınız için destek@protahmin.com adresine detaylı 
                    bir açıklama ile e-posta gönderebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-muted/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Çalışma Saatleri</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pazartesi - Cuma</span>
                    <span className="text-foreground">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cumartesi</span>
                    <span className="text-foreground">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pazar</span>
                    <span className="text-foreground">Kapalı</span>
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
