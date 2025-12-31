# SENTIO - Flutter Mobile App Design Specification

## 📱 Project Overview

**App Name:** SENTIO  
**Description:** AI-Powered Football Match Prediction Platform (AI Destekli Futbol Maç Tahmin Platformu)  
**Platform:** iOS & Android (Flutter)  
**Language:** Turkish (Primary)

---

## 🎨 Design System

### Brand Colors (HSL to HEX Conversion)

#### Primary Palette
```dart
// Light Theme Colors
static const Color primaryPurple = Color(0xFF8B5CF6);      // Primary - HSL(262, 83%, 58%)
static const Color primaryPurpleLight = Color(0xFFA78BFA); // Primary Hover
static const Color accentOrange = Color(0xFFF97316);       // Accent - HSL(24, 95%, 53%)
static const Color accentOrangeLight = Color(0xFFFB923C);  // Accent Hover

// Semantic Colors
static const Color winGreen = Color(0xFF22C55E);           // Win - HSL(152, 69%, 45%)
static const Color loseRed = Color(0xFFEF4444);            // Lose - HSL(0, 84%, 60%)
static const Color drawYellow = Color(0xFFF59E0B);         // Draw - HSL(38, 92%, 50%)
static const Color liveRed = Color(0xFFEF4444);            // Live indicator

// Light Theme
static const Color lightBackground = Color(0xFFF8FAFC);    // HSL(220, 30%, 98%)
static const Color lightForeground = Color(0xFF1E293B);    // HSL(220, 25%, 12%)
static const Color lightCard = Color(0xFFFFFFFF);          // Pure white
static const Color lightMuted = Color(0xFFE2E8F0);         // HSL(220, 15%, 92%)
static const Color lightMutedForeground = Color(0xFF64748B); // HSL(220, 10%, 45%)
static const Color lightBorder = Color(0xFFDDE3ED);        // HSL(220, 15%, 88%)

// Dark Theme
static const Color darkBackground = Color(0xFF0F172A);     // HSL(240, 15%, 8%)
static const Color darkForeground = Color(0xFFF1F5F9);     // HSL(220, 20%, 98%)
static const Color darkCard = Color(0xFF1E293B);           // HSL(240, 15%, 12%)
static const Color darkMuted = Color(0xFF334155);          // HSL(240, 12%, 22%)
static const Color darkMutedForeground = Color(0xFF94A3B8); // HSL(240, 8%, 55%)
static const Color darkBorder = Color(0xFF334155);         // HSL(240, 12%, 20%)
```

### Gradients
```dart
// Primary Gradient (Purple)
static const LinearGradient gradientPrimary = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [Color(0xFF8B5CF6), Color(0xFFA855F7)],
);

// Accent Gradient (Orange)
static const LinearGradient gradientAccent = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [Color(0xFFF97316), Color(0xFFFB923C)],
);

// Premium Gradient (Purple to Orange)
static const LinearGradient gradientPremium = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [Color(0xFF8B5CF6), Color(0xFFC084FC), Color(0xFFF97316)],
);

// Success Gradient (Green)
static const LinearGradient gradientSuccess = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [Color(0xFF22C55E), Color(0xFF16A34A)],
);

// Text Gradient Effect
static const LinearGradient textGradient = LinearGradient(
  colors: [Color(0xFF8B5CF6), Color(0xFFF97316)],
);
```

