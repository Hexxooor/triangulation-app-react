import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, ButtonGroup, Dropdown, Alert } from 'react-bootstrap';
import projectStorage from '../services/ProjectStorage';
import { toast } from 'react-toastify';

const ProjectStatus = ({ 
  currentProject, 
  hasUnsavedChanges, 
  onSave, 
  onOpenManager, 
  onOpenExportImport,
  onNewProject 
}) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentProject) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save after 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentProject, autoSaveEnabled]);

  const handleAutoSave = async () => {
    if (onSave) {
      const success = await onSave();
      if (success) {
        setLastSaved(new Date());
        toast.info('Projekt automatisch gespeichert', {
          position: "bottom-right",
          autoClose: 2000
        });
      }
    }
  };

  const handleManualSave = async () => {
    if (onSave) {
      const success = await onSave();
      if (success) {
        setLastSaved(new Date());
        toast.success('Projekt gespeichert');
      }
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Nie';
    const diff = Date.now() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Gerade eben';
    if (minutes === 1) return 'Vor 1 Minute';
    return `Vor ${minutes} Minuten`;
  };

  const getProjectStats = () => {
    if (!currentProject?.data) return { points: 0, hasCalculation: false };
    
    return {
      points: currentProject.data.referencePoints?.length || 0,
      hasCalculation: !!currentProject.data.calculatedPosition
    };
  };

  if (!currentProject) {
    return (
      <Card className="mb-3 border-warning">
        <Card.Body className="py-2">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Badge bg="warning" text="dark">
                <i className="bi bi-folder2 me-1"></i>
                Kein Projekt geladen
              </Badge>
              <small className="text-muted ms-2">
                Erstellen Sie ein neues Projekt oder laden Sie ein bestehendes
              </small>
            </div>
            <ButtonGroup size="sm">
              <Button variant="success" onClick={onNewProject}>
                <i className="bi bi-plus me-1"></i>
                Neu
              </Button>
              <Button variant="outline-primary" onClick={onOpenManager}>
                <i className="bi bi-folder2-open me-1"></i>
                Laden
              </Button>
            </ButtonGroup>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const stats = getProjectStats();

  return (
    <Card className="mb-3 border-primary shadow-sm">
      <Card.Body className="py-2">
        <div className="d-flex justify-content-between align-items-center">
          {/* Project Info */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <h6 className="mb-0 me-2">
                <i className="bi bi-folder2-open text-primary me-1"></i>
                {currentProject.name}
              </h6>
              
              {hasUnsavedChanges && (
                <Badge bg="warning" text="dark" className="me-2">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  Ungespeichert
                </Badge>
              )}
              
              <Badge bg="light" text="dark" className="me-2">
                {stats.points} Punkt{stats.points === 1 ? '' : 'e'}
              </Badge>
              
              {stats.hasCalculation && (
                <Badge bg="success">
                  <i className="bi bi-check-circle me-1"></i>
                  Berechnet
                </Badge>
              )}
            </div>
            
            <div className="d-flex align-items-center small text-muted">
              <span className="me-3">
                <i className="bi bi-clock me-1"></i>
                Letzte Speicherung: {formatLastSaved()}
              </span>
              
              {currentProject.description && (
                <span className="me-3">
                  <i className="bi bi-info-circle me-1"></i>
                  {currentProject.description}
                </span>
              )}
              
              <div className="form-check form-switch me-3" style={{ fontSize: '0.8rem' }}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autoSaveSwitch"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  style={{ transform: 'scale(0.8)' }}
                />
                <label className="form-check-label" htmlFor="autoSaveSwitch">
                  Auto-Save
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-2">
            {/* Save Button */}
            <Button
              variant={hasUnsavedChanges ? "warning" : "outline-success"}
              size="sm"
              onClick={handleManualSave}
              disabled={!hasUnsavedChanges}
              title={hasUnsavedChanges ? "Projekt speichern" : "Alle Änderungen gespeichert"}
            >
              <i className={`bi bi-${hasUnsavedChanges ? 'floppy' : 'check-circle'} me-1`}></i>
              {hasUnsavedChanges ? 'Speichern' : 'Gespeichert'}
            </Button>

            {/* Project Actions Dropdown */}
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" size="sm" id="project-actions">
                <i className="bi bi-three-dots-vertical"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={onOpenManager}>
                  <i className="bi bi-folder2-open me-2"></i>
                  Projekt wechseln
                </Dropdown.Item>
                <Dropdown.Item onClick={onNewProject}>
                  <i className="bi bi-plus me-2"></i>
                  Neues Projekt
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={() => {
                    const duplicated = projectStorage.duplicateProject(currentProject.id);
                    if (duplicated) {
                      toast.success(`Projekt "${duplicated.name}" dupliziert`);
                    }
                  }}
                >
                  <i className="bi bi-files me-2"></i>
                  Projekt duplizieren
                </Dropdown.Item>
                <Dropdown.Item onClick={onOpenExportImport}>
                  <i className="bi bi-arrow-left-right me-2"></i>
                  Export/Import
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item 
                  className="text-danger"
                  onClick={() => {
                    if (window.confirm(`Projekt "${currentProject.name}" wirklich löschen?`)) {
                      if (projectStorage.deleteProject(currentProject.id)) {
                        toast.success('Projekt gelöscht');
                        // Reset to no project state
                        window.location.reload(); // Simple way to reset state
                      }
                    }
                  }}
                >
                  <i className="bi bi-trash me-2"></i>
                  Projekt löschen
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectStatus;