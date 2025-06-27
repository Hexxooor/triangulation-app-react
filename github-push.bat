@echo off
REM 🚀 GitHub Push Script für Triangulation App (Windows)
REM Automatisierter Push zur GitHub-Repository

echo 🎯 Triangulation App - GitHub Push wird gestartet...
echo =======================================================

REM Check if git is available
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git ist nicht installiert oder nicht im PATH verfügbar
    echo Bitte installiere Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [SUCCESS] Git ist verfügbar

REM Check if we're in a git repository
if not exist .git (
    echo [INFO] Git Repository initialisieren...
    git init
    echo [SUCCESS] Git Repository initialisiert
) else (
    echo [SUCCESS] Git Repository bereits vorhanden
)

REM Set default branch to main
git checkout -b main 2>nul || git checkout main

REM Add all files
echo [INFO] Dateien zum Repository hinzufügen...
git add .

REM Check if there are changes to commit
git diff --staged --quiet
if %errorlevel% equ 0 (
    echo [WARNING] Keine neuen Änderungen zu committen
) else (
    echo [INFO] Commit erstellen...
    git commit -m "🎯 Major Release v2.0.0: Erweiterte Triangulation App mit Docker

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
- Vollständige GitHub Issue/PR Templates"
    echo [SUCCESS] Commit erstellt
)

REM Check if remote exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] GitHub Remote Repository ist nicht konfiguriert
    echo.
    echo Bitte führe folgende Schritte aus:
    echo 1. Erstelle ein neues Repository auf GitHub: https://github.com/new
    echo 2. Repository Name: triangulation-app-react
    echo 3. Führe dann aus:
    echo.
    echo    git remote add origin https://github.com/DEIN_USERNAME/triangulation-app-react.git
    echo    git push -u origin main
    echo.
    echo Oder verwende SSH:
    echo    git remote add origin git@github.com:DEIN_USERNAME/triangulation-app-react.git
    echo    git push -u origin main
    echo.
    set /p set_remote="Möchtest du die Remote URL jetzt setzen? (y/n): "
    
    if /i "%set_remote%"=="y" (
        set /p remote_url="Gib deine GitHub Remote URL ein: "
        git remote add origin "%remote_url%"
        echo [SUCCESS] Remote origin gesetzt
        
        echo [INFO] Push zum GitHub Repository...
        git push -u origin main
        if %errorlevel% equ 0 (
            echo [SUCCESS] Erfolgreich zu GitHub gepusht!
        ) else (
            echo [ERROR] Push fehlgeschlagen. Überprüfe die Remote URL und deine Berechtigung.
            pause
            exit /b 1
        )
    ) else (
        echo [WARNING] Remote nicht gesetzt. Führe die obigen Schritte manuell aus.
    )
) else (
    echo [INFO] Push zum GitHub Repository...
    git push
    if %errorlevel% equ 0 (
        echo [SUCCESS] Erfolgreich zu GitHub gepusht!
    ) else (
        echo [ERROR] Push fehlgeschlagen. Versuche 'git push -u origin main'
        pause
        exit /b 1
    )
)

REM Repository Status
echo.
echo 📊 Repository Status:
echo =====================
for /f "tokens=*" %%a in ('git branch --show-current 2^>nul') do set current_branch=%%a
echo Branch: %current_branch%

for /f "tokens=*" %%a in ('git rev-list --count HEAD 2^>nul') do set commit_count=%%a
echo Commits: %commit_count%

git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('git remote get-url origin 2^>nul') do set remote_url=%%a
    echo Remote: %remote_url%
) else (
    echo Remote: nicht gesetzt
)

echo.
echo 📝 Letzte Commits:
echo ==================
git log --oneline -5 2>nul

echo.
echo 🚀 Nächste Schritte:
echo ===================
echo 1. 🌐 Repository auf GitHub öffnen
echo 2. 🐳 Docker Container testen:
echo    npm run dev          # Development mit Hot Reload
echo    npm run prod         # Production Build
echo    npm run health       # Health Checks
echo.
echo 3. 🚀 GitHub Actions überprüfen:
echo    - CI/CD Pipeline läuft automatisch bei Push
echo.
echo 4. 📚 Dokumentation überprüfen:
echo    - README.md für Benutzer
echo    - DEPLOYMENT.md für Deployment
echo    - CONTRIBUTING.md für Entwickler
echo.
echo 5. 🏷️ Release erstellen (optional):
echo    git tag v2.0.0
echo    git push origin v2.0.0

echo.
echo [SUCCESS] GitHub Push erfolgreich abgeschlossen! 🎉
echo [SUCCESS] Deine erweiterte Triangulation App ist jetzt auf GitHub verfügbar!

echo.
echo ✨ Happy Coding! ✨
pause
