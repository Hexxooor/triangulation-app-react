# 🌐 Render.com Deployment Guide

## 🚀 Automatisches Deployment zur Render.com

Deine Triangulation App kann automatisch auf Render.com deployed werden - einem kostenlosen Hosting-Service für Web-Anwendungen.

## 📋 Schnellstart

### Option 1: Automatisch via GitHub (Empfohlen)
1. **Gehe zu:** https://render.com
2. **Sign up** mit deinem GitHub Account
3. **Connect Repository:** `Hexxooor/triangulation-app-react`
4. **Services werden automatisch erkannt** dank `render.yaml`

### Option 2: Manual Setup
1. **New Web Service** → **Build and deploy from a Git repository**
2. **Connect GitHub:** `https://github.com/Hexxooor/triangulation-app-react`
3. **Konfiguration:**

#### Frontend Service:
```
Name: triangulation-frontend
Runtime: Docker
Dockerfile Path: ./frontend/Dockerfile.render
<<<<<<< HEAD
=======
Build Command: npm ci && npm run build
Start Command: serve -s build -l $PORT
>>>>>>> 4a542fb (f)
```

#### Backend Service:
```
Name: triangulation-backend  
Runtime: Docker
Dockerfile Path: ./backend/Dockerfile.render
<<<<<<< HEAD
=======
Build Command: pip install -r requirements.txt
Start Command: gunicorn --bind 0.0.0.0:$PORT app:app
>>>>>>> 4a542fb (f)
```

## 🔧 Environment Variables

### Frontend Environment Variables:
```bash
NODE_ENV=production
REACT_APP_API_URL=https://triangulation-backend.onrender.com
REACT_APP_VERSION=2.0.0
```

### Backend Environment Variables:
```bash
FLASK_ENV=production
PYTHONUNBUFFERED=1
CORS_ORIGINS=https://triangulation-frontend.onrender.com
<<<<<<< HEAD
=======
SECRET_KEY=your_secure_secret_key
>>>>>>> 4a542fb (f)
```

## 🌐 Nach dem Deployment

### URLs (werden automatisch generiert):
- **Frontend:** https://triangulation-frontend.onrender.com
- **Backend:** https://triangulation-backend.onrender.com

### Features verfügbar:
- ✅ **Drag & Drop** Triangulation
- ✅ **GPS Integration** 
- ✅ **Mobile Responsive**
- ✅ **Real-time Calculations**
- ✅ **Accuracy Settings**

## 🔄 Automatische Updates

### GitHub Integration:
- **Jeder Push** zu `main` Branch triggert automatisches Deployment
- **GitHub Actions** Pipeline läuft zuerst (Tests, Builds)
- **Render Webhooks** starten Deployment nach erfolgreichem CI

### Deployment Status:
```bash
# Check deployment status
curl https://triangulation-frontend.onrender.com/health
curl https://triangulation-backend.onrender.com/api/health
```

## 💰 Kosten

### Free Tier (ausreichend für Demo/Portfolio):
- **750 Stunden/Monat** (genug für 24/7)
- **100GB Bandwidth**
- **Sleeps nach 15min Inaktivität** (wacht bei Request auf)

### Paid Plans (für Production):
- **$7/Monat** pro Service
- **Keine Sleep-Funktion**
- **Mehr Ressourcen**

## 🔧 Troubleshooting

### Häufige Probleme:

#### Service schläft ein (Free Tier)
```bash
# Keep-alive Service (optional)
# Erstelle einen Cron-Job der alle 10 Minuten die App aufruft
curl https://triangulation-frontend.onrender.com/health
```

#### Build Fehler
```bash
# Logs anzeigen in Render Dashboard
# Oder via API:
curl -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services/YOUR_SERVICE_ID/logs"
```

#### CORS Issues
```bash
# Backend Environment Variable setzen:
CORS_ORIGINS=https://triangulation-frontend.onrender.com
```

