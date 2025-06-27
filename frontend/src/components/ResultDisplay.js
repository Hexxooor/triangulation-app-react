import React, { useState } from 'react';
import { Card, Badge, Button, Collapse, Alert, ProgressBar, ListGroup } from 'react-bootstrap';

function ResultDisplay({ result, isPreview = false }) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatCoordinate = (coord) => {
    return coord.toFixed(6);
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy < 10) return 'success';
    if (accuracy < 25) return 'info';
    if (accuracy < 50) return 'warning';
    return 'danger';
  };

  const getAccuracyText = (accuracy) => {
    if (accuracy < 10) return 'Sehr präzise';
    if (accuracy < 25) return 'Präzise';
    if (accuracy < 50) return 'Gut';
    if (accuracy < 100) return 'Akzeptabel';
    return 'Ungenau';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 80) return 'success';
    if (confidence > 60) return 'info';
    if (confidence > 40) return 'warning';
    return 'danger';
  };

  const getPreviewIcon = () => {
    if (isPreview) return '👁️';
    return '🎯';
  };

  return (
    <Card className={`shadow-sm fade-in ${isPreview ? 'border-warning' : 'border-success'}`}>
      <Card.Header className={`d-flex justify-content-between align-items-center ${
        isPreview ? 'bg-warning text-dark' : 'bg-success text-white'
      }`}>
        <h6 className="mb-0">
          {getPreviewIcon()}
          <span className="ms-2">
            {isPreview ? 'Live-Vorschau' : 'Berechneter Standort'}
          </span>
        </h6>
        <div>
          {result.confidence !== undefined && (
            <Badge bg={getConfidenceColor(result.confidence)} className="me-2">
              {result.confidence.toFixed(0)}%
            </Badge>
          )}
          {result.accuracy !== undefined && (
            <Badge bg={getAccuracyColor(result.accuracy)}>
              ±{result.accuracy.toFixed(1)}m
            </Badge>
          )}
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Haupt-Koordinaten */}
        <div className="coordinate-display mb-3">
          <div className="row g-2">
            <div className="col-12">
              <strong>🌐 GPS-Koordinaten:</strong>
            </div>
            <div className="col-12">
              <div className="coordinate-value">
                📍 {formatCoordinate(result.lat)}, {formatCoordinate(result.lng)}
              </div>
            </div>
          </div>
          
          {result.x !== undefined && result.y !== undefined && (
            <div className="row g-2 mt-2">
              <div className="col-12">
                <strong>📏 Lokale Koordinaten:</strong>
              </div>
              <div className="col-6">
                <small className="text-muted">X:</small><br />
                <span className="coordinate-value">{result.x.toFixed(1)}m</span>
              </div>
              <div className="col-6">
                <small className="text-muted">Y:</small><br />
                <span className="coordinate-value">{result.y.toFixed(1)}m</span>
              </div>
            </div>
          )}
        </div>

        {/* Genauigkeits-Informationen */}
        <div className="mb-3">
          {result.accuracy !== undefined && (
            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span>
                  <i className="bi bi-bullseye me-1"></i>
                  Genauigkeit:
                </span>
                <Badge bg={getAccuracyColor(result.accuracy)} className="accuracy-badge">
                  {getAccuracyText(result.accuracy)}
                </Badge>
              </div>
              <ProgressBar 
                variant={getAccuracyColor(result.accuracy)} 
                now={Math.max(0, 100 - result.accuracy)} 
                className="mb-1"
                style={{ height: '8px' }}
              />
              <small className="text-muted">±{result.accuracy.toFixed(1)} Meter</small>
            </div>
          )}

          {result.confidence !== undefined && (
            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span>
                  <i className="bi bi-shield-check me-1"></i>
                  Vertrauen:
                </span>
                <Badge bg={getConfidenceColor(result.confidence)}>
                  {result.confidence.toFixed(0)}%
                </Badge>
              </div>
              <ProgressBar 
                variant={getConfidenceColor(result.confidence)} 
                now={result.confidence} 
                className="mb-1"
                style={{ height: '8px' }}
              />
              <small className="text-muted">
                {result.confidence > 80 ? 'Sehr zuverlässig' :
                 result.confidence > 60 ? 'Zuverlässig' :
                 result.confidence > 40 ? 'Mäßig zuverlässig' : 'Unsicher'}
              </small>
            </div>
          )}
        </div>

        {/* Methoden-Information */}
        {result.method && (
          <div className="mb-3">
            <small className="text-muted">
              <i className="bi bi-gear me-1"></i>
              Methode: <strong>{result.method}</strong>
            </small>
            {result.point_count && (
              <small className="text-muted ms-2">
                ({result.point_count} Punkte)
              </small>
            )}
          </div>
        )}

        {/* Erweiterte Details */}
        {!isPreview && (result.max_error !== undefined || result.mean_error !== undefined) && (
          <>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="mb-2"
            >
              <i className={`bi bi-chevron-${showDetails ? 'up' : 'down'} me-1`}></i>
              {showDetails ? 'Details ausblenden' : 'Details anzeigen'}
            </Button>
            
            <Collapse in={showDetails}>
              <div>
                <Card className="bg-light border-0">
                  <Card.Body className="py-2">
                    <h6 className="mb-2">Fehler-Analyse:</h6>
                    <ListGroup variant="flush">
                      {result.max_error !== undefined && (
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-1 bg-transparent">
                          <small>Maximaler Fehler:</small>
                          <Badge bg={getAccuracyColor(result.max_error)}>
                            ±{result.max_error.toFixed(1)}m
                          </Badge>
                        </ListGroup.Item>
                      )}
                      {result.mean_error !== undefined && (
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-1 bg-transparent">
                          <small>Durchschnittlicher Fehler:</small>
                          <Badge bg={getAccuracyColor(result.mean_error)}>
                            ±{result.mean_error.toFixed(1)}m
                          </Badge>
                        </ListGroup.Item>
                      )}
                      {result.outliers && result.outliers.length > 0 && (
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-1 bg-transparent">
                          <small>Ausreißer-Punkte:</small>
                          <Badge bg="warning">{result.outliers.length}</Badge>
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </div>
            </Collapse>
          </>
        )}

        {/* Vorschau-Hinweis */}
        {isPreview && (
          <Alert variant="warning" className="mb-3">
            <small>
              <i className="bi bi-eye me-1"></i>
              <strong>Live-Vorschau:</strong> Wird automatisch aktualisiert. 
              Für finale Berechnung fügen Sie mehr Punkte hinzu.
            </small>
          </Alert>
        )}

        {/* Aktionen */}
        <div className="d-flex gap-2">
          <Button
            variant={isPreview ? 'outline-warning' : 'outline-success'}
            size="sm"
            onClick={() => copyToClipboard(`${result.lat}, ${result.lng}`)}
            className="flex-fill"
          >
            <i className={`bi bi-${copied ? 'check' : 'clipboard'} me-1`}></i>
            {copied ? 'Kopiert!' : 'Koordinaten kopieren'}
          </Button>
          
          <Button
            variant={isPreview ? 'outline-warning' : 'outline-success'}
            size="sm"
            onClick={() => {
              const googleMapsUrl = `https://www.google.com/maps?q=${result.lat},${result.lng}`;
              window.open(googleMapsUrl, '_blank');
            }}
            className="flex-fill"
          >
            <i className="bi bi-box-arrow-up-right me-1"></i>
            Google Maps
          </Button>
        </div>

        {/* Empfehlungen für Vorschau */}
        {isPreview && result.confidence < 70 && (
          <Alert variant="info" className="mt-3 mb-0">
            <small>
              <i className="bi bi-lightbulb me-1"></i>
              <strong>Tipp:</strong> Fügen Sie 1-2 weitere Punkte hinzu für bessere Genauigkeit.
            </small>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}

export default ResultDisplay;