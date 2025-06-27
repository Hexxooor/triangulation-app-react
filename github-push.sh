#!/bin/bash

# 🚀 GitHub Push Script für Triangulation App
# Automatisierter Push zur GitHub-Repository

set -e  # Exit on any error

echo "🎯 Triangulation App - GitHub Push wird gestartet..."
echo "======================================================="

# Farben für bessere Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfiguration
REPO_NAME="triangulation-app-react"
MAIN_BRANCH="main"
COMMIT_MESSAGE="🎯 Major Release v2.0.0: Erweiterte Triangulation App mit Docker

✨ Neue Features:
- Drag & Drop für Referenzpunkte
- Inline-Entfernungsbearbeitung
- Genauigkeitseinstellungen (0-2km Slider)
- GPS-Integration mit automatischer Positionierung
- Mobile Optimierung für Touch-Geräte

🐳 Docker Integration:
- Vollständige Containerisierung (Frontend + Backend)
- Multi-stage Docker Builds für Optimierung
- Development & Production Konfigurationen
- Docker Compose Setups mit Hot Reload

🚀 DevOps & CI/CD:
- GitHub Actions Pipeline (Tests, Builds, Deployment)
- Automatische Docker Image Registry
- Security Scanning mit Trivy
- Integration Tests und Health Checks

📚 Dokumentation:
- Umfassende README.md mit allen Features
- Detailliertes DEPLOYMENT.md für verschiedene Plattformen
- CONTRIBUTING.md für Entwickler
- Vollständige GitHub Issue/PR Templates

🔧 Technische Verbesserungen:
- Erweiterte Triangulation-Algorithmen (Weighted Least Squares)
- Performance-Optimierungen und Caching
- Security Hardening (Non-root Container, Headers)
- Monitoring Integration (Prometheus, Grafana)"

# Helper functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git ist nicht installiert oder nicht im PATH verfügbar"
    exit 1
fi

print_success "Git ist verfügbar"

# Check if we're in a git repository
if [ ! -d .git ]; then
    print_status "Git Repository initialisieren..."
    git init
    print_success "Git Repository initialisiert"
else
    print_success "Git Repository bereits vorhanden"
fi

# Set user configuration (if not set)
if [ -z "$(git config user.name)" ]; then
    print_warning "Git user.name nicht gesetzt"
    echo -n "Gib deinen Namen ein: "
    read -r git_name
    git config user.name "$git_name"
    print_success "Git user.name gesetzt: $git_name"
fi

if [ -z "$(git config user.email)" ]; then
    print_warning "Git user.email nicht gesetzt"
    echo -n "Gib deine E-Mail ein: "
    read -r git_email
    git config user.email "$git_email"
    print_success "Git user.email gesetzt: $git_email"
fi

# Switch to main branch
current_branch=$(git branch --show-current 2>/dev/null || echo "")
if [ "$current_branch" != "$MAIN_BRANCH" ]; then
    print_status "Wechsle zu $MAIN_BRANCH branch..."
    git checkout -b "$MAIN_BRANCH" 2>/dev/null || git checkout "$MAIN_BRANCH"
    print_success "Auf $MAIN_BRANCH branch"
fi

# Add all files
print_status "Dateien zum Repository hinzufügen..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_warning "Keine neuen Änderungen zu committen"
else
    print_status "Commit erstellen..."
    git commit -m "$COMMIT_MESSAGE"
    print_success "Commit erstellt"
fi

# Check if remote exists
if ! git remote get-url origin &> /dev/null; then
    print_warning "GitHub Remote Repository ist nicht konfiguriert"
    echo ""
    echo "Bitte führe folgende Schritte aus:"
    echo "1. Erstelle ein neues Repository auf GitHub: https://github.com/new"
    echo "2. Repository Name: $REPO_NAME"
    echo "3. Führe dann aus:"
    echo ""
    echo -e "${YELLOW}   git remote add origin https://github.com/DEIN_USERNAME/$REPO_NAME.git${NC}"
    echo -e "${YELLOW}   git push -u origin $MAIN_BRANCH${NC}"
    echo ""
    echo "Oder verwende SSH:"
    echo -e "${YELLOW}   git remote add origin git@github.com:DEIN_USERNAME/$REPO_NAME.git${NC}"
    echo -e "${YELLOW}   git push -u origin $MAIN_BRANCH${NC}"
    echo ""
    
    # Offer to set remote interactively
    echo -n "Möchtest du die Remote URL jetzt setzen? (y/n): "
    read -r set_remote
    
    if [ "$set_remote" = "y" ] || [ "$set_remote" = "Y" ]; then
        echo -n "Gib deine GitHub Remote URL ein: "
        read -r remote_url
        git remote add origin "$remote_url"
        print_success "Remote origin gesetzt: $remote_url"
        
        print_status "Push zum GitHub Repository..."
        if git push -u origin "$MAIN_BRANCH"; then
            print_success "Erfolgreich zu GitHub gepusht!"
        else
            print_error "Push fehlgeschlagen. Überprüfe die Remote URL und deine Berechtigung."
            exit 1
        fi
    else
        print_warning "Remote nicht gesetzt. Führe die obigen Schritte manuell aus."
    fi
