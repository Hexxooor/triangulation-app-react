import React from 'react';
import { Card, Badge, Alert, ListGroup, ProgressBar } from 'react-bootstrap';

function StatisticsPanel({ statistics }) {
  if (!statistics) return null;

  const getQualityIcon = (quality) => {
    switch (quality) {
      case 'Excellent': return '🌟';
      case 'Very Good': return '✨';
      case 'Good': return '✅';
      case 'Acceptable': return '⚠️';
      case 'Poor': return '❌';
      default: return '❓';
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy < 10) return 'success';
    if (accuracy < 25) return 'info';
    if (accuracy < 50) return 'warning';
    return 'danger';
  };

  return (
    <Card className="mb-3 shadow-sm fade-in">
      <Card.Header className="bg-success text-white">
        <h6 className="mb-0">
          <i className="bi bi-graph-up me-2"></i>
          Erweiterte Statistiken
        </h6>
      </Card.Header>
      <Card.Body>
        {/* Qualität */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">
              {getQualityIcon(statistics.quality)} Qualität:
            </span>
            <Badge bg={statistics.quality_color}>
              {statistics.quality}
            </Badge>
          </div>
          
          {/* Genauigkeit */}
          <div className="mb-2">
            <small className="text-muted">Genauigkeit: ±{statistics.accuracy_meters}m</small>
            <ProgressBar 
              variant={getAccuracyColor(statistics.accuracy_meters)}
              now={Math.max(0, 100 - statistics.accuracy_meters)}
              className="mt-1"
              style={{ height: '6px' }}
            />
          </div>
          
          {/* Konfidenz */}
          <div className="mb-2">
            <small className="text-muted">Konfidenz: {statistics.confidence_percent}%</small>
            <ProgressBar 
              variant={statistics.confidence_percent > 70 ? 'success' : statistics.confidence_percent > 50 ? 'warning' : 'danger'}
              now={statistics.confidence_percent}
              className="mt-1"
              style={{ height: '6px' }}
            />
          </div>
        </div>

        {/* Statistik-Details */}
        <ListGroup variant="flush" className="mb-3">
          <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
            <small className="text-muted">
              <i className="bi bi-geo-alt me-1"></i>
              Referenzpunkte:
            </small>
            <Badge bg="primary">{statistics.point_count}</Badge>
          </ListGroup.Item>
          
          <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
            <small className="text-muted">
              <i className="bi bi-calculator me-1"></i>
              Methode:
            </small>
            <small className="fw-bold">{statistics.method_used}</small>
          </ListGroup.Item>
          
          <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
            <small className="text-muted">
              <i className="bi bi-bullseye me-1"></i>
              Max. Fehler:
            </small>
            <Badge bg={getAccuracyColor(statistics.max_error_meters)}>
              ±{statistics.max_error_meters}m
            </Badge>
          </ListGroup.Item>
          
          <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
            <small className="text-muted">
              <i className="bi bi-bar-chart me-1"></i>
              Ø Fehler:
            </small>
            <Badge bg={getAccuracyColor(statistics.mean_error_meters)}>
              ±{statistics.mean_error_meters}m
            </Badge>
          </ListGroup.Item>
          
          {statistics.outlier_count > 0 && (
            <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2">
              <small className="text-muted">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Ausreißer:
              </small>
              <Badge bg="warning">{statistics.outlier_count}</Badge>
            </ListGroup.Item>
          )}
        </ListGroup>

        {/* Empfehlungen */}
        {statistics.suggestions && statistics.suggestions.length > 0 && (
          <Alert variant="info" className="mb-0">
            <div className="mb-2">
              <strong>
                <i className="bi bi-lightbulb me-1"></i>
                Empfehlungen:
              </strong>
            </div>
            <ul className="mb-0 ps-3">
              {statistics.suggestions.map((suggestion, index) => (
                <li key={index} className="small">{suggestion}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}

export default StatisticsPanel;