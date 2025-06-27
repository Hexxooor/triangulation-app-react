# 🎯 Erweiterte Triangulation App

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/docker-enabled-blue.svg)
![CI/CD](https://img.shields.io/badge/ci%2Fcd-enabled-green.svg)
![Render](https://img.shields.io/badge/deploy-render.com-purple.svg)

Eine moderne, containerisierte Web-Anwendung für präzise Triangulation mit erweiterten Features wie Drag & Drop, GPS-Integration und Echtzeit-Berechnung.

## 🌐 Live Demo

**🚀 App ist live auf Render.com:**
- **Frontend:** https://triangulation-frontend.onrender.com
- **Backend API:** https://triangulation-backend.onrender.com

## 🚀 Neue Features (Version 2.0)

### ✨ Core Features
- **🎯 Drag & Drop Referenzpunkte** - Intuitive Positionierung per Maus/Touch
- **📝 Inline-Entfernungsbearbeitung** - Direkte Bearbeitung durch Klick
- **🎚️ Genauigkeitseinstellungen** - Slider von 0-2000m mit Presets
- **📍 GPS-Integration** - Automatische Gerätepositionierung
- **💾 Erweiterte Projektverwaltung** - Speichern, Laden, Exportieren
- **📱 Mobile Optimierung** - Touch-optimierte Bedienung

### 🔧 Technische Verbesserungen
- **🐳 Docker Containerisierung** - Frontend + Backend vollständig containerisiert
- **🚀 GitHub Actions CI/CD** - Automatische Tests, Builds und Deployments
- **🌐 Render.com Integration** - Automatisches Deployment zu Render.com
- **🔄 Hot Reload Development** - Schnelle Entwicklungszyklen
- **📊 Monitoring Integration** - Health Checks und Observability
- **🔒 Security Hardening** - Non-root Container, Security Headers

## 🐳 Schnellstart mit Docker

### Entwicklung (Hot Reload)
```bash
# Repository klonen
git clone https://github.com/Hexxooor/triangulation-app-react.git
cd triangulation-app-react

# Development Server starten
npm run dev

# Oder mit Docker Compose direkt:
docker-compose -f docker-compose.dev.yml up --build
```

**✅ App läuft auf:** http://localhost:3000

### Produktion
```bash
# Produktion starten
npm run prod

# Logs anzeigen
npm run prod:logs

# Stoppen
npm run prod:down
```

## 🌐 Deployment zu Render.com

### Automatisches Deployment:
1. **Fork** dieses Repository
2. **Render.com Account** erstellen
3. **Repository verbinden** - Services werden automatisch erkannt
4. **Deploy** - dank vorkonfigurierter `render.yaml`

Siehe [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) für detaillierte Anleitung.

## 📋 Verfügbare Scripts

| Script | Beschreibung |
|--------|-------------|
| `npm run dev` | Development mit Hot Reload |
| `npm run prod` | Produktion starten |
| `npm run test` | Tests ausführen |
| `npm run build` | Docker Images bauen |
| `npm run health` | Health Checks |

## 🛠️ Lokale Entwicklung ohne Docker

### Voraussetzungen
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://python.org/))
- **Git** ([Download](https://git-scm.com/))

### Setup
```bash
# 1. Dependencies installieren
npm run install:all

# 2. Frontend starten (Terminal 1)
cd frontend && npm start

# 3. Backend starten (Terminal 2)
cd backend && python app.py
```

**Frontend:** http://localhost:3000  
**Backend:** http://localhost:5000

## 📱 Features im Detail

### 🎯 Drag & Drop Referenzpunkte
- **Intuitive Bedienung:** Punkte per Maus oder Touch verschieben
- **Live-Updates:** Automatische Neuberechnung beim Verschieben
- **Visuelle Feedback:** Highlight beim Hovern/Ziehen

### 📝 Inline-Entfernungsbearbeitung
- **Direkte Bearbeitung:** Klick auf Entfernungswert
- **Validierung:** 0.1m bis 50km Bereich
- **Tastatur-Navigation:** Enter zum Speichern, Escape zum Abbrechen

### 🎚️ Genauigkeitseinstellungen
- **Slider-Kontrolle:** 0-2000m Bereich
- **Smart Presets:** Hoch (50m), Mittel (100m), Niedrig (200m)
- **Visuelle Circles:** Genauigkeits-Kreise um Referenzpunkte

### 📍 GPS-Integration
- **Geräteposition:** Automatische Standortabfrage
- **Genauigkeitsanzeige:** GPS-Genauigkeit visualisiert
- **Karten-Zentrierung:** Automatisches Zentrieren auf Position

## 🏗️ Architektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Render.com    │
│   (React)       │◄──►│   (Flask)       │◄──►│   Hosting       │
│   Port: 3000    │    │   Port: 5000    │    │   Auto Deploy   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Docker        │    │   Triangulation │    │   GitHub        │
│   Container     │    │   Algorithm     │    │   Actions       │
│   (Nginx)       │    │   Engine        │    │   CI/CD         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technologie Stack
- **Frontend:** React 18, Bootstrap 5, Leaflet Maps
- **Backend:** Python Flask, NumPy (Triangulation), CORS
- **Containerisierung:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Hosting:** Render.com (automatisches Deployment)
- **Reverse Proxy:** Nginx

## 🔧 Konfiguration

### Umgebungsvariablen
```bash
# .env Datei erstellen (basierend auf .env.template)
cp .env.template .env

# Wichtige Konfigurationen:
REACT_APP_API_URL=/api              # API Endpoint
FLASK_ENV=production                # Backend Environment
SECRET_KEY=your_secret_key          # Flask Secret
```

## 📊 Performance & Limits

### Benchmarks
| Feature | Performance | Limit |
|---------|-------------|-------|
| Drag Response | <100ms | - |
| Live Calculation | <200ms | 20 Punkte |
| GPS Acquisition | <5s | Browser-abhängig |
| API Response | <1s | - |

### Browser Support
- ✅ **Chrome** 90+
- ✅ **Firefox** 88+
- ✅ **Safari** 14+
- ✅ **Edge** 90+
- ⚠️ **Mobile Safari** (GPS limitiert ohne HTTPS)

## 🚀 Deployment

### 🌐 Render.com (Empfohlen)
```bash
# Automatisches Deployment via GitHub Integration
# Siehe RENDER_DEPLOYMENT.md für Details
```

### 🐳 Docker
```bash
# Container Registry
docker pull ghcr.io/hexxooor/triangulation-app-react-frontend:latest
docker pull ghcr.io/hexxooor/triangulation-app-react-backend:latest
```

## 🔍 Monitoring & Health Checks

### Health Checks
```bash
# Live App (Render.com)
curl https://triangulation-frontend.onrender.com/health
curl https://triangulation-backend.onrender.com/api/health

# Lokal
curl http://localhost:3000/health
curl http://localhost:5000/api/health
```

## 🧪 Testing

### Automatisierte Tests
```bash
# Alle Tests ausführen
npm run test

# Coverage Report
npm run test:coverage
```

### API Tests
```bash
# Triangulation API testen
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

## 🤝 Contributing

### Development Workflow
1. **Fork** das Repository
2. **Branch** erstellen: `git checkout -b feature/amazing-feature`
3. **Entwickeln** mit Hot Reload: `npm run dev`
4. **Testen**: `npm run test`
5. **Pull Request** öffnen

Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für detaillierte Anleitung.

## 🔧 Troubleshooting

### Häufige Probleme

**Port bereits belegt:**
```bash
npm run dev:down && npm run dev
```

**GPS funktioniert nicht:**
- HTTPS erforderlich (automatisch auf Render.com)
- Browser-Permissions prüfen

**Performance Probleme:**
```bash
# Docker Resources erhöhen
docker update --memory=2g --cpus=2 container_name
```

## 📝 Changelog

### Version 2.0.0 (2024-06-27)
- ✨ **Drag & Drop** für Referenzpunkte
- ✨ **Inline-Entfernungsbearbeitung**
- ✨ **Genauigkeitseinstellungen** (0-2km Slider)
- ✨ **GPS-Integration**
- ✨ **Mobile Optimierung**
- 🐳 **Docker Containerisierung**
- 🚀 **GitHub Actions CI/CD**
- 🌐 **Render.com Deployment**
- 📊 **Monitoring Integration**
- 🔒 **Security Hardening**

Siehe [CHANGELOG.md](CHANGELOG.md) für vollständige Versionshistorie.

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 👤 Autor

**Hexxooor**
- 🌐 GitHub: [@Hexxooor](https://github.com/Hexxooor)
- 📧 Issues: [GitHub Issues](https://github.com/Hexxooor/triangulation-app-react/issues)

## 🙏 Danksagungen

- **React**, **Flask**, **Docker** Communities
- **Render.com** für kostenloses Hosting
- **GitHub Actions** für CI/CD

---

<div align="center">

**🌐 Live Demo:** https://triangulation-frontend.onrender.com

**⭐ Star this repo if you find it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/Hexxooor/triangulation-app-react.svg?style=social&label=Star)](https://github.com/Hexxooor/triangulation-app-react)
[![GitHub forks](https://img.shields.io/github/forks/Hexxooor/triangulation-app-react.svg?style=social&label=Fork)](https://github.com/Hexxooor/triangulation-app-react/fork)

**🚀 Ready for Production • 🐳 Docker Enabled • 🌐 Auto-Deploy**

</div>
