from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import math
from typing import List, Dict, Any, Tuple, Optional
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

class AdvancedTriangulationCalculator:
    """
    Erweiterte Klasse für die Berechnung der Triangulation mit beliebig vielen Punkten
    """
    
    @staticmethod
    def calculate_position(points: List[Dict]) -> Dict[str, Any]:
        """
        Berechnet die Position basierend auf 3 oder mehr Referenzpunkten
        Verwendet verschiedene Algorithmen je nach Anzahl der Punkte
        
        Args:
            points: Liste von Dictionaries mit 'lat', 'lng', 'distance' keys
            
        Returns:
            Dictionary mit berechneter Position, Genauigkeit und Statistiken
        """
        if len(points) < 3:
            return {"error": "Mindestens 3 Referenzpunkte erforderlich"}
        
        try:
            # Konvertiere Geo-Koordinaten zu kartesischen Koordinaten
            cartesian_points = []
            center_lat = sum(p['lat'] for p in points) / len(points)
            center_lng = sum(p['lng'] for p in points) / len(points)
            
            for i, point in enumerate(points):
                x, y = AdvancedTriangulationCalculator.geo_to_cartesian(
                    point['lat'], point['lng'], center_lat, center_lng
                )
                cartesian_points.append({
                    'x': x, 'y': y, 'd': point['distance'],
                    'lat': point['lat'], 'lng': point['lng'],
                    'id': i + 1
                })
            
            # Wähle Algorithmus basierend auf Anzahl der Punkte
            if len(cartesian_points) == 3:
                result = AdvancedTriangulationCalculator.trilaterate_3_points(cartesian_points)
            else:
                result = AdvancedTriangulationCalculator.multilaterate_advanced(cartesian_points)
            
            if 'error' in result:
                return result
            
            # Konvertiere zurück zu Geo-Koordinaten
            lat, lng = AdvancedTriangulationCalculator.cartesian_to_geo(
                result['x'], result['y'], center_lat, center_lng
            )
            
            return {
                "lat": lat,
                "lng": lng,
                "accuracy": result.get('accuracy', 0),
                "method": result.get('method', 'unknown'),
                "point_count": len(points),
                "confidence": result.get('confidence', 0)
            }
            
        except Exception as e:
            return {"error": f"Berechnungsfehler: {str(e)}"}
    
    @staticmethod
    def multilaterate_advanced(points: List[Dict]) -> Dict[str, Any]:
        """
        Erweiterte Multilateration für beliebig viele Punkte
        Verwendet Weighted Least Squares
        """
        try:
            n = len(points)
            
            # Erstelle Design-Matrix für Least Squares
            A = np.zeros((n, 2))
            b = np.zeros(n)
            weights = np.ones(n)
            
            for i, point in enumerate(points):
                A[i, 0] = 2 * point['x']
                A[i, 1] = 2 * point['y']
                b[i] = (point['x']**2 + point['y']**2 - point['d']**2)
                weights[i] = 1.0 / (1.0 + point['d'] / 1000.0)
            
            # Weighted Least Squares
            W = np.diag(weights)
            AtWA = A.T @ W @ A
            AtWb = A.T @ W @ b
            
            if np.linalg.det(AtWA) < 1e-12:
                return {"error": "Singulare Matrix - Punkte sind ungünstig positioniert"}
            
            solution = np.linalg.solve(AtWA, AtWb)
            x, y = solution[0], solution[1]
            
            # Berechne Genauigkeitsmetriken
            distance_errors = []
            for point in points:
                calculated_dist = math.sqrt((x - point['x'])**2 + (y - point['y'])**2)
                error = abs(calculated_dist - point['d'])
                distance_errors.append(error)
            
            rmse = np.sqrt(np.mean(np.array(distance_errors)**2))
            confidence = max(0, min(100, 100 * (1 - rmse / 50)))
            
            return {
                "x": x,
                "y": y,
                "accuracy": rmse,
                "method": f"Weighted Least Squares ({n} Punkte)",
                "confidence": confidence
            }
            
        except Exception as e:
            return {"error": f"Multilateration fehlgeschlagen: {str(e)}"}
    
    @staticmethod
    def trilaterate_3_points(points: List[Dict]) -> Dict[str, Any]:
        """
        Exakte Trilateration für genau 3 Punkte
        """
        try:
            p1, p2, p3 = points[0], points[1], points[2]
            
            # Löse das System linearer Gleichungen
            A = 2 * (p2['x'] - p1['x'])
            B = 2 * (p2['y'] - p1['y'])
            C = (p1['d']**2 - p2['d']**2 - p1['x']**2 + p2['x']**2 - p1['y']**2 + p2['y']**2)
            D = 2 * (p3['x'] - p2['x'])
            E = 2 * (p3['y'] - p2['y'])
            F = (p2['d']**2 - p3['d']**2 - p2['x']**2 + p3['x']**2 - p2['y']**2 + p3['y']**2)
            
            denominator = A * E - B * D
            
            if abs(denominator) < 1e-10:
                return {"error": "Punkte sind kollinear oder Konfiguration ist ungültig"}
            
            x = (C * E - F * B) / denominator
            y = (A * F - D * C) / denominator
            
            # Verifiziere die Lösung
            distance_errors = []
            for point in points:
                calculated_dist = math.sqrt((x - point['x'])**2 + (y - point['y'])**2)
                error = abs(calculated_dist - point['d'])
                distance_errors.append(error)
            
            max_error = max(distance_errors)
            confidence = max(0, min(100, 100 * (1 - max_error / 100)))
            
            return {
                "x": x,
                "y": y,
                "accuracy": max_error,
                "method": "Exakte Trilateration (3 Punkte)",
                "confidence": confidence
            }
            
        except Exception as e:
            return {"error": f"Trilateration fehlgeschlagen: {str(e)}"}
    
    @staticmethod
    def geo_to_cartesian(lat: float, lng: float, ref_lat: float, ref_lng: float) -> Tuple[float, float]:
        """
        Konvertiert Geo-Koordinaten zu lokalen kartesischen Koordinaten
        """
        R = 6371000  # Erdradius in Metern
        
        lat_rad = math.radians(lat)
        lng_rad = math.radians(lng)
        ref_lat_rad = math.radians(ref_lat)
        ref_lng_rad = math.radians(ref_lng)
        
        x = R * (lng_rad - ref_lng_rad) * math.cos(ref_lat_rad)
        y = R * (lat_rad - ref_lat_rad)
        
        return x, y
    
    @staticmethod
    def cartesian_to_geo(x: float, y: float, ref_lat: float, ref_lng: float) -> Tuple[float, float]:
        """
        Konvertiert kartesische Koordinaten zurück zu Geo-Koordinaten
        """
        R = 6371000  # Erdradius in Metern
        
        ref_lat_rad = math.radians(ref_lat)
        
        lat = ref_lat + math.degrees(y / R)
        lng = ref_lng + math.degrees(x / (R * math.cos(ref_lat_rad)))
        
        return lat, lng

