const API_BASE_URL =  'http://localhost:3001'; // Assuming json-server runs on port 3000

export const endpoints = {
  // Team Formations
  teamFormation: {
    getAll: () => `${API_BASE_URL}/teamFormations`,
    getById: (id: number) => `${API_BASE_URL}/teamFormations/${id}`,
    // Get team formation for a specific case
    getByCaseId: (caseId: number) => `${API_BASE_URL}/teamFormations?caseId=${caseId}`,
    create: () => `${API_BASE_URL}/teamFormations`,
    update: (id: number) => `${API_BASE_URL}/teamFormations/${id}`,
  },

  // Reports
  reports: {
    getAll: () => `${API_BASE_URL}/reports`,
    getById: (id: number) => `${API_BASE_URL}/reports/${id}`,
    // Use query params for filtering
    getByCaseId: (caseId: number) => `${API_BASE_URL}/reports?caseId=${caseId}`,
    getBySubmitter: (personId: number) => `${API_BASE_URL}/reports?submittedBy=${personId}`,
    create: () => `${API_BASE_URL}/reports`,
    update: (id: number) => `${API_BASE_URL}/reports/${id}`,
    delete: (id: number) => `${API_BASE_URL}/reports/${id}`,
  },

  // Persons
  persons: {
    getAll: () => `${API_BASE_URL}/persons`,
    getById: (id: number) => `${API_BASE_URL}/persons/${id}`,
    // For login, we'll query by email
    getByEmail: (email: string) => `${API_BASE_URL}/persons?email=${email}`,
    create: () => `${API_BASE_URL}/persons`,
    update: (id: number) => `${API_BASE_URL}/persons/${id}`,
    delete: (id: number) => `${API_BASE_URL}/persons/${id}`,
  },

  // Cases
  cases: {
    getAll: () => `${API_BASE_URL}/cases`,
    getById: (id: number) => `${API_BASE_URL}/cases/${id}`,
    create: () => `${API_BASE_URL}/cases`,
    update: (id: number) => `${API_BASE_URL}/cases/${id}`,
    delete: (id: number) => `${API_BASE_URL}/cases/${id}`,
  },

  // Admins
  admin: {
    // We can query the admins table by email for login
    getByEmail: (email: string) => `${API_BASE_URL}/admins?email=${email}`,
  },

  // Departments
  departments: {
    getAll: () => `${API_BASE_URL}/departments`,
    getById: (id: number) => `${API_BASE_URL}/departments/${id}`,
    // Use query params for filtering by district
    getByDistrict: (districtName: string) => `${API_BASE_URL}/departments?district=${districtName}`,
    create: () => `${API_BASE_URL}/departments`,
    update: (id: number) => `${API_BASE_URL}/departments/${id}`,
    delete: (id: number) => `${API_BASE_URL}/departments/${id}`,
  },
};