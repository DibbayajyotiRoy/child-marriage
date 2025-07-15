import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Case } from '@/types'; // Assuming you have a types file

// This interface should match the fields in your 'cases' table in db.json
export interface CreateCaseRequest {
  title: string;
  description: string;
  createdBy: number;
  departmentId: number;
  // Set defaults for these on creation
  status?: 'active' | 'pending' | 'resolved';
  finalReportSubmitted?: boolean;
  createdAt?: string;
}

export interface UpdateCaseRequest {
  title?: string;
  description?: string;
  status?: 'active' | 'pending' | 'resolved';
  departmentId?: number;
  finalReportSubmitted?: boolean;
}

// Interface for team assignment request
export interface AssignTeamRequest {
  teamMembers: number[]; // Array of person IDs
  leaderId?: number; // Optional team leader ID
  assignedAt?: string;
}

export class CaseService extends BaseApiService {
  async getById(id: number): Promise<Case> {
    return this.get<Case>(endpoints.cases.getById(id));
  }

  async getAll(): Promise<Case[]> {
    return this.get<Case[]>(endpoints.cases.getAll());
  }

  async create(request: CreateCaseRequest): Promise<Case> {
    const newCase = {
      ...request,
      // Set server-side-like defaults
      status: request.status || 'active',
      finalReportSubmitted: request.finalReportSubmitted || false,
      createdAt: request.createdAt || new Date().toISOString(),
    };
    return this.post<Case>(endpoints.cases.create(), newCase);
  }

  async update(id: number, request: UpdateCaseRequest): Promise<Case> {
    return this.put<Case>(endpoints.cases.update(id), request);
  }

  async deleteCase(id: number): Promise<void> {
    return this.delete<void>(endpoints.cases.delete(id));
  }

  // New method for team assignment based on the screenshot
  async assignTeam(caseId: number, request: AssignTeamRequest): Promise<any> {
    const teamData = {
      ...request,
      assignedAt: request.assignedAt || new Date().toISOString(),
    };
    return this.post<any>(endpoints.cases.assignTeam(caseId), teamData);
  }

  // Client-side filtering methods - these can be used if backend doesn't support query params
  async getCasesByStatus(status: 'active' | 'pending' | 'resolved'): Promise<Case[]> {
    const allCases = await this.getAll();
    return allCases.filter(c => c.status === status);
  }

  async getCasesByDepartment(departmentId: number): Promise<Case[]> {
    const allCases = await this.getAll();
    return allCases.filter(c => c.departmentId === departmentId);
  }

  async getCasesByCreator(createdBy: number): Promise<Case[]> {
    const allCases = await this.getAll();
    return allCases.filter(c => c.createdBy === createdBy);
  }

  // Server-side filtering methods (if your backend supports query parameters)
  async getCasesByStatusServer(status: 'active' | 'pending' | 'resolved'): Promise<Case[]> {
    return this.get<Case[]>(`${endpoints.cases.getAll()}?status=${status}`);
  }

  async getCasesByDepartmentServer(departmentId: number): Promise<Case[]> {
    return this.get<Case[]>(`${endpoints.cases.getAll()}?departmentId=${departmentId}`);
  }

  async getCasesByCreatorServer(createdBy: number): Promise<Case[]> {
    return this.get<Case[]>(`${endpoints.cases.getAll()}?createdBy=${createdBy}`);
  }

  // Pagination support
  async getCasesPaginated(page: number = 1, limit: number = 10): Promise<Case[]> {
    return this.get<Case[]>(`${endpoints.cases.getAll()}?_page=${page}&_limit=${limit}`);
  }

  // Search functionality
  async searchCases(query: string): Promise<Case[]> {
    return this.get<Case[]>(`${endpoints.cases.getAll()}?q=${encodeURIComponent(query)}`);
  }
}

export const caseService = new CaseService();