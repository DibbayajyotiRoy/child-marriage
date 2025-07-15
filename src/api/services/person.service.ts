import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Person } from '@/types';

export interface CreatePersonRequest {
  name: string;
  email: string;
  password: string; // Password should be sent on creation
  departmentId: number;
  role: 'person' | 'police';
  phoneNumber?: string;
  position?: string;
  address?: string;
}

export interface UpdatePersonRequest {
  name?: string;
  email?: string;
  departmentId?: number;
  role?: 'person' | 'police';
  phoneNumber?: string;
  position?: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  person: Person;
  token: string;
  expiresIn: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

// Spring Boot authentication service
export class PersonService extends BaseApiService {
  /**
   * Authenticate user with Spring Boot backend
   * Note: This assumes your Spring Boot app has proper authentication endpoints
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    // For Spring Boot, you would typically have a dedicated auth endpoint
    return this.post<LoginResponse>(endpoints.auth.login(), request);
  }

  /**
   * Logout user (if you have session management)
   */
  async logout(): Promise<void> {
    return this.post<void>(endpoints.auth.logout(), {});
  }

  /**
   * Register a new user
   */
  async register(request: CreatePersonRequest): Promise<Person> {
    return this.post<Person>(endpoints.auth.register(), request);
  }

  /**
   * Change user password
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    return this.put<void>(`${endpoints.persons.getAll()}/change-password`, request);
  }

  /**
   * Reset password request
   */
  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    return this.post<void>(`${endpoints.persons.getAll()}/reset-password`, request);
  }

  /**
   * Get current user profile (requires authentication)
   */
  async getCurrentUser(): Promise<Person> {
    return this.get<Person>(`${endpoints.persons.getAll()}/me`);
  }

  /**
   * Update current user profile
   */
  async updateProfile(request: UpdatePersonRequest): Promise<Person> {
    return this.put<Person>(`${endpoints.persons.getAll()}/me`, request);
  }

  // Standard CRUD operations
  async getAll(): Promise<Person[]> {
    return this.get<Person[]>(endpoints.persons.getAll());
  }

  async getById(id: number): Promise<Person> {
    return this.get<Person>(endpoints.persons.getById(id));
  }

  async create(request: CreatePersonRequest): Promise<Person> {
    return this.post<Person>(endpoints.persons.create(), request);
  }

  async update(id: number, request: UpdatePersonRequest): Promise<Person> {
    return this.put<Person>(endpoints.persons.update(id), request);
  }

  async deletePerson(id: number): Promise<void> {
    return this.delete<void>(endpoints.persons.delete(id));
  }

  // Additional filtering and search methods
  async getByDepartment(departmentId: number): Promise<Person[]> {
    return this.get<Person[]>(`${endpoints.persons.getAll()}?departmentId=${departmentId}`);
  }

  async getByRole(role: 'person' | 'police'): Promise<Person[]> {
    return this.get<Person[]>(`${endpoints.persons.getAll()}?role=${role}`);
  }

  async searchPersons(query: string): Promise<Person[]> {
    return this.get<Person[]>(`${endpoints.persons.getAll()}?search=${encodeURIComponent(query)}`);
  }

  /**
   * Get persons with pagination (Spring Boot style)
   */
  async getPersonsPaginated(page: number = 0, size: number = 10, sort?: string): Promise<{
    content: Person[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    let url = `${endpoints.persons.getAll()}?page=${page}&size=${size}`;
    if (sort) {
      url += `&sort=${sort}`;
    }
    return this.get(url);
  }

  /**
   * Get persons by department with pagination
   */
  async getPersonsByDepartmentPaginated(
    departmentId: number,
    page: number = 0,
    size: number = 10
  ): Promise<{
    content: Person[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return this.get(`${endpoints.persons.getAll()}?departmentId=${departmentId}&page=${page}&size=${size}`);
  }

  /**
   * Get persons by role with pagination
   */
  async getPersonsByRolePaginated(
    role: 'person' | 'police',
    page: number = 0,
    size: number = 10
  ): Promise<{
    content: Person[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return this.get(`${endpoints.persons.getAll()}?role=${role}&page=${page}&size=${size}`);
  }

  /**
   * Activate/Deactivate user account
   */
  async toggleUserStatus(id: number, active: boolean): Promise<Person> {
    return this.put<Person>(`${endpoints.persons.getById(id)}/status`, { active });
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    usersByRole: { [role: string]: number };
    usersByDepartment: { [departmentId: string]: number };
    activeUsers: number;
  }> {
    return this.get(`${endpoints.persons.getAll()}/stats`);
  }

  /**
   * Bulk import users
   */
  async bulkImport(users: CreatePersonRequest[]): Promise<Person[]> {
    return this.post<Person[]>(`${endpoints.persons.getAll()}/bulk-import`, { users });
  }

  // /**
  //  * Export users to CSV
  //  */
  // async exportUsers(departmentId?: number): Promise<Blob> {
  //   let url = `${endpoints.persons.getAll()}/export`;
  //   if (departmentId) {
  //     url += `?departmentId=${departmentId}`;
  //   }
  //   return this.get<Blob>(url, { responseType: 'blob' });
  // }
}

export const personService = new PersonService();