#!/bin/bash

# =============================================================================
# Triangulation App Starter Script für Linux/Mac (Verbesserte Version)
# Startet Backend und Frontend mit verbesserter Fehlerbehandlung
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
 🎯 TRIANGULATION APP STARTER
===================================
 Status: Starte Anwendung...
===================================
EOF
echo -e "${NC}"
echo ""

# Arbeitsverzeichnis
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo -e "${CYAN}📁 Arbeitsverzeichnis: $APP_DIR${NC}"
echo ""

# Funktion für Fehlerbehandlung
handle_error() {
    echo -e "${RED}❌ Fehler: $1${NC}"
    exit 1
}

# Funktion zum Beenden aller Prozesse
cleanup() {
    echo -e "\n${YELLOW}🛑 Beende Anwendung...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Backend beendet${NC}"
    fi
    echo -e "${GREEN}✅ Anwendung vollständig beendet${NC}"
    exit 0
}

# Trap für sauberes Beenden
trap cleanup SIGINT SIGTERM

# Prüfe ob Installation vorhanden ist
if [ ! -d "backend/venv" ]; then
    echo -e "${RED}❌ Backend nicht installiert!${NC}"
    echo -e "${YELLOW}➤ Bitte zuerst ./install.sh ausführen${NC}"
    echo ""
    read -p "Soll die Installation jetzt gestartet werden? (j/n): " INSTALL_CHOICE
    if [[ "$INSTALL_CHOICE" =~ ^[JjYy]$ ]]; then
        ./install.sh
        exit 0
    else
        exit 1
    fi
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${RED}❌ Frontend nicht installiert!${NC}"
    echo -e "${YELLOW}➤ Bitte zuerst ./install.sh ausführen${NC}"
    echo ""
    read -p "Soll die Installation jetzt gestartet werden? (j/n): " INSTALL_CHOICE
    if [[ "$INSTALL_CHOICE" =~ ^[JjYy]$ ]]; then
        ./install.sh
        exit 0
    else
        exit 1
    fi
fi

# Prüfe ob Ports bereits belegt sind
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 5000 bereits belegt - Backend könnte bereits laufen${NC}"
    echo ""
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 bereits belegt - Frontend könnte bereits laufen${NC}"
    echo ""
fi

echo -e "${GREEN}✅ Installationen gefunden${NC}"
echo -e "${GREEN}✅ Starte Services...${NC}"
echo ""

# Python-Befehl ermitteln
PYTHON_CMD=""
for cmd in python3.11 python3.10 python3.9 python3 python; do
    if command -v $cmd &> /dev/null; then
        PYTHON_CMD=$cmd
        break
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    handle_error "Python nicht gefunden! Bitte ./install.sh ausführen"
fi

# =============================================================================
# Backend starten
# =============================================================================
echo -e "${PURPLE}🐍 Backend (Python Flask) wird gestartet...${NC}"
cd backend

# Virtual Environment prüfen
if [ ! -f "venv/bin/activate" ]; then
    handle_error "Virtual Environment beschädigt! Bitte ./install.sh erneut ausführen"
fi

# Virtual Environment aktivieren
source venv/bin/activate

# Dependencies prüfen
echo -e "${YELLOW}🔍 Prüfe Backend Dependencies...${NC}"
$PYTHON_CMD -c "import flask, numpy" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}📦 Backend Dependencies werden nachinstalliert...${NC}"
    pip install -r requirements.txt --quiet
fi

# Backend im Hintergrund starten
echo -e "${GREEN}🚀 Backend Server startet auf http://localhost:5000${NC}"
$PYTHON_CMD app.py &
BACKEND_PID=$!

# Warten bis Backend bereit ist
echo -e "${YELLOW}⏳ Warte auf Backend...${NC}"
for i in {1..15}; do
    sleep 1
    if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend ist bereit!${NC}"
        break
    fi
    echo "   Versuche $i/15..."
done

# Prüfen ob Backend tatsächlich läuft
if ! curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Backend braucht länger als erwartet, aber Frontend wird trotzdem gestartet...${NC}"
fi

echo ""

# =============================================================================
# Frontend starten
# =============================================================================
echo -e "${PURPLE}⚛️  Frontend (React) wird gestartet...${NC}"
cd ../frontend

# Frontend Dependencies prüfen
echo -e "${YELLOW}🔍 Prüfe Frontend Dependencies...${NC}"
if [ ! -d "node_modules/react" ]; then
    echo -e "${YELLOW}📦 Frontend Dependencies werden nachinstalliert...${NC}"
    npm install --silent
fi

echo -e "${GREEN}🚀 Frontend startet auf http://localhost:3000${NC}"
echo ""
echo -e "${CYAN}🌐 Browser öffnet sich automatisch in wenigen Sekunden...${NC}"
echo ""
echo "================================================================================"
echo -e "${WHITE}                        🎯 TRIANGULATION APP LÄUFT${NC}"
echo "================================================================================"
echo -e "${WHITE} Frontend:  http://localhost:3000  (Hauptanwendung)${NC}"
echo -e "${WHITE} Backend:   http://localhost:5000  (API Server)${NC}"
echo ""
echo -e "${YELLOW} 📝 Zum Beenden: Ctrl+C drücken${NC}"
echo -e "${YELLOW} 🔄 Zum Neustarten: ./start.sh erneut ausführen${NC}"
echo "================================================================================"
echo ""

# Frontend starten (blockiert bis beendet)
npm start

# Cleanup wird automatisch durch trap aufgerufen
