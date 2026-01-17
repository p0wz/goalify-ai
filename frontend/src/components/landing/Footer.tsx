import { Link } from "react-router-dom";
import { Trophy, Twitter, Instagram, Mail, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export const Footer = () => {
  const { t } = useLanguage();

  const footerLinks = {
    product: [
      { label: t.nav.pricing, href: "/pricing" },
    ],
    company: [
      { label: t.nav.about, href: "/about" },
      { label: t.nav.contact, href: "/contact" },
    ],
    legal: [
      { label: t.footer.privacyPolicy, href: "#" },
      { label: t.footer.terms, href: "#" },
    ],
  };

  return (
    <footer className="bg-card/50 backdrop-blur-xl border-t border-border relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 gradient-primary flex items-center justify-center shadow-brutalist-sm">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display-bold text-xl text-gradient">SENTIO</span>
                <span className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground">PICKS</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs leading-relaxed">
              {t.footer.description}
            </p>

            {/* Social Links - Brutalist Style */}
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Mail, href: "/contact" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 brutalist-border bg-card flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-brutalist-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-foreground mb-4 uppercase tracking-wider text-sm">{t.footer.product}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-foreground mb-4 uppercase tracking-wider text-sm">{t.footer.company}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 <span className="font-display">SENTIO PICKS</span>. {t.footer.allRightsReserved}
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link key={link.label} to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
