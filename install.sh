#!/bin/bash

# =============================================================================
# Triangulation App - Vollständige Installation für Linux/Mac
# Installiert Python, Node.js und alle Dependencies automatisch
# =============================================================================

# Farben für bessere Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
cat << "EOF"
 ██████╗ ██╗  ██╗██████╗ ██╗ █████╗ ███╗   ██╗ ██████╗ ██╗   ██╗██╗      █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
 ╚══██╔══╝██║  ██║██╔══██╗██║██╔══██╗████╗  ██║██╔════╝ ██║   ██║██║     ██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
    ██║   ███████║██████╔╝██║███████║██╔██╗ ██║██║  ███╗██║   ██║██║     ███████║   ██║   ██║██║   ██║██╔██╗ ██║
    ██║   ██╔══██║██╔══██╗██║██╔══██║██║╚██╗██║██║   ██║██║   ██║██║     ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
    ██║   ██║  ██║██║  ██║██║██║  ██║██║ ╚████║╚██████╔╝╚██████╔╝███████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

                                🎯 VOLLSTÄNDIGE INSTALLATION 🎯
EOF
echo -e "${NC}"
echo "================================================================================"
echo ""

# Betriebssystem erkennen
OS="Unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
fi

echo -e "${GREEN}✅ Betriebssystem erkannt: $OS${NC}"
echo ""

# Arbeitsverzeichnis
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo -e "${CYAN}📁 Arbeitsverzeichnis: $APP_DIR${NC}"
echo ""

# Funktion für Fehlerbehandlung
handle_error() {
    echo -e "${RED}❌ Fehler: $1${NC}"
    echo "Installation abgebrochen."
    exit 1
}

# =============================================================================
# SCHRITT 1: Package Manager prüfen und System aktualisieren
# =============================================================================
echo "================================================================================"
echo -e "${PURPLE}📦 SCHRITT 1: System aktualisieren${NC}"
echo "================================================================================"
echo ""

if [[ "$OS" == "Linux" ]]; then
    # Prüfen welcher Package Manager verfügbar ist
    if command -v apt-get &> /dev/null; then
        PACKAGE_MANAGER="apt"
        echo -e "${YELLOW}🔧 APT Package Manager erkannt${NC}"
        echo "System wird aktualisiert..."
        sudo apt-get update -qq
        sudo apt-get install -y curl wget build-essential software-properties-common
    elif command -v yum &> /dev/null; then
        PACKAGE_MANAGER="yum"
        echo -e "${YELLOW}🔧 YUM Package Manager erkannt${NC}"
        echo "System wird aktualisiert..."
        sudo yum update -y -q
        sudo yum install -y curl wget gcc gcc-c++ make
    elif command -v dnf &> /dev/null; then
        PACKAGE_MANAGER="dnf"
        echo -e "${YELLOW}🔧 DNF Package Manager erkannt${NC}"
        echo "System wird aktualisiert..."
        sudo dnf update -y -q
        sudo dnf install -y curl wget gcc gcc-c++ make
    else
        handle_error "Kein unterstützter Package Manager gefunden (apt, yum, dnf)"
    fi
elif [[ "$OS" == "macOS" ]]; then
    # Xcode Command Line Tools installieren
    if ! xcode-select -p &> /dev/null; then
        echo -e "${YELLOW}🔧 Xcode Command Line Tools werden installiert...${NC}"
        xcode-select --install
        echo "Bitte die Xcode Installation abschließen und das Skript erneut ausführen."
        exit 1
    fi
    
    # Homebrew installieren falls nicht vorhanden
    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}🍺 Homebrew wird installiert...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Homebrew zum PATH hinzufügen
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    PACKAGE_MANAGER="brew"
    echo -e "${YELLOW}🍺 Homebrew Package Manager erkannt${NC}"
fi

echo -e "${GREEN}✅ System aktualisiert${NC}"
echo ""

# =============================================================================
# SCHRITT 2: Python Installation prüfen/installieren
# =============================================================================
echo "================================================================================"
echo -e "${PURPLE}🐍 SCHRITT 2: Python Installation${NC}"
echo "================================================================================"
echo ""