<<<<<<< HEAD
=======
## 🚀 GitHub Actions Integration

### Secrets in GitHub Repository setzen:

1. **Gehe zu:** https://github.com/Hexxooor/triangulation-app-react/settings/secrets/actions

2. **Add Repository Secrets:**
```bash
RENDER_API_KEY=your_render_api_key_here
RENDER_FRONTEND_WEBHOOK=https://api.render.com/deploy/srv-YOUR_FRONTEND_ID
RENDER_BACKEND_WEBHOOK=https://api.render.com/deploy/srv-YOUR_BACKEND_ID
```

### Workflow Status:
- ✅ **CI/CD Tests** laufen zuerst
- ✅ **Docker Builds** werden erstellt
- ✅ **Render Deployment** startet nach erfolgreichem CI
- ✅ **Health Checks** verifizieren Deployment

>>>>>>> 4a542fb (f)
## 📊 Monitoring

### Health Checks:
```bash
# Frontend Health
curl https://triangulation-frontend.onrender.com/health

# Backend Health  
curl https://triangulation-backend.onrender.com/api/health

# API Test
curl -X POST https://triangulation-backend.onrender.com/api/triangulate \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {"lat": 52.5200, "lng": 13.4050, "distance": 1000},
      {"lat": 52.5300, "lng": 13.4150, "distance": 1500},
      {"lat": 52.5100, "lng": 13.4250, "distance": 800}
    ]
  }'
```

<<<<<<< HEAD
=======
### Render Dashboard:
- **Services:** https://dashboard.render.com/
- **Logs:** Real-time logs für Debugging
- **Metrics:** Performance und Uptime Monitoring

## 🎯 Custom Domain (Optional)

### Eigene Domain verbinden:
1. **Render Dashboard** → **Service** → **Settings** → **Custom Domains**
2. **Add Custom Domain:** `triangulation.yourdomain.com`
3. **DNS Records** in deinem Domain Provider setzen:
   ```
   CNAME triangulation yourdomain.onrender.com
   ```

### SSL/HTTPS:
- **Automatisch aktiviert** für alle Render Services
- **Let's Encrypt** Zertifikate werden automatisch erneuert

## 🔗 Weitere Services

### Database (Optional):
```yaml
# render.yaml erweitern:
databases:
  - name: triangulation-postgres
    databaseName: triangulation  
    user: triangulation_user
    plan: free
```

### Redis (Optional):
```yaml
# render.yaml erweitern:
services:
  - type: redis
    name: triangulation-redis
    plan: free
    maxmemoryPolicy: allkeys-lru
```

>>>>>>> 4a542fb (f)
## ✨ Nach dem ersten Deployment

### 1. URLs testen:
```bash
open https://triangulation-frontend.onrender.com
```

### 2. Features testen:
- **Drag & Drop** Points auf der Karte
- **GPS Button** für automatische Positionierung
- **Accuracy Slider** für Genauigkeitseinstellungen
- **Mobile View** auf dem Smartphone

<<<<<<< HEAD
=======
### 3. Performance optimieren:
- **Render Sleep** vermeiden mit Keep-alive
- **CDN** für statische Assets
- **Caching** für API Responses

>>>>>>> 4a542fb (f)
---

## 🎉 Success!

**Deine Triangulation App ist jetzt live unter:**
- 🌐 **Frontend:** https://triangulation-frontend.onrender.com
- 🔧 **Backend:** https://triangulation-backend.onrender.com

**Features:**
- ✅ Professional deployment
- ✅ Automatic SSL/HTTPS
- ✅ GitHub integration
- ✅ Health monitoring
- ✅ Free hosting

**Perfect für:**
- 📋 **Portfolio Showcases**
- 🎯 **Client Demonstrations**  
- 👥 **Team Collaboration**
- 🚀 **MVP Testing**

---

<<<<<<< HEAD
**Happy Deploying! 🚀**
=======
**Happy Deploying! 🚀**
>>>>>>> 4a542fb (f)
