/**
 * ProjectStorage Service
 * Handles all localStorage operations for project management
 * Provides CRUD operations for triangulation projects
 */

class ProjectStorage {
  constructor() {
    this.STORAGE_KEY = 'triangulation_projects';
    this.APP_SETTINGS_KEY = 'triangulation_app_settings';
    this.STORAGE_VERSION = '1.0';
    this.MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const size = data ? new Blob([data]).size : 0;
      const percentage = (size / this.MAX_STORAGE_SIZE) * 100;
      
      return {
        size,
        maxSize: this.MAX_STORAGE_SIZE,
        percentage: Math.round(percentage * 100) / 100,
        available: this.MAX_STORAGE_SIZE - size
      };
    } catch (error) {
      console.warn('Storage stats error:', error);
      return null;
    }
  }

  /**
   * Initialize storage with default structure
   */
  initializeStorage() {
    try {
      const existingData = localStorage.getItem(this.STORAGE_KEY);
      if (!existingData) {
        const defaultData = {
          version: this.STORAGE_VERSION,
          projects: [],
          activeProjectId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultData));
        
        // Initialize app settings
        const defaultSettings = {
          defaultMapCenter: [52.5200, 13.4050], // Berlin
          theme: 'default',
          autoSave: true,
          autoSaveInterval: 30000, // 30 seconds
          maxProjects: 50
        };
        
        localStorage.setItem(this.APP_SETTINGS_KEY, JSON.stringify(defaultSettings));
      }
      return true;
    } catch (error) {
      console.error('Storage initialization failed:', error);
      return false;
    }
  }

  /**
   * Get all storage data
   */
  getStorageData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        this.initializeStorage();
        return this.getStorageData();
      }
      
      const parsed = JSON.parse(data);
      
      // Validate and migrate if necessary
      if (!parsed.version || parsed.version !== this.STORAGE_VERSION) {
        return this.migrateData(parsed);
      }
      
      return parsed;
    } catch (error) {
      console.error('Storage read error:', error);
      this.initializeStorage();
      return this.getStorageData();
    }
  }

  /**
   * Save storage data
   */
  saveStorageData(data) {
    try {
      const dataToSave = {
        ...data,
        version: this.STORAGE_VERSION,
        updatedAt: new Date().toISOString()
      };
      
      const jsonString = JSON.stringify(dataToSave);
      
      // Check storage size before saving
      if (new Blob([jsonString]).size > this.MAX_STORAGE_SIZE) {
        throw new Error('Storage size limit exceeded');
      }
      
      localStorage.setItem(this.STORAGE_KEY, jsonString);
      return true;
    } catch (error) {
      console.error('Storage save error:', error);
      return false;
    }
  }

  /**
   * Generate unique project ID
   */
  generateProjectId() {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all projects
   */
  getAllProjects() {
    try {
      const data = this.getStorageData();
      return data.projects || [];
    } catch (error) {
      console.error('Get projects error:', error);
      return [];
    }
  }

  /**
   * Get project by ID
   */
  getProject(projectId) {
    try {
      const projects = this.getAllProjects();
      return projects.find(p => p.id === projectId) || null;
    } catch (error) {
      console.error('Get project error:', error);
      return null;
    }
  }

  /**
   * Create new project
   */
  createProject(projectData) {
    try {
      const data = this.getStorageData();
      
      // Check project limit
      if (data.projects.length >= 50) {
        throw new Error('Maximum number of projects reached');
      }
      
      const newProject = {
        id: this.generateProjectId(),
        name: projectData.name || 'Neues Projekt',
        description: projectData.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {
          referencePoints: projectData.referencePoints || [],
          calculatedPosition: projectData.calculatedPosition || null,
          mapCenter: projectData.mapCenter || [52.5200, 13.4050],
          statistics: projectData.statistics || null,
          settings: {
            autoCalculate: projectData.autoCalculate !== undefined ? projectData.autoCalculate : true,
            maxPoints: projectData.maxPoints || 20
          }
        }
      };
      
      data.projects.push(newProject);
      
      if (this.saveStorageData(data)) {
        return newProject;
      }
      
      throw new Error('Failed to save project');
    } catch (error) {
      console.error('Create project error:', error);
      return null;
    }
  }

  /**
   * Update existing project
   */
  updateProject(projectId, updates) {
    try {
      const data = this.getStorageData();
      const projectIndex = data.projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }
      
      const currentProject = data.projects[projectIndex];
      
      // Merge updates
      const updatedProject = {
        ...currentProject,
        ...updates,
        id: projectId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
        data: {
          ...currentProject.data,
          ...(updates.data || {})
        }
      };
      
      data.projects[projectIndex] = updatedProject;
      
      if (this.saveStorageData(data)) {
        return updatedProject;
      }
      
      throw new Error('Failed to update project');
    } catch (error) {
      console.error('Update project error:', error);
      return null;
    }
  }

  /**
   * Delete project
   */
  deleteProject(projectId) {
    try {
      const data = this.getStorageData();
      const projectIndex = data.projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        return false;
      }
      
      data.projects.splice(projectIndex, 1);
      
      // Clear active project if deleted
      if (data.activeProjectId === projectId) {
        data.activeProjectId = null;
      }
      
      return this.saveStorageData(data);
    } catch (error) {
      console.error('Delete project error:', error);
      return false;
    }
  }

  /**
   * Duplicate project
   */
  duplicateProject(projectId) {
    try {
      const originalProject = this.getProject(projectId);
      if (!originalProject) {
        throw new Error('Project not found');
      }
      
      const duplicatedProject = {
        name: `${originalProject.name} (Kopie)`,
        description: originalProject.description,
        referencePoints: [...originalProject.data.referencePoints],
        calculatedPosition: originalProject.data.calculatedPosition,
        mapCenter: [...originalProject.data.mapCenter],
        statistics: originalProject.data.statistics,
        autoCalculate: originalProject.data.settings.autoCalculate,
        maxPoints: originalProject.data.settings.maxPoints
      };
      
      return this.createProject(duplicatedProject);
    } catch (error) {
      console.error('Duplicate project error:', error);
      return null;
    }
  }

  /**
   * Set active project
   */
  setActiveProject(projectId) {
    try {
      const data = this.getStorageData();
      
      // Validate project exists
      if (projectId && !data.projects.find(p => p.id === projectId)) {
        throw new Error('Project not found');
      }
      
      data.activeProjectId = projectId;
      return this.saveStorageData(data);
    } catch (error) {
      console.error('Set active project error:', error);
      return false;
    }
  }

  /**
   * Get active project
   */
  getActiveProject() {
    try {
      const data = this.getStorageData();
      if (!data.activeProjectId) {
        return null;
      }
      
      return this.getProject(data.activeProjectId);
    } catch (error) {
      console.error('Get active project error:', error);
      return null;
    }
  }

  /**
   * Export projects as JSON
   */
  exportProjects(projectIds = null) {
    try {
      const data = this.getStorageData();
      let projectsToExport = data.projects;
      
      if (projectIds && Array.isArray(projectIds)) {
        projectsToExport = data.projects.filter(p => projectIds.includes(p.id));
      }
      
      const exportData = {
        version: this.STORAGE_VERSION,
        exportedAt: new Date().toISOString(),
        projects: projectsToExport,
        totalProjects: projectsToExport.length
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Export projects error:', error);
      return null;
    }
  }

  /**
   * Import projects from JSON
   */
  importProjects(jsonData, options = {}) {
    try {
      const { overwrite = false, keepExisting = true } = options;
      
      const importData = JSON.parse(jsonData);
      
      if (!importData.projects || !Array.isArray(importData.projects)) {
        throw new Error('Invalid import data format');
      }
      
      const data = this.getStorageData();
      
      if (overwrite) {
        data.projects = [];
      }
      
      let importedCount = 0;
      let skippedCount = 0;
      
      for (const project of importData.projects) {
        // Validate project structure
        if (!project.name || !project.data) {
          skippedCount++;
          continue;
        }
        
        // Check for existing project by name
        const existingProject = data.projects.find(p => p.name === project.name);
        
        if (existingProject && keepExisting) {
          skippedCount++;
          continue;
        }
        
        // Create new project with new ID
        const newProject = {
          ...project,
          id: this.generateProjectId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        data.projects.push(newProject);
        importedCount++;
      }
      
      if (this.saveStorageData(data)) {
        return {
          success: true,
          imported: importedCount,
          skipped: skippedCount,
          total: importData.projects.length
        };
      }
      
      throw new Error('Failed to save imported projects');
    } catch (error) {
      console.error('Import projects error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get app settings
   */
  getAppSettings() {
    try {
      const data = localStorage.getItem(this.APP_SETTINGS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Get app settings error:', error);
      return {};
    }
  }

  /**
   * Update app settings
   */
  updateAppSettings(settings) {
    try {
      const currentSettings = this.getAppSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.APP_SETTINGS_KEY, JSON.stringify(updatedSettings));
      return true;
    } catch (error) {
      console.error('Update app settings error:', error);
      return false;
    }
  }

  /**
   * Clear all storage data
   */
  clearAllData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.APP_SETTINGS_KEY);
      return true;
    } catch (error) {
      console.error('Clear storage error:', error);
      return false;
    }
  }

  /**
   * Migrate data from older versions
   */
  migrateData(oldData) {
    try {
      // Migration logic for future versions
      const migratedData = {
        version: this.STORAGE_VERSION,
        projects: oldData.projects || [],
        activeProjectId: oldData.activeProjectId || null,
        createdAt: oldData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.saveStorageData(migratedData);
      return migratedData;
    } catch (error) {
      console.error('Migration error:', error);
      this.initializeStorage();
      return this.getStorageData();
    }
  }
}

// Create singleton instance
const projectStorage = new ProjectStorage();

export default projectStorage;