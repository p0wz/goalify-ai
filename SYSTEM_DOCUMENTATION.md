# GoalSniper/Goalify AI - Sistem Dokümantasyonu

> **Son Güncelleme:** 2026-01-03
> **Versiyon:** 2.0 (Live Bot Entegrasyonu)

---

## 📁 Proje Yapısı

```
goalsniper-daily/
├── backend/
│   ├── server.js              # Ana Express sunucu
│   ├── lib/
│   │   ├── analyzer.js        # Günlük maç analizi (13 market)
│   │   ├── auth.js            # JWT kimlik doğrulama
│   │   ├── database.js        # Turso/LibSQL veritabanı
│   │   ├── flashscore.js      # RapidAPI Flashscore client
│   │   ├── redis.js           # Upstash Redis cache
│   │   ├── settlement.js      # Günlük bahis settlement
│   │   ├── liveBot.js         # Canlı bot ana modülü
│   │   ├── liveMomentum.js    # Momentum algılama
│   │   ├── liveH2H.js         # Skor-duyarlı H2H analizi
│   │   ├── liveStrategies.js  # First Half / Late Game stratejileri
│   │   └── liveSettlement.js  # Canlı sinyal settlement
│   └── data/
│       └── leagues.js         # İzin verilen ligler
├── frontend/
│   └── src/
│       ├── pages/             # React sayfaları
│       └── components/        # UI bileşenleri
└── sentio_app/                # Flutter mobil uygulama
```

---

## 🔧 Backend Modülleri

### 1. server.js (Ana Sunucu)
**Satır Sayısı:** ~815
**Port:** 3001 (varsayılan)

