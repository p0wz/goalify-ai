import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/components/LanguageProvider";

const Terms = () => {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card-premium rounded-2xl p-8 md:p-12">
                        {language === 'tr' ? <TermsTR /> : <TermsEN />}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

const TermsEN = () => (
    <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-display-bold text-foreground mb-2">Sentio Picks Terms of Use</h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 17, 2026</p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">1. Acceptance of the Agreement</h2>
        <p className="text-muted-foreground leading-relaxed">
            By visiting the Sentio Picks website, downloading our mobile application, or utilizing any associated products and data (collectively referred to as the "Services"), you acknowledge that you have read and agree to be legally bound by these Terms of Use ("Terms"). If these terms are not acceptable to you, you must refrain from accessing or using our Services immediately.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">2. Scope of Services</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks provides data-driven sports insights, performance analysis, match predictions, and related athletic content for its subscribers. Our Services encompass, but are not limited to, statistical modeling, real-time betting odds, expert evaluations, and interactive community features.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">3. User & Subscriber Responsibilities</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">As a registered user or subscriber of Sentio Picks, you commit to the following:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Confidentiality of Information:</strong> You shall not leak, redistribute, or share the proprietary odds, analysis, or any exclusive data provided through the Services with non-subscribers or third parties.</li>
            <li><strong className="text-foreground">Non-Commercial Usage:</strong> The Services are intended strictly for individual, personal use. Any commercial exploitation of our data is prohibited.</li>
            <li><strong className="text-foreground">System Integrity:</strong> You agree not to engage in any conduct that disrupts, damages, or impairs the functionality of our digital infrastructure.</li>
            <li><strong className="text-foreground">Authorized Access:</strong> Any attempt to bypass security measures or gain unauthorized entry into our systems, networks, or restricted data is strictly forbidden.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">4. Intellectual Property Rights</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks holds exclusive ownership, title, and interest in all aspects of the Services, including but not limited to original content, software architecture, underlying code, data sets, and all related intellectual property. No part of our Services may be duplicated, modified, sold, or redistributed without express, prior written authorization from Sentio Picks.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">5. Disclaimer of Warranties</h2>
        <p className="text-muted-foreground leading-relaxed">
            The Services are provided on an "as-available" and "as-is" basis. Sentio Picks disclaims all warranties, whether express or implied, including warranties of accuracy, fitness for a specific purpose, or non-infringement. We do not guarantee that our platform will operate without interruptions, be entirely free of errors, or remain immune to digital threats like viruses.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">6. Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks, its partners, or employees shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from your use of the Services. This includes, but is not limited to, financial losses, loss of potential profits, data corruption, or other intangible losses arising from reliance on our analysis or predictions.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">7. Indemnification</h2>
        <p className="text-muted-foreground leading-relaxed">
            You agree to protect, defend, and hold Sentio Picks and its affiliates harmless from any claims, damages, legal fees, or liabilities resulting from your misuse of the Services or any breach of these established Terms.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">8. Account Termination</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks reserves the unilateral right to suspend or terminate your access to the platform at any time, with or without prior notice, for any violation of these terms or at our own discretion.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">9. Jurisdictional Law</h2>
        <p className="text-muted-foreground leading-relaxed">
            These Terms and any disputes arising from them shall be governed by and interpreted according to the laws of Türkiye, without regard to international conflict of law principles.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">10. Amendments to Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
            We may periodically update these Terms to reflect changes in our Services or legal requirements. In the event of significant modifications, we will notify our users via email or through a prominent announcement within our platform.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">Contact Information</h2>
        <p className="text-muted-foreground leading-relaxed">
            For any inquiries regarding these Terms of Use, please reach out to our team at: <a href="mailto:legal@sentiopicks.com" className="text-primary hover:underline">legal@sentiopicks.com</a>
        </p>

        <p className="text-muted-foreground leading-relaxed mt-8 italic">
            By continuing to use Sentio Picks, you confirm that you have reviewed, understood, and consented to these Terms of Use.
        </p>
    </div>
);

const TermsTR = () => (
    <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-display-bold text-foreground mb-2">Sentio Picks Kullanım Koşulları</h1>
        <p className="text-muted-foreground mb-8">Yürürlük Tarihi: 17 Ocak 2026</p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">1. Sözleşmenin Kabulü</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks web sitesini ziyaret ederek, mobil uygulamamızı indirerek veya ilgili herhangi bir ürün ve veriyi (toplu olarak "Hizmetler" olarak anılacaktır) kullanarak, bu Kullanım Koşullarını ("Koşullar") okuduğunuzu ve yasal olarak bağlı olmayı kabul ettiğinizi beyan etmiş olursunuz. Bu koşullar sizin için kabul edilebilir değilse, Hizmetlerimize erişmekten veya bunları kullanmaktan derhal kaçınmalısınız.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">2. Hizmetlerin Kapsamı</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks, aboneleri için veri odaklı spor analizleri, performans değerlendirmeleri, maç tahminleri ve ilgili atletik içerikler sunmaktadır. Hizmetlerimiz; istatistiksel modelleme, gerçek zamanlı bahis oranları, uzman değerlendirmeleri ve interaktif topluluk özelliklerini kapsamakta ancak bunlarla sınırlı değildir.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">3. Kullanıcı ve Abone Sorumlulukları</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Sentio Picks'in kayıtlı kullanıcısı veya abonesi olarak aşağıdakileri taahhüt edersiniz:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-foreground">Bilgi Gizliliği:</strong> Hizmetler aracılığıyla sağlanan tescilli oranları, analizleri veya münhasır verileri abone olmayan kişilerle veya üçüncü taraflarla sızdırmayacak, yeniden dağıtmayacak veya paylaşmayacaksınız.</li>
            <li><strong className="text-foreground">Ticari Olmayan Kullanım:</strong> Hizmetler yalnızca bireysel, kişisel kullanım için tasarlanmıştır. Verilerimizin herhangi bir ticari amaçla kullanılması yasaktır.</li>
            <li><strong className="text-foreground">Sistem Bütünlüğü:</strong> Dijital altyapımızın işlevselliğini bozan, zarar veren veya engelleyen herhangi bir davranışta bulunmamayı kabul edersiniz.</li>
            <li><strong className="text-foreground">Yetkili Erişim:</strong> Güvenlik önlemlerini atlamaya veya sistemlerimize, ağlarımıza veya kısıtlı verilere yetkisiz erişim sağlamaya yönelik herhangi bir girişim kesinlikle yasaktır.</li>
        </ul>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">4. Fikri Mülkiyet Hakları</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks, orijinal içerik, yazılım mimarisi, temel kod, veri setleri ve tüm ilgili fikri mülkiyet dahil ancak bunlarla sınırlı olmamak üzere Hizmetlerin tüm yönleri üzerinde münhasır mülkiyet, unvan ve menfaat sahibidir. Hizmetlerimizin hiçbir bölümü Sentio Picks'ten açık ve önceden yazılı izin alınmadan çoğaltılamaz, değiştirilemez, satılamaz veya yeniden dağıtılamaz.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">5. Garanti Feragatnamesi</h2>
        <p className="text-muted-foreground leading-relaxed">
            Hizmetler "mevcut haliyle" ve "sunulduğu şekliyle" sağlanmaktadır. Sentio Picks, doğruluk, belirli bir amaca uygunluk veya ihlal etmeme garantileri dahil olmak üzere tüm açık veya zımni garantileri reddeder. Platformumuzun kesintisiz çalışacağını, tamamen hatasız olacağını veya virüsler gibi dijital tehditlere karşı bağışık kalacağını garanti etmiyoruz.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">6. Sorumluluk Sınırlaması</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks, ortakları veya çalışanları, Hizmetleri kullanmanızdan kaynaklanan doğrudan, dolaylı, arızi veya sonuç olarak ortaya çıkan zararlardan sorumlu tutulamaz. Bu; analizlerimize veya tahminlerimize güvenmekten kaynaklanan mali kayıpları, potansiyel kar kaybını, veri bozulmasını veya diğer maddi olmayan kayıpları içerir ancak bunlarla sınırlı değildir.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">7. Tazminat</h2>
        <p className="text-muted-foreground leading-relaxed">
            Hizmetleri kötüye kullanmanızdan veya bu Koşulların herhangi bir ihlalinden kaynaklanan her türlü talep, zarar, yasal ücret veya yükümlülüklere karşı Sentio Picks'i ve bağlı kuruluşlarını korumayı, savunmayı ve zararsız tutmayı kabul edersiniz.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">8. Hesap Feshi</h2>
        <p className="text-muted-foreground leading-relaxed">
            Sentio Picks, bu koşulların herhangi bir ihlali nedeniyle veya kendi takdirimize bağlı olarak, önceden haber vererek veya vermeksizin, herhangi bir zamanda platforma erişiminizi askıya alma veya sonlandırma hakkını tek taraflı olarak saklı tutar.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">9. Yargı Yetkisi</h2>
        <p className="text-muted-foreground leading-relaxed">
            Bu Koşullar ve bunlardan doğan herhangi bir anlaşmazlık, uluslararası kanun çatışması ilkelerine bakılmaksızın Türkiye yasalarına göre yönetilecek ve yorumlanacaktır.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">10. Koşullarda Değişiklikler</h2>
        <p className="text-muted-foreground leading-relaxed">
            Hizmetlerimizdeki veya yasal gereksinimlerdeki değişiklikleri yansıtmak için bu Koşulları periyodik olarak güncelleyebiliriz. Önemli değişiklikler olması durumunda, kullanıcılarımızı e-posta yoluyla veya platformumuz içinde belirgin bir duyuru aracılığıyla bilgilendireceğiz.
        </p>

        <h2 className="text-xl font-display text-foreground mt-8 mb-4">İletişim Bilgileri</h2>
        <p className="text-muted-foreground leading-relaxed">
            Bu Kullanım Koşulları hakkında herhangi bir sorunuz için lütfen ekibimize şu adresten ulaşın: <a href="mailto:legal@sentiopicks.com" className="text-primary hover:underline">legal@sentiopicks.com</a>
        </p>

        <p className="text-muted-foreground leading-relaxed mt-8 italic">
            Sentio Picks'i kullanmaya devam ederek, bu Kullanım Koşullarını incelediğinizi, anladığınızı ve onayladığınızı teyit etmiş olursunuz.
        </p>
    </div>
);

export default Terms;
