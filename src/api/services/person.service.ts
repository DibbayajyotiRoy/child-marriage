import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Person } from '@/types';

export interface CreatePersonRequest {
  name: string;
  email: string;
  password: string; // Password should be sent on creation
  departmentId: number;
  role: 'person' | 'police';
}

export interface UpdatePersonRequest {
  name?: string;
  email?: string;
  departmentId?: number;
  role?: 'person' | 'police';
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Login logic for a simple json-server
export class PersonService extends BaseApiService {
  async login(request: LoginRequest): Promise<Person | null> {
    // 1. Fetch user by email
    const users = await this.get<Person[]>(endpoints.persons.getByEmail(request.email));
    const user = users[0]; // Email should be unique

    // 2. Check if user exists and password matches
    if (user && user.password === request.password) {
      delete user.password; // Don't keep password in the client-side object
      return user;
    }
    
    return null; // Login failed
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
}

export const personService = new PersonService();