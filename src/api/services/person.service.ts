import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Person } from '@/types';

// ✅ FIXED: This interface now matches your backend PersonRequestDTO exactly.
export interface CreatePersonRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  departmentId: string; // This will be mapped to a Department object on the backend
  role: 'MEMBER' | 'SUPERVISOR';
  address: string;
  gender: string;
  phoneNumber: string;
  // Optional fields
  district?: string;
  designation?: string;
  officeName?: string;
  status?: string;
  subdivision?: string;
  rank?: number;
}

export interface UpdatePersonRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: string;
  role?: 'MEMBER' | 'SUPERVISOR';
  address?: string;
  phoneNumber?: string;
}

export class PersonService extends BaseApiService {
  async getAll(): Promise<Person[]> {
    return this.get<Person[]>(endpoints.persons.getAll());
  }

  async getById(id: string): Promise<Person> {
    return this.get<Person>(endpoints.persons.getById(id));
  }

  async create(request: CreatePersonRequest): Promise<Person> {
    return this.post<Person>(endpoints.persons.create(), request);
  }

  async update(id: string, request: UpdatePersonRequest): Promise<Person> {
    return this.put<Person>(endpoints.persons.update(id), request);
  }

  async deletePerson(id: string): Promise<void> {
    return this.delete<void>(endpoints.persons.delete(id));
  }
}

export const personService = new PersonService();