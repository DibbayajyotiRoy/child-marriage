import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Department } from '@/types';

export interface CreateDepartmentRequest {
  name: string;
  district: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  district?: string;
}

export class DepartmentService extends BaseApiService {
  /**
   * ✅ FINAL FIX: Restored the real API call. The dashboard will now try to fetch
   * the real list of departments. If the backend endpoint is still broken,
   * the `.catch()` block in the UI component will handle it gracefully.
   */
  async getAll(): Promise<Department[]> {
    return this.get<Department[]>(endpoints.departments.getAll());
  }

  /**
   * Retrieves a single department by its UUID.
   * @param id The unique UUID (string) of the department.
   */
  async getById(id: string): Promise<Department> {
    return this.get<Department>(endpoints.departments.getById(id));
  }
  
  /**
   * Creates a new department.
   */
  async create(request: CreateDepartmentRequest): Promise<Department> {
    return this.post<Department>(endpoints.departments.create(), request);
  }

  /**
   * Updates an existing department by its UUID.
   * @param id The unique UUID (string) of the department.
   */
  async update(id: string, request: UpdateDepartmentRequest): Promise<Department> {
    return this.put<Department>(endpoints.departments.update(id), request);
  }

  /**
   * Deletes a department by its UUID.
   * @param id The unique UUID (string) of the department.
   */
  async deleteDepartment(id: string): Promise<void> {
    return this.delete<void>(endpoints.departments.delete(id));
  }
}

export const departmentService = new DepartmentService();