@app.route('/api/triangulate', methods=['POST'])
def triangulate():
    """
    Erweiterte API für Triangulation mit beliebig vielen Punkten
    """
    try:
        data = request.get_json()
        
        if not data or 'points' not in data:
            return jsonify({"error": "Ungültige Anfrage - 'points' Array erforderlich"}), 400
        
        points = data['points']
        
        if len(points) < 3:
            return jsonify({"error": "Mindestens 3 Referenzpunkte erforderlich"}), 400
        
        # Validiere Eingabedaten
        for i, point in enumerate(points):
            required_fields = ['lat', 'lng', 'distance']
            for field in required_fields:
                if field not in point:
                    return jsonify({"error": f"Punkt {i+1}: '{field}' fehlt"}), 400
                if not isinstance(point[field], (int, float)):
                    return jsonify({"error": f"Punkt {i+1}: '{field}' muss eine Zahl sein"}), 400
            
            if point['distance'] <= 0:
                return jsonify({"error": f"Punkt {i+1}: Entfernung muss größer als 0 sein"}), 400
        
        # Berechne Triangulation
        result = AdvancedTriangulationCalculator.calculate_position(points)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"Server-Fehler: {str(e)}"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health Check Endpoint für Render.com und Docker"""
    return jsonify({
        "status": "healthy", 
        "message": "Advanced Triangulation API läuft",
        "version": "2.0.0"
    })

@app.route('/health', methods=['GET'])
def health_check_root():
    """Alternative Health Check Route"""
    return health_check()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print("🎯 Advanced Triangulation API Server startet...")
    print("🌍 Verfügbare Endpoints:")
    print("   POST /api/triangulate - Erweiterte Standort-Berechnung")
    print("   GET  /api/health - Health Check")
    print(f"\n📍 Server läuft auf Port {port}")
    
    app.run(debug=debug, host='0.0.0.0', port=port)