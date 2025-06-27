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
            
            # Erweiterte Statistiken berechnen
            stats = AdvancedTriangulationCalculator.calculate_statistics(
                result, cartesian_points
            )
            
            return {
                "lat": lat,
                "lng": lng,
                "x": result['x'],
                "y": result['y'], 
                "accuracy": result.get('accuracy', 0),
                "method": result.get('method', 'unknown'),
                "statistics": stats,
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
        Verwendet Weighted Least Squares und Ausreißer-Erkennung
        Verwendet Weighted Least Squares
        """
        try:
            n = len(points)
            
            # Erstelle Design-Matrix für Least Squares
            A = np.zeros((n, 2))
            b = np.zeros(n)
            weights = np.ones(n)  # Standardgewichte
            weights = np.ones(n)
            
            for i, point in enumerate(points):
                A[i, 0] = 2 * point['x']
                A[i, 1] = 2 * point['y']
                b[i] = (point['x']**2 + point['y']**2 - point['d']**2)
                
                # Gewichtung basierend auf Entfernung (nähere Punkte = höhere Genauigkeit)
                weights[i] = 1.0 / (1.0 + point['d'] / 1000.0)  # Normalisiert auf km
                weights[i] = 1.0 / (1.0 + point['d'] / 1000.0)
            
            # Weighted Least Squares
            W = np.diag(weights)
            AtWA = A.T @ W @ A
            AtWb = A.T @ W @ b
            
            if np.linalg.det(AtWA) < 1e-12:
                return {"error": "Singulare Matrix - Punkte sind ungünstig positioniert"}
            
            solution = np.linalg.solve(AtWA, AtWb)
            x, y = solution[0], solution[1]
            
            # Residuals und Fehleranalyse
            predicted = A @ solution
            residuals = b - predicted
            weighted_residuals = np.sqrt(W) @ residuals
            
            # Berechne verschiedene Genauigkeitsmetriken
            rmse = np.sqrt(np.mean(weighted_residuals**2))
            max_error = np.max(np.abs(weighted_residuals))
            
            # Einzelne Entfernungsfehler berechnen
            # Berechne Genauigkeitsmetriken
            distance_errors = []
            for point in points:
                calculated_dist = math.sqrt((x - point['x'])**2 + (y - point['y'])**2)
                error = abs(calculated_dist - point['d'])
                distance_errors.append(error)
            
            # Ausreißer-Erkennung (Punkte mit großem Fehler)
            mean_error = np.mean(distance_errors)
            std_error = np.std(distance_errors)
            outliers = []
            
            for i, error in enumerate(distance_errors):
                if error > mean_error + 2 * std_error:
                    outliers.append({
                        'point_id': points[i].get('id', i+1),
                        'error': error,
                        'distance': points[i]['d']
                    })
            
            # Konfidenz-Score berechnen
            max_acceptable_error = 50  # 50 Meter
            confidence = max(0, min(100, 100 * (1 - rmse / max_acceptable_error)))
            
            # Verbesserungsvorschläge
            suggestions = []
            if len(outliers) > 0:
                suggestions.append(f"Überprüfen Sie {len(outliers)} Punkte mit hohen Fehlern")
            if confidence < 50:
                suggestions.append("Fügen Sie mehr Referenzpunkte hinzu für bessere Genauigkeit")
            if rmse > 100:
                suggestions.append("Überprüfen Sie die Entfernungsmessungen")
            rmse = np.sqrt(np.mean(np.array(distance_errors)**2))
            confidence = max(0, min(100, 100 * (1 - rmse / 50)))
            
            return {
                "x": x,
                "y": y,
                "accuracy": rmse,
                "method": f"Weighted Least Squares ({n} Punkte)",
                "confidence": confidence,
                "max_error": max_error,
                "mean_error": mean_error,
                "distance_errors": distance_errors,
                "outliers": outliers, 
                "suggestions": suggestions,
                "residuals": residuals.tolist(),
                "weights_used": weights.tolist()
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
            mean_error = np.mean(distance_errors)
            
            # Konfidenz basierend auf Fehlern
            confidence = max(0, min(100, 100 * (1 - max_error / 100)))
            
            return {
                "x": x,
                "y": y,
                "accuracy": max_error,
                "method": "Exakte Trilateration (3 Punkte)",
                "confidence": confidence,
                "max_error": max_error,
                "mean_error": mean_error,
                "distance_errors": distance_errors,
                "outliers": [],
                "suggestions": [] if confidence > 70 else ["Überprüfen Sie die Entfernungsmessungen"]
                "confidence": confidence
            }
            
        except Exception as e:
            return {"error": f"Trilateration fehlgeschlagen: {str(e)}"}
    
    @staticmethod
    def calculate_statistics(result: Dict, points: List[Dict]) -> Dict[str, Any]:
        """
        Berechnet erweiterte Statistiken für die Triangulation
        """
        stats = {
            "point_count": len(points),
            "method_used": result.get('method', 'unknown'),
            "accuracy_meters": round(result.get('accuracy', 0), 2),
            "confidence_percent": round(result.get('confidence', 0), 1),
            "max_error_meters": round(result.get('max_error', 0), 2),
            "mean_error_meters": round(result.get('mean_error', 0), 2),
            "outlier_count": len(result.get('outliers', [])),
            "suggestions": result.get('suggestions', [])
        }
        
        # Qualitätsbewertung
        accuracy = result.get('accuracy', float('inf'))
        if accuracy < 10:
            stats['quality'] = "Excellent"
            stats['quality_color'] = "success"
        elif accuracy < 25:
            stats['quality'] = "Very Good"
            stats['quality_color'] = "success"
        elif accuracy < 50:
            stats['quality'] = "Good"
            stats['quality_color'] = "warning"
        elif accuracy < 100:
            stats['quality'] = "Acceptable"
            stats['quality_color'] = "warning"
        else:
            stats['quality'] = "Poor"
            stats['quality_color'] = "danger"
        
        return stats
    
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
        auto_calculate = data.get('auto_calculate', True)
        
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
            
            if not (-90 <= point['lat'] <= 90):
                return jsonify({"error": f"Punkt {i+1}: Ungültiger Breitengrad"}), 400
            
            if not (-180 <= point['lng'] <= 180):
                return jsonify({"error": f"Punkt {i+1}: Ungültiger Längengrad"}), 400
        
        # Berechne erweiterte Triangulation
        
        # Berechne Triangulation
        result = AdvancedTriangulationCalculator.calculate_position(points)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"Server-Fehler: {str(e)}"}), 500

@app.route('/api/triangulate/preview', methods=['POST'])
def triangulate_preview():
    """
    Vorschau-Berechnung für Live-Updates während der Eingabe
    """
    try:
        data = request.get_json()
        points = data.get('points', [])
        
        if len(points) < 3:
            return jsonify({
                "ready": False, 
                "points_needed": 3 - len(points),
                "message": f"Noch {3 - len(points)} Punkt(e) erforderlich"
            })
        
        # Schnelle Berechnung für Vorschau
        result = AdvancedTriangulationCalculator.calculate_position(points)
        
        if 'error' in result:
            return jsonify({"ready": False, "error": result['error']})
        
        return jsonify({
            "ready": True,
            "preview": {
                "lat": result['lat'],
                "lng": result['lng'],
                "accuracy": result['accuracy'],
                "confidence": result.get('confidence', 0),
                "point_count": len(points)
            }
        })
        
    except Exception as e:
        return jsonify({"ready": False, "error": str(e)})

@app.route('/api/points/validate', methods=['POST'])
def validate_points():
    """
    Validiert Referenzpunkte und gibt Empfehlungen
    """
    try:
        data = request.get_json()
        points = data.get('points', [])
        
        if len(points) < 2:
            return jsonify({"valid": True, "suggestions": []})
        
        suggestions = []
        warnings = []
        
        # Prüfe Punktverteilung
        if len(points) >= 3:
            # Berechne geometrische Verteilung
            distances = []
            for i in range(len(points)):
                for j in range(i+1, len(points)):
                    p1, p2 = points[i], points[j]
                    dist = math.sqrt((p1['lat'] - p2['lat'])**2 + (p1['lng'] - p2['lng'])**2)
                    distances.append(dist)
            
            min_dist = min(distances) * 111000  # Ungefähr Meter
            max_dist = max(distances) * 111000
            
            if min_dist < 100:  # Punkte zu nah beieinander
                warnings.append("Einige Referenzpunkte sind sehr nah beieinander (< 100m)")
                suggestions.append("Verteilen Sie die Punkte weiter für bessere Genauigkeit")
            
            if max_dist / min_dist > 20:  # Sehr ungleiche Verteilung
                warnings.append("Ungleiche Punktverteilung erkannt")
                suggestions.append("Versuchen Sie eine gleichmäßigere Verteilung der Referenzpunkte")
        
        # Prüfe Entfernungsbereiche
        distances = [p['distance'] for p in points]
        if len(distances) > 1:
            min_range = min(distances)
            max_range = max(distances)
            
            if max_range / min_range > 10:
                warnings.append("Sehr unterschiedliche Entfernungsbereiche")
                suggestions.append("Ähnliche Entfernungsbereiche führen zu besserer Genauigkeit")
        
        # Empfehlungen für Punktanzahl
        if len(points) < 4:
            suggestions.append("4 oder mehr Punkte verbessern die Genauigkeit erheblich")
        elif len(points) > 10:
            suggestions.append("Mehr als 10 Punkte verbessern die Genauigkeit nur noch minimal")
        
        return jsonify({
            "valid": len(warnings) == 0,
            "warnings": warnings,
            "suggestions": suggestions,
            "point_count": len(points),
            "recommended_count": min(8, max(4, len(points)))
        })
        
    except Exception as e:
        return jsonify({"valid": False, "error": str(e)})

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

@app.route('/api/distance', methods=['POST'])
def calculate_distance():
    """Berechnet die Entfernung zwischen zwei Geo-Punkten"""
    try:
        data = request.get_json()
        
        if not data or 'point1' not in data or 'point2' not in data:
            return jsonify({"error": "point1 und point2 erforderlich"}), 400
        
        p1 = data['point1']
        p2 = data['point2']
        
        # Haversine Formel für Entfernungsberechnung
        R = 6371000  # Erdradius in Metern
        
        lat1_rad = math.radians(p1['lat'])
        lat2_rad = math.radians(p2['lat'])
        delta_lat = math.radians(p2['lat'] - p1['lat'])
        delta_lng = math.radians(p2['lng'] - p1['lng'])
        
        a = (math.sin(delta_lat/2)**2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng/2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        distance = R * c
        
        return jsonify({"distance": distance})
        
    except Exception as e:
        return jsonify({"error": f"Entfernungsberechnung fehlgeschlagen: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print("🎯 Advanced Triangulation API Server startet...")
    print("🌍 Verfügbare Endpoints:")
    print("   POST /api/triangulate - Erweiterte Standort-Berechnung")
    print("   POST /api/triangulate/preview - Live-Vorschau")
    print("   POST /api/points/validate - Punkt-Validierung")
    print("   POST /api/distance - Entfernung berechnen")
    print("   GET  /api/health - Health Check")
    print(f"\n📍 Server läuft auf Port {port}")
    
    app.run(debug=debug, host='0.0.0.0', port=port)
    app.run(debug=True, host='0.0.0.0', port=5000)
