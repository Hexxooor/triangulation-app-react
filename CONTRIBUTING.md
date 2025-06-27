# 🤝 Contributing zu Triangulation App

Danke für dein Interesse an der Triangulation App! Diese Anleitung hilft dir beim Beitragen zum Projekt.

## 📋 Übersicht

- [🚀 Schnellstart](#-schnellstart)
- [🔧 Development Setup](#-development-setup)
- [📝 Code-Standards](#-code-standards)
- [🧪 Testing](#-testing)
- [📦 Pull Requests](#-pull-requests)
- [🐛 Bug Reports](#-bug-reports)
- [✨ Feature Requests](#-feature-requests)

## 🚀 Schnellstart

1. **Fork** das Repository
2. **Clone** dein Fork
3. **Setup** Development Environment
4. **Branch** erstellen für dein Feature
5. **Entwickeln**, **Testen**, **Committen**
6. **Pull Request** erstellen

```bash
# Repository forken und clonen
git clone https://github.com/DEIN_USERNAME/triangulation-app-react.git
cd triangulation-app-react

# Development Setup
npm run setup

# Feature Branch erstellen
git checkout -b feature/dein-feature-name

# Development Server starten
npm run dev
```

## 🔧 Development Setup

### Voraussetzungen
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://python.org/))
- **Docker** & **Docker Compose** ([Download](https://docker.com/))
- **Git** ([Download](https://git-scm.com/))

### Mit Docker (Empfohlen)
```bash
# Komplettes Setup mit einem Befehl
npm run dev

# App läuft auf:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Ohne Docker
```bash
# Alle Dependencies installieren
npm run install:all

# Terminal 1: Frontend
cd frontend && npm start

# Terminal 2: Backend  
cd backend && python app.py
```

### Environment Setup
```bash
# Environment Variables konfigurieren
cp .env.template .env
# Bearbeite .env nach Bedarf
```

## 📝 Code-Standards

### Frontend (React)
- **ESLint** + **Prettier** für Code-Formatierung
- **Functional Components** mit Hooks
- **Bootstrap** für Styling
- **Axios** für API-Calls

```javascript
// Beispiel: Guter React Component
import React, { useState, useEffect } from 'react';

const TriangulationComponent = ({ points, onPointUpdate }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  
  useEffect(() => {
    // Effect logic
  }, [points]);
  
  const handlePointDrag = useCallback((pointId, newPosition) => {
    onPointUpdate(pointId, newPosition);
  }, [onPointUpdate]);
  
  return (
    <div className="triangulation-component">
      {/* Component JSX */}
    </div>
  );
};

export default TriangulationComponent;
```

### Backend (Python Flask)
- **Black** für Code-Formatierung (Line Length: 100)
- **Flake8** für Linting
- **Type Hints** verwenden
- **Docstrings** für Funktionen

```python
# Beispiel: Guter Python Code
from typing import List, Dict, Any, Optional

def calculate_triangulation(points: List[Dict[str, float]]) -> Dict[str, Any]:
    """
    Berechnet die Triangulation basierend auf Referenzpunkten.
    
    Args:
        points: Liste von Dictionaries mit 'lat', 'lng', 'distance' keys
        
    Returns:
        Dictionary mit berechneter Position und Genauigkeitsdaten
    """
    if len(points) < 3:
        raise ValueError("Mindestens 3 Referenzpunkte erforderlich")
    
    # Implementation...
    return result
```

### Commit Messages
Verwende **Conventional Commits**:

```bash
# Format: <type>[optional scope]: <description>

feat: add drag and drop functionality for reference points
fix: resolve GPS accuracy calculation bug
docs: update deployment guide with Render.com examples  
style: format code with prettier
refactor: extract triangulation logic into separate service
test: add integration tests for API endpoints
chore: update dependencies to latest versions

# Mit Scope
feat(frontend): implement inline distance editing
fix(backend): handle edge case in multilateration algorithm
```

### Branch Naming
```bash
# Feature Branches
feature/drag-drop-points
feature/gps-integration
feature/mobile-optimization

# Bug Fix Branches  
fix/calculation-accuracy
fix/cors-header-issue
fix/memory-leak-frontend

# Documentation Branches
docs/api-documentation
docs/deployment-guide

# Chore Branches
chore/dependency-updates
chore/docker-optimization
```

## 🧪 Testing

### Frontend Tests
```bash
# Tests ausführen
cd frontend
npm test

# Coverage Report
npm test -- --coverage --watchAll=false

# Tests für spezifische Dateien
npm test -- --testNamePattern="TriangulationComponent"
```

### Backend Tests
```bash
# Tests ausführen
cd backend
pytest

# Coverage Report
pytest --cov=. --cov-report=html

# Tests für spezifische Module
pytest test_triangulation.py -v
```

### Integration Tests
```bash
# Mit Docker Compose
npm run test

# Vollständige Test-Suite
npm run test:coverage
```

### Test-Standards
- **Minimum 80% Code Coverage**
- **Unit Tests** für alle Funktionen
- **Integration Tests** für API-Endpoints
- **E2E Tests** für kritische User Flows

## 📦 Pull Requests

### Bevor du einen PR erstellst
1. **Tests** schreiben und ausführen
2. **Code-Standards** befolgen
3. **Dokumentation** aktualisieren
4. **Docker-Build** testen
5. **Breaking Changes** dokumentieren

### PR-Prozess
1. **Aktueller Stand:** Rebase auf latest `main`
2. **Squash Commits:** Saubere Git-History
3. **PR Template** vollständig ausfüllen
4. **Screenshots** bei UI-Änderungen
5. **Tests-Status** grün

```bash
# PR vorbereiten
git checkout main
git pull upstream main
git checkout feature/dein-feature
git rebase main

# Tests ausführen
npm run test
npm run build

# PR erstellen
git push origin feature/dein-feature
# Erstelle PR auf GitHub
```

### Code Review Prozess
- **Mindestens 1 Reviewer** erforderlich
- **Alle Tests** müssen bestehen
- **Docker-Build** muss erfolgreich sein
- **Breaking Changes** müssen diskutiert werden

## 🐛 Bug Reports

### Gute Bug Reports enthalten:
- **Klare Beschreibung** des Problems
- **Schritte zur Reproduktion**
- **Erwartetes vs. tatsächliches Verhalten**  
- **Environment-Informationen**
- **Screenshots/Videos** bei UI-Problemen
- **Browser-Console-Logs**

### Template verwenden
Verwende das [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) für strukturierte Reports.

## ✨ Feature Requests

### Gute Feature Requests enthalten:
- **Problem/Motivation** klar definiert
- **Detaillierte Beschreibung** der Lösung
- **Use Cases** und Beispiele
- **UI/UX Mockups** falls relevant
- **Technische Überlegungen**

### Template verwenden
Verwende das [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).

## 🎨 UI/UX Guidelines

### Design System
- **Bootstrap 5** als Base Framework
- **Konsistente Farben:** Primary (#007bff), Success (#28a745), Danger (#dc3545)
- **Responsive Design:** Mobile-first Approach
- **Accessibility:** WCAG 2.1 AA Standards

### Komponenten-Standards
```javascript
// Konsistente Button-Styles
<Button 
  variant="primary" 
  size="sm" 
  disabled={isLoading}
  onClick={handleClick}
>
  {isLoading ? <Spinner size="sm" /> : 'Save'}
</Button>

// Konsistente Form-Validierung
<Form.Control
  type="number"
  value={distance}
  onChange={handleDistanceChange}
  isInvalid={errors.distance}
  min="0.1"
  max="50000"
/>
<Form.Control.Feedback type="invalid">
  {errors.distance}
</Form.Control.Feedback>
```

## 🚀 Deployment

### Docker Testing
```bash
# Production Build testen
npm run build
npm run prod

# Development Setup testen  
npm run dev

# Health Checks
npm run health
```

### CI/CD Pipeline
- **Automatische Tests** bei jedem PR
- **Docker-Builds** für main branch
- **Security Scanning** mit Trivy
- **Deployment** nach successful merge zu Render.com

## 📚 Dokumentation

### Was dokumentiert werden sollte:
- **API-Änderungen** im RENDER_DEPLOYMENT.md
- **Neue Features** im README.md
- **Breaking Changes** im CHANGELOG.md
- **Code-Kommentare** für komplexe Logik

### Documentation Standards
```markdown
# Verwende klare Überschriften
## Subsektionen für Organisation
### Details für spezifische Punkte

**Bold** für wichtige Begriffe
*Italic* für Betonung
`code` für Code-Snippets

```bash
# Code-Blöcke mit Sprache
npm run dev
```

- Listen für Aufzählungen
- [ ] Checkboxes für Tasks
```

## 🆘 Hilfe bekommen

### Wo du Hilfe findest:
- **GitHub Issues:** Für Bugs und Feature Requests
- **GitHub Discussions:** Für Fragen und Diskussionen
- **Code Comments:** Für spezifische Code-Fragen
- **Live Demo:** https://triangulation-frontend.onrender.com

### Häufige Fragen

**Q: Wie starte ich die Development Environment?**
A: `npm run dev` startet Frontend und Backend mit Hot Reload.

**Q: Wie führe ich Tests aus?**
A: `npm run test` für alle Tests, `npm run test:coverage` für Coverage.

**Q: Wie aktualisiere ich Dependencies?**
A: Erstelle ein Issue für Dependency-Updates oder einen PR mit den Änderungen.

**Q: Wo kann ich die Live-Demo testen?**
A: https://triangulation-frontend.onrender.com

## 🙏 Danksagungen

Vielen Dank an alle Contributors, die zu diesem Projekt beitragen! Jeder Beitrag, egal wie klein, wird geschätzt.

### Arten von Beiträgen:
- 🐛 **Bug Fixes**
- ✨ **Neue Features**
- 📚 **Dokumentation**
- 🧪 **Tests**
- 🎨 **UI/UX Verbesserungen**
- 🔧 **Refactoring**
- ⚡ **Performance-Optimierungen**

---

**Happy Contributing! 🚀**

Bei Fragen zum Contributing-Prozess, erstelle gerne ein Issue oder teste die Live-Demo unter https://triangulation-frontend.onrender.com