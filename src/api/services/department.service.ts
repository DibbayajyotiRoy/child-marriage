import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Department, Person } from '@/types';

// Interface for creating a new department
export interface CreateDepartmentRequest {
  name: string;
  district: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// Interface for updating a department
export interface UpdateDepartmentRequest {
  name?: string;
  district?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// For Spring Boot response that includes persons
export interface DepartmentWithPersons extends Department {
  persons: Person[];
}

export class DepartmentService extends BaseApiService {
  /**
   * Retrieves all departments from the API.
   */
  async getAll(): Promise<Department[]> {
    return this.get<Department[]>(endpoints.departments.getAll());
  }

  /**
   * Retrieves a single department by its ID.
   * @param id The unique ID of the department.
   */
  async getById(id: number): Promise<Department> {
    return this.get<Department>(endpoints.departments.getById(id));
  }

  /**
   * Retrieves all departments located in a specific district.
   * Note: This uses query parameters - your Spring Boot backend should support filtering
   * @param districtName The name of the district to filter by.
   */
  async getByDistrict(districtName: string): Promise<Department[]> {
    return this.get<Department[]>(`${endpoints.departments.getAll()}?district=${encodeURIComponent(districtName)}`);
  }
  
  /**
   * Retrieves a single department along with all persons associated with it.
   * Note: This assumes your Spring Boot backend has an endpoint that returns department with persons
   * @param departmentId The unique ID of the department.
   */
  async getDepartmentWithPersons(departmentId: number): Promise<DepartmentWithPersons> {
    // For Spring Boot, you might have a specific endpoint like /api/departments/{id}/with-persons
    // or use query parameters
    const url = `${endpoints.departments.getById(departmentId)}?include=persons`;
    return this.get<DepartmentWithPersons>(url);
  }

  /**
   * Alternative method to get persons in a department
   * @param departmentId The unique ID of the department.
   */
  async getPersonsInDepartment(departmentId: number): Promise<Person[]> {
    return this.get<Person[]>(`${endpoints.departments.getById(departmentId)}/persons`);
  }
  
  /**
   * Creates a new department.
   * @param request The data for the new department.
   */
  async create(request: CreateDepartmentRequest): Promise<Department> {
    return this.post<Department>(endpoints.departments.create(), request);
  }

  /**
   * Updates an existing department.
   * @param id The unique ID of the department to update.
   * @param request The updated data for the department.
   */
  async update(id: number, request: UpdateDepartmentRequest): Promise<Department> {
    return this.put<Department>(endpoints.departments.update(id), request);
  }

  /**
   * Deletes a department by its unique ID.
   * @param id The unique ID of the department to delete.
   */
  async deleteDepartment(id: number): Promise<void> {
    return this.delete<void>(endpoints.departments.delete(id));
  }

  /**
   * Search departments by name or district
   * @param query The search query
   */
  async searchDepartments(query: string): Promise<Department[]> {
    return this.get<Department[]>(`${endpoints.departments.getAll()}?search=${encodeURIComponent(query)}`);
  }

  /**
   * Get departments with pagination
   * @param page Page number (0-based for Spring Boot)
   * @param size Number of items per page
   * @param sort Optional sort parameter (e.g., "name,asc")
   */
  async getDepartmentsPaginated(page: number = 0, size: number = 10, sort?: string): Promise<{
    content: Department[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    let url = `${endpoints.departments.getAll()}?page=${page}&size=${size}`;
    if (sort) {
      url += `&sort=${sort}`;
    }
    return this.get(url);
  }

  /**
   * Get all districts (unique list)
   */
  async getAllDistricts(): Promise<string[]> {
    return this.get<string[]>(`${endpoints.departments.getAll()}/districts`);
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats(): Promise<{
    totalDepartments: number;
    departmentsByDistrict: { [district: string]: number };
    totalPersons: number;
  }> {
    return this.get(`${endpoints.departments.getAll()}/stats`);
  }
}

export const departmentService = new DepartmentService();