### Typography
```dart
// Font Family: Plus Jakarta Sans (Google Fonts)
// Install: google_fonts package

// Text Styles
class AppTypography {
  // Display - Headlines
  static TextStyle displayLarge = GoogleFonts.plusJakartaSans(
    fontSize: 48,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.02,
  );
  
  static TextStyle displayMedium = GoogleFonts.plusJakartaSans(
    fontSize: 36,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.02,
  );
  
  static TextStyle displaySmall = GoogleFonts.plusJakartaSans(
    fontSize: 28,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.02,
  );
  
  // Headlines
  static TextStyle headlineLarge = GoogleFonts.plusJakartaSans(
    fontSize: 24,
    fontWeight: FontWeight.w600,
  );
  
  static TextStyle headlineMedium = GoogleFonts.plusJakartaSans(
    fontSize: 20,
    fontWeight: FontWeight.w600,
  );
  
  static TextStyle headlineSmall = GoogleFonts.plusJakartaSans(
    fontSize: 18,
    fontWeight: FontWeight.w600,
  );
  
  // Body
  static TextStyle bodyLarge = GoogleFonts.plusJakartaSans(
    fontSize: 16,
    fontWeight: FontWeight.w400,
  );
  
  static TextStyle bodyMedium = GoogleFonts.plusJakartaSans(
    fontSize: 14,
    fontWeight: FontWeight.w400,
  );
  
  static TextStyle bodySmall = GoogleFonts.plusJakartaSans(
    fontSize: 12,
    fontWeight: FontWeight.w400,
  );
  
  // Labels
  static TextStyle labelLarge = GoogleFonts.plusJakartaSans(
    fontSize: 14,
    fontWeight: FontWeight.w500,
  );
  
  static TextStyle labelMedium = GoogleFonts.plusJakartaSans(
    fontSize: 12,
    fontWeight: FontWeight.w500,
  );
  
  static TextStyle labelSmall = GoogleFonts.plusJakartaSans(
    fontSize: 10,
    fontWeight: FontWeight.w500,
  );
}
```

### Border Radius
```dart
class AppRadius {
  static const double sm = 8.0;   // Small elements
  static const double md = 12.0;  // Medium elements
  static const double lg = 16.0;  // Cards, containers
  static const double xl = 20.0;  // Large cards
  static const double xxl = 24.0; // Modals, sheets
  static const double full = 9999.0; // Pills, avatars
}
```

### Shadows
```dart
class AppShadows {
  // Light shadows
  static BoxShadow cardShadow = BoxShadow(
    color: Colors.black.withOpacity(0.05),
    blurRadius: 10,
    offset: Offset(0, 4),
  );
  
  // Glow effects
  static BoxShadow primaryGlow = BoxShadow(
    color: Color(0xFF8B5CF6).withOpacity(0.25),
    blurRadius: 40,
    spreadRadius: 0,
  );
  
  static BoxShadow accentGlow = BoxShadow(
    color: Color(0xFFF97316).withOpacity(0.25),
    blurRadius: 40,
    spreadRadius: 0,
  );
  
  static BoxShadow winGlow = BoxShadow(
    color: Color(0xFF22C55E).withOpacity(0.35),
    blurRadius: 20,
    offset: Offset(0, 4),
  );
}
```

### Spacing
```dart
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  static const double xxxl = 32.0;
  static const double section = 48.0;
}
```

---

## 📐 Screen Specifications

### 1. Splash Screen
- **Background:** Gradient from primary purple to accent orange
- **Content:** 
  - SENTIO logo (Trophy icon in white, 80x80dp)
  - App name "SENTIO" in white, display font
  - Tagline "AI Destekli Futbol Tahmin Platformu" in white/80%
  - Loading indicator (pulsing animation)

### 2. Onboarding Screens (3 pages)
- **Page 1:** AI-powered analysis introduction
  - Brain icon with gradient background
  - Title: "Yapay Zeka Destekli Analizler"
  - Description explaining AI features
  
- **Page 2:** Real-time predictions
  - TrendingUp icon
  - Title: "Anlık Tahminler"
  - Description about live predictions
  
- **Page 3:** High success rate
  - Trophy icon
  - Title: "Yüksek Başarı Oranı"
  - Description about success metrics
  
- **Navigation:** Dot indicators, Skip button, Next/Get Started button

### 3. Authentication Screens

#### Login Screen
```
┌─────────────────────────────────────┐
│          [SENTIO Logo]              │
│    AI Destekli Futbol Tahmin        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 📧 E-posta                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🔒 Şifre                     │    │
│  └─────────────────────────────┘    │
│                                     │
│           Şifremi Unuttum →         │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      Giriş Yap              │    │
│  └─────────────────────────────┘    │
│           (Gradient Primary)        │
│                                     │
│  ─────────── veya ───────────       │
│                                     │
│  [Google]  [Apple]  [Facebook]      │
│                                     │
│     Hesabın yok mu? Kayıt Ol        │
└─────────────────────────────────────┘
```

#### Register Screen
- Same layout as login
- Additional fields: Name, Confirm Password
- Terms & Privacy checkbox
- "Kayıt Ol" primary button

### 4. Main Tab Navigation (Bottom Navigation Bar)
```dart
// 5 tabs with icons
[
  BottomNavItem(icon: Home, label: "Ana Sayfa", route: "/dashboard"),
  BottomNavItem(icon: Target, label: "Tahminler", route: "/predictions"),
  BottomNavItem(icon: Zap, label: "Canlı", route: "/live"),  // Highlighted center
  BottomNavItem(icon: Trophy, label: "Ligler", route: "/leagues"),
  BottomNavItem(icon: User, label: "Profil", route: "/profile"),
]
```

**Bottom Nav Style:**
- Background: Card color with blur effect
- Active item: Primary color with subtle glow
- Center "Canlı" button: Floating, gradient background, larger
- Height: 80dp with safe area padding

### 5. Dashboard / Home Screen
```
┌─────────────────────────────────────┐
│ ☰  SENTIO                    🔔 ⚙️  │
├─────────────────────────────────────┤
│                                     │
│  Hoş Geldin, [Kullanıcı]! 👋        │
│  Bugünün tahminleri hazır.          │
│                                     │
│  ┌──────────┐ ┌──────────┐          │
│  │ Toplam   │ │ Başarı   │          │
│  │ 247      │ │ %81.4    │          │
│  │ +12 ↑    │ │ +5% ↑    │          │
│  └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐          │
│  │ Aktif    │ │ Kazanılan│          │
│  │ 12       │ │ 201      │          │
│  │          │ │ +8 ↑     │          │
│  └──────────┘ └──────────┘          │
│                                     │
│  📊 Performans Grafiği              │
│  ┌─────────────────────────────┐    │
│  │     [Line Chart]             │    │
│  │     Son 7 gün performans     │    │
│  └─────────────────────────────┘    │
│                                     │
│  ⚡ Hızlı İşlemler                   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │Yeni│ │Canlı│ │İst.│ │Prem│        │
│  └────┘ └────┘ └────┘ └────┘        │
│                                     │
│  🔴 Canlı Maçlar                    │
│  ┌─────────────────────────────┐    │
│  │ GS 2 - 1 FB    78'  🔴      │    │
│  │ Tahmin: GS Kazanır ✓        │    │
│  └─────────────────────────────┘    │
│                                     │
│  📋 Son Aktiviteler                 │
│  ┌─────────────────────────────┐    │
│  │ ✓ Barcelona - Real Madrid   │    │
│  │   Tahmin doğru - +2.1x      │    │
│  ├─────────────────────────────┤    │
│  │ ✗ Man City - Liverpool      │    │
│  │   Tahmin yanlış             │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### 6. Predictions Screen
```
┌─────────────────────────────────────┐
│ ←  Tahminler              🔍 📊     │
├─────────────────────────────────────┤
│ [Bugün] [Yarın] [Haftalık] [Tümü]  │
├─────────────────────────────────────┤
│                                     │
│  Süper Lig                          │
│  ┌─────────────────────────────┐    │
│  │ GS      vs      FB          │    │
│  │ [Logo]         [Logo]       │    │
│  │        20:00                │    │
│  │                             │    │
│  │ AI Tahmini: Galatasaray     │    │
│  │ Güven: ████████░░ 85%       │    │
│  │                             │    │
│  │ [Detay Gör] [Tahmin Yap]    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ BJK     vs      TS          │    │
│  │ [Logo]         [Logo]       │    │
│  │        22:00                │    │
│  │                             │    │
│  │ AI Tahmini: Berabere        │    │
│  │ Güven: ██████░░░░ 62%       │    │
│  │                             │    │
│  │ [Detay Gör] [Tahmin Yap]    │    │
│  └─────────────────────────────┘    │
│                                     │
│  Premier League                     │
│  ┌─────────────────────────────┐    │
│  │ ...                         │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### 7. Match Detail Screen
```
┌─────────────────────────────────────┐
│ ←  Maç Detayı               ♡ 📤    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │    [GS Logo]   vs   [FB Logo]│   │
│  │   Galatasaray    Fenerbahçe │    │
│  │                             │    │
│  │         20:00               │    │
│  │     15 Aralık 2024          │    │
│  │                             │    │
│  │    🏟️ Türk Telekom Arena    │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Genel] [İstatistik] [Kadro] [H2H] │
│                                     │
│  🤖 AI Analizi                      │
│  ┌─────────────────────────────┐    │
│  │ Tahmin: Galatasaray Kazanır │    │
│  │                             │    │
│  │  GS    ████████████░ 68%    │    │
│  │  Berabere ███░░░░░░░ 18%    │    │
│  │  FB    ██░░░░░░░░░░ 14%     │    │
│  │                             │    │
│  │ Güven Skoru: 85/100  ⭐     │    │
│  └─────────────────────────────┘    │
│                                     │
│  📊 Önemli İstatistikler            │
│  ┌────────────────────────────┐     │
│  │ Form       ████░  ░░███     │    │
│  │ Gol Ort.   2.3      1.8     │    │
│  │ Temiz K.   4        2       │    │
│  └────────────────────────────┘     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Tahminimi Kaydet        │    │
│  │     (Gradient Primary)      │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### 8. Live Matches Screen
```
┌─────────────────────────────────────┐
│ ←  Canlı Maçlar          🔔 🔄      │
├─────────────────────────────────────┤
│                                     │
│  🔴 3 Canlı Maç                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🔴 CANLI          78:24     │    │
│  │                             │    │
│  │ [GS]  Galatasaray    2      │    │
│  │ [FB]  Fenerbahçe     1      │    │
│  │                             │    │
│  │ ⚽ 23' - Icardi              │    │
│  │ ⚽ 45' - Icardi              │    │
│  │ ⚽ 67' - Dzeko               │    │
│  │                             │    │
│  │ Tahmin: ✓ GS Kazanır        │    │
│  │ [Detaylar →]                │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🔴 CANLI          34:12     │    │
│  │                             │    │
│  │ [MC]  Man City       0      │    │
│  │ [LIV] Liverpool      0      │    │
│  │                             │    │
│  │ Tahmin: ⏳ Bekleniyor        │    │
│  │ [Detaylar →]                │    │
│  └─────────────────────────────┘    │
│                                     │
│  📅 Yaklaşan Maçlar                 │
│  ┌─────────────────────────────┐    │
│  │ Barcelona vs Real Madrid    │    │
│  │ 2 saat sonra                │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### 9. Leagues Screen
```
┌─────────────────────────────────────┐
│ ←  Ligler                   🔍      │
├─────────────────────────────────────┤
│ [Takip Edilen] [Tümü] [Ülkeler]    │
├─────────────────────────────────────┤
│                                     │
│  ⭐ Takip Ettiklerim                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │SL  │ │PL  │ │LL  │ │BL  │        │
│  └────┘ └────┘ └────┘ └────┘        │
│                                     │
│  🇹🇷 Türkiye                         │
│  ┌─────────────────────────────┐    │
│  │ 🏆 Süper Lig                │    │
│  │    20 takım • 12 maç/hafta  │    │
│  │    [Takip Et]               │    │
│  ├─────────────────────────────┤    │
│  │ 🏆 1. Lig                   │    │
│  │    18 takım • 9 maç/hafta   │    │
│  └─────────────────────────────┘    │
│                                     │
│  🏴󠁧󠁢󠁥󠁮󠁧󠁿 İngiltere                      │
│  ┌─────────────────────────────┐    │
│  │ 🏆 Premier League           │    │
│  │    20 takım • 10 maç/hafta  │    │
│  ├─────────────────────────────┤    │
│  │ 🏆 Championship             │    │
│  │    24 takım • 12 maç/hafta  │    │
│  └─────────────────────────────┘    │
│                                     │
│  🇪🇸 İspanya                         │
│  ...                                │
│                                     │
└─────────────────────────────────────┘
```

