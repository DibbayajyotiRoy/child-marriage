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
      status: 'active',
      finalReportSubmitted: false,
      createdAt: new Date().toISOString(),
    };
    return this.post<Case>(endpoints.cases.create(), newCase);
  }

  async update(id: number, request: UpdateCaseRequest): Promise<Case> {
    return this.put<Case>(endpoints.cases.update(id), request);
  }

  async deleteCase(id: number): Promise<void> {
    return this.delete<void>(endpoints.cases.delete(id));
  }

  // Client-side filtering is fine, or you can use json-server's query params
  async getCasesByStatus(status: 'active' | 'pending' | 'resolved'): Promise<Case[]> {
    const allCases = await this.getAll();
    return allCases.filter(c => c.status === status);
  }
}

export const caseService = new CaseService();