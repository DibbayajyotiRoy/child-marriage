
import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Department, Person } from '@/types';

export interface DepartmentWithEmployees extends Department {
  employees: Person[];
}

export class DepartmentService extends BaseApiService {
  async getByDistrict(districtName: string): Promise<DepartmentWithEmployees[]> {
    return this.get<DepartmentWithEmployees[]>(endpoints.departments.getByDistrict(districtName));
  }
}

export const departmentService = new DepartmentService();