### 10. Profile Screen
```
┌─────────────────────────────────────┐
│     Profil                    ⚙️    │
├─────────────────────────────────────┤
│                                     │
│         ┌──────────┐                │
│         │  Avatar  │                │
│         │   👤     │                │
│         └──────────┘                │
│         Ahmet Yılmaz                │
│         Pro Üye ⭐                   │
│         @ahmetyilmaz                │
│                                     │
│  ┌──────────┐ ┌──────────┐          │
│  │ 247      │ │ %81.4    │          │
│  │ Tahmin   │ │ Başarı   │          │
│  └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐          │
│  │ 201      │ │ 156      │          │
│  │ Kazanılan│ │ Seri     │          │
│  └──────────┘ └──────────┘          │
│                                     │
│  📊 Performans                      │
│  ┌─────────────────────────────┐    │
│  │    [Monthly Chart]          │    │
│  └─────────────────────────────┘    │
│                                     │
│  📋 Menü                            │
│  ┌─────────────────────────────┐    │
│  │ 👤 Profili Düzenle        → │    │
│  ├─────────────────────────────┤    │
│  │ 📊 İstatistiklerim        → │    │
│  ├─────────────────────────────┤    │
│  │ ⭐ Premium                 → │    │
│  ├─────────────────────────────┤    │
│  │ 🔔 Bildirimler            → │    │
│  ├─────────────────────────────┤    │
│  │ ⚙️ Ayarlar                → │    │
│  ├─────────────────────────────┤    │
│  │ ❓ Yardım                  → │    │
│  ├─────────────────────────────┤    │
│  │ 🚪 Çıkış Yap              → │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### 11. Settings Screen
```
┌─────────────────────────────────────┐
│ ←  Ayarlar                          │
├─────────────────────────────────────┤
│                                     │
│  👤 Hesap                           │
│  ┌─────────────────────────────┐    │
│  │ Profil Bilgileri          → │    │
│  ├─────────────────────────────┤    │
│  │ Şifre Değiştir            → │    │
│  ├─────────────────────────────┤    │
│  │ Bağlı Hesaplar            → │    │
│  └─────────────────────────────┘    │
│                                     │
│  🔔 Bildirimler                     │
│  ┌─────────────────────────────┐    │
│  │ Push Bildirimleri      [●] │    │
│  ├─────────────────────────────┤    │
│  │ Maç Hatırlatıcı        [●] │    │
│  ├─────────────────────────────┤    │
│  │ Tahmin Sonuçları       [●] │    │
│  └─────────────────────────────┘    │
│                                     │
│  🎨 Görünüm                         │
│  ┌─────────────────────────────┐    │
│  │ Tema              [Otomatik]│    │
│  ├─────────────────────────────┤    │
│  │ Dil                 [Türkçe]│    │
│  └─────────────────────────────┘    │
│                                     │
│  🔒 Gizlilik                        │
│  ┌─────────────────────────────┐    │
│  │ Gizlilik Politikası       → │    │
│  ├─────────────────────────────┤    │
│  │ Kullanım Şartları         → │    │
│  ├─────────────────────────────┤    │
│  │ Hesabı Sil                → │    │
│  └─────────────────────────────┘    │
│                                     │
│  ℹ️ Hakkında                        │
│  ┌─────────────────────────────┐    │
│  │ Versiyon                1.0 │    │
│  ├─────────────────────────────┤    │
│  │ Bizi Değerlendir          → │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### 12. Premium/Subscription Screen
```
┌─────────────────────────────────────┐
│ ←  Premium                          │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │    ✨ SENTIO Premium ✨     │    │
│  │    (Gradient Premium BG)    │    │
│  │                             │    │
│  │  Tüm özelliklere erişin     │    │
│  └─────────────────────────────┘    │
│                                     │
│  ✓ Sınırsız AI tahminleri           │
│  ✓ Öncelikli bildirimler            │
│  ✓ Detaylı analiz raporları         │
│  ✓ Özel Discord kanalı              │
│  ✓ Reklamsız deneyim                │
│  ✓ VIP müşteri desteği              │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ AYLIK                       │    │
│  │ ₺99/ay                      │    │
│  │ 7 gün ücretsiz dene         │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ YILLIK           %40 İndirim│    │
│  │ ₺699/yıl (₺58/ay)          │    │
│  │ En popüler ⭐               │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Premium'a Geç           │    │
│  │     (Gradient Primary)      │    │
│  └─────────────────────────────┘    │
│                                     │
│  Dilediğiniz zaman iptal edin       │
│                                     │
└─────────────────────────────────────┘
```

