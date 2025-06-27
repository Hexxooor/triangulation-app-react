import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, Polyline } from 'react-leaflet';
import { Badge } from 'react-bootstrap';
import L from 'leaflet';

// Fix für Leaflet Icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons für verschiedene Punkttypen
const referenceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const calculatedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49]
});

const previewIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [28, 46],
  iconAnchor: [14, 46],
  popupAnchor: [1, -37],
  shadowSize: [46, 46]
});

const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Komponente für Map-Events
function MapEvents({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    }
  });
  return null;
}

// Farbpalette für viele Referenzpunkte
const circleColors = [
  '#dc3545', '#fd7e14', '#ffc107', '#20c997', '#0dcaf0', 
  '#6f42c1', '#d63384', '#198754', '#0d6efd', '#6c757d'
];

function MapComponent({ 
  center, 
  referencePoints, 
  calculatedPosition, 
  previewPosition,
  activePoint, 
  onMapClick,
  showPreview = false,
  onPointDrag,
  onPointDragEnd,
  accuracySettings = {},
  showAccuracyCircles = false
}) {
  const mapRef = useRef();
  const [showConnections, setShowConnections] = useState(false);
  const [showCircles, setShowCircles] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null);
  
  // Automatisches Zentrieren bei berechneter Position
  useEffect(() => {
    if ((calculatedPosition || previewPosition) && mapRef.current) {
      const position = calculatedPosition || previewPosition;
      mapRef.current.setView([position.lat, position.lng], 15);
    }
  }, [calculatedPosition, previewPosition]);

  // Automatisches Anpassen der Kartenansicht an alle Punkte
  useEffect(() => {
    if (referencePoints.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(referencePoints.map(p => [p.lat, p.lng]));
      
      // Erweitere Bounds um berechnete Position
      if (calculatedPosition) {
        bounds.extend([calculatedPosition.lat, calculatedPosition.lng]);
      }
      
      // Erweitere Bounds um Vorschau-Position
      if (previewPosition) {
        bounds.extend([previewPosition.lat, previewPosition.lng]);
      }
      
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [referencePoints, calculatedPosition, previewPosition]);

  const getCircleColor = (index) => {
    return circleColors[index % circleColors.length];
  };

  const formatAccuracy = (accuracy) => {
    if (accuracy < 10) return `Sehr gut (±${accuracy.toFixed(1)}m)`;
    if (accuracy < 25) return `Gut (±${accuracy.toFixed(1)}m)`;
    if (accuracy < 50) return `Akzeptabel (±${accuracy.toFixed(1)}m)`;
    return `Ungenau (±${accuracy.toFixed(1)}m)`;
  };

  const getDistanceQuality = (distance) => {
    if (distance < 500) return 'Kurz';
    if (distance < 1500) return 'Mittel';
    if (distance < 3000) return 'Lang';
    return 'Sehr lang';
  };

  // Drag & Drop Event Handlers
  const handleDragStart = (point) => {
    setDraggingPoint(point);
    setDragPreviewPosition({ lat: point.lat, lng: point.lng });
    if (onPointDrag) {
      onPointDrag(point, { lat: point.lat, lng: point.lng });
    }
  };

  const handleDrag = (point, event) => {
    const newPos = { lat: event.target.getLatLng().lat, lng: event.target.getLatLng().lng };
    setDragPreviewPosition(newPos);
    if (onPointDrag) {
      onPointDrag(point, newPos);
    }
  };

  const handleDragEnd = (point, event) => {
    const newPos = { lat: event.target.getLatLng().lat, lng: event.target.getLatLng().lng };
    setDraggingPoint(null);
    setDragPreviewPosition(null);
    if (onPointDragEnd) {
      onPointDragEnd(point, newPos);
    }
  };

  return (
    <div className="map-container position-relative">
      {/* Karten-Controls */}
      <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 1000 }}>
        <div className="btn-group-vertical" role="group">
          <button
            className={`btn btn-sm ${showCircles ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setShowCircles(!showCircles)}
            title="Entfernungskreise ein/ausblenden"
          >
            <i className="bi bi-circle"></i>
          </button>
          {referencePoints.length > 2 && (
            <button
              className={`btn btn-sm ${showConnections ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setShowConnections(!showConnections)}
              title="Verbindungslinien ein/ausblenden"
            >
              <i className="bi bi-diagram-3"></i>
            </button>
          )}
        </div>
      </div>

      {/* Legende */}
      {referencePoints.length > 3 && (
        <div className="position-absolute bottom-0 start-0 m-2 bg-white p-2 rounded shadow-sm" style={{ zIndex: 1000, maxWidth: '200px' }}>
          <h6 className="mb-2 small">Legende:</h6>
          <div className="small">
            <div className="d-flex align-items-center mb-1">
              <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#dc3545', borderRadius: '50%' }}></div>
              <span>Referenzpunkte</span>
            </div>
            {calculatedPosition && (
              <div className="d-flex align-items-center mb-1">
                <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '50%' }}></div>
                <span>Berechnet</span>
              </div>
            )}
            {showPreview && previewPosition && (
              <div className="d-flex align-items-center mb-1">
                <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#fd7e14', borderRadius: '50%' }}></div>
                <span>Vorschau</span>
              </div>
            )}
          </div>
        </div>
      )}

      <MapContainer
        ref={mapRef}
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Click Events */}
        <MapEvents onMapClick={onMapClick} />

        {/* Aktiver Punkt (vor Bestätigung) */}
        {activePoint && (
          <Marker
            position={[activePoint.lat, activePoint.lng]}
            icon={activeIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>🆕 Neuer Punkt</strong><br />
                <small>
                  📍 {activePoint.lat.toFixed(6)}<br />
                  📍 {activePoint.lng.toFixed(6)}
                </small><br />
                <em>→ Entfernung eingeben</em>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Referenzpunkte */}
        {referencePoints.map((point, index) => (
          <React.Fragment key={point.id}>
            {/* Marker für Referenzpunkt */}
            <Marker
              position={[point.lat, point.lng]}
              icon={draggingPoint?.id === point.id ? activeIcon : referenceIcon}
              draggable={true}
              autoPan={true}
              autoPanPadding={[50, 50]}
              autoPanSpeed={10}
              eventHandlers={{
                click: () => setSelectedPoint(point),
                dragstart: () => handleDragStart(point),
                drag: (e) => handleDrag(point, e),
                dragend: (e) => handleDragEnd(point, e),
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>🎯 {point.name}</strong>
                  {draggingPoint?.id === point.id && <Badge bg="warning" className="ms-1">Bewegt...</Badge>}<br />
                  <small>
                    📍 {dragPreviewPosition && draggingPoint?.id === point.id ? 
                      `${dragPreviewPosition.lat.toFixed(6)}, ${dragPreviewPosition.lng.toFixed(6)}` :
                      `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`
                    }<br />
                    📏 {point.distance.toLocaleString()}m ({getDistanceQuality(point.distance)})<br />
                    {point.accuracy && <>🎯 ±{point.accuracy}m<br /></>}
                    🕐 {point.timestamp}<br />
                    {draggingPoint?.id === point.id && <em className="text-warning">➡️ Ziehen zum Verschieben</em>}
                  </small>
                </div>
              </Popup>
            </Marker>

            {/* Entfernungskreis */}
            {showCircles && (
              <Circle
                center={dragPreviewPosition && draggingPoint?.id === point.id ? 
                  [dragPreviewPosition.lat, dragPreviewPosition.lng] : 
                  [point.lat, point.lng]
                }
                radius={point.distance}
                pathOptions={{
                  color: getCircleColor(index),
                  fillColor: getCircleColor(index),
                  fillOpacity: draggingPoint?.id === point.id ? 0.2 : 0.1,
                  weight: draggingPoint?.id === point.id ? 3 : 2,
                  dashArray: '5, 5'
                }}
              />
            )}

            {/* Genauigkeitskreis */}
            {showAccuracyCircles && point.accuracy && (
              <Circle
                center={dragPreviewPosition && draggingPoint?.id === point.id ? 
                  [dragPreviewPosition.lat, dragPreviewPosition.lng] : 
                  [point.lat, point.lng]
                }
                radius={point.accuracy}
                pathOptions={{
                  color: point.accuracy <= 25 ? '#28a745' : point.accuracy <= 100 ? '#ffc107' : '#dc3545',
                  fillColor: point.accuracy <= 25 ? '#28a745' : point.accuracy <= 100 ? '#ffc107' : '#dc3545',
                  fillOpacity: 0.05,
                  weight: 1,
                  dashArray: '2, 2'
                }}
              />
            )}
          </React.Fragment>
        ))}

        {/* Verbindungslinien zwischen Referenzpunkten */}
        {showConnections && referencePoints.length > 2 && (
          <Polyline
            positions={referencePoints.map(p => [p.lat, p.lng])}
            pathOptions={{
              color: '#6c757d',
              weight: 1,
              opacity: 0.5,
              dashArray: '2, 4'
            }}
          />
        )}

        {/* Vorschau-Position */}
        {showPreview && previewPosition && !calculatedPosition && (
          <Marker
            position={[previewPosition.lat, previewPosition.lng]}
            icon={previewIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>👁️ Live-Vorschau</strong><br />
                <small>
                  📍 {previewPosition.lat.toFixed(6)}<br />
                  📍 {previewPosition.lng.toFixed(6)}<br />
                  {previewPosition.accuracy && (
                    <>📊 {formatAccuracy(previewPosition.accuracy)}<br /></>
                  )}
                  {previewPosition.confidence && (
                    <>🎯 Vertrauen: {previewPosition.confidence.toFixed(0)}%<br /></>
                  )}
                  <em>Wird automatisch aktualisiert</em>
                </small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Berechnete Position */}
        {calculatedPosition && (
          <Marker
            position={[calculatedPosition.lat, calculatedPosition.lng]}
            icon={calculatedIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>🎯 Berechneter Standort</strong><br />
                <small>
                  📍 {calculatedPosition.lat.toFixed(6)}<br />
                  📍 {calculatedPosition.lng.toFixed(6)}<br />
                  {calculatedPosition.accuracy && (
                    <>📊 {formatAccuracy(calculatedPosition.accuracy)}<br /></>
                  )}
                  {calculatedPosition.confidence && (
                    <>🎯 Vertrauen: {calculatedPosition.confidence.toFixed(0)}%<br /></>
                  )}
                  {calculatedPosition.method && (
                    <>🔧 {calculatedPosition.method}<br /></>
                  )}
                  {calculatedPosition.point_count && (
                    <>📈 {calculatedPosition.point_count} Referenzpunkte<br /></>
                  )}
                </small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Verbindungslinien von Referenzpunkten zur berechneten Position */}
        {showConnections && calculatedPosition && (
          <>
            {referencePoints.map((point, index) => (
              <Polyline
                key={`connection-${point.id}`}
                positions={[
                  [point.lat, point.lng],
                  [calculatedPosition.lat, calculatedPosition.lng]
                ]}
                pathOptions={{
                  color: getCircleColor(index),
                  weight: 1,
                  opacity: 0.6,
                  dashArray: '3, 3'
                }}
              />
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
}

export default MapComponent;