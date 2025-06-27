#!/bin/bash

# 🚀 Git Repository Setup Script für Triangulation App

echo "🎯 Triangulation App - Git Setup wird gestartet..."

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📁 Git Repository initialisieren..."
    git init
    echo "✅ Git Repository initialisiert"
else
    echo "✅ Git Repository bereits vorhanden"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "" ]; then
    echo "🔄 Wechsle zu main branch..."
    git checkout -b main 2>/dev/null || git checkout main
fi

# Add all files
echo "📦 Dateien zum Repository hinzufügen..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  Keine neuen Änderungen zu committen"
else
    echo "💬 Commit erstellen..."
    git commit -m "🎯 Initial commit: Erweiterte Triangulation App v2.0

✨ Features:
- Drag & Drop für Referenzpunkte
- Inline-Entfernungsbearbeitung  
- Genauigkeitseinstellungen (0-2km)
- GPS-Integration
- Mobile Optimierung

🐳 Docker:
- Frontend Containerisierung (React + Nginx)
- Backend Containerisierung (Python Flask)
- Multi-stage builds für Optimierung
- Development & Production Konfigurationen

🚀 CI/CD:
- GitHub Actions Pipeline
- Automatische Tests & Builds
- Security Scanning
- Multi-Platform Support

📚 Dokumentation:
- Umfassende README.md
- Deployment Guide
- Docker Compose Beispiele"
    
    echo "✅ Initial commit erstellt"
fi

echo "🏷️  Repository-Status:"
echo "Branch: $(git branch --show-current)"
echo "Commits: $(git rev-list --count HEAD 2>/dev/null || echo '0')"
echo "Status:"
git status --short

echo ""
echo "🚀 Nächste Schritte:"
echo "1. GitHub Repository erstellen: https://github.com/new"
echo "2. Remote hinzufügen: git remote add origin https://github.com/username/triangulation-app-react.git"
echo "3. Push: git push -u origin main"
echo ""
echo "✅ Git Setup abgeschlossen!"