### 13. Notifications Screen
```
┌─────────────────────────────────────┐
│ ←  Bildirimler         Tümünü Oku   │
├─────────────────────────────────────┤
│ [Tümü] [Maçlar] [Tahminler] [Sistem]│
├─────────────────────────────────────┤
│                                     │
│  Bugün                              │
│  ┌─────────────────────────────┐    │
│  │ ⚽ Maç Başladı!             │ 🔵 │
│  │ Galatasaray - Fenerbahçe    │    │
│  │ 2 dakika önce               │    │
│  ├─────────────────────────────┤    │
│  │ ✅ Tahmin Kazandı!          │ 🔵 │
│  │ Barcelona 3-1 Real Madrid   │    │
│  │ +2.4x kazanç                │    │
│  │ 1 saat önce                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  Dün                                │
│  ┌─────────────────────────────┐    │
│  │ 🔔 Maç Hatırlatıcı          │    │
│  │ Man City - Liverpool        │    │
│  │ 1 saat içinde başlıyor      │    │
│  ├─────────────────────────────┤    │
│  │ 📊 Haftalık Rapor           │    │
│  │ Bu hafta %82 başarı oranı   │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

---

## 🧩 Reusable Components

### 1. StatsCard
```dart
class StatsCard extends StatelessWidget {
  final String title;
  final String value;
  final int? change;          // Percentage change
  final IconData icon;
  final StatsCardVariant variant; // primary, success, accent, default
  
