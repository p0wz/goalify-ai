# GoalSniper Daily

Günlük maç öncesi analiz ve otomatik settlement sistemi.

## Kurulum

### Backend
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Backend (Render)
1. GitHub repo'yu Render'a bağlayın
2. Environment Variables ekleyin:
   - `RAPIDAPI_KEY`
   - `GROQ_API_KEY`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`

### Frontend (Vercel)
1. GitHub repo'yu Vercel'e bağlayın
2. `vercel.json`'daki API URL'yi güncelleyin
3. Deploy edin

## Özellikler
- 13 market analizi
- AI prompt oluşturma
- Otomatik settlement
- Training pool
