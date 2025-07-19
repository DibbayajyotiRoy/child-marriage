import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Person } from '@/types';

// Matches PersonRequestDTO
export interface CreatePersonRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  departmentId: string; // departmentId is a UUID string
  role: 'MEMBER' | 'SUPERVISOR';
}

// Matches PersonRequestDTO for updates
export interface UpdatePersonRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: string;
  role?: 'MEMBER' | 'SUPERVISOR';
}

export class PersonService extends BaseApiService {
  /**
   * Retrieves all persons from the API.
   */
  async getAll(): Promise<Person[]> {
    return this.get<Person[]>(endpoints.persons.getAll());
  }

  /**
   * Retrieves a single person by their UUID.
   * @param id The unique UUID (string) of the person.
   */
  async getById(id: string): Promise<Person> {
    return this.get<Person>(endpoints.persons.getById(id));
  }

  /**
   * Creates a new person.
   */
  async create(request: CreatePersonRequest): Promise<Person> {
    return this.post<Person>(endpoints.persons.create(), request);
  }

  /**
   * Updates a person by their UUID.
   * @param id The unique UUID (string) of the person.
   */
  async update(id: string, request: UpdatePersonRequest): Promise<Person> {
    return this.put<Person>(endpoints.persons.update(id), request);
  }

  /**
   * Deletes a person by their UUID.
   * @param id The unique UUID (string) of the person.
   */
  async deletePerson(id: string): Promise<void> {
    return this.delete<void>(endpoints.persons.delete(id));
  }
}

export const personService = new PersonService();