  // Variants change the icon background and glow colors
  // Primary: Purple gradient
  // Success: Green gradient  
  // Accent: Orange gradient
  // Default: Muted background
}
```

### 2. MatchCard
```dart
class MatchCard extends StatelessWidget {
  final Team homeTeam;
  final Team awayTeam;
  final DateTime matchTime;
  final MatchStatus status;    // upcoming, live, finished
  final AIPrediction? prediction;
  final int? homeScore;
  final int? awayScore;
  final VoidCallback onTap;
}
```

### 3. PredictionBadge
```dart
class PredictionBadge extends StatelessWidget {
  final PredictionResult result;  // win, lose, draw, pending
  final double confidence;
  
  // Colors based on result:
  // win: Green with success glow
  // lose: Red with destructive style
  // draw: Yellow/orange
  // pending: Muted/gray
}
```

### 4. GradientButton
```dart
class GradientButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final GradientType gradient;  // primary, accent, premium
  final bool isLoading;
  final IconData? icon;
}
```

### 5. GlassCard
```dart
class GlassCard extends StatelessWidget {
  final Widget child;
  final GlassCardVariant variant; // default, strong, premium
  final EdgeInsets padding;
  final VoidCallback? onTap;
  
  // Implements glassmorphism effect with:
  // - Blur backdrop
  // - Semi-transparent background
  // - Subtle border
}
```

### 6. LiveIndicator
```dart
class LiveIndicator extends StatelessWidget {
  // Pulsing red dot with "CANLI" text
  // Animation: Scale 1.0 -> 0.95 with opacity 1.0 -> 0.6
  // Duration: 1.5s, ease-in-out
}
```

### 7. ConfidenceMeter
```dart
class ConfidenceMeter extends StatelessWidget {
  final double percentage;  // 0-100
  final Color? color;       // Defaults based on percentage
  final bool showLabel;
  
  // Color logic:
  // 80-100%: Green (win color)
  // 60-79%: Primary purple
  // 40-59%: Yellow/orange
  // 0-39%: Red
}
```

### 8. TeamLogo
```dart
class TeamLogo extends StatelessWidget {
  final String? imageUrl;
  final String teamName;      // For fallback avatar
  final double size;
  final bool showBorder;
}
```

---

## 🎬 Animations

### Page Transitions
```dart
// Slide from right for forward navigation
// Slide from left for back navigation
// Fade for tab switches
// Scale for modals/dialogs
```

### Micro-interactions
```dart
// 1. Button press - slight scale down (0.95) with haptic feedback
// 2. Card tap - elevation increase with subtle scale (1.02)
// 3. Pull to refresh - custom animation with logo
// 4. Skeleton loading - shimmer effect for loading states
// 5. Success/Error - Lottie animations for feedback
// 6. Number counters - animated counting for stats
```

### Live Match Updates
```dart
// Goal animation: Confetti + vibration
// Score update: Scale bounce
// Time update: Fade transition
// Status change: Slide transition
```

---

## 📦 Recommended Packages

```yaml
dependencies:
  # UI & Styling
  google_fonts: ^6.0.0
  flutter_svg: ^2.0.0
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  lottie: ^2.7.0
  
  # State Management
  flutter_riverpod: ^2.4.0
  # OR
  flutter_bloc: ^8.1.0
  
  # Navigation
  go_router: ^12.0.0
  
  # Charts
  fl_chart: ^0.65.0
  
  # Animations
  flutter_animate: ^4.3.0
  animations: ^2.0.0
  
  # Storage
  shared_preferences: ^2.2.0
  flutter_secure_storage: ^9.0.0
  
  # Network
  dio: ^5.4.0
  
  # Utils
  intl: ^0.18.0
  timeago: ^3.6.0
