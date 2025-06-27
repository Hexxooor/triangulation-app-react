import React, { useState } from 'react';
import { Button, Badge, Collapse, Card, Form, InputGroup } from 'react-bootstrap';

function PointList({ points, onRemovePoint, onUpdateDistance, maxPoints = 20 }) {
  const [expandedView, setExpandedView] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [editingDistance, setEditingDistance] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  const displayLimit = 5; // Zeige nur die ersten 5 Punkte standardmäßig
  const displayPoints = showAll ? points : points.slice(0, displayLimit);
  const hasMorePoints = points.length > displayLimit;

  const getDistanceColor = (distance) => {
    if (distance < 500) return 'success';
    if (distance < 1500) return 'primary';
    if (distance < 3000) return 'warning';
    return 'danger';
  };

  const formatDistance = (distance) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${distance.toLocaleString()} m`;
  };

  const getAccuracyEstimate = (distance, index) => {
    // Einfache Schätzung basierend auf Entfernung und Position
    const baseAccuracy = Math.min(100, distance * 0.05); // 5% der Entfernung
    const positionBonus = index < 3 ? 0.8 : 1.0; // Erste 3 Punkte sind meist genauer
    return Math.round(baseAccuracy * positionBonus);
  };

  // Entfernungsbearbeitung
  const startEditDistance = (point) => {
    setEditingDistance(point.id);
    setEditValue(point.distance.toString());
  };

  const cancelEditDistance = () => {
    setEditingDistance(null);
    setEditValue('');
  };

  const saveDistance = (point) => {
    const newDistance = parseFloat(editValue);
    if (newDistance && newDistance > 0 && newDistance <= 50000) {
      if (onUpdateDistance) {
        onUpdateDistance(point.id, newDistance);
      }
      setEditingDistance(null);
      setEditValue('');
    }
  };

  const handleKeyPress = (e, point) => {
    if (e.key === 'Enter') {
      saveDistance(point);
    } else if (e.key === 'Escape') {
      cancelEditDistance();
    }
  };

  const validateDistance = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 && num <= 50000;
  };

  return (
    <div>
      {/* Kompakte Ansicht */}
      {!expandedView && (
        <>
          {displayPoints.map((point, index) => (
            <div key={point.id} className="point-list-item mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <Badge bg="primary" className="me-2">
                      {index + 1}
                    </Badge>
                    <strong className="me-2">{point.name}</strong>
                    <small className="text-muted">{point.timestamp}</small>
                  </div>
                  
                  <div className="d-flex gap-3 small">
                    <span>
                      <i className="bi bi-geo-alt me-1"></i>
                      {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                    </span>
                    <span>
                      <i className="bi bi-rulers me-1"></i>
                      {editingDistance === point.id ? (
                        <InputGroup size="sm" style={{ width: '120px', display: 'inline-flex' }}>
                          <Form.Control
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, point)}
                            onBlur={() => saveDistance(point)}
                            isInvalid={!validateDistance(editValue)}
                            autoFocus
                            style={{ fontSize: '0.75rem', height: '24px' }}
                          />
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => saveDistance(point)}
                            disabled={!validateDistance(editValue)}
                            style={{ padding: '0 4px', fontSize: '0.7rem' }}
                          >
                            <i className="bi bi-check"></i>
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={cancelEditDistance}
                            style={{ padding: '0 4px', fontSize: '0.7rem' }}
                          >
                            <i className="bi bi-x"></i>
                          </Button>
                        </InputGroup>
                      ) : (
                        <Badge 
                          bg={getDistanceColor(point.distance)} 
                          className="fw-normal editable-distance"
                          style={{ cursor: 'pointer' }}
                          onClick={() => startEditDistance(point)}
                          title="Klicken zum Bearbeiten"
                        >
                          {formatDistance(point.distance)}
                          {point.isDragModified && <i className="bi bi-pencil-square ms-1"></i>}
                        </Badge>
                      )}
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onRemovePoint(point.id)}
                  title="Punkt entfernen"
                  className="ms-2"
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </div>
          ))}
          
          {/* Weitere Punkte anzeigen */}
          {hasMorePoints && (
            <div className="text-center mt-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    <i className="bi bi-chevron-up me-1"></i>
                    Weniger anzeigen
                  </>
                ) : (
                  <>
                    <i className="bi bi-chevron-down me-1"></i>
                    {points.length - displayLimit} weitere anzeigen
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Erweiterte Ansicht */}
      {expandedView && (
        <div className="advanced-point-view">
          {points.map((point, index) => (
            <Card key={point.id} className="mb-2 border-start border-primary border-3">
              <Card.Body className="py-2">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    {/* Header */}
                    <div className="d-flex align-items-center mb-2">
                      <Badge bg="primary" className="me-2">
                        #{index + 1}
                      </Badge>
                      <strong className="me-2">{point.name}</strong>
                      <Badge bg="light" text="dark" className="me-2">
                        {point.timestamp}
                      </Badge>
                      <Badge bg={getDistanceColor(point.distance)}>
                        {formatDistance(point.distance)}
                      </Badge>
                    </div>
                    
                    {/* Details */}
                    <div className="row g-2 small text-muted">
                      <div className="col-12">
                        <i className="bi bi-geo-alt me-1"></i>
                        <span className="font-monospace">
                          {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                        </span>
                      </div>
                      <div className="col-6">
                        <i className="bi bi-rulers me-1"></i>
                        Entfernung: 
                        {editingDistance === point.id ? (
                          <InputGroup size="sm" className="d-inline-flex ms-1" style={{ width: '140px' }}>
                            <Form.Control
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => handleKeyPress(e, point)}
                              onBlur={() => saveDistance(point)}
                              isInvalid={!validateDistance(editValue)}
                              autoFocus
                              style={{ fontSize: '0.8rem' }}
                            />
                            <InputGroup.Text style={{ fontSize: '0.7rem', padding: '0 4px' }}>m</InputGroup.Text>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => saveDistance(point)}
                              disabled={!validateDistance(editValue)}
                              style={{ padding: '0 4px' }}
                            >
                              <i className="bi bi-check"></i>
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={cancelEditDistance}
                              style={{ padding: '0 4px' }}
                            >
                              <i className="bi bi-x"></i>
                            </Button>
                          </InputGroup>
                        ) : (
                          <strong 
                            className="editable-distance ms-1" 
                            style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                            onClick={() => startEditDistance(point)}
                            title="Klicken zum Bearbeiten"
                          >
                            {point.distance.toLocaleString()} m
                            {point.isDragModified && <i className="bi bi-pencil-square ms-1"></i>}
                          </strong>
                        )}
                      </div>
                      <div className="col-6">
                        <i className="bi bi-target me-1"></i>
                        Geschätzte Genauigkeit: <strong>±{getAccuracyEstimate(point.distance, index)}m</strong>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onRemovePoint(point.id)}
                    title="Punkt entfernen"
                    className="ms-2"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Ansicht umschalten */}
      {points.length > 3 && (
        <div className="text-center mt-3 pt-2 border-top">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setExpandedView(!expandedView)}
          >
            {expandedView ? (
              <>
                <i className="bi bi-list me-1"></i>
                Kompakte Ansicht
              </>
            ) : (
              <>
                <i className="bi bi-card-list me-1"></i>
                Detailansicht
              </>
            )}
          </Button>
        </div>
      )}

      {/* Kapazitätsanzeige */}
      {points.length > 0 && (
        <div className="mt-3 pt-2 border-top">
          <div className="d-flex justify-content-between align-items-center small text-muted">
            <span>
              <i className="bi bi-info-circle me-1"></i>
              Kapazität:
            </span>
            <span>
              <strong>{points.length}</strong> / {maxPoints}
              {points.length >= maxPoints && (
                <i className="bi bi-exclamation-circle text-warning ms-1" title="Maximum erreicht"></i>
              )}
            </span>
          </div>
          
          {/* Qualitäts-Indikator */}
          <div className="mt-1">
            <small className="text-muted">
              Qualität: 
              {points.length < 3 && <span className="text-danger ms-1">Unzureichend (min. 3)</span>}
              {points.length >= 3 && points.length < 5 && <span className="text-warning ms-1">Ausreichend</span>}
              {points.length >= 5 && points.length < 8 && <span className="text-success ms-1">Gut</span>}
              {points.length >= 8 && <span className="text-primary ms-1">Excellent</span>}
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

export default PointList;