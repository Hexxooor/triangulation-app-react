@echo off
:: SCHNELLE DEPENDENCY-INSTALLATION UND START
echo.
echo 🎯 TRIANGULATION APP - SCHNELL-SETUP
echo ==========================================
echo.

cd /d "%~dp0"

echo 🔍 Prüfe Python und Node.js...

:: Python prüfen
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python nicht gefunden!
    echo 💡 Bitte Python von https://python.org installieren
    pause
    exit /b 1
)

:: Node.js prüfen
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js nicht gefunden!
    echo 💡 Bitte Node.js von https://nodejs.org installieren
    pause
    exit /b 1
)

echo ✅ Python und Node.js gefunden
echo.

:: =============================================================================
:: BACKEND SETUP
:: =============================================================================
echo 🐍 BACKEND SETUP...
cd backend

:: Prüfe ob Flask installiert ist
python -c "import flask" 2>nul
if errorlevel 1 (
    echo ⚠️  Flask nicht gefunden - installiere Dependencies...
    
    :: Versuche zuerst Virtual Environment
    if exist "venv\Scripts\activate.bat" (
        echo 🔧 Aktiviere Virtual Environment...
        call venv\Scripts\activate.bat
        pip install -r requirements.txt
    ) else (
        echo 🔧 Erstelle Virtual Environment...
        python -m venv venv
        call venv\Scripts\activate.bat
        pip install --upgrade pip
        pip install -r requirements.txt
    )
    
    :: Prüfe erneut
    python -c "import flask" 2>nul
    if errorlevel 1 (
        echo ❌ Backend Setup fehlgeschlagen!
        echo 💡 Versuche manuelle Installation: pip install flask flask-cors numpy
        pause
        exit /b 1
    )
) else (
    echo ✅ Flask bereits installiert
    :: Aktiviere venv falls vorhanden
    if exist "venv\Scripts\activate.bat" (
        call venv\Scripts\activate.bat
    )
)

:: Backend starten
echo 🚀 Backend startet auf http://localhost:5000
start "Backend" python app.py

:: Warte bis Backend bereit ist
echo ⏳ Warte auf Backend...
for /l %%i in (1,1,15) do (
    timeout /t 1 /nobreak >nul
    curl -s http://localhost:5000/api/health >nul 2>&1
    if !errorlevel!==0 (
        echo ✅ Backend bereit!
        goto backend_ready
    )
    echo    %%i/15...
)

echo ⚠️  Backend braucht länger...

:backend_ready
echo.

:: =============================================================================
:: FRONTEND SETUP
:: =============================================================================
echo ⚛️  FRONTEND SETUP...
cd ..\frontend

:: Prüfe ob node_modules existiert
if not exist "node_modules" (
    echo 📦 Installiere Frontend Dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ NPM Install fehlgeschlagen!
        pause
        exit /b 1
    )
) else (
    echo ✅ Node modules bereits installiert
)

:: Frontend starten
echo 🚀 Frontend startet auf http://localhost:3000
echo.
echo ================================================================================
echo                          🎯 TRIANGULATION APP LÄUFT
echo ================================================================================
echo  🌐 Frontend: http://localhost:3000  (Hauptanwendung)
echo  🔧 Backend:  http://localhost:5000  (API Server)
echo.
echo  📝 Zum Beenden: Ctrl+C drücken
echo ================================================================================
echo.

:: Frontend starten
call npm start

:: Cleanup
echo.
echo 🛑 App beendet
taskkill /f /im python.exe /t >nul 2>&1
pause
