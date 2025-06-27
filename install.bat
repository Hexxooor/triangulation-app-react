@echo off
:: =============================================================================
:: Triangulation App - Vollständige Installation für Windows
:: Installiert Python, Node.js und alle Dependencies automatisch
:: =============================================================================

setlocal EnableDelayedExpansion
color 0A

echo.
echo  ██████╗ ██╗  ██╗██████╗ ██╗ █████╗ ███╗   ██╗ ██████╗ ██╗   ██╗██╗      █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
echo  ╚══██╔══╝██║  ██║██╔══██╗██║██╔══██╗████╗  ██║██╔════╝ ██║   ██║██║     ██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
echo     ██║   ███████║██████╔╝██║███████║██╔██╗ ██║██║  ███╗██║   ██║██║     ███████║   ██║   ██║██║   ██║██╔██╗ ██║
echo     ██║   ██╔══██║██╔══██╗██║██╔══██║██║╚██╗██║██║   ██║██║   ██║██║     ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
echo     ██║   ██║  ██║██║  ██║██║██║  ██║██║ ╚████║╚██████╔╝╚██████╔╝███████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
echo     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
echo.
echo                                    🎯 VOLLSTÄNDIGE INSTALLATION 🎯
echo.
echo ================================================================================
echo.

:: Prüfen ob Admin-Rechte vorhanden sind
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ FEHLER: Bitte als Administrator ausführen!
    echo.
    echo Rechtsklick auf die Datei → "Als Administrator ausführen"
    echo.
    pause
    exit /b 1
)

echo ✅ Administrator-Rechte erkannt
echo.

:: Arbeitsverzeichnis setzen
set "APP_DIR=%~dp0"
cd /d "%APP_DIR%"

echo 📁 Arbeitsverzeichnis: %APP_DIR%
echo.

:: =============================================================================
:: SCHRITT 1: Python Installation prüfen/installieren
:: =============================================================================
echo ================================================================================
echo 🐍 SCHRITT 1: Python Installation
echo ================================================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Python nicht gefunden - wird automatisch installiert...
    echo.
    
    :: Python Installer herunterladen
    echo 📥 Python 3.11 wird heruntergeladen...
    if not exist "python-installer.exe" (
        powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.6/python-3.11.6-amd64.exe' -OutFile 'python-installer.exe'}"
    )
    
    echo 🔧 Python wird installiert...
    python-installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    
    :: Warten bis Installation abgeschlossen
    timeout /t 30 /nobreak >nul
    
    :: PATH aktualisieren
    refreshenv
    
    :: Erneut prüfen
    python --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Python Installation fehlgeschlagen!
        echo Bitte Python manuell von https://python.org installieren
        pause
        exit /b 1
    )
    
    :: Installer löschen
    del python-installer.exe >nul 2>&1
    
    echo ✅ Python erfolgreich installiert!
) else (
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo ✅ Python bereits installiert: !PYTHON_VERSION!
)

:: pip aktualisieren
echo 📦 pip wird aktualisiert...
python -m pip install --upgrade pip --quiet
echo.

:: =============================================================================
:: SCHRITT 2: Node.js Installation prüfen/installieren
:: =============================================================================
echo ================================================================================
echo 🟢 SCHRITT 2: Node.js Installation
echo ================================================================================
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Node.js nicht gefunden - wird automatisch installiert...
    echo.
    
    :: Node.js Installer herunterladen
    echo 📥 Node.js LTS wird heruntergeladen...
    if not exist "nodejs-installer.msi" (
        powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.18.2/node-v18.18.2-x64.msi' -OutFile 'nodejs-installer.msi'}"
    )
    
    echo 🔧 Node.js wird installiert...
    msiexec /i nodejs-installer.msi /quiet /norestart
    
    :: Warten bis Installation abgeschlossen
    timeout /t 60 /nobreak >nul
    
    :: PATH aktualisieren
    set "PATH=%PATH%;%ProgramFiles%\nodejs"
    
    :: Erneut prüfen
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Node.js Installation fehlgeschlagen!
        echo Bitte Node.js manuell von https://nodejs.org installieren
        pause
        exit /b 1
    )
    
    :: Installer löschen
    del nodejs-installer.msi >nul 2>&1
    
    echo ✅ Node.js erfolgreich installiert!
) else (
    for /f "tokens=*" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
    echo ✅ Node.js bereits installiert: !NODE_VERSION!
)

:: npm Version prüfen
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm nicht gefunden!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version 2^>^&1') do set NPM_VERSION=%%i
    echo ✅ npm verfügbar: v!NPM_VERSION!
)
echo.

:: =============================================================================
:: SCHRITT 3: Backend Setup
:: =============================================================================
echo ================================================================================
echo 🔧 SCHRITT 3: Backend (Python Flask) Setup
echo ================================================================================
echo.

if not exist "backend" (
    echo ❌ Backend-Verzeichnis nicht gefunden!
    pause
    exit /b 1
)

