
import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Issue } from '@/types';

export interface CreateCaseRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  reportedByEmail: string;
  location: string;
  victimAge?: number;
  urgencyLevel: 'immediate' | 'urgent' | 'normal';
}

export interface UpdateCaseRequest {
  title?: string;
  description?: string;
  status?: 'active' | 'pending' | 'resolved';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  assignedTeam?: string;
}

export interface AssignTeamRequest {
  teamId: string;
  notes?: string;
}

export class CaseService extends BaseApiService {
  async getById(id: string): Promise<Issue> {
    return this.get<Issue>(endpoints.cases.getById(id));
  }

  async getAll(): Promise<Issue[]> {
    return this.get<Issue[]>(endpoints.cases.getAll());
  }

  async create(request: CreateCaseRequest): Promise<Issue> {
    return this.post<Issue>(endpoints.cases.create(), request);
  }

  async update(id: string, request: UpdateCaseRequest): Promise<Issue> {
    return this.put<Issue>(endpoints.cases.update(id), request);
  }

  async delete(id: string): Promise<void> {
    return this.delete<void>(endpoints.cases.delete(id));
  }

  async assignTeam(caseId: string, request: AssignTeamRequest): Promise<Issue> {
    return this.post<Issue>(endpoints.cases.assignTeam(caseId), request);
  }

  async getStatus(id: string): Promise<{ status: string; lastUpdated: Date }> {
    return this.get<{ status: string; lastUpdated: Date }>(endpoints.cases.getStatus(id));
  }

  async escalate(caseId: string): Promise<Issue> {
    return this.post<Issue>(endpoints.cases.escalate(caseId), {});
  }

  async getActiveCases(): Promise<Issue[]> {
    const allCases = await this.getAll();
    return allCases.filter(c => c.status === 'active');
  }

  async getPendingCases(): Promise<Issue[]> {
    const allCases = await this.getAll();
    return allCases.filter(c => c.status === 'pending');
  }

  async getResolvedCases(): Promise<Issue[]> {
    const allCases = await this.getAll();
    return allCases.filter(c => c.status === 'resolved');
  }
}

export const caseService = new CaseService();
