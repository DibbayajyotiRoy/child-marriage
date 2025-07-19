// ✅ Use relative path for the Vite proxy
const API_BASE_URL = '/api';

export const endpoints = {
  // TeamFormation uses UUIDs (string) for all its IDs
  teamFormation: {
    create: () => `${API_BASE_URL}/team-formations`,
    initiate: (caseId: string) => `${API_BASE_URL}/team-formations/initiate/${caseId}`,
    submitResponse: (teamId: string) => `${API_BASE_URL}/team-formations/response/${teamId}`,
    getByCaseId: (caseId: string) => `${API_BASE_URL}/team-formations/case/${caseId}`,
  },

  // Report uses Long (number) for its own ID, but UUIDs (string) for foreign keys
  reports: {
    create: () => `${API_BASE_URL}/reports`,
    getById: (id: number) => `${API_BASE_URL}/reports/${id}`,
    update: (id: number) => `${API_BASE_URL}/reports/${id}`,
    delete: (id: number) => `${API_BASE_URL}/reports/${id}`,
    getByCaseId: (caseId: string) => `${API_BASE_URL}/reports/case/${caseId}`,
    getByPersonId: (personId: string) => `${API_BASE_URL}/reports/team-member/${personId}`,
  },

  // Case uses UUIDs (string)
  cases: {
    create: () => `${API_BASE_URL}/cases`,
    getById: (id: string) => `${API_BASE_URL}/cases/${id}`,
  },

  // Person uses UUIDs (string)
  persons: {
    getAll: () => `${API_BASE_URL}/persons`,
    getById: (id: string) => `${API_BASE_URL}/persons/${id}`,
    create: () => `${API_BASE_URL}/persons`,
    update: (id: string) => `${API_BASE_URL}/persons/${id}`,
    delete: (id: string) => `${API_BASE_URL}/persons/${id}`,
    createBulk: () => `${API_BASE_URL}/persons/bulk`,
  },
  
  // Post uses UUIDs (string)
  posts: {
    getAll: () => `${API_BASE_URL}/posts`,
    getById: (id: string) => `${API_BASE_URL}/posts/${id}`,
    create: () => `${API_BASE_URL}/posts`,
    update: (id: string) => `${API_BASE_URL}/posts/${id}`,
    delete: (id: string) => `${API_BASE_URL}/posts/${id}`,
  },

  // Department uses UUIDs (string)
  departments: {
    getAll: () => `${API_BASE_URL}/departments`,
    getById: (id: string) => `${API_BASE_URL}/departments/${id}`,
    create: () => `${API_BASE_URL}/departments`,
    update: (id: string) => `${API_BASE_URL}/departments/${id}`,
    delete: (id: string) => `${API_BASE_URL}/departments/${id}`,
  },
  
  // Auth has no IDs and a different base path
  auth: {
    login: () => `/auth/login`,
    logout: () => `/auth/logout`,
  },
};