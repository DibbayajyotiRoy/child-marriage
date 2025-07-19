import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Case } from '@/types';

export interface CreateCaseRequest {
  title: string;
  description: string;
  createdBy: string; 
  departmentId: string; 
  status?: 'active' | 'pending' | 'resolved';
}

export class CaseService extends BaseApiService {
  /**
   * ‼️ NOTE: The backend does not currently have a `GET /api/cases` endpoint.
   * This method returns an empty array to prevent the UI from crashing.
   * To display a list of all issues, a method must be added to the backend `CaseController`.
   */
  async getAll(): Promise<Case[]> {
    console.warn("[CaseService] The 'getAll' method was called, but the backend endpoint 'GET /api/cases' does not exist. Returning an empty array.");
    return Promise.resolve([]);
  }

  async getById(id: string): Promise<Case> {
    return this.get<Case>(endpoints.cases.getById(id));
  }

  async create(request: CreateCaseRequest): Promise<Case> {
    return this.post<Case>(endpoints.cases.create(), request);
  }
}

export const caseService = new CaseService();