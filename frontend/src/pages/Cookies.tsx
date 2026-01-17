import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/components/LanguageProvider";

const Cookies = () => {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card-premium rounded-2xl p-8 md:p-12">
                        {language === 'tr' ? <CookiesTR /> : <CookiesEN />}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

const CookiesEN = () => (
    <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-display-bold text-foreground mb-2">Sentio Picks Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 17, 2026</p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">1. Understanding Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
            Cookies are minor data fragments stored as text files on your computer or mobile device when you access a website. These tools are standard across the digital industry, used to ensure websites operate smoothly and to provide essential analytical data to the platform administrators.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">2. How Sentio Picks Utilizes Cookies</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">We employ cookies to enhance your journey on our platform through several specific functions:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Core Operational Cookies:</strong> These are vital for the fundamental operation of our site. They facilitate essential tasks such as secure account login and seamless site navigation.</li>
            <li><strong className="text-foreground">Analytical & Performance Cookies:</strong> These allow us to monitor how users interact with Sentio Picks—identifying which sections are most visited and detecting any technical hurdles. This data is instrumental in optimizing our platform's speed and efficiency.</li>
            <li><strong className="text-foreground">Preference & Functionality Cookies:</strong> To provide a more tailored experience, these cookies remember your specific settings, such as localized language choices or regional configurations, so you don't have to reset them during every visit.</li>
            <li><strong className="text-foreground">Marketing & Behavioral Cookies:</strong> These are used to display insights or content that aligns with your specific interests. They also help us manage the frequency of certain messages and evaluate the reach of our informational campaigns.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">3. Classifications of Cookies</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Transient (Session) Cookies:</strong> These are short-term identifiers that expire and are automatically erased once your browser session ends.</li>
            <li><strong className="text-foreground">Enduring (Persistent) Cookies:</strong> These remain on your hardware for a predetermined duration or until you manually remove them, helping us recognize you upon your return.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">4. External Third-Party Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
            In addition to our proprietary systems, we may permit trusted third-party partners to place cookies via our Services. Please note that these external cookies are governed by the respective privacy and cookie policies of those third-party entities.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">5. Managing Your Preferences</h2>
        <p className="text-muted-foreground leading-relaxed">
            You have full authority over your cookie data. Most modern web browsers provide settings that allow you to decline or delete cookies at your discretion. However, please be aware that restricting cookies may limit your access to certain interactive features and the overall performance of the Sentio Picks platform.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">6. Policy Amendments</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks may revise this Cookie Policy periodically to reflect technological or regulatory changes. We suggest visiting this page regularly to stay updated on how we use tracking technologies.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">7. Contact Information</h2>
        <p className="text-muted-foreground leading-relaxed">
            If you require further clarification regarding our use of cookies, please reach out to our support team at: <a href="mailto:privacy@sentiopicks.com" className="text-primary hover:underline">privacy@sentiopicks.com</a>
        </p>
    </div>
);

const CookiesTR = () => (
    <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-display-bold text-foreground mb-2">Sentio Picks Çerez Politikası</h1>
        <p className="text-muted-foreground mb-8">Yürürlük Tarihi: 17 Ocak 2026</p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">1. Çerezleri Anlama</h2>
        <p className="text-muted-foreground leading-relaxed">
            Çerezler, bir web sitesine eriştiğinizde bilgisayarınıza veya mobil cihazınıza metin dosyaları olarak depolanan küçük veri parçalarıdır. Bu araçlar dijital endüstride standarttır; web sitelerinin sorunsuz çalışmasını sağlamak ve platform yöneticilerine temel analitik verileri sağlamak için kullanılır.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">2. Sentio Picks Çerezleri Nasıl Kullanır</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Platformumuzdaki yolculuğunuzu çeşitli özel işlevlerle geliştirmek için çerezleri kullanıyoruz:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Temel İşletim Çerezleri:</strong> Bunlar sitemizin temel işleyişi için hayati önem taşır. Güvenli hesap girişi ve sorunsuz site navigasyonu gibi temel görevleri kolaylaştırır.</li>
            <li><strong className="text-foreground">Analitik ve Performans Çerezleri:</strong> Bunlar, kullanıcıların Sentio Picks ile nasıl etkileşimde bulunduğunu izlememize olanak tanır—en çok ziyaret edilen bölümleri belirler ve teknik engelleri tespit eder. Bu veriler platformumuzun hızını ve verimliliğini optimize etmede etkilidir.</li>
            <li><strong className="text-foreground">Tercih ve İşlevsellik Çerezleri:</strong> Daha özelleştirilmiş bir deneyim sunmak için bu çerezler, yerelleştirilmiş dil seçimleri veya bölgesel yapılandırmalar gibi belirli ayarlarınızı hatırlar, böylece her ziyarette bunları sıfırlamanız gerekmez.</li>
            <li><strong className="text-foreground">Pazarlama ve Davranışsal Çerezler:</strong> Bunlar, belirli ilgi alanlarınızla uyumlu içgörüler veya içerik görüntülemek için kullanılır. Ayrıca belirli mesajların sıklığını yönetmemize ve bilgilendirme kampanyalarımızın erişimini değerlendirmemize yardımcı olur.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">3. Çerez Sınıflandırmaları</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Geçici (Oturum) Çerezleri:</strong> Bunlar, tarayıcı oturumunuz sona erdiğinde süresi dolan ve otomatik olarak silinen kısa vadeli tanımlayıcılardır.</li>
            <li><strong className="text-foreground">Kalıcı Çerezler:</strong> Bunlar, önceden belirlenmiş bir süre boyunca veya siz manuel olarak kaldırana kadar donanımınızda kalır ve geri döndüğünüzde sizi tanımamıza yardımcı olur.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">4. Harici Üçüncü Taraf Çerezleri</h2>
        <p className="text-muted-foreground leading-relaxed">
            Kendi sistemlerimize ek olarak, güvenilir üçüncü taraf ortaklarının Hizmetlerimiz aracılığıyla çerez yerleştirmesine izin verebiliriz. Bu harici çerezlerin söz konusu üçüncü taraf kuruluşların kendi gizlilik ve çerez politikaları tarafından yönetildiğini lütfen unutmayın.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">5. Tercihlerinizi Yönetme</h2>
        <p className="text-muted-foreground leading-relaxed">
            Çerez verileriniz üzerinde tam yetkiye sahipsiniz. Çoğu modern web tarayıcısı, isteğinize göre çerezleri reddetmenize veya silmenize olanak tanıyan ayarlar sunar. Ancak, çerezleri kısıtlamanın belirli etkileşimli özelliklere erişiminizi ve Sentio Picks platformunun genel performansını sınırlayabileceğini lütfen unutmayın.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">6. Politika Değişiklikleri</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks, teknolojik veya düzenleyici değişiklikleri yansıtmak için bu Çerez Politikasını periyodik olarak revize edebilir. İzleme teknolojilerini nasıl kullandığımız hakkında güncel kalmak için bu sayfayı düzenli olarak ziyaret etmenizi öneririz.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">7. İletişim Bilgileri</h2>
        <p className="text-muted-foreground leading-relaxed">
            Çerez kullanımımız hakkında daha fazla açıklamaya ihtiyaç duyarsanız, lütfen destek ekibimize şu adresten ulaşın: <a href="mailto:privacy@sentiopicks.com" className="text-primary hover:underline">privacy@sentiopicks.com</a>
        </p>
    </div>
);

export default Cookies;