else
    print_status "Push zum GitHub Repository..."
    if git push; then
        print_success "Erfolgreich zu GitHub gepusht!"
    else
        print_error "Push fehlgeschlagen. Versuche 'git push -u origin $MAIN_BRANCH'"
        exit 1
    fi
fi

# Repository Status
echo ""
echo "📊 Repository Status:"
echo "====================="
print_status "Branch: $(git branch --show-current)"
print_status "Commits: $(git rev-list --count HEAD 2>/dev/null || echo '0')"
print_status "Remote: $(git remote get-url origin 2>/dev/null || echo 'nicht gesetzt')"

# Show recent commits
echo ""
echo "📝 Letzte Commits:"
echo "=================="
git log --oneline -5 2>/dev/null || echo "Keine Commits vorhanden"

# File statistics
echo ""
echo "📁 Repository Inhalt:"
echo "===================="
echo "Gesamt Dateien: $(find . -type f ! -path './.git/*' ! -path './node_modules/*' ! -path './.venv/*' ! -path './venv/*' | wc -l)"
echo "Docker Dateien: $(find . -name 'Dockerfile*' -o -name 'docker-compose*.yml' | wc -l)"
echo "GitHub Workflows: $(find .github/workflows -name '*.yml' 2>/dev/null | wc -l || echo '0')"

# Next steps
echo ""
echo "🚀 Nächste Schritte:"
echo "==================="
echo "1. 🌐 Repository auf GitHub öffnen:"
if git remote get-url origin &> /dev/null; then
    remote_url=$(git remote get-url origin)
    # Convert SSH to HTTPS for browser
    if [[ $remote_url == git@github.com:* ]]; then
        browser_url="https://github.com/${remote_url#git@github.com:}"
        browser_url="${browser_url%.git}"
    else
        browser_url="${remote_url%.git}"
    fi
    echo "   $browser_url"
fi

echo ""
echo "2. 🐳 Docker Container testen:"
echo "   npm run dev          # Development mit Hot Reload"
echo "   npm run prod         # Production Build"
echo "   npm run health       # Health Checks"

echo ""
echo "3. 🚀 GitHub Actions überprüfen:"
echo "   - CI/CD Pipeline läuft automatisch bei Push"
echo "   - Actions Tab: $browser_url/actions"

echo ""
echo "4. 📚 Dokumentation überprüfen:"
echo "   - README.md für Benutzer"
echo "   - DEPLOYMENT.md für Deployment"
echo "   - CONTRIBUTING.md für Entwickler"

echo ""
echo "5. 🏷️ Release erstellen (optional):"
echo "   git tag v2.0.0"
echo "   git push origin v2.0.0"

echo ""
print_success "GitHub Push erfolgreich abgeschlossen! 🎉"
print_success "Deine erweiterte Triangulation App ist jetzt auf GitHub verfügbar!"

# Optional: Open browser
if command -v xdg-open &> /dev/null && [ -n "$browser_url" ]; then
    echo -n "Repository im Browser öffnen? (y/n): "
    read -r open_browser
    if [ "$open_browser" = "y" ] || [ "$open_browser" = "Y" ]; then
        xdg-open "$browser_url"
    fi
elif command -v open &> /dev/null && [ -n "$browser_url" ]; then
    echo -n "Repository im Browser öffnen? (y/n): "
    read -r open_browser
    if [ "$open_browser" = "y" ] || [ "$open_browser" = "Y" ]; then
        open "$browser_url"
    fi
fi

echo ""
echo "✨ Happy Coding! ✨"
