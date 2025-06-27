import React, { useState } from 'react';
import { Card, Form, Button, Badge, Row, Col, ButtonGroup } from 'react-bootstrap';

function AccuracySettings({ 
  accuracySettings = {}, 
  onUpdateAccuracySettings,
  showAccuracyCircles,
  onToggleAccuracyCircles,
  points = [],
  onUpdatePointAccuracy
}) {
  const [localSettings, setLocalSettings] = useState({
    globalDefault: 100,
    showCircles: true,
    colorScheme: 'traffic',
    presets: {
      high: 25,
      medium: 100,
      low: 500
    },
    ...accuracySettings
  });

  const handleGlobalDefaultChange = (value) => {
    const newSettings = { ...localSettings, globalDefault: value };
    setLocalSettings(newSettings);
    if (onUpdateAccuracySettings) {
      onUpdateAccuracySettings(newSettings);
    }
  };

  const applyPreset = (preset) => {
    const presetValue = localSettings.presets[preset];
    handleGlobalDefaultChange(presetValue);
  };

  const applyToAllPoints = () => {
    if (onUpdatePointAccuracy) {
      points.forEach(point => {
        onUpdatePointAccuracy(point.id, localSettings.globalDefault);
      });
    }
  };

  const getColorForAccuracy = (accuracy) => {
    if (accuracy <= 25) return 'success';
    if (accuracy <= 100) return 'warning';
    return 'danger';
  };

  const getAccuracyQuality = (accuracy) => {
    if (accuracy <= 25) return 'Hoch';
    if (accuracy <= 100) return 'Mittel';
    return 'Niedrig';
  };

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="bg-info text-white">
        <h6 className="mb-0">
          <i className="bi bi-bullseye me-2"></i>
          Genauigkeitseinstellungen
        </h6>
      </Card.Header>
      <Card.Body>
        {/* Globale Einstellungen */}
        <div className="mb-4">
          <h6 className="mb-3">
            <i className="bi bi-globe me-1"></i>
            Globale Einstellungen
          </h6>
          
          <Form.Group className="mb-3">
            <Form.Label className="d-flex justify-content-between">
              <span>Standard-Genauigkeit</span>
              <Badge bg={getColorForAccuracy(localSettings.globalDefault)}>
                ±{localSettings.globalDefault}m ({getAccuracyQuality(localSettings.globalDefault)})
              </Badge>
            </Form.Label>
            <Form.Range
              min={0}
              max={2000}
              step={5}
              value={localSettings.globalDefault}
              onChange={(e) => handleGlobalDefaultChange(parseInt(e.target.value))}
              className="mb-2"
            />
            <div className="d-flex justify-content-between small text-muted">
              <span>Exakt (0m)</span>
              <span>Ungenau (2km)</span>
            </div>
          </Form.Group>

          {/* Presets */}
          <div className="mb-3">
            <Form.Label>Schnellauswahl:</Form.Label>
            <ButtonGroup size="sm" className="w-100">
              <Button 
                variant={localSettings.globalDefault === localSettings.presets.high ? 'success' : 'outline-success'}
                onClick={() => applyPreset('high')}
              >
                Hoch (±{localSettings.presets.high}m)
              </Button>
              <Button 
                variant={localSettings.globalDefault === localSettings.presets.medium ? 'warning' : 'outline-warning'}
                onClick={() => applyPreset('medium')}
              >
                Mittel (±{localSettings.presets.medium}m)
              </Button>
              <Button 
                variant={localSettings.globalDefault === localSettings.presets.low ? 'danger' : 'outline-danger'}
                onClick={() => applyPreset('low')}
              >
                Niedrig (±{localSettings.presets.low}m)
              </Button>
            </ButtonGroup>
          </div>

          {/* Auf alle Punkte anwenden */}
          {points.length > 0 && (
            <div className="mb-3">
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={applyToAllPoints}
                className="w-100"
              >
                <i className="bi bi-arrow-repeat me-1"></i>
                Auf alle {points.length} Punkte anwenden
              </Button>
            </div>
          )}
        </div>

        {/* Visualisierung */}
        <div className="mb-3">
          <h6 className="mb-3">
            <i className="bi bi-eye me-1"></i>
            Visualisierung
          </h6>
          
          <Form.Check 
            type="switch"
            id="show-accuracy-circles"
            label="Genauigkeitskreise auf Karte anzeigen"
            checked={showAccuracyCircles}
            onChange={(e) => onToggleAccuracyCircles && onToggleAccuracyCircles(e.target.checked)}
            className="mb-2"
          />
          
          <div className="small text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Zeigt Unsicherheitsbereiche um Referenzpunkte
          </div>
        </div>

        {/* Legende */}
        {showAccuracyCircles && (
          <div className="mt-3 pt-3 border-top">
            <h6 className="mb-2">Farblegende:</h6>
            <Row className="g-2">
              <Col>
                <div className="d-flex align-items-center">
                  <div 
                    className="me-2 rounded-circle" 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: '#28a745',
                      border: '1px solid #28a745'
                    }}
                  ></div>
                  <small>Hoch (≤25m)</small>
                </div>
              </Col>
              <Col>
                <div className="d-flex align-items-center">
                  <div 
                    className="me-2 rounded-circle" 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: '#ffc107',
                      border: '1px solid #ffc107'
                    }}
                  ></div>
                  <small>Mittel (≤100m)</small>
                </div>
              </Col>
              <Col>
                <div className="d-flex align-items-center">
                  <div 
                    className="me-2 rounded-circle" 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: '#dc3545',
                      border: '1px solid #dc3545'
                    }}
                  ></div>
                  <small>Niedrig (>100m)</small>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Statistiken */}
        {points.length > 0 && (
          <div className="mt-3 pt-3 border-top">
            <h6 className="mb-2">Genauigkeitsstatistik:</h6>
            <div className="small">
              <div className="d-flex justify-content-between mb-1">
                <span>Punkte mit hoher Genauigkeit:</span>
                <Badge bg="success">
                  {points.filter(p => (p.accuracy || localSettings.globalDefault) <= 25).length}
                </Badge>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Punkte mit mittlerer Genauigkeit:</span>
                <Badge bg="warning">
                  {points.filter(p => {
                    const acc = p.accuracy || localSettings.globalDefault;
                    return acc > 25 && acc <= 100;
                  }).length}
                </Badge>
              </div>
              <div className="d-flex justify-content-between">
                <span>Punkte mit niedriger Genauigkeit:</span>
                <Badge bg="danger">
                  {points.filter(p => (p.accuracy || localSettings.globalDefault) > 100).length}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default AccuracySettings;