PYTHON_CMD=""
# Prüfe verschiedene Python-Versionen
for cmd in python3.11 python3.10 python3.9 python3 python; do
    if command -v $cmd &> /dev/null; then
        VERSION=$($cmd --version 2>&1 | grep -oE '[0-9]+\.[0-9]+')
        if [[ $(echo "$VERSION >= 3.8" | bc -l 2>/dev/null || echo 0) == 1 ]]; then
            PYTHON_CMD=$cmd
            break
        fi
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    echo -e "${YELLOW}⚠️  Python 3.8+ nicht gefunden - wird installiert...${NC}"
    
    if [[ "$OS" == "Linux" ]]; then
        if [[ "$PACKAGE_MANAGER" == "apt" ]]; then
            sudo apt-get install -y python3 python3-pip python3-venv python3-dev
        elif [[ "$PACKAGE_MANAGER" == "yum" ]]; then
            sudo yum install -y python3 python3-pip python3-devel
        elif [[ "$PACKAGE_MANAGER" == "dnf" ]]; then
            sudo dnf install -y python3 python3-pip python3-devel
        fi
        PYTHON_CMD="python3"
    elif [[ "$OS" == "macOS" ]]; then
        brew install python@3.11
        PYTHON_CMD="python3"
    fi
    
    # Erneut prüfen
    if ! command -v $PYTHON_CMD &> /dev/null; then
        handle_error "Python Installation fehlgeschlagen"
    fi
else
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
    echo -e "${GREEN}✅ Python bereits installiert: $PYTHON_VERSION${NC}"
fi

# pip aktualisieren
echo -e "${YELLOW}📦 pip wird aktualisiert...${NC}"
$PYTHON_CMD -m pip install --upgrade pip --quiet --user

echo ""

# =============================================================================
# SCHRITT 3: Node.js Installation prüfen/installieren
# =============================================================================
echo "================================================================================"
echo -e "${PURPLE}🟢 SCHRITT 3: Node.js Installation${NC}"
echo "================================================================================"
echo ""

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js nicht gefunden - wird installiert...${NC}"
    
    if [[ "$OS" == "Linux" ]]; then
        # NodeSource Repository hinzufügen
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        if [[ "$PACKAGE_MANAGER" == "apt" ]]; then
            sudo apt-get install -y nodejs
        elif [[ "$PACKAGE_MANAGER" == "yum" ]]; then
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs npm
        elif [[ "$PACKAGE_MANAGER" == "dnf" ]]; then
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo dnf install -y nodejs npm
        fi
    elif [[ "$OS" == "macOS" ]]; then
        brew install node
    fi
    
    # Erneut prüfen
    if ! command -v node &> /dev/null; then
        handle_error "Node.js Installation fehlgeschlagen"
    fi
else
    NODE_VERSION=$(node --version 2>&1)
    echo -e "${GREEN}✅ Node.js bereits installiert: $NODE_VERSION${NC}"
fi

# npm Version prüfen
if ! command -v npm &> /dev/null; then
    handle_error "npm nicht gefunden"
else
    NPM_VERSION=$(npm --version 2>&1)
    echo -e "${GREEN}✅ npm verfügbar: v$NPM_VERSION${NC}"
fi

echo ""

# =============================================================================
# SCHRITT 4: Backend Setup
# =============================================================================
echo "================================================================================"
echo -e "${PURPLE}🔧 SCHRITT 4: Backend (Python Flask) Setup${NC}"
echo "================================================================================"
echo ""

if [ ! -d "backend" ]; then
    handle_error "Backend-Verzeichnis nicht gefunden!"
fi

cd backend

