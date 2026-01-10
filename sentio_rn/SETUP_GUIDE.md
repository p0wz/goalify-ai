# Firebase ve RevenueCat Yapılandırma Rehberi

## 📱 Firebase Kurulumu

### 1. Firebase Console'da Proje Oluşturma

1. [Firebase Console](https://console.firebase.google.com)'a gidin
2. "Add project" tıklayın ve "SENTIO" adında proje oluşturun
3. Google Analytics'i etkinleştirin (isteğe bağlı)

### 2. Android Uygulaması Ekleme

1. Project settings → Add app → Android
2. Package name: `com.sentio.app` (bu değeri app.json'da güncelleyin)
3. `google-services.json` dosyasını indirin
4. Dosyayı şu konuma kopyalayın: `android/app/google-services.json`

### 3. iOS Uygulaması Ekleme

1. Project settings → Add app → iOS
2. Bundle ID: `com.sentio.app`
3. `GoogleService-Info.plist` dosyasını indirin
4. Dosyayı şu konuma kopyalayın: `ios/GoogleService-Info.plist`

### 4. Authentication Ayarları

1. Firebase Console → Authentication → Sign-in method
2. Şu sağlayıcıları etkinleştirin:
   - Email/Password
   - Google

### 5. Web Client ID Alın

1. Google Cloud Console → APIs & Services → Credentials
2. "OAuth 2.0 Client IDs" bölümünden Web Client ID'yi kopyalayın
3. `src/services/firebase.ts` dosyasında güncelleyin:

```typescript
const WEB_CLIENT_ID = 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com';
```

---

## 💳 RevenueCat Kurulumu

### 1. RevenueCat Hesabı

1. [RevenueCat](https://app.revenuecat.com) hesabı oluşturun
2. Yeni proje oluşturun: "SENTIO"

### 2. App Store Connect Entegrasyonu (iOS)

1. App Store Connect'te uygulama oluşturun
2. In-App Purchases ekleyin:
   - `sentio_pro_monthly` - Aylık ($9.99)
   - `sentio_pro_annual` - Yıllık ($79.99)
3. RevenueCat'te App Store Connect bağlayın

### 3. Google Play Console Entegrasyonu (Android)

1. Google Play Console'da uygulama oluşturun
2. In-App Products ekleyin:
   - `sentio_pro_monthly`
   - `sentio_pro_annual`
3. RevenueCat'te Google Play bağlayın

### 4. RevenueCat Entitlements

1. RevenueCat → Entitlements → Create
2. ID: `pro`
3. Bu entitlement'a ürünlerinizi ekleyin

### 5. API Keys

1. RevenueCat → API Keys
2. iOS ve Android için Public App-specific API Keys alın
3. `src/services/revenuecat.ts` dosyasında güncelleyin:

```typescript
const API_KEYS = {
  ios: 'appl_YOUR_IOS_API_KEY',
  android: 'goog_YOUR_ANDROID_API_KEY',
};
```

---

## 📲 Expo Configuration

### app.json Güncellemesi

```json
{
  "expo": {
    "name": "SENTIO",
    "slug": "sentio",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.sentio.app",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "com.sentio.app",
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

---

## 🧪 Test Kullanıcıları

### Sandbox Test (iOS)
1. App Store Connect → Users and Access → Sandbox Testers
2. Test kullanıcısı ekleyin
3. Cihazda App Store'dan çıkış yapın ve sandbox hesabıyla giriş yapın

### Test Track (Android)
1. Google Play Console → Testing → Internal testing
2. Tester ekleyin
3. Test bağlantısını paylaşın

---

## 🚀 Build Komutları

### Development Build (EAS)

```bash
# iOS
npx eas-cli build --profile development --platform ios

# Android  
npx eas-cli build --profile development --platform android
```

### Production Build

```bash
npx eas-cli build --profile production --platform all
```

---

## ✅ Onay Listesi

- [ ] Firebase projesi oluşturuldu
- [ ] google-services.json indirildi
- [ ] GoogleService-Info.plist indirildi
- [ ] Web Client ID alındı ve firebase.ts'e eklendi
- [ ] RevenueCat hesabı oluşturuldu
- [ ] In-App Products oluşturuldu
- [ ] "pro" entitlement oluşturuldu
- [ ] API keys alındı ve revenuecat.ts'e eklendi
- [ ] app.json güncellendi
- [ ] EAS Build yapılandırıldı