cd backend

echo 📦 Virtual Environment wird erstellt...
if exist "venv" (
    echo ⚠️  Vorhandenes venv wird gelöscht...
    rmdir /s /q venv
)

python -m venv venv
if %errorlevel% neq 0 (
    echo ❌ Virtual Environment konnte nicht erstellt werden!
    pause
    exit /b 1
)

echo 🔧 Virtual Environment wird aktiviert...
call venv\Scripts\activate.bat

echo 📥 Python Dependencies werden installiert...
pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Backend Dependencies konnten nicht installiert werden!
    pause
    exit /b 1
)

echo ✅ Backend Setup erfolgreich!
echo.

:: Zurück zum Hauptverzeichnis
cd ..

:: =============================================================================
:: SCHRITT 4: Frontend Setup
:: =============================================================================
echo ================================================================================
echo ⚛️  SCHRITT 4: Frontend (React) Setup
echo ================================================================================
echo.

if not exist "frontend" (
    echo ❌ Frontend-Verzeichnis nicht gefunden!
    pause
    exit /b 1
)

cd frontend

echo 📥 NPM Dependencies werden installiert...
echo (Das kann einige Minuten dauern...)
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend Dependencies konnten nicht installiert werden!
    echo Versuche alternative Installation...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ❌ Frontend Installation fehlgeschlagen!
        pause
        exit /b 1
    )
)

echo ✅ Frontend Setup erfolgreich!
echo.

:: Zurück zum Hauptverzeichnis
cd ..

:: =============================================================================
:: SCHRITT 5: Desktop-Verknüpfungen erstellen
:: =============================================================================
echo ================================================================================
echo 🖥️  SCHRITT 5: Desktop-Verknüpfungen erstellen
echo ================================================================================
echo.

:: Verknüpfung für App-Start erstellen
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\Triangulation App.lnk"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%APP_DIR%start.bat'; $Shortcut.WorkingDirectory = '%APP_DIR%'; $Shortcut.IconLocation = 'shell32.dll,23'; $Shortcut.Description = 'Triangulation App starten'; $Shortcut.Save()"

echo ✅ Desktop-Verknüpfung erstellt: "Triangulation App"
echo.

:: =============================================================================
:: SCHRITT 6: Firewall-Regeln (Optional)
:: =============================================================================
echo ================================================================================
echo 🔥 SCHRITT 6: Firewall-Konfiguration (Optional)
echo ================================================================================
echo.

echo Sollen Firewall-Regeln für die App erstellt werden? (j/n)
set /p FIREWALL_CHOICE="> "

if /i "!FIREWALL_CHOICE!"=="j" (
    echo 🔧 Firewall-Regeln werden erstellt...
    netsh advfirewall firewall add rule name="Triangulation App - Frontend" dir=in action=allow protocol=TCP localport=3000
    netsh advfirewall firewall add rule name="Triangulation App - Backend" dir=in action=allow protocol=TCP localport=5000
    echo ✅ Firewall-Regeln erstellt
) else (
    echo ⏭️  Firewall-Konfiguration übersprungen
)
echo.

:: =============================================================================
:: INSTALLATION ABGESCHLOSSEN
:: =============================================================================
echo ================================================================================
echo 🎉 INSTALLATION ERFOLGREICH ABGESCHLOSSEN!
echo ================================================================================
echo.
echo ✅ Python installiert und konfiguriert
echo ✅ Node.js installiert und konfiguriert  
echo ✅ Backend Dependencies installiert
echo ✅ Frontend Dependencies installiert
echo ✅ Desktop-Verknüpfung erstellt
echo.
echo 🚀 Die App kann jetzt gestartet werden:
echo.
echo    📱 Option 1: Doppelklick auf Desktop-Verknüpfung "Triangulation App"
echo    📱 Option 2: start.bat in diesem Ordner ausführen
echo    📱 Option 3: Manuell mit den folgenden Befehlen:
echo.
echo        Backend:  cd backend ^&^& venv\Scripts\activate ^&^& python app.py
echo        Frontend: cd frontend ^&^& npm start
echo.
echo 🌐 Nach dem Start öffnet sich die App automatisch im Browser:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo 📚 Weitere Informationen in der README.md
echo.
echo ================================================================================

:: Fragen ob die App direkt gestartet werden soll
echo.
echo Soll die App jetzt gestartet werden? (j/n)
set /p START_CHOICE="> "

if /i "!START_CHOICE!"=="j" (
    echo.
    echo 🚀 App wird gestartet...
    start "" "%APP_DIR%start.bat"
    echo.
    echo ✅ Die App startet in einem neuen Fenster!
    echo    Frontend: http://localhost:3000
    echo    Backend:  http://localhost:5000
) else (
    echo.
    echo ✅ Installation abgeschlossen!
    echo    Verwenden Sie die Desktop-Verknüpfung zum Starten.
)

echo.
echo Drücken Sie eine beliebige Taste zum Beenden...
pause >nul
