const API_BASE_URL = 'http://localhost:8080'; // Updated to match your backend port

export const endpoints = {
  // Team Formations
  teamFormation: {
    getAll: () => `${API_BASE_URL}/api/team-formations`,
    getById: (id: number) => `${API_BASE_URL}/api/team-formations/${id}`,
    // Response endpoint - specific to team formations
    submitResponse: (id: number) => `${API_BASE_URL}/api/team-formations/${id}/response`,
    create: () => `${API_BASE_URL}/api/team-formations`,
    update: (id: number) => `${API_BASE_URL}/api/team-formations/${id}`,
  },

  // Reports
  reports: {
    getAll: () => `${API_BASE_URL}/api/reports`,
    getById: (id: number) => `${API_BASE_URL}/api/reports/${id}`,
    create: () => `${API_BASE_URL}/api/reports`,
    update: (id: number) => `${API_BASE_URL}/api/reports/${id}`,
    delete: (id: number) => `${API_BASE_URL}/api/reports/${id}`,
  },

  // Cases
  cases: {
    getAll: () => `${API_BASE_URL}/api/cases`,
    getById: (id: number) => `${API_BASE_URL}/api/cases/${id}`,
    create: () => `${API_BASE_URL}/api/cases`,
    update: (id: number) => `${API_BASE_URL}/api/cases/${id}`,
    delete: (id: number) => `${API_BASE_URL}/api/cases/${id}`,
    // Team assignment endpoint for cases
    assignTeam: (caseId: number) => `${API_BASE_URL}/api/cases/${caseId}/team`,
  },

  // Persons
  persons: {
    getAll: () => `${API_BASE_URL}/api/persons`,
    getById: (id: number) => `${API_BASE_URL}/api/persons/${id}`,
    create: () => `${API_BASE_URL}/api/persons`,
    update: (id: number) => `${API_BASE_URL}/api/persons/${id}`,
    delete: (id: number) => `${API_BASE_URL}/api/persons/${id}`,
    // For login, we'll query by email (if supported by backend)
    getByEmail: (email: string) => `${API_BASE_URL}/api/persons?email=${email}`,
  },

  // Hi Controller (Health Check or Hello endpoint)
  health: {
    check: () => `${API_BASE_URL}/hi`,
  },

  // Additional endpoints that might be needed based on common patterns:
  
  // Authentication (if you have login endpoints)
  auth: {
    login: () => `${API_BASE_URL}/api/auth/login`,
    logout: () => `${API_BASE_URL}/api/auth/logout`,
    register: () => `${API_BASE_URL}/api/auth/register`,
  },

  // Departments (if you have department management)
  departments: {
    getAll: () => `${API_BASE_URL}/api/departments`,
    getById: (id: number) => `${API_BASE_URL}/api/departments/${id}`,
    create: () => `${API_BASE_URL}/api/departments`,
    update: (id: number) => `${API_BASE_URL}/api/departments/${id}`,
    delete: (id: number) => `${API_BASE_URL}/api/departments/${id}`,
  },

  // Admin endpoints (if you have admin-specific operations)
  admin: {
    getAll: () => `${API_BASE_URL}/api/admin/users`,
    getById: (id: number) => `${API_BASE_URL}/api/admin/users/${id}`,
    create: () => `${API_BASE_URL}/api/admin/users`,
    update: (id: number) => `${API_BASE_URL}/api/admin/users/${id}`,
    delete: (id: number) => `${API_BASE_URL}/api/admin/users/${id}`,
  },
};