```

---

## 📁 Suggested Project Structure

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   │   ├── colors.dart
│   │   ├── typography.dart
│   │   ├── spacing.dart
│   │   └── strings.dart
│   ├── theme/
│   │   ├── app_theme.dart
│   │   ├── light_theme.dart
│   │   └── dark_theme.dart
│   ├── router/
│   │   └── app_router.dart
│   └── utils/
│       └── helpers.dart
├── data/
│   ├── models/
│   │   ├── user.dart
│   │   ├── match.dart
│   │   ├── prediction.dart
│   │   ├── team.dart
│   │   └── league.dart
│   ├── repositories/
│   │   ├── auth_repository.dart
│   │   ├── match_repository.dart
│   │   └── prediction_repository.dart
│   └── services/
│       ├── api_service.dart
│       └── storage_service.dart
├── presentation/
│   ├── screens/
│   │   ├── splash/
│   │   ├── onboarding/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── predictions/
│   │   ├── live/
│   │   ├── leagues/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── notifications/
│   │   └── premium/
│   ├── widgets/
│   │   ├── common/
│   │   │   ├── gradient_button.dart
│   │   │   ├── glass_card.dart
│   │   │   ├── stats_card.dart
│   │   │   └── loading_shimmer.dart
│   │   ├── match/
│   │   │   ├── match_card.dart
│   │   │   ├── live_indicator.dart
│   │   │   └── team_logo.dart
│   │   └── prediction/
│   │       ├── prediction_badge.dart
│   │       └── confidence_meter.dart
│   └── providers/
│       ├── auth_provider.dart
│       ├── theme_provider.dart
│       └── match_provider.dart
└── l10n/
    ├── app_tr.arb
    └── app_en.arb
```

---

## 🔗 API Endpoints (Reference)

```dart
// Base URL: https://api.sentio.app/v1

// Auth
POST   /auth/login
POST   /auth/register
POST   /auth/logout
POST   /auth/forgot-password

// User
GET    /user/profile
PUT    /user/profile
GET    /user/stats
GET    /user/predictions

// Matches
GET    /matches/live
GET    /matches/upcoming
GET    /matches/{id}
GET    /matches/{id}/stats

// Predictions
GET    /predictions/today
GET    /predictions/{matchId}
POST   /predictions/save
GET    /predictions/history

// Leagues
GET    /leagues
GET    /leagues/{id}
GET    /leagues/{id}/standings
POST   /leagues/{id}/follow

// Notifications
GET    /notifications
PUT    /notifications/{id}/read
DELETE /notifications/{id}
```

---

## ✅ Implementation Checklist

### Phase 1 - Foundation
- [ ] Project setup with clean architecture
- [ ] Theme system (light/dark)
- [ ] Navigation setup with go_router
- [ ] Core widgets (buttons, cards, inputs)
- [ ] Typography and color constants

### Phase 2 - Authentication
- [ ] Splash screen with animations
- [ ] Onboarding flow
- [ ] Login screen
- [ ] Register screen
- [ ] Forgot password flow

### Phase 3 - Main Features
- [ ] Dashboard/Home screen
- [ ] Bottom navigation
- [ ] Stats cards with animations
- [ ] Performance chart

### Phase 4 - Predictions
- [ ] Predictions list screen
- [ ] Match detail screen
- [ ] AI prediction display
- [ ] Prediction saving

### Phase 5 - Live & Leagues
- [ ] Live matches screen
- [ ] Real-time updates (WebSocket)
- [ ] Leagues listing
- [ ] League detail & standings

### Phase 6 - Profile & Settings
- [ ] Profile screen
- [ ] Settings screen
- [ ] Notifications screen
- [ ] Premium subscription screen

### Phase 7 - Polish
- [ ] Micro-interactions
- [ ] Loading states
- [ ] Error handling
- [ ] Push notifications
- [ ] App icon & splash

---

## 📞 Contact & Support

**Brand:** SENTIO  
**Website:** https://sentio.app  
**Support:** support@sentio.app

---

*This design specification was created based on the SENTIO web application design system for consistency across platforms.*