#### Bağımlılıklar:
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
```

#### Cron Jobs:
| Job | Zamanlama | Açıklama |
|-----|-----------|----------|
| `runSettlementCycle` | Her 10 dakika | Günlük bahis settlement |
| `liveSettlement.runLiveSettlement` | Her 10 dakika | Canlı sinyal settlement |

#### API Rotaları:

**Auth Routes:**
| Endpoint | Method | Auth | Açıklama |
|----------|--------|------|----------|
| `/api/auth/register` | POST | - | Yeni kullanıcı kaydı |
| `/api/auth/login` | POST | - | Giriş yapma |
| `/api/auth/me` | GET | ✓ | Kullanıcı bilgisi |

**Analysis Routes:**
| Endpoint | Method | Auth | Açıklama |
|----------|--------|------|----------|
| `/api/analysis/run` | POST | ✓ | Günlük analiz başlat |
| `/api/analysis/cached` | GET | ✓ | Cache'deki sonuçlar |

**Bet Management Routes:**
| Endpoint | Method | Auth | Açıklama |
|----------|--------|------|----------|
| `/api/bets` | GET | ✓ | Onaylı bahisleri getir |
| `/api/bets` | POST | ✓ | Yeni bahis ekle |
| `/api/bets/settle` | POST | Admin | Manuel settlement |
| `/api/training` | GET/POST | Admin | Training pool |

**Live Bot Routes:**
| Endpoint | Method | Auth | Açıklama |
|----------|--------|------|----------|
| `/api/live/signals` | GET | ✓ | Aktif sinyalleri getir |
| `/api/live/history` | GET | ✓ | Sinyal geçmişi |
| `/api/live/scan` | POST | Admin | Manuel tarama |
| `/api/live/start` | POST | Admin | Botu başlat |
| `/api/live/stop` | POST | Admin | Botu durdur |

---

### 2. auth.js (Kimlik Doğrulama)
**Satır Sayısı:** 101

#### Fonksiyonlar:

```javascript
authenticateToken(req, res, next)
```
- JWT token doğrulama middleware
- Bearer token formatı: `Authorization: Bearer <token>`
- Token süresi: 24 saat
- Legacy admin desteği: `admin-legacy` ID

```javascript
requireAdmin(req, res, next)
```
- Admin rolü kontrolü middleware
- `req.user.role === 'admin'` kontrolü

```javascript
generateToken(user)
```
- JWT token oluşturma
- Payload: `{ id, email, role, plan }`
- Algorithm: HS256

```javascript
hashPassword(password) / comparePassword(plain, hashed)
```
- bcrypt ile şifre hashleme (salt: 10)

---

### 3. database.js (Veritabanı)
**Satır Sayısı:** ~500
**Teknoloji:** Turso (LibSQL)

#### Tablolar:

**users:**
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',      -- user | admin
    plan TEXT DEFAULT 'free',      -- free | pro
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

**approved_bets:**
```sql
CREATE TABLE approved_bets (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    home_team TEXT,
    away_team TEXT,
    league TEXT,
    market TEXT,
    odds TEXT,
    status TEXT DEFAULT 'PENDING',  -- PENDING | WON | LOST | REFUND
    final_score TEXT,
    match_time TEXT,
    approved_at TEXT,
    settled_at TEXT
)
```

**live_signals:**
```sql
CREATE TABLE live_signals (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    home_team TEXT,
    away_team TEXT,
    league TEXT,
    strategy TEXT,           -- First Half Goal | Late Game Goal
    strategy_code TEXT,      -- FIRST_HALF | LATE_GAME
    entry_score TEXT,
    entry_time INTEGER,
    match_minute INTEGER,
    confidence INTEGER,
    reason TEXT,
    stats TEXT,              -- JSON: shots, corners, xG
    status TEXT DEFAULT 'PENDING',
    final_score TEXT,
    settled_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

**training_pool:**
```sql
CREATE TABLE training_pool (
    id TEXT PRIMARY KEY,
    match_id TEXT,
    home_team TEXT,
    away_team TEXT,
    market TEXT,
    prediction TEXT,
    actual_result TEXT,      -- WON | LOST
    stats TEXT,              -- JSON
    created_at TEXT
)
```

#### CRUD Fonksiyonlar:
- `createUser`, `getUserByEmail`, `getUserById`, `getAllUsers`
- `addApprovedBet`, `getApprovedBets`, `settleBetInDB`
- `addLiveSignal`, `getLiveSignals`, `updateLiveSignal`, `getLiveSignalStats`
- `addToTrainingPool`, `getTrainingPool`, `getTrainingStats`

---

### 4. flashscore.js (API Client)
**Satır Sayısı:** ~360
**API:** RapidAPI Flashscore4

#### Konfigürasyon:
```javascript
// Günlük analiz için
const FLASHSCORE_API = {
    baseURL: 'https://flashscore4.p.rapidapi.com',
    headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'flashscore4.p.rapidapi.com'
    }
};

// Canlı bot için (ayrı key)
const FLASHSCORE_API_LIVE = {
    headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY_LIVE || process.env.RAPIDAPI_KEY
    }
};
```

#### API Endpoints:
| Fonksiyon | Endpoint | Kullanım |
|-----------|----------|----------|
| `fetchDayMatches` | `/v1/events/list?sport_id=1&date={YYYYMMDD}` | Günlük maç listesi |
| `fetchH2H` | `/v1/match/h2h/{matchId}` | H2H verileri |
| `fetchMatchDetails` | `/v1/match/details/{matchId}` | Maç detayları (skor) |
| `fetchMatchOdds` | `/v1/match/odds/{matchId}` | Maç oranları |
| `fetchLiveMatches` | `/v1/match/live/1` | Canlı maçlar (Live Bot) |
| `fetchMatchStats` | `/v1/match/stats/{matchId}` | Maç istatistikleri (Live Bot) |

#### Rate Limiting:
- Her istek arası 400ms bekleme
- 429 hatasında exponential backoff (5 retry)

---

### 5. analyzer.js (Günlük Analiz)
**Satır Sayısı:** ~704
**Market Sayısı:** 14

#### Analiz Edilen Marketler:

| # | Market | Kriterleri |
|---|--------|------------|
| 1 | Over 2.5 Goals | Lig ort ≥3.0, Her iki takım O2.5 ≥70%, Ev takım gol ≥1.5 |
| 2 | BTTS | Ev gol %≥85, Dep gol %≥80, BTTS form ≥70%, H2H BTTS ≥50% |
| 3 | 1X Double Chance | Ev kayıp ≤1, Dep galibiyet <%30 |
| 4 | Home Over 1.5 | Ev gol ≥2.2, Dep yediği ≥1.6, Ev gol %≥90 |
| 5 | Under 3.5 | Lig ort <2.4, U3.5 form ≥80%, H2H güvenli |
| 6 | Under 2.5 | Lig ort <2.5, U2.5 form ≥75% |
| 7 | First Half O0.5 | İlk yarı gol analizi + HT skor doğrulaması |
| 8 | MS1 & 1.5 Üst | Ev galibiyet ≥60%, Ev gol ≥1.9 |
| 9 | Dep 0.5 Üst | Dep gol %≥80, Deplasmanda ≥1.2 gol |
| 10 | Hnd. MS1 (-1.5) | Ev %≥70, Gol farkı ≥1.8 |
| 11 | Hnd. MS2 (-1.5) | Dep %≥70, Gol farkı ≥1.8 |
| 12 | 1X + 1.5 Üst | Çifte şans + gol kombinasyonu |
| 13 | Ev Herhangi Yarı | İlk veya ikinci yarıyı kazanma |
| 14 | Dep DNB | Beraberlikte iade |

#### Ana Fonksiyonlar:
```javascript
calculateStats(history, teamName)    // Form hesaplama
analyzeMatch(match, h2hData)         // Tam analiz
analyzeFirstHalf(...)                // İlk yarı potansiyeli
validateHTScores(...)                // HT skor doğrulama
generateAIPrompt(...)                // AI prompt oluşturma
```

---

### 6. settlement.js (Günlük Settlement)
**Satır Sayısı:** ~249
**Bekleme:** 3 saat (maç sonrası)

#### Desteklenen Market Değerlendirmeleri:

```javascript
evaluatePrediction(market, homeGoals, awayGoals, htHome, htAway)
```

| Kategori | Marketler |
|----------|-----------|
| Over/Under | O0.5, O1.5, O2.5, O3.5, U1.5, U2.5, U3.5, U4.5 |
| BTTS | BTTS, BTTS No |
| 1X2 | MS1, MS2, MSX |
| Double Chance | 1X, X2, 12 |
| Team Goals | Home O1.5, Home O0.5, Away O0.5, Away O1.5 |
| DNB | Home DNB, Away DNB (REFUND döner) |
| First Half | 1H O0.5 (HT skoru gerekli) |
| Kombinasyonlar | 1X+O1.5, 2X+O1.5, 1+O2.5, 2+U3.5, vb. |

---

### 7. redis.js (Cache)
**Satır Sayısı:** 197
**Teknoloji:** Upstash Redis

#### Cache Keys:
| Key | TTL | Açıklama |
|-----|-----|----------|
| `goalsniper:analysis:results` | 1 saat | Analiz sonuçları |
| `goalsniper:settlement:status` | 24 saat | Settlement durumu |
| `goalsniper:ratelimit:{key}` | 60 saniye | Rate limiting |
| `goalsniper:stats:{stat}` | ∞ | İstatistikler |

#### Fonksiyonlar:
- `cacheAnalysisResults` / `getCachedAnalysisResults`
- `checkRateLimit(key, maxRequests, windowSeconds)`
- `incrementStat(stat)` / `getStats()`
- `ping()` - Health check

---

## 🤖 Canlı Bot Sistemi

### 8. liveBot.js (Ana Modül)
**Satır Sayısı:** ~406
**Tarama Aralığı:** 3 dakika

#### Akış:
```
1. fetchLiveMatches() - Tüm canlı maçları çek
2. Filter Candidates - Zaman/skor kriterleri
3. fetchMatchStats() - İstatistikleri çek
4. Red Card Check - Kırmızı kart filtresi
5. Base Activity Check - Ölü maç kontrolü
6. Momentum Detection - 12 dakikalık lookback
7. Strategy Analysis - First Half / Late Game
8. Signal Limit Check - Günlük limit kontrolü
9. H2H Analysis - Skor-duyarlı analiz
10. Score Safety Check - Skor değişimi kontrolü
11. Save Signal - Veritabanına kaydet
```

#### Sinyal Limitleri:
| Strateji | Günlük Limit |
|----------|--------------|
| FIRST_HALF | 1 sinyal/maç |
| LATE_GAME | 2 sinyal/maç |

---

### 9. liveMomentum.js (Momentum Algılama)
**Satır Sayısı:** ~229
**Lookback:** 12 dakika (4 snapshot)

#### Momentum Tetikleyicileri:
| Tetikleyici | Koşul | Açıklama |
|-------------|-------|----------|
| CORNER_SIEGE | +3 korner | 12 dk içinde eklenen |
| SHOT_SURGE | +4 şut | 12 dk içinde eklenen |
| SOT_THREAT | +2 isabetli şut | 12 dk içinde eklenen |
| XG_SPIKE | +0.4 xG | 12 dk içinde eklenen |

#### Base Activity Check:
```javascript
checkBaseActivity(elapsed, stats) {
    // İlk yarı: 30' sonra min 4 şut, 2 korner
    // İkinci yarı: 60' sonra min 6 şut, 3 korner
    return { isAlive, reason }
}
```

---

### 10. liveStrategies.js (Strateji Analizi)
**Satır Sayısı:** ~279

#### First Half Goal (12'-38'):
| Kriter | Koşul |
|--------|-------|
| Dakika | 12-38 arası |
| Skor Farkı | ≤ 1 |
| Momentum | Gerekli |

**Confidence Bonusları:**
- SoT ≥ 4: +5%
- Shots ≥ 8: +5%
- Corners ≥ 5: +5%
- xG ≥ 0.8: +8%
- xG > Goals: +10% (Underperformance)
- Dominance (60%+ poss): +8%
- Peak Timing (18'-32'): +5%

#### Late Game Goal (46'-82'):
| Kriter | Koşul |
|--------|-------|
| Dakika | 46-82 arası |
| Skor Farkı | ≤ 2 |
| Momentum | Gerekli |

**Ek Bonuslar:**
- Trailing Team Attack: +12%
- Close Game (0-0, 1-1): +8%
- xG Underperformance: +10%

---

### 11. liveH2H.js (H2H Analizi)
**Satır Sayısı:** ~147
**API Calls:** Max 5 per match

#### İstek Yapısı:
- Home team son 2 maç
- Away team son 2 maç
- Son H2H maçı

#### Skor-Duyarlı Analiz:
```javascript
// First Half için
avgHTGoals = avg(ht_goals_from_last_matches)
remainingPotential = avgHTGoals - currentHTGoals

// remainingPotential < 0.5 → SKIP
// remainingPotential ≥ 1.5 → +15% bonus
```

#### Confidence Bonusları:
| Koşul | Bonus |
|-------|-------|
| HT Rate ≥ 70% | +12% |
| HT Rate 50-70% | +6% |
| HT Rate < 40% | SKIP |
| Remaining ≥ 1.5 | +15% |
| Remaining ≥ 0.8 | +8% |
| Remaining < 0.5 | SKIP |
| Last H2H 3+ goals | +8% |
| Last H2H 0-1 goal | -8% |

---

### 12. liveSettlement.js (Canlı Settlement)
**Satır Sayısı:** ~135
**Bekleme:** 1 saat

#### Settlement Mantığı:
```javascript
// FIRST_HALF sinyalleri
checkScore = HT Score (score_1st_half)

// LATE_GAME sinyalleri
checkScore = FT Score (score)

if (finalScore !== entryScore) → WON
else → LOST
```

---

## 🗄️ Environment Variables

```env
# Server
PORT=3001

# Database (Turso)
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# API Keys
RAPIDAPI_KEY=...              # Günlük analiz için
RAPIDAPI_KEY_LIVE=...         # Canlı bot için (opsiyonel)

# Auth
JWT_SECRET=...
SESSION_SECRET=...

# CORS
ALLOWED_ORIGINS=https://goalify-ai.pages.dev
```

---

## 🖥️ Frontend (React + Vite)

### Sayfa Yapısı:
| Sayfa | Rota | Açıklama |
|-------|------|----------|
| Landing | `/` | Ana sayfa |
| Login | `/login` | Giriş |
| Register | `/register` | Kayıt |
| Dashboard | `/dashboard` | Kullanıcı paneli |
| Analysis | `/analysis` | Analiz sayfası |
| AdminPanel | `/admin` | Admin paneli |

### Admin Panel Sekmeleri:
1. **Analiz** - Günlük analiz çalıştırma
2. **Tüm Maçlar** - Tüm maçlar listesi
3. **Bahisler** - Onaylı bahisler
4. **Canlı Bot** - Bot kontrolü + aktif sinyaller
5. **Bot Geçmişi** - Sinyal geçmişi tablosu
6. **Mobil** - Mobil bahis yönetimi
7. **Training** - Training pool
8. **Kullanıcılar** - Kullanıcı yönetimi

---

## 📱 Mobil Uygulama (Flutter)

**Proje:** `sentio_app/`
**Teknolojiler:** Flutter, Riverpod, Go Router

### Ekranlar:
- Splash Screen
- Login/Register
- Dashboard
- Predictions
- Premium
- Settings
- Notifications

---

## 🚀 Deployment

### Backend (Render):
- Auto-deploy from GitHub
- Environment: Node.js 18
- Health check: `/api/health`

### Frontend (Cloudflare Pages):
- Auto-deploy from GitHub
- Build: `npm run build`
- Output: `dist/`

### Database (Turso):
- Distributed SQLite
- Primary region: Fra (Frankfurt)

### Cache (Upstash):
- Redis REST API
- Global replication

---

## 📊 API Kullanım Tahmini

| İşlem | Günlük API Call |
|-------|-----------------|
| Günlük Analiz (50 maç) | ~300 call |
| Canlı Bot (8 saat, 3dk aralık) | ~160 call (listeler) |
| Canlı Bot Stats | ~500 call |
| Settlement | ~100 call |
| **Toplam** | ~1000-1500 call/gün |

---

*Bu dokümantasyon otomatik olarak oluşturulmuştur.*
