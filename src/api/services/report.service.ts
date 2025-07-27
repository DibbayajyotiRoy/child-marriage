import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Report } from '@/types';

export interface CreateReportRequest {
  caseId: string; 
  personId: string; 
  content: string;
}

export interface UpdateReportRequest {
    content?: string;
    sdmFeedback?: string;
}

export class ReportService extends BaseApiService {
  /**
   * NOTE: The backend does not have an endpoint to get all reports.
   * This method returns an empty array to prevent 404 errors on app startup.
   */
  async getAll(): Promise<Report[]> {
    console.warn("[ReportService] The 'getAll' method was called, but the backend endpoint 'GET /api/reports' does not exist. Returning an empty array.");
    return Promise.resolve([]);
  }

  /**
   * Retrieves a single report by its unique ID (which is a number/Long).
   */
  async getById(id: number): Promise<Report> {
    return this.get<Report>(endpoints.reports.getById(id));
  }

  /**
   * Retrieves all reports for a specific case by its UUID.
   */
  async getByCaseId(caseId: string): Promise<Report[]> {
    return this.get<Report[]>(endpoints.reports.getByCaseId(caseId));
  }
  
  /**
   * This is required by the PersonDashboard.
   */
  async getByPersonId(personId: string): Promise<Report[]> {
    return this.get<Report[]>(endpoints.reports.getByPersonId(personId));
  }

  /**
   * Creates a new report.
   */
  async create(request: CreateReportRequest): Promise<Report> {
    return this.post<Report>(endpoints.reports.create(), request);
  }

  /**
   * Updates an existing report.
   */
  async update(id: number, request: UpdateReportRequest): Promise<Report> {
    return this.put<Report>(endpoints.reports.update(id), request);
  }
}

export const reportService = new ReportService();