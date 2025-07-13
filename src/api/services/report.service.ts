
import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Report } from '@/types';

export interface CreateReportRequest {
  issueId: string;
  authorId: string;
  content: string;
}

export interface UpdateReportRequest {
  content: string;
}

export class ReportService extends BaseApiService {
  async getById(id: string): Promise<Report> {
    return this.get<Report>(endpoints.reports.getById(id));
  }

  async getByTeamMember(personId: string): Promise<Report[]> {
    return this.get<Report[]>(endpoints.reports.getByTeamMember(personId));
  }

  async getByCaseId(caseId: string): Promise<Report[]> {
    return this.get<Report[]>(endpoints.reports.getByCaseId(caseId));
  }

  async create(request: CreateReportRequest): Promise<Report> {
    return this.post<Report>(endpoints.reports.create(), request);
  }

  async update(id: string, request: UpdateReportRequest): Promise<Report> {
    return this.put<Report>(endpoints.reports.update(id), request);
  }

  async deleteReport(id: string): Promise<void> {
    return this.delete<void>(endpoints.reports.delete(id));
  }

  async getFinalReport(caseId: string): Promise<Report> {
    return this.get<Report>(endpoints.reports.getFinalReport(caseId));
  }
}

export const reportService = new ReportService();
