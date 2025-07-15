import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Report } from '@/types';

// Matches the 'reports' table structure
export interface CreateReportRequest {
  caseId: number;
  submittedBy: number;
  teamFormationId: number;
  content: string;
  reportType?: 'initial' | 'progress' | 'final' | 'incident';
  attachments?: string[]; // Array of file URLs or IDs
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateReportRequest {
  content?: string;
  reportType?: 'initial' | 'progress' | 'final' | 'incident';
  attachments?: string[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
}

export interface ReportFilter {
  caseId?: number;
  submittedBy?: number;
  teamFormationId?: number;
  reportType?: 'initial' | 'progress' | 'final' | 'incident';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface ReportStats {
  totalReports: number;
  reportsByType: { [type: string]: number };
  reportsByStatus: { [status: string]: number };
  reportsByPriority: { [priority: string]: number };
  averageProcessingTime: number;
  recentReports: Report[];
}

export class ReportService extends BaseApiService {
  /**
   * Retrieves all reports from the API with optional filtering.
   */
  async getAll(filter?: ReportFilter): Promise<Report[]> {
    let url = endpoints.reports.getAll();
    
    if (filter) {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    return this.get<Report[]>(url);
  }

  /**
   * Retrieves a single report by its unique ID.
   * @param id The unique ID of the report.
   */
  async getById(id: number): Promise<Report> {
    return this.get<Report>(endpoints.reports.getById(id));
  }

  /**
   * Retrieves all reports associated with a specific case ID.
   * @param caseId The unique ID of the case.
   */
  async getByCaseId(caseId: number): Promise<Report[]> {
    return this.get<Report[]>(`${endpoints.reports.getAll()}?caseId=${caseId}`);
  }

  /**
   * Retrieves all reports submitted by a specific person.
   * @param submittedBy The ID of the person who submitted the reports.
   */
  async getBySubmitter(submittedBy: number): Promise<Report[]> {
    return this.get<Report[]>(`${endpoints.reports.getAll()}?submittedBy=${submittedBy}`);
  }

  /**
   * Retrieves all reports for a specific team formation.
   * @param teamFormationId The ID of the team formation.
   */
  async getByTeamFormation(teamFormationId: number): Promise<Report[]> {
    return this.get<Report[]>(`${endpoints.reports.getAll()}?teamFormationId=${teamFormationId}`);
  }

  /**
   * Creates a new report.
   * @param request The data for the new report.
   */
  async create(request: CreateReportRequest): Promise<Report> {
    const newReport = {
      ...request,
      submittedAt: new Date().toISOString(),
      status: 'draft' as const,
      reportType: request.reportType || 'progress',
      priority: request.priority || 'medium',
    };
    return this.post<Report>(endpoints.reports.create(), newReport);
  }

  /**
   * Updates an existing report.
   * @param id The ID of the report to update.
   * @param request The data to update.
   */
  async update(id: number, request: UpdateReportRequest): Promise<Report> {
    return this.put<Report>(endpoints.reports.update(id), request);
  }

  /**
   * Deletes a report by its unique ID.
   * @param id The ID of the report to delete.
   */
  async deleteReport(id: number): Promise<void> {
    return this.delete<void>(endpoints.reports.delete(id));
  }

  /**
   * Submit a report (change status from draft to submitted).
   * @param id The ID of the report to submit.
   */
  async submitReport(id: number): Promise<Report> {
    return this.put<Report>(`${endpoints.reports.getById(id)}/submit`, {});
  }

  /**
   * Approve a report (for supervisors/admins).
   * @param id The ID of the report to approve.
   * @param comments Optional approval comments.
   */
  async approveReport(id: number, comments?: string): Promise<Report> {
    return this.put<Report>(`${endpoints.reports.getById(id)}/approve`, { comments });
  }

  /**
   * Reject a report (for supervisors/admins).
   * @param id The ID of the report to reject.
   * @param reason Reason for rejection.
   */
  async rejectReport(id: number, reason: string): Promise<Report> {
    return this.put<Report>(`${endpoints.reports.getById(id)}/reject`, { reason });
  }

  /**
   * Get reports with pagination (Spring Boot style).
   */
  async getReportsPaginated(
    page: number = 0,
    size: number = 10,
    sort?: string,
    filter?: ReportFilter
  ): Promise<{
    content: Report[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    let url = `${endpoints.reports.getAll()}?page=${page}&size=${size}`;
    
    if (sort) {
      url += `&sort=${sort}`;
    }
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => url += `&${key}=${encodeURIComponent(v)}`);
          } else {
            url += `&${key}=${encodeURIComponent(value.toString())}`;
          }
        }
      });
    }
    
