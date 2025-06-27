# 🎯 Erweiterte Triangulation App

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/docker-enabled-blue.svg)
![CI/CD](https://img.shields.io/badge/ci%2Fcd-enabled-green.svg)
<<<<<<< HEAD
![Render](https://img.shields.io/badge/deploy-render.com-purple.svg)

Eine moderne, containerisierte Web-Anwendung für präzise Triangulation mit erweiterten Features wie Drag & Drop, GPS-Integration und Echtzeit-Berechnung.

## 🌐 Live Demo

**🚀 App ist live auf Render.com:**
- **Frontend:** https://triangulation-frontend.onrender.com
- **Backend API:** https://triangulation-backend.onrender.com
=======

Eine moderne, containerisierte Web-Anwendung für präzise Triangulation mit erweiterten Features wie Drag & Drop, GPS-Integration und Echtzeit-Berechnung.

![Triangulation App Screenshot](docs/images/screenshot-main.png)
>>>>>>> 4a542fb (f)

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
<<<<<<< HEAD
- **🌐 Render.com Integration** - Automatisches Deployment zu Render.com
- **🔄 Hot Reload Development** - Schnelle Entwicklungszyklen
- **📊 Monitoring Integration** - Health Checks und Observability
=======
- **🔄 Hot Reload Development** - Schnelle Entwicklungszyklen
- **📊 Monitoring Integration** - Prometheus, Grafana, Health Checks
>>>>>>> 4a542fb (f)
- **🔒 Security Hardening** - Non-root Container, Security Headers

## 🐳 Schnellstart mit Docker

### Entwicklung (Hot Reload)
```bash
# Repository klonen
<<<<<<< HEAD
git clone https://github.com/Hexxooor/triangulation-app-react.git
=======
git clone https://github.com/username/triangulation-app-react.git
>>>>>>> 4a542fb (f)
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

<<<<<<< HEAD
=======
# Oder mit Docker Compose direkt:
docker-compose up --build -d

>>>>>>> 4a542fb (f)
# Logs anzeigen
npm run prod:logs

# Stoppen
npm run prod:down
```

<<<<<<< HEAD
## 🌐 Deployment zu Render.com

### Automatisches Deployment:
1. **Fork** dieses Repository
2. **Render.com Account** erstellen
3. **Repository verbinden** - Services werden automatisch erkannt
4. **Deploy** - dank vorkonfigurierter `render.yaml`

Siehe [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) für detaillierte Anleitung.
=======
### Erweiterte Produktion (mit Monitoring)
```bash
# Mit Prometheus, Grafana, Load Balancing
npm run prod:extended

# Monitoring Dashboard: http://localhost:3001
# Prometheus: http://localhost:9090
```
>>>>>>> 4a542fb (f)

## 📋 Verfügbare Scripts

| Script | Beschreibung |
|--------|-------------|
| `npm run dev` | Development mit Hot Reload |
| `npm run prod` | Produktion starten |
| `npm run test` | Tests ausführen |
| `npm run build` | Docker Images bauen |
| `npm run health` | Health Checks |
<<<<<<< HEAD
=======
| `npm run logs:frontend` | Frontend Logs |
| `npm run logs:backend` | Backend Logs |
| `npm run quick-start` | Schnellster Start (detached) |

<details>
<summary>📋 Alle verfügbaren Scripts anzeigen</summary>

```bash
# Development
npm run dev                    # Development mit Hot Reload
npm run dev:detached          # Development im Hintergrund
npm run dev:down              # Development stoppen
npm run dev:logs              # Development Logs
npm run dev:clean             # Development cleanup

# Production
npm run prod                  # Produktion starten
npm run prod:down             # Produktion stoppen
npm run prod:logs             # Produktion Logs
npm run prod:clean            # Produktion cleanup
npm run prod:extended         # Erweiterte Produktion mit Monitoring

# Build & Test
npm run build                 # Docker Images bauen
npm run build:no-cache        # Build ohne Cache
npm run test                  # Tests ausführen
npm run test:coverage         # Tests mit Coverage

# Health & Monitoring
npm run health                # Health Checks
npm run monitoring            # Monitoring Stack starten

# Utilities
npm run setup                 # Komplettes Setup
npm run quick-start           # Schnellstart
npm run docker:clean          # Docker cleanup
```
</details>
>>>>>>> 4a542fb (f)

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
<<<<<<< HEAD
cd frontend && npm start

# 3. Backend starten (Terminal 2)
cd backend && python app.py
=======
cd frontend
npm start

# 3. Backend starten (Terminal 2)
cd backend
python app.py
>>>>>>> 4a542fb (f)
```

**Frontend:** http://localhost:3000  
**Backend:** http://localhost:5000

## 📱 Features im Detail

### 🎯 Drag & Drop Referenzpunkte
- **Intuitive Bedienung:** Punkte per Maus oder Touch verschieben
- **Live-Updates:** Automatische Neuberechnung beim Verschieben
- **Visuelle Feedback:** Highlight beim Hovern/Ziehen

<<<<<<< HEAD
=======
```javascript
// Beispiel: Punkt verschieben
const handlePointDrag = (pointId, newPosition) => {
  updatePoint(pointId, newPosition);
  recalculateTriangulation();
};
```

>>>>>>> 4a542fb (f)
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
<<<<<<< HEAD
│   Frontend      │    │   Backend       │    │   Render.com    │
│   (React)       │◄──►│   (Flask)       │◄──►│   Hosting       │
│   Port: 3000    │    │   Port: 5000    │    │   Auto Deploy   │
=======
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Flask)       │◄──►│   (Optional)    │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
>>>>>>> 4a542fb (f)
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
<<<<<<< HEAD
│   Docker        │    │   Triangulation │    │   GitHub        │
│   Container     │    │   Algorithm     │    │   Actions       │
│   (Nginx)       │    │   Engine        │    │   CI/CD         │
=======
│   Nginx         │    │   Triangulation │    │   Redis         │
│   (Reverse      │    │   Algorithm     │    │   (Caching)     │
│   Proxy)        │    │   Engine        │    │   Port: 6379    │
>>>>>>> 4a542fb (f)
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technologie Stack
- **Frontend:** React 18, Bootstrap 5, Leaflet Maps
- **Backend:** Python Flask, NumPy (Triangulation), CORS
- **Containerisierung:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
<<<<<<< HEAD
- **Hosting:** Render.com (automatisches Deployment)
- **Reverse Proxy:** Nginx
=======
- **Monitoring:** Prometheus, Grafana (optional)
- **Reverse Proxy:** Nginx
- **Caching:** Redis (optional)
>>>>>>> 4a542fb (f)

## 🔧 Konfiguration

### Umgebungsvariablen
```bash
# .env Datei erstellen (basierend auf .env.template)
cp .env.template .env

# Wichtige Konfigurationen:
REACT_APP_API_URL=/api              # API Endpoint
<<<<<<< HEAD
=======
REACT_APP_MAP_API_KEY=your_key      # Mapbox/OSM API Key
>>>>>>> 4a542fb (f)
FLASK_ENV=production                # Backend Environment
SECRET_KEY=your_secret_key          # Flask Secret
```

<<<<<<< HEAD
=======
### Docker Konfiguration
```yaml
# docker-compose.override.yml für lokale Anpassungen
version: '3.8'
services:
  frontend:
    environment:
      - REACT_APP_DEBUG=true
  backend:
    environment:
      - FLASK_DEBUG=1
```

>>>>>>> 4a542fb (f)
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

<<<<<<< HEAD
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
=======
### Container Registry
```bash
# Images von GitHub Container Registry
docker pull ghcr.io/username/triangulation-app-react-frontend:latest
docker pull ghcr.io/username/triangulation-app-react-backend:latest
```

### Cloud Deployment

<details>
<summary>🌩️ AWS ECS</summary>

```bash
# Task Definition registrieren
aws ecs register-task-definition --cli-input-json file://ecs-task.json

# Service erstellen
aws ecs create-service --cluster triangulation --service-name triangulation-service
```
</details>

<details>
<summary>☁️ Google Cloud Run</summary>

```bash
# Frontend deployen
gcloud run deploy triangulation-frontend \
  --image gcr.io/PROJECT_ID/triangulation-frontend \
  --platform managed --port 80

# Backend deployen
gcloud run deploy triangulation-backend \
  --image gcr.io/PROJECT_ID/triangulation-backend \
  --platform managed --port 5000
```
</details>

<details>
<summary>🌊 DigitalOcean App Platform</summary>

```yaml
# .do/app.yaml
name: triangulation-app
services:
- name: frontend
  source_dir: /frontend
  github:
    repo: username/triangulation-app-react
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```
</details>

### Kubernetes
```bash
# Kubernetes Manifests anwenden
kubectl apply -f k8s/

# Ingress konfigurieren
kubectl apply -f k8s/ingress.yaml
```

## 🔍 Monitoring & Debugging

### Health Checks
```bash
# Einzelne Services prüfen
curl http://localhost:3000/health  # Frontend
curl http://localhost:5000/api/health  # Backend

# Automatischer Health Check
npm run health
```

### Logs
```bash
# Live Logs anzeigen
npm run logs:frontend
npm run logs:backend

# Alle Logs
npm run prod:logs

# Strukturierte Logs
docker-compose logs --tail=100 -f | jq '.'
```

### Debugging
```bash
# Development Container betreten
npm run shell:frontend
npm run shell:backend

# Oder mit Docker direkt:
docker-compose exec frontend sh
docker-compose exec backend bash
>>>>>>> 4a542fb (f)
```

## 🧪 Testing

### Automatisierte Tests
```bash
# Alle Tests ausführen
npm run test

<<<<<<< HEAD
=======
# Frontend Tests
cd frontend && npm test

# Backend Tests
cd backend && pytest

>>>>>>> 4a542fb (f)
# Coverage Report
npm run test:coverage
```

<<<<<<< HEAD
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
=======
### Integration Tests
```bash
# Mit Docker Compose
docker-compose -f docker-compose.dev.yml run --rm test-runner

# API Tests
curl -X POST http://localhost:5000/api/triangulate \
  -H "Content-Type: application/json" \
  -d '{"points": [...]}'
>>>>>>> 4a542fb (f)
```

## 🤝 Contributing

### Development Workflow
1. **Fork** das Repository
2. **Branch** erstellen: `git checkout -b feature/amazing-feature`
3. **Entwickeln** mit Hot Reload: `npm run dev`
4. **Testen**: `npm run test`
<<<<<<< HEAD
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
=======
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Pull Request** öffnen

### Code Standards
- **Frontend:** ESLint + Prettier
- **Backend:** Black + Flake8
- **Commits:** Conventional Commits
- **Testing:** Jest (Frontend), Pytest (Backend)

## 🔧 Troubleshooting

<details>
<summary>🚨 Häufige Probleme</summary>

### Port bereits belegt
```bash
# Services stoppen und neu starten
npm run dev:down
npm run dev
```

### CORS Fehler
```bash
# API URL in Frontend konfigurieren
export REACT_APP_API_URL=http://localhost:5000
```

### GPS funktioniert nicht
- **HTTPS erforderlich** für GPS in Production
- **Browser-Permissions** prüfen
- **Timeout-Einstellungen** anpassen

### Performance Probleme
```bash
# Accuracy Circles bei >10 Punkten deaktivieren
export REACT_APP_MAX_ACCURACY_CIRCLES=10

>>>>>>> 4a542fb (f)
# Docker Resources erhöhen
docker update --memory=2g --cpus=2 container_name
```

<<<<<<< HEAD
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
=======
### Build Fehler
```bash
# Cache leeren und neu bauen
npm run docker:clean
npm run build:no-cache
```
</details>

## 📝 Changelog

<details>
<summary>📋 Version History</summary>

### Version 2.0.0 (2024-06-27)
- ✨ **Drag & Drop** für Referenzpunkte implementiert
- ✨ **Inline-Entfernungsbearbeitung** hinzugefügt
- ✨ **Genauigkeitseinstellungen** (0-2km Slider)
- ✨ **GPS-Integration** für automatische Positionierung
- ✨ **Mobile Optimierung** für Touch-Geräte
- 🐳 **Docker Containerisierung** komplett implementiert
- 🚀 **GitHub Actions CI/CD** Pipeline erstellt
- 📊 **Monitoring Integration** (Prometheus/Grafana)
- 🔒 **Security Hardening** implementiert
- 📱 **Responsive Design** verbessert

### Version 1.0.0 (2024-05-15)
- 🎯 **Grundlegende Triangulation** implementiert
- 📊 **Projekt-Management** hinzugefügt
- 🗺️ **Interaktive Karte** (Leaflet) integriert
- 📱 **Responsive Design** erstellt
- 🎨 **Bootstrap UI** implementiert
- 🔄 **API Integration** (Flask Backend)
</details>

## 📄 Lizenz

Dieses Projekt steht unter der **MIT Lizenz** - siehe [LICENSE](LICENSE) Datei für Details.

## 👤 Autor

**Patrick**
- 📧 Email: [your-email@domain.com](mailto:your-email@domain.com)
- 🌐 GitHub: [@username](https://github.com/username)
- 💼 LinkedIn: [Patrick](https://linkedin.com/in/username)

## 🙏 Danksagungen

- **React Team** für das großartige Framework
- **Flask Community** für die Python Web-Integration
- **Docker** für die Containerisierung
- **Leaflet** für die Karten-Integration
- **Bootstrap** für das UI Framework
>>>>>>> 4a542fb (f)

---

<div align="center">

<<<<<<< HEAD
**🌐 Live Demo:** https://triangulation-frontend.onrender.com

**⭐ Star this repo if you find it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/Hexxooor/triangulation-app-react.svg?style=social&label=Star)](https://github.com/Hexxooor/triangulation-app-react)
[![GitHub forks](https://img.shields.io/github/forks/Hexxooor/triangulation-app-react.svg?style=social&label=Fork)](https://github.com/Hexxooor/triangulation-app-react/fork)

**🚀 Ready for Production • 🐳 Docker Enabled • 🌐 Auto-Deploy**
=======
**⭐ Star this repo if you find it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/username/triangulation-app-react.svg?style=social&label=Star)](https://github.com/username/triangulation-app-react)
[![GitHub forks](https://img.shields.io/github/forks/username/triangulation-app-react.svg?style=social&label=Fork)](https://github.com/username/triangulation-app-react/fork)
>>>>>>> 4a542fb (f)

</div>
