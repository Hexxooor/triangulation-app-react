#!/usr/bin/env python3
"""
Triangulation App - Render.com Entry Point
Wrapper für das Backend im backend/ Verzeichnis
"""

import sys
import os

# Füge das backend-Verzeichnis zum Python-Path hinzu
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Importiere die Flask-App aus dem backend-Verzeichnis
from app import app

if __name__ == '__main__':
    # Für lokale Entwicklung
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
else:
    # Für Render.com (Gunicorn)
    application = app