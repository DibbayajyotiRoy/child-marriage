
import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Person } from '@/types';

export interface CreatePersonRequest {
  name: string;
  email: string;
  departmentId: string;
}

export interface UpdatePersonRequest {
  name?: string;
  email?: string;
  departmentId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Person;
  token: string;
}

export class PersonService extends BaseApiService {
  async getById(id: string): Promise<Person> {
    return this.get<Person>(endpoints.persons.getById(id));
  }

  async getAll(): Promise<Person[]> {
    return this.get<Person[]>(endpoints.persons.getAll());
  }

  async create(request: CreatePersonRequest): Promise<Person> {
    return this.post<Person>(endpoints.persons.create(), request);
  }

  async update(id: string, request: UpdatePersonRequest): Promise<Person> {
    return this.put<Person>(endpoints.persons.update(id), request);
  }

  async delete(id: string): Promise<void> {
    return this.delete<void>(endpoints.persons.delete(id));
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>(endpoints.persons.login(), request);
  }
}

export const personService = new PersonService();
