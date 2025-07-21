import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Case } from '@/types';

export interface CreateCaseRequest {
  title: string;
  description: string;
  createdBy: string;
  departmentId: string;
  status?: string;
}

export class CaseService extends BaseApiService {
  /**
   * ✅ FIXED: This now calls the real GET /api/cases endpoint that you added to the backend.
   */
  async getAll(): Promise<Case[]> {
    return this.get<Case[]>(endpoints.cases.getAll());
  }

  async getById(id: string): Promise<Case> {
    return this.get<Case>(endpoints.cases.getById(id));
  }

  async create(request: CreateCaseRequest): Promise<Case> {
    return this.post<Case>(endpoints.cases.create(), request);
  }
}

export const caseService = new CaseService();