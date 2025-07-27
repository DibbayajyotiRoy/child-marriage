// ✅ Use a relative path for the Vite proxy to forward requests to the backend.
const API_BASE_URL = '/api';

export const endpoints = {
  // TeamFormation uses UUIDs (string) for all its IDs
  teamFormation: {
    getById: (id: string) => `${API_BASE_URL}/team-formations/${id}`,
    getByCaseId: (caseId: string) => `${API_BASE_URL}/team-formations/case/${caseId}`,
    getAllPendingResponses: () => `${API_BASE_URL}/team-formations/pending-responses`,
    getPendingResponsesByTeamId: (teamId: string) => `${API_BASE_URL}/team-formations/${teamId}/pending-responses`,
    create: () => `${API_BASE_URL}/team-formations`,
    submitResponse: (teamId: string) => `${API_BASE_URL}/team-formations/${teamId}/response`,
  },

  // Report uses Long (number) for its own ID, but UUIDs (string) for foreign keys
  reports: {
    delete: (id: number) => `${API_BASE_URL}/reports/${id}`,
    getById: (id: number) => `${API_BASE_URL}/reports/${id}`,
    getByPersonId: (personId: string) => `${API_BASE_URL}/reports/team-member/${personId}`,
    getByCaseId: (caseId: string) => `${API_BASE_URL}/reports/case/${caseId}`,
    getFinalByCaseId: (caseId: string) => `${API_BASE_URL}/reports/case/${caseId}/final`,
    getByCaseAndDepartment: (caseId: string) => `${API_BASE_URL}/reports/case/${caseId}/department`,
    create: () => `${API_BASE_URL}/reports`,
    merge: () => `${API_BASE_URL}/reports/merge`,
    update: (id: number) => `${API_BASE_URL}/reports/${id}`,
  },

  // Post uses UUIDs (string)
  posts: {
    delete: (id: string) => `${API_BASE_URL}/posts/${id}`,
    getById: (id: string) => `${API_BASE_URL}/posts/${id}`,
    getAll: () => `${API_BASE_URL}/posts`,
    create: () => `${API_BASE_URL}/posts`,
    update: (id: string) => `${API_BASE_URL}/posts/${id}`,
  },

  // Person uses UUIDs (string)
  persons: {
    delete: (id: string) => `${API_BASE_URL}/persons/${id}`,
    getById: (id: string) => `${API_BASE_URL}/persons/${id}`,
    getAll: () => `${API_BASE_URL}/persons`,
    search: () => `${API_BASE_URL}/persons/search`,
    getByEmail: () => `${API_BASE_URL}/persons/email`,
    login: () => `${API_BASE_URL}/persons/login`,
    create: () => `${API_BASE_URL}/persons`,
    createBulk: () => `${API_BASE_URL}/persons/bulk`,
    update: (id: string) => `${API_BASE_URL}/persons/${id}`,
  },

  // Department uses UUIDs (string)
  departments: {
    delete: (id: string) => `${API_BASE_URL}/departments/${id}`,
    getById: (id: string) => `${API_BASE_URL}/departments/${id}`,
    getAll: () => `${API_BASE_URL}/departments`,
    getByName: (name: string) => `${API_BASE_URL}/departments/name/${name}`,
    create: () => `${API_BASE_URL}/departments`,
    update: (id: string) => `${API_BASE_URL}/departments/${id}`,
  },

  // Case uses UUIDs (string)
  cases: {
    getAll: () => `${API_BASE_URL}/cases`,
    getById: (id: string) => `${API_BASE_URL}/cases/${id}`,
    getStatus: (id: string) => `${API_BASE_URL}/cases/${id}/status`,
    create: () => `${API_BASE_URL}/cases`,
    update: (id: string) => `${API_BASE_URL}/cases/${id}`,
  },

  // Auth has a different base path and no IDs
  auth: {
    login: () => `/auth/login`,
    logout: () => `/auth/logout`,
  },

  // Health check has no prefix
  health: {
    check: () => `/hi`,
  },
};