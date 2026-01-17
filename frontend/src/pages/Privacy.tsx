import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/components/LanguageProvider";

const Privacy = () => {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card-premium rounded-2xl p-8 md:p-12">
                        {language === 'tr' ? <PrivacyTR /> : <PrivacyEN />}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

const PrivacyEN = () => (
    <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-display-bold text-foreground mb-2">Sentio Picks Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 17, 2026</p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
            At Sentio Picks, we prioritize the confidentiality of our users and are dedicated to safeguarding your personal data. This Privacy Policy outlines our procedures regarding the collection, utilization, sharing, and protection of your information when you interact with our website, mobile applications, or associated digital services (collectively, the "Services"). We encourage you to review this document thoroughly. By engaging with our Services, you consent to the data practices described herein.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">2. Data We Collect</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">We may gather various types of information to provide a better experience:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Identifiable Personal Information:</strong> Data that distinguishes you as an individual, such as your full name, email address, contact number, and payment/billing details.</li>
            <li><strong className="text-foreground">Technical Usage Data:</strong> Information regarding your interaction with our platform, including your IP address, browser specifications, device identifiers, specific pages accessed, and the timing of your visits.</li>
            <li><strong className="text-foreground">Cookies & Tracking Technologies:</strong> We utilize cookies and similar tracking tools to monitor user behavior, remember your preferences, and enhance site navigation.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">3. Purpose of Data Processing</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Your information is utilized for the following core objectives:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Service Delivery & Optimization:</strong> To operate, maintain, and refine the features and analytics we provide to you.</li>
            <li><strong className="text-foreground">User Engagement:</strong> To reach out with essential service notices, platform updates, and promotional or marketing materials.</li>
            <li><strong className="text-foreground">Legal & Rights Protection:</strong> To uphold our terms of service, prevent fraudulent activity, and defend our legal interests.</li>
            <li><strong className="text-foreground">Regulatory Compliance:</strong> To process data in accordance with applicable laws, judicial proceedings, or government requests.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">4. Information Sharing & Disclosure</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Sentio Picks does not sell your personal data. However, we may share information with:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Third-Party Service Providers:</strong> Specialized vendors who assist in our operations (e.g., payment processors, hosting services). These parties are contractually bound to use your data strictly for the services they provide to us.</li>
            <li><strong className="text-foreground">Business Affiliates:</strong> We may collaborate with trusted partners to introduce products or opportunities that align with your interests.</li>
            <li><strong className="text-foreground">Legal Mandates:</strong> We may disclose data if required by law or if we receive a valid subpoena or request from law enforcement authorities.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">5. Your Rights & Control</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">You maintain control over your data through the following options:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Review & Edit:</strong> You can access and modify your profile information by logging into your account settings or by contacting our support team.</li>
            <li><strong className="text-foreground">Communication Preferences:</strong> You may opt out of promotional emails at any time by clicking the "unsubscribe" link in our messages.</li>
            <li><strong className="text-foreground">Cookie Management:</strong> Most browsers allow you to block or delete cookies. Note that disabling these may impact the functionality of certain Service features.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">6. Data Security</h2>
        <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security protocols designed to prevent unauthorized access, alteration, or loss of your information. Nevertheless, please be aware that no digital transmission or storage system can be guaranteed as 100% secure.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">7. Protection of Minors</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks is designed for an adult audience and does not intentionally collect data from individuals under the age of 18. If we discover that a minor has provided personal information, we will take immediate steps to remove such data from our records.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">8. Revisions to This Policy</h2>
        <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify this Privacy Policy periodically. Should material changes occur, we will notify you via the email address associated with your account or through a prominent notice on our platform.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">9. Contact Us</h2>
        <p className="text-muted-foreground leading-relaxed">
            For questions, clarifications, or requests regarding your privacy and this policy, please contact us at: <a href="mailto:privacy@sentiopicks.com" className="text-primary hover:underline">privacy@sentiopicks.com</a>
        </p>
    </div>
);

const PrivacyTR = () => (
    <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-display-bold text-foreground mb-2">Sentio Picks Gizlilik Politikası</h1>
        <p className="text-muted-foreground mb-8">Yürürlük Tarihi: 17 Ocak 2026</p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">1. Giriş</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks olarak, kullanıcılarımızın gizliliğine öncelik veriyor ve kişisel verilerinizi korumaya kendimizi adıyoruz. Bu Gizlilik Politikası, web sitemiz, mobil uygulamalarımız veya ilgili dijital hizmetlerimizle (toplu olarak "Hizmetler") etkileşimde bulunduğunuzda bilgilerinizin toplanması, kullanılması, paylaşılması ve korunmasına ilişkin prosedürlerimizi özetlemektedir. Bu belgeyi dikkatlice incelemenizi öneririz. Hizmetlerimizi kullanarak, burada açıklanan veri uygulamalarına onay vermiş olursunuz.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">2. Topladığımız Veriler</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Daha iyi bir deneyim sunmak için çeşitli bilgi türleri toplayabiliriz:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Tanımlanabilir Kişisel Bilgiler:</strong> Tam adınız, e-posta adresiniz, iletişim numaranız ve ödeme/fatura bilgileriniz gibi sizi birey olarak ayırt eden veriler.</li>
            <li><strong className="text-foreground">Teknik Kullanım Verileri:</strong> IP adresiniz, tarayıcı özellikleri, cihaz tanımlayıcıları, erişilen belirli sayfalar ve ziyaretlerinizin zamanlaması dahil olmak üzere platformumuzla etkileşiminize ilişkin bilgiler.</li>
            <li><strong className="text-foreground">Çerezler ve İzleme Teknolojileri:</strong> Kullanıcı davranışını izlemek, tercihlerinizi hatırlamak ve site navigasyonunu geliştirmek için çerezler ve benzeri izleme araçları kullanıyoruz.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">3. Veri İşlemenin Amacı</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Bilgileriniz aşağıdaki temel amaçlar için kullanılmaktadır:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Hizmet Sunumu ve Optimizasyonu:</strong> Size sunduğumuz özellikleri ve analizleri işletmek, sürdürmek ve geliştirmek için.</li>
            <li><strong className="text-foreground">Kullanıcı Etkileşimi:</strong> Temel hizmet bildirimleri, platform güncellemeleri ve promosyon veya pazarlama materyalleri ile iletişime geçmek için.</li>
            <li><strong className="text-foreground">Yasal ve Hak Koruması:</strong> Hizmet şartlarımızı desteklemek, dolandırıcılık faaliyetlerini önlemek ve yasal haklarımızı savunmak için.</li>
            <li><strong className="text-foreground">Düzenleyici Uyumluluk:</strong> Verileri yürürlükteki yasalara, yargı süreçlerine veya hükümet taleplerine uygun olarak işlemek için.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">4. Bilgi Paylaşımı ve Açıklaması</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Sentio Picks kişisel verilerinizi satmaz. Ancak, bilgileri aşağıdakilerle paylaşabiliriz:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Üçüncü Taraf Hizmet Sağlayıcıları:</strong> Operasyonlarımızda yardımcı olan uzmanlaşmış tedarikçiler (örn. ödeme işlemcileri, barındırma hizmetleri). Bu taraflar, verilerinizi yalnızca bize sağladıkları hizmetler için kullanmakla sözleşmeyle bağlıdır.</li>
            <li><strong className="text-foreground">İş Ortakları:</strong> İlgi alanlarınızla uyumlu ürün veya fırsatları sunmak için güvenilir ortaklarla işbirliği yapabiliriz.</li>
            <li><strong className="text-foreground">Yasal Zorunluluklar:</strong> Kanun tarafından gerekli görülürse veya kolluk kuvvetlerinden geçerli bir celp veya talep alırsak verileri açıklayabiliriz.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">5. Haklarınız ve Kontrolünüz</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Verileriniz üzerinde aşağıdaki seçeneklerle kontrol sahibi olursunuz:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">İnceleme ve Düzenleme:</strong> Hesap ayarlarınıza giriş yaparak veya destek ekibimizle iletişime geçerek profil bilgilerinize erişebilir ve bunları değiştirebilirsiniz.</li>
            <li><strong className="text-foreground">İletişim Tercihleri:</strong> Mesajlarımızdaki "abonelikten çık" bağlantısına tıklayarak promosyon e-postalarından istediğiniz zaman çıkabilirsiniz.</li>
            <li><strong className="text-foreground">Çerez Yönetimi:</strong> Çoğu tarayıcı çerezleri engellemenize veya silmenize olanak tanır. Bunları devre dışı bırakmanın belirli Hizmet özelliklerinin işlevselliğini etkileyebileceğini unutmayın.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">6. Veri Güvenliği</h2>
        <p className="text-muted-foreground leading-relaxed">
            Bilgilerinizin yetkisiz erişimini, değiştirilmesini veya kaybını önlemek için tasarlanmış endüstri standardı güvenlik protokolleri uyguluyoruz. Ancak, hiçbir dijital iletim veya depolama sisteminin %100 güvenli olduğunun garanti edilemeyeceğini lütfen unutmayın.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">7. Küçüklerin Korunması</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks yetişkin izleyici kitlesi için tasarlanmıştır ve 18 yaşın altındaki bireylerden kasıtlı olarak veri toplamaz. Bir küçüğün kişisel bilgi sağladığını keşfedersek, bu verileri kayıtlarımızdan kaldırmak için derhal adımlar atacağız.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">8. Bu Politikada Yapılan Değişiklikler</h2>
        <p className="text-muted-foreground leading-relaxed">
            Bu Gizlilik Politikasını periyodik olarak değiştirme hakkımızı saklı tutarız. Önemli değişiklikler olması durumunda, hesabınızla ilişkili e-posta adresi aracılığıyla veya platformumuzda belirgin bir bildirim yoluyla sizi bilgilendireceğiz.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">9. Bize Ulaşın</h2>
        <p className="text-muted-foreground leading-relaxed">
            Gizliliğiniz ve bu politikayla ilgili sorularınız, açıklamalarınız veya talepleriniz için lütfen bizimle iletişime geçin: <a href="mailto:privacy@sentiopicks.com" className="text-primary hover:underline">privacy@sentiopicks.com</a>
        </p>
    </div>
);

export default Privacy;
