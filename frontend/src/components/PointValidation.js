import React from 'react';
import { Card, Alert, ListGroup, Badge } from 'react-bootstrap';

function PointValidation({ validation }) {
  if (!validation) return null;

  const getValidationIcon = () => {
    if (validation.valid) return '✅';
    return '⚠️';
  };

  const getValidationVariant = () => {
    if (validation.valid) return 'success';
    if (validation.warnings && validation.warnings.length > 0) return 'warning';
    return 'info';
  };

  return (
    <Card className="mb-3 shadow-sm fade-in">
      <Card.Header className={`bg-${getValidationVariant()} text-white`}>
        <h6 className="mb-0">
          <i className="bi bi-check-circle me-2"></i>
          Punkt-Validierung {getValidationIcon()}
        </h6>
      </Card.Header>
      <Card.Body>
        {/* Status-Übersicht */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">Status:</span>
            <Badge bg={validation.valid ? 'success' : 'warning'}>
              {validation.valid ? 'Optimal' : 'Verbesserbar'}
            </Badge>
          </div>
          
          <div className="d-flex justify-content-between align-items-center">
            <span className="small text-muted">Aktuelle Punkte:</span>
            <Badge bg="primary">{validation.point_count}</Badge>
          </div>
          
          <div className="d-flex justify-content-between align-items-center">
            <span className="small text-muted">Empfohlen:</span>
            <Badge bg="info">{validation.recommended_count}</Badge>
          </div>
        </div>

        {/* Warnungen */}
        {validation.warnings && validation.warnings.length > 0 && (
          <Alert variant="warning" className="mb-3">
            <div className="mb-2">
              <strong>
                <i className="bi bi-exclamation-triangle me-1"></i>
                Warnungen:
              </strong>
            </div>
            <ul className="mb-0 ps-3">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="small">{warning}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Empfehlungen */}
        {validation.suggestions && validation.suggestions.length > 0 && (
          <Alert variant="info" className="mb-0">
            <div className="mb-2">
              <strong>
                <i className="bi bi-lightbulb me-1"></i>
                Verbesserungsvorschläge:
              </strong>
            </div>
            <ul className="mb-0 ps-3">
              {validation.suggestions.map((suggestion, index) => (
                <li key={index} className="small">{suggestion}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}

export default PointValidation;