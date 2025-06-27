@echo off
setlocal EnableDelayedExpansion
color 0A

:: Triangulation App Starter Script für Windows (Verbesserte Version)
echo.
echo  🎯 TRIANGULATION APP STARTER
echo ===================================
echo  Status: Starte Anwendung...
echo ===================================
echo.

:: Arbeitsverzeichnis setzen
set "APP_DIR=%~dp0"
cd /d "%APP_DIR%"

echo 📁 Arbeitsverzeichnis: %APP_DIR%
echo.

:: Erweiterte Diagnose der Installation
echo 🔍 INSTALLATIONS-DIAGNOSE:
echo ===================================

:: Backend prüfen
if exist "backend" (
    echo ✅ Backend-Ordner gefunden
    if exist "backend\venv" (
        echo ✅ Backend Virtual Environment gefunden
        if exist "backend\venv\Scripts\python.exe" (
            echo ✅ Python in venv gefunden
            set "BACKEND_OK=1"
        ) else (
            echo ❌ Python nicht in venv gefunden
            set "BACKEND_OK=0"
        )
    ) else (
        echo ❌ Backend Virtual Environment fehlt
        set "BACKEND_OK=0"
    )
) else (
    echo ❌ Backend-Ordner nicht gefunden
    set "BACKEND_OK=0"
)

:: Frontend prüfen
if exist "frontend" (
    echo ✅ Frontend-Ordner gefunden
    if exist "frontend\node_modules" (
        echo ✅ Frontend node_modules gefunden
        if exist "frontend\node_modules\react" (
            echo ✅ React installiert
            set "FRONTEND_OK=1"
        ) else (
            echo ❌ React nicht gefunden
            set "FRONTEND_OK=0"
        )
    ) else (
        echo ❌ Frontend node_modules fehlen
        set "FRONTEND_OK=0"
    )
) else (
    echo ❌ Frontend-Ordner nicht gefunden
    set "FRONTEND_OK=0"
)

echo.
echo 📊 INSTALLATIONS-STATUS:
echo ===================================
if "%BACKEND_OK%"=="1" (
    echo ✅ Backend: Bereit
) else (
    echo ❌ Backend: Nicht bereit
)

if "%FRONTEND_OK%"=="1" (
    echo ✅ Frontend: Bereit
) else (
    echo ❌ Frontend: Nicht bereit
)

echo.

:: Entscheidung basierend auf Status
if "%BACKEND_OK%"=="1" if "%FRONTEND_OK%"=="1" (
    echo 🚀 Installation vollständig - Starte App...
    goto :start_app
)

echo ⚠️  Installation unvollständig oder fehlerhaft
echo.
echo 🔧 OPTIONEN:
echo ===================================
echo [1] Installation reparieren (install.bat ausführen)
echo [2] Trotzdem versuchen zu starten
echo [3] Manuelle Installation prüfen
echo [4] Beenden
echo.

choice /C 1234 /M "Wählen Sie eine Option"

if errorlevel 4 (
    echo.
    echo 👋 Auf Wiedersehen!
    pause
    exit /b 0
)

if errorlevel 3 (
    echo.
    echo 🔍 MANUELLE PRÜFUNG:
    echo ===================================
    echo.
    echo Backend-Pfad: %APP_DIR%backend\venv
    if exist "backend\venv" (
        echo ✅ Verzeichnis existiert
        dir "backend\venv\Scripts" | findstr "python.exe" >nul
        if !errorlevel!==0 (
            echo ✅ python.exe gefunden
        ) else (
            echo ❌ python.exe nicht gefunden
        )
    ) else (
        echo ❌ Verzeichnis existiert nicht
    )
    
    echo.
    echo Frontend-Pfad: %APP_DIR%frontend\node_modules
    if exist "frontend\node_modules" (
        echo ✅ Verzeichnis existiert
        if exist "frontend\node_modules\react" (
            echo ✅ React-Module gefunden
        ) else (
            echo ❌ React-Module nicht gefunden
        )
    ) else (
        echo ❌ Verzeichnis existiert nicht
    )
    
    echo.
    echo 💡 LÖSUNGSVORSCHLÄGE:
    echo - Führen Sie install.bat als Administrator aus
    echo - Stellen Sie sicher, dass keine Antivirus-Software blockiert
    echo - Prüfen Sie Internetverbindung für Downloads
    echo - Versuchen Sie installation in einem anderen Ordner
    echo.
    pause
    exit /b 1
)

if errorlevel 2 (
    echo.
    echo ⚠️  Versuche trotz unvollständiger Installation zu starten...
    echo.
    goto :start_app
)

if errorlevel 1 (
    echo.
    echo 🔧 Starte Reparatur-Installation...
    echo.
    call install.bat
    if !errorlevel!==0 (
        echo.
        echo ✅ Installation abgeschlossen - Versuche erneut zu starten...
        echo.
        timeout /t 3 /nobreak >nul
        goto :start_app
    ) else (
        echo.
        echo ❌ Installation fehlgeschlagen!
        echo.
        pause
        exit /b 1
    )
)

:start_app
echo.
echo 🚀 STARTE ANWENDUNG
echo ===================================

:: Prüfe ob Ports bereits belegt sind
netstat -an | findstr ":5000 " >nul 2>&1
if !errorlevel!==0 (
    echo ⚠️  Port 5000 bereits belegt - Backend läuft möglicherweise bereits
    echo.
)

netstat -an | findstr ":3000 " >nul 2>&1
if !errorlevel!==0 (
    echo ⚠️  Port 3000 bereits belegt - Frontend läuft möglicherweise bereits
    echo.
    echo 🌐 Versuchen Sie: http://localhost:3000
    echo.
    pause
    exit /b 0
)

:: =============================================================================
:: Backend starten
:: =============================================================================
echo 🐍 BACKEND WIRD GESTARTET...
cd backend

:: Virtual Environment aktivieren (mit Fallback)
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo ❌ Virtual Environment Aktivierung fehlgeschlagen!
    echo 🔧 Versuche direkten Python-Pfad...
    if exist "venv\Scripts\python.exe" (
        set "PYTHON_CMD=venv\Scripts\python.exe"
    ) else (
        echo ❌ Python nicht gefunden - verwende System-Python
        set "PYTHON_CMD=python"
    )
)

:: Python-Befehl setzen falls nicht gesetzt
if not defined PYTHON_CMD (
    set "PYTHON_CMD=python"
)

:: Backend-Dependencies prüfen
echo 🔍 Prüfe Backend Dependencies...
%PYTHON_CMD% -c "import flask, numpy" 2>nul
if !errorlevel! neq 0 (
    echo 📦 Backend Dependencies werden nachinstalliert...
    %PYTHON_CMD% -m pip install -r requirements.txt --quiet
    if !errorlevel! neq 0 (
        echo ❌ Dependency-Installation fehlgeschlagen!
        echo 💡 Versuchen Sie: pip install flask flask-cors numpy
        pause
        exit /b 1
    )
)

:: Backend starten
echo 🚀 Backend Server startet auf http://localhost:5000
start "Triangulation Backend" /min %PYTHON_CMD% app.py

:: Warten und prüfen ob Backend bereit ist
echo ⏳ Warte auf Backend...
for /l %%i in (1,1,20) do (
    timeout /t 1 /nobreak >nul
    
    :: Prüfe mit curl falls verfügbar
    curl -s http://localhost:5000/api/health >nul 2>&1
    if !errorlevel!==0 (
        echo ✅ Backend ist bereit! (nach %%i Sekunden)
        goto backend_ready
    )
    
    :: Alternativ mit PowerShell prüfen
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
    if !errorlevel!==0 (
        echo ✅ Backend ist bereit! (nach %%i Sekunden)
        goto backend_ready
    )
    
    if %%i LSS 20 (
        echo    Versuche %%i/20...
    )
)

echo ⚠️  Backend braucht länger als erwartet...
echo 🌐 Prüfen Sie manuell: http://localhost:5000/api/health

:backend_ready
echo.

:: =============================================================================
:: Frontend starten
:: =============================================================================
echo ⚛️  FRONTEND WIRD GESTARTET...
cd ..\frontend

:: Node.js verfügbarkeit prüfen
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Node.js nicht gefunden!
    echo 💡 Bitte Node.js installieren: https://nodejs.org
    pause
    exit /b 1
)

:: NPM verfügbarkeit prüfen
npm --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ npm nicht gefunden!
    pause
    exit /b 1
)

:: Frontend Dependencies prüfen
echo 🔍 Prüfe Frontend Dependencies...
if not exist "node_modules\react" (
    echo 📦 Frontend Dependencies werden nachinstalliert...
    call npm install --silent
    if !errorlevel! neq 0 (
        echo ❌ NPM Install fehlgeschlagen!
        echo 💡 Versuchen Sie: npm install --legacy-peer-deps
        pause
        exit /b 1
    )
)

:: Frontend starten
echo 🚀 Frontend startet auf http://localhost:3000
echo.
echo 🌐 Browser öffnet sich automatisch in wenigen Sekunden...
echo.
echo ================================================================================
echo                            🎯 TRIANGULATION APP LÄUFT
echo ================================================================================
echo  Frontend:  http://localhost:3000  (Hauptanwendung)
echo  Backend:   http://localhost:5000  (API Server)
echo.
echo  📝 Zum Beenden: Dieses Fenster schließen oder Ctrl+C drücken
echo  🔄 Zum Neustarten: start.bat erneut ausführen
echo  🛠  Bei Problemen: install.bat als Administrator ausführen
echo ================================================================================
echo.

:: Frontend starten (blockiert bis beendet)
call npm start

:: Cleanup wenn Frontend beendet wird
echo.
echo 🛑 Frontend wurde beendet
echo 🧹 Räume auf...

:: Backend-Prozess beenden
taskkill /f /im python.exe /t >nul 2>&1

echo ✅ Anwendung vollständig beendet
echo.
echo 🔄 Zum Neustarten: start.bat erneut ausführen
echo.
pause