    return this.get(url);
  }

  /**
   * Search reports by content or tags.
   * @param query The search query.
   */
  async searchReports(query: string): Promise<Report[]> {
    return this.get<Report[]>(`${endpoints.reports.getAll()}?search=${encodeURIComponent(query)}`);
  }

  /**
   * Get report statistics.
   */
  async getReportStats(filter?: ReportFilter): Promise<ReportStats> {
    let url = `${endpoints.reports.getAll()}/stats`;
    
    if (filter) {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    return this.get<ReportStats>(url);
  }

  // /**
  //  * Export reports to PDF or CSV.
  //  * @param format The export format.
  //  * @param filter Optional filter criteria.
  //  */
  // async exportReports(format: 'pdf' | 'csv', filter?: ReportFilter): Promise<Blob> {
  //   let url = `${endpoints.reports.getAll()}/export?format=${format}`;
    
  //   if (filter) {
  //     Object.entries(filter).forEach(([key, value]) => {
  //       if (value !== undefined && value !== null) {
  //         if (Array.isArray(value)) {
  //           value.forEach(v => url += `&${key}=${encodeURIComponent(v)}`);
  //         } else {
  //           url += `&${key}=${encodeURIComponent(value.toString())}`;
  //         }
  //       }
  //     });
  //   }
    
  //   return this.get<Blob>(url, { responseType: 'blob' });
  // }

  /**
   * Get report templates.
   */
  async getReportTemplates(): Promise<{ id: string; name: string; template: string }[]> {
    return this.get(`${endpoints.reports.getAll()}/templates`);
  }

  /**
   * Create report from template.
   * @param templateId The template ID.
   * @param data The data to fill the template.
   */
  async createFromTemplate(templateId: string, data: any): Promise<Report> {
    return this.post<Report>(`${endpoints.reports.getAll()}/templates/${templateId}`, data);
  }

  /**
   * Get report comments/reviews.
   * @param reportId The report ID.
   */
  async getReportComments(reportId: number): Promise<any[]> {
    return this.get(`${endpoints.reports.getById(reportId)}/comments`);
  }

  /**
   * Add comment to report.
   * @param reportId The report ID.
   * @param comment The comment text.
   */
  async addReportComment(reportId: number, comment: string): Promise<any> {
    return this.post(`${endpoints.reports.getById(reportId)}/comments`, { comment });
  }

  // /**
  //  * Upload attachment to report.
  //  * @param reportId The report ID.
  //  * @param file The file to upload.
  //  */
  // async uploadAttachment(reportId: number, file: File): Promise<{ url: string; filename: string }> {
  //   const formData = new FormData();
  //   formData.append('file', file);
    
  //   return this.post(`${endpoints.reports.getById(reportId)}/attachments`, formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' }
  //   });
  // }

  /**
   * Delete attachment from report.
   * @param reportId The report ID.
   * @param attachmentId The attachment ID.
   */
  async deleteAttachment(reportId: number, attachmentId: string): Promise<void> {
    return this.delete(`${endpoints.reports.getById(reportId)}/attachments/${attachmentId}`);
  }
}

export const reportService = new ReportService();