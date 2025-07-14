import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Report } from '@/types';

// Matches the 'reports' table in db.json
export interface CreateReportRequest {
  caseId: number;
  submittedBy: number;
  teamFormationId: number;
  content: string;
}

export interface UpdateReportRequest {
  content?: string;
}

export class ReportService extends BaseApiService {
  async getById(id: number): Promise<Report> {
    return this.get<Report>(endpoints.reports.getById(id));
  }

  async getByCaseId(caseId: number): Promise<Report[]> {
    return this.get<Report[]>(endpoints.reports.getByCaseId(caseId));
  }

  async create(request: CreateReportRequest): Promise<Report> {
    const newReport = {
      ...request,
      submittedAt: new Date().toISOString(),
    };
    return this.post<Report>(endpoints.reports.create(), newReport);
  }

  async update(id: number, request: UpdateReportRequest): Promise<Report> {
    return this.put<Report>(endpoints.reports.update(id), request);
  }

  async deleteReport(id: number): Promise<void> {
    return this.delete<void>(endpoints.reports.delete(id));
  }
}

export const reportService = new ReportService();