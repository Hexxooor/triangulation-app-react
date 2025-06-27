import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Alert, Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import projectStorage from '../services/ProjectStorage';
import { toast } from 'react-toastify';

const ExportImport = ({ show, onHide, projects, onImportComplete }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [importData, setImportData] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importOptions, setImportOptions] = useState({
    overwrite: false,
    keepExisting: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (show) {
      setSelectedProjects([]);
      setImportData('');
      setImportFile(null);
      setImportResult(null);
      setActiveTab('export');
    }
  }, [show]);

  const handleSelectAllProjects = (checked) => {
    if (checked) {
      setSelectedProjects(projects.map(p => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleProjectSelect = (projectId, checked) => {
    if (checked) {
      setSelectedProjects([...selectedProjects, projectId]);
    } else {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    }
  };

  const handleExport = () => {
    if (selectedProjects.length === 0) {
      toast.error('Bitte wählen Sie mindestens ein Projekt aus');
      return;
    }

    try {
      const exportData = projectStorage.exportProjects(selectedProjects);
      
      if (!exportData) {
        toast.error('Fehler beim Exportieren der Projekte');
        return;
      }

      // Create download link
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `triangulation-projects-${timestamp}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${selectedProjects.length} Projekt(e) exportiert`);
      onHide();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Fehler beim Exportieren der Projekte');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast.error('Bitte wählen Sie eine JSON-Datei aus');
      return;
    }

    setImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImportData(e.target.result);
    };
    reader.onerror = () => {
      toast.error('Fehler beim Lesen der Datei');
    };
    reader.readAsText(file);
  };

  const validateImportData = (data) => {
    try {
      const parsed = JSON.parse(data);
      
      if (!parsed.projects || !Array.isArray(parsed.projects)) {
        return { valid: false, error: 'Ungültiges Datenformat: Projekte nicht gefunden' };
      }

      if (parsed.projects.length === 0) {
        return { valid: false, error: 'Keine Projekte in der Datei gefunden' };
      }

      // Validate project structure
      for (const project of parsed.projects) {
        if (!project.name || !project.data) {
          return { valid: false, error: 'Ungültige Projektstruktur' };
        }
      }

      return { 
        valid: true, 
        projectCount: parsed.projects.length,
        version: parsed.version,
        exportedAt: parsed.exportedAt
      };
    } catch (error) {
      return { valid: false, error: 'Ungültiges JSON-Format' };
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error('Bitte wählen Sie eine Datei aus oder fügen Sie JSON-Daten ein');
      return;
    }

    const validation = validateImportData(importData);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = projectStorage.importProjects(importData, importOptions);
      
      if (result.success) {
        setImportResult(result);
        toast.success(`${result.imported} Projekt(e) erfolgreich importiert`);
        
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        toast.error(`Import fehlgeschlagen: ${result.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Fehler beim Importieren der Projekte');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedProjectsInfo = () => {
    if (selectedProjects.length === 0) return 'Keine Projekte ausgewählt';
    if (selectedProjects.length === projects.length) return 'Alle Projekte ausgewählt';
    return `${selectedProjects.length} von ${projects.length} Projekten ausgewählt`;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-secondary text-white">
        <Modal.Title>
          <i className="bi bi-arrow-left-right me-2"></i>
          Projekte Exportieren/Importieren
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Tab Navigation */}
        <div className="d-flex mb-3">
          <Button
            variant={activeTab === 'export' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('export')}
            className="me-2"
          >
            <i className="bi bi-download me-2"></i>
            Exportieren
          </Button>
          <Button
            variant={activeTab === 'import' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('import')}
          >
            <i className="bi bi-upload me-2"></i>
            Importieren
          </Button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div>
            <Alert variant="light">
              <i className="bi bi-info-circle me-2"></i>
              Wählen Sie die Projekte aus, die Sie exportieren möchten. Die Daten werden als JSON-Datei heruntergeladen.
            </Alert>

            <Card className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Projekte auswählen</span>
                <Form.Check
                  type="checkbox"
                  label="Alle auswählen"
                  checked={selectedProjects.length === projects.length && projects.length > 0}
                  onChange={(e) => handleSelectAllProjects(e.target.checked)}
                />
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {projects.length === 0 ? (
                  <Alert variant="light" className="text-center mb-0">
                    Keine Projekte zum Exportieren verfügbar
                  </Alert>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                      <div>
                        <h6 className="mb-1">{project.name}</h6>
                        <small className="text-muted">
                          {project.data?.referencePoints?.length || 0} Punkte • 
                          {new Date(project.updatedAt).toLocaleDateString('de-DE')}
                        </small>
                      </div>
                      <Form.Check
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={(e) => handleProjectSelect(project.id, e.target.checked)}
                      />
                    </div>
                  ))
                )}
              </Card.Body>
            </Card>

            <Alert variant="light">
              <div className="d-flex justify-content-between align-items-center">
                <span>{getSelectedProjectsInfo()}</span>
                <Badge bg="primary">{selectedProjects.length}</Badge>
              </div>
            </Alert>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div>
            <Alert variant="light">
              <i className="bi bi-info-circle me-2"></i>
              Importieren Sie Projekte aus einer JSON-Datei oder fügen Sie JSON-Daten direkt ein.
            </Alert>

            <Card className="mb-3">
              <Card.Header>Datei auswählen</Card.Header>
              <Card.Body>
                <Form.Control
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="mb-2"
                />
                {importFile && (
                  <small className="text-muted">
                    Datei: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                  </small>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>Oder JSON-Daten einfügen</Card.Header>
              <Card.Body>
                <Form.Control
                  as="textarea"
                  rows={6}
                  placeholder="JSON-Daten hier einfügen..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                />
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>Import-Optionen</Card.Header>
              <Card.Body>
                <Form.Check
                  type="checkbox"
                  label="Bestehende Projekte überschreiben"
                  checked={importOptions.overwrite}
                  onChange={(e) => setImportOptions({
                    ...importOptions,
                    overwrite: e.target.checked
                  })}
                  className="mb-2"
                />
                <Form.Check
                  type="checkbox"
                  label="Bestehende Projekte mit gleichem Namen behalten"
                  checked={importOptions.keepExisting}
                  onChange={(e) => setImportOptions({
                    ...importOptions,
                    keepExisting: e.target.checked
                  })}
                  disabled={importOptions.overwrite}
                />
              </Card.Body>
            </Card>

            {/* Import Result */}
            {importResult && (
              <Alert variant={importResult.success ? 'success' : 'danger'}>
                <h6>Import-Ergebnis</h6>
                <Row>
                  <Col>
                    <Badge bg="success" className="me-2">
                      {importResult.imported} Importiert
                    </Badge>
                    <Badge bg="warning" className="me-2">
                      {importResult.skipped} Übersprungen
                    </Badge>
                    <Badge bg="secondary">
                      {importResult.total} Gesamt
                    </Badge>
                  </Col>
                </Row>
              </Alert>
            )}

            {/* Validation Preview */}
            {importData && (
              <Card className="mb-3">
                <Card.Header>Vorschau</Card.Header>
                <Card.Body>
                  {(() => {
                    const validation = validateImportData(importData);
                    if (!validation.valid) {
                      return (
                        <Alert variant="danger">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          {validation.error}
                        </Alert>
                      );
                    }

                    return (
                      <Alert variant="success">
                        <i className="bi bi-check-circle me-2"></i>
                        {validation.projectCount} gültige Projekt(e) gefunden
                        {validation.exportedAt && (
                          <><br /><small>Exportiert am: {new Date(validation.exportedAt).toLocaleString('de-DE')}</small></>
                        )}
                      </Alert>
                    );
                  })()}
                </Card.Body>
              </Card>
            )}
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Schließen
        </Button>
        
        {activeTab === 'export' ? (
          <Button 
            variant="primary" 
            onClick={handleExport}
            disabled={selectedProjects.length === 0}
          >
            <i className="bi bi-download me-2"></i>
            Exportieren ({selectedProjects.length})
          </Button>
        ) : (
          <Button 
            variant="primary" 
            onClick={handleImport}
            disabled={!importData.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Importiere...
              </>
            ) : (
              <>
                <i className="bi bi-upload me-2"></i>
                Importieren
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ExportImport;