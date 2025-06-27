import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MapComponent from './components/MapComponent';
import PointList from './components/PointList';
import ResultDisplay from './components/ResultDisplay';
import StatisticsPanel from './components/StatisticsPanel';
import PointValidation from './components/PointValidation';
import ProjectManager from './components/ProjectManager';
import ProjectStatus from './components/ProjectStatus';
import ExportImport from './components/ExportImport';
import AccuracySettings from './components/AccuracySettings';
import projectStorage from './services/ProjectStorage';
import axios from 'axios';

function App() {
  const [referencePoints, setReferencePoints] = useState([]);
  const [calculatedPosition, setCalculatedPosition] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [mapCenter, setMapCenter] = useState([52.5200, 13.4050]); // Berlin als Standard
  const [activePoint, setActivePoint] = useState(null);
  const [distanceInput, setDistanceInput] = useState('');
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [previewResult, setPreviewResult] = useState(null);
  const [validation, setValidation] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [maxPoints, setMaxPoints] = useState(20); // Maximale Anzahl Punkte
  const [isPreviewCalculating, setIsPreviewCalculating] = useState(false);

  // Project Management State
  const [currentProject, setCurrentProject] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Accuracy Settings State
  const [accuracySettings, setAccuracySettings] = useState({
    globalDefault: 100,
    showCircles: false,
    colorScheme: 'traffic',
    presets: {
      high: 25,
      medium: 100,
      low: 500
    }
  });
  const [showAccuracyCircles, setShowAccuracyCircles] = useState(false);

  // Debounce Utility
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initialize project storage on app load
  useEffect(() => {
    projectStorage.initializeStorage();
    loadProjects();
    
    // Try to load active project
    const activeProject = projectStorage.getActiveProject();
    if (activeProject) {
      loadProjectData(activeProject);
    }
  }, []);

  // Track changes for auto-save
  useEffect(() => {
    if (currentProject) {
      setHasUnsavedChanges(true);
    }
  }, [referencePoints, calculatedPosition, mapCenter, statistics, autoCalculate, maxPoints, accuracySettings, showAccuracyCircles]);

  // Project Management Functions
  const loadProjects = () => {
    const allProjects = projectStorage.getAllProjects();
    setProjects(allProjects);
  };

  const getCurrentProjectData = () => {
    return {
      referencePoints,
      calculatedPosition,
      mapCenter,
      statistics,
      settings: {
        autoCalculate,
        maxPoints,
        accuracySettings,
        showAccuracyCircles
      }
    };
  };

  const loadProjectData = (project) => {
    if (!project || !project.data) return;
    
    setReferencePoints(project.data.referencePoints || []);
    setCalculatedPosition(project.data.calculatedPosition || null);
    setMapCenter(project.data.mapCenter || [52.5200, 13.4050]);
    setStatistics(project.data.statistics || null);
    
    // Load settings
    const settings = project.data.settings || {};
    setAutoCalculate(settings.autoCalculate !== undefined ? settings.autoCalculate : true);
    setMaxPoints(settings.maxPoints || 20);
    setAccuracySettings(settings.accuracySettings || {
      globalDefault: 100,
      showCircles: false,
      colorScheme: 'traffic',
      presets: { high: 25, medium: 100, low: 500 }
    });
    setShowAccuracyCircles(settings.showAccuracyCircles || false);
    
    setCurrentProject(project);
    setHasUnsavedChanges(false);
  };

  const saveCurrentProject = async () => {
    if (!currentProject) return false;
    
    try {
      setIsAutoSaving(true);
      
      const projectData = getCurrentProjectData();
      const updatedProject = projectStorage.updateProject(currentProject.id, {
        data: projectData
      });
      
      if (updatedProject) {
        setCurrentProject(updatedProject);
        setHasUnsavedChanges(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Save project error:', error);
      return false;
    } finally {
      setIsAutoSaving(false);
    }
  };

  const createNewProject = () => {
    const projectData = {
      name: 'Neues Projekt',
      description: 'Triangulation Projekt erstellt am ' + new Date().toLocaleString('de-DE'),
      ...getCurrentProjectData()
    };
    
    const newProject = projectStorage.createProject(projectData);
    if (newProject) {
      setCurrentProject(newProject);
      setHasUnsavedChanges(false);
      projectStorage.setActiveProject(newProject.id);
      toast.success(`Projekt "${newProject.name}" erstellt`);
      return newProject;
    }
    
    toast.error('Fehler beim Erstellen des Projekts');
    return null;
  };

  const handleLoadProject = (project) => {
    if (hasUnsavedChanges) {
      if (!window.confirm('Ungespeicherte Änderungen gehen verloren. Fortfahren?')) {
        return;
      }
    }
    
    loadProjectData(project);
    projectStorage.setActiveProject(project.id);
  };

  const handleCreateProject = (project) => {
    setCurrentProject(project);
    setHasUnsavedChanges(false);
    projectStorage.setActiveProject(project.id);
    loadProjects();
  };

  // Automatische Berechnung
  const performAutoCalculation = async () => {
    if (referencePoints.length < 3) return;

    setIsPreviewCalculating(true);
    
    try {
      const response = await axios.post('/api/triangulate/preview', {
        points: referencePoints.map(point => ({
          lat: point.lat,
          lng: point.lng,
          distance: point.distance
        }))
      });

      if (response.data.ready) {
        setPreviewResult(response.data.preview);
        
        // Bei guter Konfidenz automatisch als Hauptergebnis setzen
        if (response.data.preview.confidence > 50) {
          const fullResult = await axios.post('/api/triangulate', {
            points: referencePoints.map(point => ({
              lat: point.lat,
              lng: point.lng,
              distance: point.distance
            }))
          });
          
          setCalculatedPosition(fullResult.data);
          setStatistics(fullResult.data.statistics);
        }
      }
    } catch (error) {
      console.warn('Preview calculation failed:', error);
    } finally {
      setIsPreviewCalculating(false);
    }
  };

  // Punkt-Validierung
  const validatePoints = async () => {
    if (referencePoints.length < 2) {
      setValidation(null);
      return;
    }

    try {
      const response = await axios.post('/api/points/validate', {
        points: referencePoints
      });
      setValidation(response.data);
    } catch (error) {
      console.warn('Validation failed:', error);
    }
  };

  // Debounced Auto-Calculation
  const debouncedCalculation = useCallback(
    debounce(() => {
      if (autoCalculate && referencePoints.length >= 3) {
        performAutoCalculation();
      }
      validatePoints();
    }, 500),
    [referencePoints, autoCalculate]
  );

  // Effect für automatische Berechnung
  useEffect(() => {
    if (referencePoints.length >= 3) {
      debouncedCalculation();
    } else {
      setCalculatedPosition(null);
      setPreviewResult(null);
      setStatistics(null);
    }
  }, [referencePoints, debouncedCalculation]);

  // Füge Referenzpunkt hinzu
  const addReferencePoint = (lat, lng, distance) => {
    if (!distance || distance <= 0) {
      toast.error('Bitte geben Sie eine gültige Entfernung ein!');
      return;
    }

    if (referencePoints.length >= maxPoints) {
      toast.error(`Maximum von ${maxPoints} Punkten erreicht!`);
      return;
    }

    const newPoint = {
      id: Date.now(),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      distance: parseFloat(distance),
      name: `Punkt ${referencePoints.length + 1}`,
      timestamp: new Date().toLocaleTimeString()
    };

    setReferencePoints([...referencePoints, newPoint]);
    setDistanceInput('');
    setActivePoint(null);
    toast.success(`Referenzpunkt ${newPoint.name} hinzugefügt!`);
  };

  // Entferne Referenzpunkt
  const removeReferencePoint = (id) => {
    const updatedPoints = referencePoints.filter(point => point.id !== id);
    setReferencePoints(updatedPoints);
    
    // Namen neu nummerieren
    const renumberedPoints = updatedPoints.map((point, index) => ({
      ...point,
      name: `Punkt ${index + 1}`
    }));
    setReferencePoints(renumberedPoints);
    
    toast.info('Referenzpunkt entfernt');
  };

  // Manuelle Berechnung
  const calculateTriangulation = async () => {
    if (referencePoints.length < 3) {
      toast.error('Mindestens 3 Referenzpunkte erforderlich!');
      return;
    }

    setIsCalculating(true);
    
    try {
      const response = await axios.post('/api/triangulate', {
        points: referencePoints.map(point => ({
          lat: point.lat,
          lng: point.lng,
          distance: point.distance
        }))
      });

      setCalculatedPosition(response.data);
      setStatistics(response.data.statistics);
      
      const quality = response.data.statistics?.quality || 'Unknown';
      toast.success(`Standort berechnet! Qualität: ${quality}`);
      
    } catch (error) {
      console.error('Triangulation error:', error);
      const errorMessage = error.response?.data?.error || 'Fehler bei der Berechnung';
      toast.error(errorMessage);
      setCalculatedPosition(null);
      setStatistics(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Lösche alle Punkte
  const clearAllPoints = () => {
    setReferencePoints([]);
    setCalculatedPosition(null);
    setPreviewResult(null);
    setStatistics(null);
    setValidation(null);
    setActivePoint(null);
    toast.info('Alle Punkte gelöscht');
  };

  // Beispieldaten laden
  const loadExampleData = () => {
    const examplePoints = [
      { id: 1, lat: 52.5200, lng: 13.4050, distance: 1000, name: 'Punkt 1', timestamp: new Date().toLocaleTimeString() },
      { id: 2, lat: 52.5300, lng: 13.4150, distance: 800, name: 'Punkt 2', timestamp: new Date().toLocaleTimeString() },
      { id: 3, lat: 52.5100, lng: 13.4250, distance: 1200, name: 'Punkt 3', timestamp: new Date().toLocaleTimeString() },
      { id: 4, lat: 52.5150, lng: 13.4100, distance: 950, name: 'Punkt 4', timestamp: new Date().toLocaleTimeString() }
    ];
    setReferencePoints(examplePoints);
    setCalculatedPosition(null);
    setPreviewResult(null);
    toast.info('Beispieldaten geladen (4 Punkte)');
  };

  // Handle map click
  const handleMapClick = (lat, lng) => {
    setActivePoint({ lat, lng });
    toast.info('Punkt ausgewählt - Geben Sie die Entfernung ein');
  };

  // Handle distance submission
  const handleDistanceSubmit = (e) => {
    e.preventDefault();
    if (activePoint && distanceInput) {
      addReferencePoint(activePoint.lat, activePoint.lng, distanceInput);
    }
  };

  // Drag & Drop Handlers
  const handlePointDrag = (point, newPosition) => {
    // Optional: Live-Update während des Dragging (debounced)
    // Hier können wir später eine debounced Vorschau-Berechnung hinzufügen
  };

  const handlePointDragEnd = (point, newPosition) => {
    // Punkt-Position aktualisieren
    const updatedPoints = referencePoints.map(p => 
      p.id === point.id 
        ? { 
            ...p, 
            lat: newPosition.lat, 
            lng: newPosition.lng,
            isDragModified: true,
            lastModified: new Date().toLocaleTimeString()
          }
        : p
    );
    
    setReferencePoints(updatedPoints);
    toast.success(`${point.name} wurde verschoben`);
  };

  // Distance Update Handler
  const handleUpdateDistance = (pointId, newDistance) => {
    const updatedPoints = referencePoints.map(p => 
      p.id === pointId 
        ? { 
            ...p, 
            distance: newDistance,
            isDistanceModified: true,
            lastModified: new Date().toLocaleTimeString()
          }
        : p
    );
    
    setReferencePoints(updatedPoints);
    toast.success(`Entfernung auf ${newDistance.toLocaleString()}m aktualisiert`);
  };

  // Accuracy Settings Handlers
  const handleUpdateAccuracySettings = (newSettings) => {
    setAccuracySettings(newSettings);
  };

  const handleToggleAccuracyCircles = (show) => {
    setShowAccuracyCircles(show);
  };

  const handleUpdatePointAccuracy = (pointId, accuracy) => {
    const updatedPoints = referencePoints.map(p => 
      p.id === pointId 
        ? { 
            ...p, 
            accuracy: accuracy,
            isAccuracyModified: true,
            lastModified: new Date().toLocaleTimeString()
          }
        : p
    );
    
    setReferencePoints(updatedPoints);
    toast.success(`Genauigkeit auf ±${accuracy}m aktualisiert`);
  };

  // GPS Funktionalität
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('GPS ist auf diesem Gerät nicht verfügbar');
      return;
    }

    setIsGettingLocation(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Karte zur GPS-Position zentrieren
        setMapCenter([latitude, longitude]);
        
        // GPS-Position als aktiven Punkt setzen
        setActivePoint({ lat: latitude, lng: longitude });
        
        // Geschätzte Genauigkeit basierend auf GPS-Genauigkeit
        const estimatedAccuracy = Math.max(accuracy || 10, 10);
        
        setIsGettingLocation(false);
        toast.success(`GPS-Position ermittelt (±${Math.round(estimatedAccuracy)}m Genauigkeit)`);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'GPS-Position konnte nicht ermittelt werden';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'GPS-Berechtigung verweigert';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'GPS-Position nicht verfügbar';
            break;
          case error.TIMEOUT:
            errorMessage = 'GPS-Timeout - Position dauert zu lange';
            break;
        }
        
        toast.error(errorMessage);
      },
      options
    );
  };

  // Fortschrittsbalken für Punkt-Sammlung
  const getProgressPercentage = () => {
    const minPoints = 3;
    const optimalPoints = 6;
    if (referencePoints.length <= minPoints) {
      return (referencePoints.length / minPoints) * 50;
    }
    return 50 + ((referencePoints.length - minPoints) / (optimalPoints - minPoints)) * 50;
  };

  const getProgressVariant = () => {
    if (referencePoints.length < 3) return 'danger';
    if (referencePoints.length < 5) return 'warning';
    return 'success';
  };

  return (
    <div className="App">
      {/* Header */}
      <div className="app-header">
        <Container>
          <Row>
            <Col>
              <h1 className="text-center mb-3">
                <i className="bi bi-geo-alt-fill me-2"></i>
                Erweiterte Triangulation
              </h1>
              <p className="text-center lead mb-2">
                Präzise Standortbestimmung mit beliebig vielen Referenzpunkten
              </p>
              <div className="text-center">
                <Badge bg="light" text="dark" className="me-2">
                  {referencePoints.length} / {maxPoints} Punkte
                </Badge>
                {previewResult && (
                  <Badge bg={previewResult.confidence > 70 ? 'success' : 'warning'}>
                    {previewResult.confidence.toFixed(0)}% Konfidenz
                  </Badge>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container fluid>
        {/* Project Status Component */}
        <ProjectStatus
          currentProject={currentProject}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={saveCurrentProject}
          onOpenManager={() => setShowProjectManager(true)}
          onOpenExportImport={() => setShowExportImport(true)}
          onNewProject={createNewProject}
        />

        <Row>
          {/* Karte */}
          <Col lg={8} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-map me-2"></i>
                  Interaktive Karte
                </h5>
                <div>
                  {isPreviewCalculating && (
                    <Spinner animation="border" size="sm" className="me-2" />
                  )}
                  {isAutoSaving && (
                    <Spinner animation="border" size="sm" className="me-2" />
                  )}
                  <Badge bg="light" text="dark">
                    {calculatedPosition ? 'Berechnet' : previewResult ? 'Vorschau' : 'Bereit'}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <MapComponent
                  center={mapCenter}
                  referencePoints={referencePoints}
                  calculatedPosition={calculatedPosition || previewResult}
                  activePoint={activePoint}
                  onMapClick={handleMapClick}
                  showPreview={!!previewResult && !calculatedPosition}
                  onPointDrag={handlePointDrag}
                  onPointDragEnd={handlePointDragEnd}
                  accuracySettings={accuracySettings}
                  showAccuracyCircles={showAccuracyCircles}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Steuerung */}
          <Col lg={4}>
            {/* Fortschritt */}
            <Card className="mb-3 border-info shadow-sm">
              <Card.Header className="bg-info text-white">
                <h6 className="mb-0">
                  <i className="bi bi-bar-chart me-2"></i>
                  Punkt-Sammlung Fortschritt
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <small className="text-muted">
                    {referencePoints.length < 3 ? 
                      `Noch ${3 - referencePoints.length} Punkt(e) für Grundberechnung` :
                      `${referencePoints.length} Punkte - ${referencePoints.length < 6 ? 'Gut' : 'Excellent'}`
                    }
                  </small>
                </div>
                <ProgressBar 
                  variant={getProgressVariant()} 
                  now={getProgressPercentage()} 
                  className="mb-2"
                />
                <div className="d-flex justify-content-between small text-muted">
                  <span>Min: 3</span>
                  <span>Optimal: 6+</span>
                  <span>Max: {maxPoints}</span>
                </div>
              </Card.Body>
            </Card>

            {/* Entfernung eingeben */}
            {activePoint && (
              <Card className="mb-3 border-warning shadow-sm fade-in">
                <Card.Header className="bg-warning text-dark">
                  <h6 className="mb-0">
                    <i className="bi bi-cursor-fill me-2"></i>
                    Neuer Referenzpunkt
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleDistanceSubmit}>
                    <div className="mb-3">
                      <small className="text-muted">
                        📍 {activePoint.lat.toFixed(6)}, {activePoint.lng.toFixed(6)}
                      </small>
                    </div>
                    <Form.Group>
                      <Form.Label>
                        Entfernung (Meter)
                        <i className="bi bi-info-circle ms-1" title="Entfernung vom gesuchten Punkt zu diesem Referenzpunkt"></i>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="z.B. 1000"
                        value={distanceInput}
                        onChange={(e) => setDistanceInput(e.target.value)}
                        className="distance-input"
                        min="1"
                        step="0.1"
                        required
                        autoFocus
                      />
                    </Form.Group>
                    <div className="d-flex gap-2 mt-3">
                      <Button type="submit" className="btn-gradient flex-fill">
                        <i className="bi bi-plus-circle me-1"></i>
                        Punkt hinzufügen
                      </Button>
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setActivePoint(null)}
                      >
                        <i className="bi bi-x"></i>
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {/* Auto-Berechnung Toggle */}
            <Card className="mb-3 shadow-sm">
              <Card.Header className="bg-secondary text-white">
                <h6 className="mb-0">
                  <i className="bi bi-gear me-2"></i>
                  Berechnungseinstellungen
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Check 
                  type="switch"
                  id="auto-calculate-switch"
                  label="Automatische Live-Berechnung"
                  checked={autoCalculate}
                  onChange={(e) => setAutoCalculate(e.target.checked)}
                  className="mb-3"
                />
                
                {!autoCalculate && (
                  <Button
                    className="btn-success-gradient w-100"
                    onClick={calculateTriangulation}
                    disabled={referencePoints.length < 3 || isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Berechne...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-calculator me-2"></i>
                        Jetzt berechnen
                      </>
                    )}
                  </Button>
                )}
              </Card.Body>
            </Card>

            {/* Genauigkeitseinstellungen */}
            <AccuracySettings
              accuracySettings={accuracySettings}
              onUpdateAccuracySettings={handleUpdateAccuracySettings}
              showAccuracyCircles={showAccuracyCircles}
              onToggleAccuracyCircles={handleToggleAccuracyCircles}
              points={referencePoints}
              onUpdatePointAccuracy={handleUpdatePointAccuracy}
            />

            {/* Referenzpunkte */}
            <Card className="mb-3 shadow-sm">
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="bi bi-geo me-2"></i>
                  Referenzpunkte 
                  <Badge bg="light" text="dark" className="ms-2">
                    {referencePoints.length}
                  </Badge>
                </h6>
                <div>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="me-2"
                    title="Aktuelle GPS-Position verwenden"
                  >
                    {isGettingLocation ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <i className="bi bi-geo-alt"></i>
                    )}
                  </Button>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={loadExampleData}
                    className="me-2"
                    title="Beispieldaten laden"
                  >
                    <i className="bi bi-file-earmark-text"></i>
                  </Button>
                  {referencePoints.length > 0 && (
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={clearAllPoints}
                      title="Alle löschen"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {referencePoints.length === 0 ? (
                  <Alert variant="light" className="text-center mb-0">
                    <i className="bi bi-cursor me-2"></i>
                    Klicken Sie auf die Karte, um Referenzpunkte hinzuzufügen
                  </Alert>
                ) : (
                  <PointList
                    points={referencePoints}
                    onRemovePoint={removeReferencePoint}
                    onUpdateDistance={handleUpdateDistance}
                    maxPoints={maxPoints}
                  />
                )}
              </Card.Body>
            </Card>

            {/* Punkt-Validierung */}
            {validation && (
              <PointValidation validation={validation} />
            )}

            {/* Ergebnis */}
            {(calculatedPosition || previewResult) && (
              <ResultDisplay 
                result={calculatedPosition || previewResult} 
                isPreview={!calculatedPosition && !!previewResult}
              />
            )}

            {/* Statistiken */}
            {statistics && (
              <StatisticsPanel statistics={statistics} />
            )}
          </Col>
        </Row>

        {/* Info Cards */}
        <Row className="mt-4">
          <Col md={3}>
            <Card className="border-primary mb-3">
              <Card.Body className="text-center">
                <i className="bi bi-1-circle-fill text-primary" style={{fontSize: '2rem'}}></i>
                <h6 className="mt-2">Punkte setzen</h6>
                <small className="text-muted">
                  Klicken Sie auf die Karte für Referenzpunkte
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-warning mb-3">
              <Card.Body className="text-center">
                <i className="bi bi-2-circle-fill text-warning" style={{fontSize: '2rem'}}></i>
                <h6 className="mt-2">Entfernungen</h6>
                <small className="text-muted">
                  Geben Sie präzise Entfernungen ein
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-success mb-3">
              <Card.Body className="text-center">
                <i className="bi bi-3-circle-fill text-success" style={{fontSize: '2rem'}}></i>
                <h6 className="mt-2">Auto-Berechnung</h6>
                <small className="text-muted">
                  Live-Updates bei jedem neuen Punkt
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-info mb-3">
              <Card.Body className="text-center">
                <i className="bi bi-4-circle-fill text-info" style={{fontSize: '2rem'}}></i>
                <h6 className="mt-2">Mehr Punkte</h6>
                <small className="text-muted">
                  Bis zu {maxPoints} Punkte für höchste Genauigkeit
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Project Manager Modal */}
      <ProjectManager
        show={showProjectManager}
        onHide={() => setShowProjectManager(false)}
        currentProjectData={getCurrentProjectData()}
        onLoadProject={handleLoadProject}
        onCreateProject={handleCreateProject}
        activeProjectId={currentProject?.id}
      />

      {/* Export/Import Modal */}
      <ExportImport
        show={showExportImport}
        onHide={() => setShowExportImport(false)}
        projects={projects}
        onImportComplete={loadProjects}
      />

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;