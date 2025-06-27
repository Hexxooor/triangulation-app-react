@echo off
:: SUPER-EINFACH: Installiert nur das Nötigste und startet
echo.
echo 🎯 TRIANGULATION APP - SUPER EINFACH
echo =====================================
echo.

cd /d "%~dp0"

:: Dependencies installieren (direkt in System-Python)
echo 📦 Installiere Python Dependencies...
pip install flask flask-cors numpy
if errorlevel 1 (
    echo ❌ Python Dependencies Installation fehlgeschlagen!
    pause
    exit /b 1
)

echo ✅ Python Dependencies installiert
echo.

:: Backend starten
echo 🐍 Backend startet...
cd backend
start "Backend" python app.py
timeout /t 3 /nobreak >nul

:: Frontend Dependencies (falls nötig)
cd ..\frontend
if not exist "node_modules" (
    echo 📦 Installiere Frontend Dependencies...
    npm install
)

:: Frontend starten
echo ⚛️  Frontend startet...
echo.
echo 🌐 http://localhost:3000
echo 🔧 http://localhost:5000
echo.

npm start
