# 🎯 Triangulation App - Projektstruktur

## 📁 Vollständige Projektübersicht

```
triangulation-app-react/
├── 📁 backend/                    # Python Flask Backend
│   ├── app.py                     # 🐍 Haupt-API Server
│   └── requirements.txt           # 📦 Python Dependencies
├── 📁 frontend/                   # React Frontend
│   ├── 📁 public/                 # Statische Dateien
│   │   ├── index.html             # 🌐 HTML Template
│   │   ├── manifest.json          # 📱 PWA Manifest
│   │   └── favicon-info.txt       # 🎯 Icon-Anweisungen
│   ├── 📁 src/                    # React Source Code
│   │   ├── 📁 components/         # React Komponenten
│   │   │   ├── MapComponent.js    # 🗺️ Leaflet Karte
│   │   │   ├── PointList.js       # 📋 Referenzpunkt-Liste
│   │   │   └── ResultDisplay.js   # 📊 Ergebnis-Anzeige
│   │   ├── App.js                 # ⚛️ Haupt-React-App
│   │   ├── index.js               # 🚀 React Entry Point
│   │   └── index.css              # 🎨 Globale Styles
│   ├── package.json               # 📦 NPM Dependencies
│   └── .env                       # ⚙️ Frontend-Konfiguration
├── 🔧 Installation & Start
│   ├── install.bat                # 💻 Windows Installer
│   ├── install.sh                 # 🐧 Linux/Mac Installer
│   ├── start.bat                  # 🚀 Windows Starter
│   ├── start.sh                   # 🚀 Linux/Mac Starter
│   └── make-executable.sh         # 🔧 Rechte setzen
├── 📚 Dokumentation
│   ├── README.md                  # 📖 Vollständige Dokumentation
│   └── SCHNELLSTART.md            # ⚡ Quick Start Guide
├── ⚙️ Konfiguration
│   ├── .env                       # 🔐 Umgebungsvariablen
│   └── .gitignore                 # 🚫 Git Ignore
└── 🛠️ Projektdateien
    ├── .venv/                     # 🐍 Python Virtual Environment
    └── (nach Installation)        # 📦 Dependencies
```

## 🔧 Installierte Dependencies

### Backend (Python)
- **Flask** - Web Framework
- **Flask-CORS** - CORS-Unterstützung  
- **NumPy** - Numerische Berechnungen
- **python-dotenv** - Umgebungsvariablen

### Frontend (React)
- **React** - UI Framework
- **React Bootstrap** - UI Komponenten
- **Leaflet** - Kartenintegration
- **React Leaflet** - React Leaflet-Bindings
- **Axios** - HTTP Client
- **React Toastify** - Benachrichtigungen

## 🚀 Start-Reihenfolge

1. **Installation** (einmalig)
   ```bash
   # Windows
   install.bat
   
   # Linux/Mac
   ./install.sh
   ```

2. **App starten** (jedes Mal)
   ```bash
   # Windows
   start.bat
   
   # Linux/Mac
   ./start.sh
   ```

## 🌐 Ports & URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📦 Wichtige Dateien

### **Backend**
- `app.py` - Flask Server mit API Endpoints
- `requirements.txt` - Python Dependencies

### **Frontend**
- `App.js` - Hauptkomponente mit State Management
- `MapComponent.js` - Interaktive Karte
- `PointList.js` - Referenzpunkt-Verwaltung
- `ResultDisplay.js` - Ergebnis-Anzeige

### **Scripts**
- `install.bat/sh` - Vollständige Installation
- `start.bat/sh` - App starten
- `make-executable.sh` - Rechte setzen (Linux/Mac)

## 🎯 Features

### **Karte**
- OpenStreetMap Integration
- Interaktive Marker
- Entfernungskreise
- Zoom & Pan

### **Triangulation**
- Trilateration-Algorithmus
- Least Squares für 4+ Punkte
- Fehlerbehandlung
- Genauigkeitsanalyse

### **UI/UX**
- Responsive Design
- Toast-Benachrichtigungen
- Moderne Gradients
- Animationen

## 📊 API Endpoints

- `POST /api/triangulate` - Standort berechnen
- `POST /api/distance` - Entfernung berechnen
- `GET /api/health` - Health Check

## 🔧 Entwicklung

### Backend erweitern
```python
# Neue API Route
@app.route('/api/new-feature', methods=['POST'])
def new_feature():
    return jsonify({"result": "success"})
```

### Frontend erweitern
```jsx
// Neue Komponente
import React from 'react';
import { Card } from 'react-bootstrap';

function NewComponent() {
    return <Card>...</Card>;
}
```

---

**🎯 Happy Coding & Triangulating!** 🗺️
