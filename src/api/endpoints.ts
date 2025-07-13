
// API Endpoints Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const endpoints = {
  // Team Formation Controller
  teamFormation: {
    getById: (id: string) => `${API_BASE_URL}/team-formations/${id}`,
    getByCaseId: (caseId: string) => `${API_BASE_URL}/team-formations/case/${caseId}`,
    create: () => `${API_BASE_URL}/team-formations`,
    updateResponse: (id: string) => `${API_BASE_URL}/team-formations/${id}/response`,
    getPendingResponses: () => `${API_BASE_URL}/team-formations/pending-responses`,
  },

  // Report Controller
  reports: {
    getById: (id: string) => `${API_BASE_URL}/reports/${id}`,
    getByTeamMember: (personId: string) => `${API_BASE_URL}/reports/team-member/${personId}`,
    getByCaseId: (caseId: string) => `${API_BASE_URL}/reports/case/${caseId}`,
    create: () => `${API_BASE_URL}/reports`,
    update: (id: string) => `${API_BASE_URL}/reports/${id}`,
    delete: (id: string) => `${API_BASE_URL}/reports/${id}`,
    getFinalReport: (caseId: string) => `${API_BASE_URL}/cases/${caseId}/final-report`,
  },

  // Person Controller
  persons: {
    getById: (id: string) => `${API_BASE_URL}/persons/${id}`,
    getAll: () => `${API_BASE_URL}/persons`,
    create: () => `${API_BASE_URL}/persons`,
    update: (id: string) => `${API_BASE_URL}/persons/${id}`,
    delete: (id: string) => `${API_BASE_URL}/persons/${id}`,
    login: () => `${API_BASE_URL}/persons/login`,
  },

  // Case Controller (Child Marriage Cases)
  cases: {
    getById: (id: string) => `${API_BASE_URL}/cases/${id}`,
    getAll: () => `${API_BASE_URL}/cases`,
    create: () => `${API_BASE_URL}/cases`,
    update: (id: string) => `${API_BASE_URL}/cases/${id}`,
    delete: (id: string) => `${API_BASE_URL}/cases/${id}`,
    assignTeam: (caseId: string) => `${API_BASE_URL}/cases/${caseId}/team`,
    getStatus: (id: string) => `${API_BASE_URL}/cases/${id}/status`,
    escalate: (caseId: string) => `${API_BASE_URL}/cases/${caseId}/escalate`,
  },

  // Admin Controller
  admin: {
    login: () => `${API_BASE_URL}/admin/login`,
  },

  // Department Controller
  departments: {
    getByDistrict: (districtName: string) => `${API_BASE_URL}/departments/district/${districtName}`,
  },
};
