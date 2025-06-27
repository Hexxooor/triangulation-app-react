import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Badge, Card, ListGroup, ButtonGroup, Spinner } from 'react-bootstrap';
import projectStorage from '../services/ProjectStorage';
import { toast } from 'react-toastify';

const ProjectManager = ({ 
  show, 
  onHide, 
  currentProjectData, 
  onLoadProject, 
  onCreateProject,
  activeProjectId 
}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [storageStats, setStorageStats] = useState(null);

  // Load projects when modal opens
  useEffect(() => {
    if (show) {
      loadProjects();
      loadStorageStats();
    }
  }, [show]);

  const loadProjects = () => {
    setLoading(true);
    try {
      const allProjects = projectStorage.getAllProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Fehler beim Laden der Projekte');
    } finally {
      setLoading(false);
    }
  };

  const loadStorageStats = () => {
    const stats = projectStorage.getStorageStats();
    setStorageStats(stats);
  };

  // Filter and sort projects
  const getFilteredAndSortedProjects = () => {
    let filtered = projects;

    // Filter by search term
    if (searchTerm) {
      filtered = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort projects
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const handleCreateProject = () => {
    setFormData({ name: '', description: '' });
    setShowCreateModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormData({ 
      name: project.name, 
      description: project.description 
    });
    setShowEditModal(true);
  };

  const handleSaveNewProject = async () => {
    if (!formData.name.trim()) {
      toast.error('Projektname ist erforderlich');
      return;
    }

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        ...currentProjectData
      };

      const newProject = projectStorage.createProject(projectData);
      
      if (newProject) {
        toast.success(`Projekt "${newProject.name}" erstellt`);
        setShowCreateModal(false);
        loadProjects();
        onCreateProject(newProject);
      } else {
        toast.error('Fehler beim Erstellen des Projekts');
      }
    } catch (error) {
      console.error('Create project error:', error);
      toast.error('Fehler beim Erstellen des Projekts');
    }
  };

  const handleSaveEditProject = async () => {
    if (!formData.name.trim()) {
      toast.error('Projektname ist erforderlich');
      return;
    }

    try {
      const updatedProject = projectStorage.updateProject(editingProject.id, {
        name: formData.name.trim(),
        description: formData.description.trim()
      });

      if (updatedProject) {
        toast.success(`Projekt "${updatedProject.name}" aktualisiert`);
        setShowEditModal(false);
        loadProjects();
      } else {
        toast.error('Fehler beim Aktualisieren des Projekts');
      }
    } catch (error) {
      console.error('Update project error:', error);
      toast.error('Fehler beim Aktualisieren des Projekts');
    }
  };

  const handleLoadProject = (project) => {
    projectStorage.setActiveProject(project.id);
    onLoadProject(project);
    toast.success(`Projekt "${project.name}" geladen`);
    onHide();
  };

  const handleDeleteProject = (project) => {
    if (window.confirm(`Projekt "${project.name}" wirklich löschen?`)) {
      if (projectStorage.deleteProject(project.id)) {
        toast.success(`Projekt "${project.name}" gelöscht`);
        loadProjects();
      } else {
        toast.error('Fehler beim Löschen des Projekts');
      }
    }
  };

  const handleDuplicateProject = (project) => {
    const duplicatedProject = projectStorage.duplicateProject(project.id);
    if (duplicatedProject) {
      toast.success(`Projekt "${duplicatedProject.name}" dupliziert`);
      loadProjects();
    } else {
      toast.error('Fehler beim Duplizieren des Projekts');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProjectStats = (project) => {
    const pointsCount = project.data?.referencePoints?.length || 0;
    const hasCalculation = !!project.data?.calculatedPosition;
    
    return { pointsCount, hasCalculation };
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-folder2-open me-2"></i>
            Projektverwaltung
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {/* Storage Stats */}
          {storageStats && (
            <Alert variant="light" className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <i className="bi bi-hdd me-2"></i>
                  Speicher: {(storageStats.size / 1024).toFixed(1)} KB von {(storageStats.maxSize / 1024 / 1024).toFixed(1)} MB
                </span>
                <Badge bg={storageStats.percentage > 80 ? 'danger' : storageStats.percentage > 60 ? 'warning' : 'success'}>
                  {storageStats.percentage}%
                </Badge>
              </div>
            </Alert>
          )}

          {/* Controls */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Projekte durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </Col>
            <Col md={4}>
              <Form.Select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="mb-2"
              >
                <option value="updatedAt-desc">Zuletzt geändert (Neueste)</option>
                <option value="updatedAt-asc">Zuletzt geändert (Älteste)</option>
                <option value="createdAt-desc">Erstellt (Neueste)</option>
                <option value="createdAt-asc">Erstellt (Älteste)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="success"
                onClick={handleCreateProject}
                className="w-100"
              >
                <i className="bi bi-plus"></i>
              </Button>
            </Col>
          </Row>

          {/* Project List */}
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Lade Projekte...</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {getFilteredAndSortedProjects().length === 0 ? (
                <Alert variant="light" className="text-center">
                  <i className="bi bi-folder2 me-2"></i>
                  {searchTerm ? 'Keine Projekte gefunden' : 'Noch keine Projekte vorhanden'}
                </Alert>
              ) : (
                <ListGroup>
                  {getFilteredAndSortedProjects().map(project => {
                    const stats = getProjectStats(project);
                    const isActive = project.id === activeProjectId;
                    
                    return (
                      <ListGroup.Item
                        key={project.id}
                        className={`d-flex justify-content-between align-items-start ${
                          isActive ? 'border-primary bg-light' : ''
                        }`}
                      >
                        <div className="flex-grow-1 me-3">
                          <div className="d-flex align-items-center mb-1">
                            <h6 className="mb-0 me-2">
                              {project.name}
                              {isActive && (
                                <Badge bg="primary" className="ms-2">Aktiv</Badge>
                              )}
                            </h6>
                          </div>
                          
                          {project.description && (
                            <p className="mb-1 text-muted small">
                              {project.description}
                            </p>
                          )}
                          
                          <div className="d-flex align-items-center gap-3 small text-muted">
                            <span>
                              <i className="bi bi-geo-alt me-1"></i>
                              {stats.pointsCount} Punkte
                            </span>
                            {stats.hasCalculation && (
                              <span>
                                <i className="bi bi-check-circle-fill text-success me-1"></i>
                                Berechnet
                              </span>
                            )}
                            <span>
                              <i className="bi bi-clock me-1"></i>
                              {formatDate(project.updatedAt)}
                            </span>
                          </div>
                        </div>
                        
                        <ButtonGroup size="sm">
                          <Button
                            variant="outline-primary"
                            onClick={() => handleLoadProject(project)}
                            title="Projekt laden"
                          >
                            <i className="bi bi-folder2-open"></i>
                          </Button>
                          <Button
                            variant="outline-secondary"
                            onClick={() => handleEditProject(project)}
                            title="Bearbeiten"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-secondary"
                            onClick={() => handleDuplicateProject(project)}
                            title="Duplizieren"
                          >
                            <i className="bi bi-files"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => handleDeleteProject(project)}
                            title="Löschen"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </ButtonGroup>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}
            </div>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Badge variant="secondary" className="me-auto">
            {projects.length} Projekt{projects.length === 1 ? '' : 'e'}
          </Badge>
          <Button variant="secondary" onClick={onHide}>
            Schließen
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Project Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <i className="bi bi-plus-circle me-2"></i>
            Neues Projekt erstellen
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Projektname *</Form.Label>
              <Form.Control
                type="text"
                placeholder="z.B. Standortbestimmung Büro"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Beschreibung</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Optionale Projektbeschreibung..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Abbrechen
          </Button>
          <Button variant="success" onClick={handleSaveNewProject}>
            <i className="bi bi-check me-1"></i>
            Projekt erstellen
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Project Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <i className="bi bi-pencil me-2"></i>
            Projekt bearbeiten
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Projektname *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Beschreibung</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Abbrechen
          </Button>
          <Button variant="warning" onClick={handleSaveEditProject}>
            <i className="bi bi-check me-1"></i>
            Änderungen speichern
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProjectManager;