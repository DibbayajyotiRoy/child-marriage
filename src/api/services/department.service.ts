import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Department, Person } from '@/types';

// For `json-server` embedding
export interface DepartmentWithPersons extends Department {
  persons: Person[];
}

export class DepartmentService extends BaseApiService {
  async getAll(): Promise<Department[]> {
    return this.get<Department[]>(endpoints.departments.getAll());
  }

  async getByDistrict(districtName: string): Promise<Department[]> {
    return this.get<Department[]>(endpoints.departments.getByDistrict(districtName));
  }
  
  // Example of using _embed to get department with its people
  async getDepartmentWithPersons(departmentId: number): Promise<DepartmentWithPersons> {
    const url = `${endpoints.departments.getById(departmentId)}?_embed=persons`;
    return this.get<DepartmentWithPersons>(url);
  }
  
  // Add other CRUD operations as needed
  async create(request: { name: string; district: string }): Promise<Department> {
    return this.post<Department>(endpoints.departments.create(), request);
  }
}

export const departmentService = new DepartmentService();