echo -e "${YELLOW}📦 Virtual Environment wird erstellt...${NC}"
if [ -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Vorhandenes venv wird gelöscht...${NC}"
    rm -rf venv
fi

$PYTHON_CMD -m venv venv || handle_error "Virtual Environment konnte nicht erstellt werden"

echo -e "${YELLOW}🔧 Virtual Environment wird aktiviert...${NC}"
source venv/bin/activate

echo -e "${YELLOW}📥 Python Dependencies werden installiert...${NC}"
pip install --upgrade pip
pip install -r requirements.txt || handle_error "Backend Dependencies konnten nicht installiert werden"

echo -e "${GREEN}✅ Backend Setup erfolgreich!${NC}"
echo ""

# Zurück zum Hauptverzeichnis
cd ..

# =============================================================================
# SCHRITT 5: Frontend Setup
# =============================================================================
echo "================================================================================"
echo -e "${PURPLE}⚛️  SCHRITT 5: Frontend (React) Setup${NC}"
echo "================================================================================"
echo ""

if [ ! -d "frontend" ]; then
    handle_error "Frontend-Verzeichnis nicht gefunden!"
fi

cd frontend

echo -e "${YELLOW}📥 NPM Dependencies werden installiert...${NC}"
echo -e "${CYAN}(Das kann einige Minuten dauern...)${NC}"

npm install || {
    echo -e "${YELLOW}⚠️  Standard-Installation fehlgeschlagen, versuche Alternative...${NC}"
    npm install --legacy-peer-deps || handle_error "Frontend Dependencies konnten nicht installiert werden"
}

echo -e "${GREEN}✅ Frontend Setup erfolgreich!${NC}"
echo ""

# Zurück zum Hauptverzeichnis
cd ..

# =============================================================================
# SCHRITT 6: Start-Skript ausführbar machen
# =============================================================================
echo "================================================================================"
echo -e "${PURPLE}🔧 SCHRITT 6: Skripte konfigurieren${NC}"
echo "================================================================================"
echo ""

# Skripte ausführbar machen
chmod +x start.sh
chmod +x install.sh

echo -e "${GREEN}✅ Skripte sind jetzt ausführbar${NC}"
echo ""

# =============================================================================
# INSTALLATION ABGESCHLOSSEN
# =============================================================================
echo "================================================================================"
echo -e "${GREEN}🎉 INSTALLATION ERFOLGREICH ABGESCHLOSSEN!${NC}"
echo "================================================================================"
echo ""
echo -e "${GREEN}✅ Python installiert und konfiguriert${NC}"
echo -e "${GREEN}✅ Node.js installiert und konfiguriert${NC}"
echo -e "${GREEN}✅ Backend Dependencies installiert${NC}"
echo -e "${GREEN}✅ Frontend Dependencies installiert${NC}"
echo -e "${GREEN}✅ Skripte konfiguriert${NC}"
echo ""
echo -e "${CYAN}🚀 Die App kann jetzt gestartet werden:${NC}"
echo ""
echo -e "${WHITE}   📱 Option 1: ./start.sh${NC}"
echo -e "${WHITE}   📱 Option 2: Manuell mit den folgenden Befehlen:${NC}"
echo ""
echo -e "${YELLOW}        Backend:  cd backend && source venv/bin/activate && python app.py${NC}"
echo -e "${YELLOW}        Frontend: cd frontend && npm start${NC}"
echo ""
echo -e "${CYAN}🌐 Nach dem Start öffnet sich die App automatisch im Browser:${NC}"
echo -e "${WHITE}    Frontend: http://localhost:3000${NC}"
echo -e "${WHITE}    Backend:  http://localhost:5000${NC}"
echo ""
echo -e "${CYAN}📚 Weitere Informationen in der README.md${NC}"
echo ""
echo "================================================================================"

# Fragen ob die App direkt gestartet werden soll
echo ""
echo -e "${YELLOW}Soll die App jetzt gestartet werden? (j/n)${NC}"
read -r START_CHOICE

if [[ "$START_CHOICE" =~ ^[JjYy]$ ]]; then
    echo ""
    echo -e "${GREEN}🚀 App wird gestartet...${NC}"
    ./start.sh &
    echo ""
    echo -e "${GREEN}✅ Die App startet in einem neuen Terminal!${NC}"
    echo -e "${WHITE}    Frontend: http://localhost:3000${NC}"
    echo -e "${WHITE}    Backend:  http://localhost:5000${NC}"
else
    echo ""
    echo -e "${GREEN}✅ Installation abgeschlossen!${NC}"
    echo -e "${WHITE}    Verwenden Sie './start.sh' zum Starten.${NC}"
fi

echo ""
echo -e "${YELLOW}Drücken Sie Enter zum Beenden...${NC}"
read -r
