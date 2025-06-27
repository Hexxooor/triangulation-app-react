@echo off
:: EINFACHER STARTER - Startet ohne Installation-Checks
echo.
echo 🎯 TRIANGULATION APP - DIREKTER START
echo =====================================
echo.

cd /d "%~dp0"

:: Prüfe grundlegende Voraussetzungen
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python nicht gefunden! 
    echo 💡 Bitte zuerst install.bat ausführen
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js nicht gefunden!
    echo 💡 Bitte zuerst install.bat ausführen
    pause
    exit /b 1
)

echo ✅ Python und Node.js gefunden
echo.

:: Backend starten
echo 🐍 Starte Backend...
cd backend

:: Versuche venv zu aktivieren, sonst System-Python
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo ✅ Virtual Environment aktiviert
) else (
    echo ⚠️  Verwende System-Python
)

:: Backend im Hintergrund starten
echo 🚀 Backend startet auf http://localhost:5000
start /b python app.py

:: Warte kurz
timeout /t 3 /nobreak >nul

:: Frontend starten
echo.
echo ⚛️  Starte Frontend...
cd ..\frontend

echo 🚀 Frontend startet auf http://localhost:3000
echo.
echo ================================================================================
echo  🌐 Frontend: http://localhost:3000
echo  🔧 Backend:  http://localhost:5000
echo ================================================================================
echo.

:: Frontend starten
npm start

echo.
echo 🛑 App beendet
pause
