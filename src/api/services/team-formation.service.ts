import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { TeamFormation } from '@/types';

export class TeamFormationService extends BaseApiService {
  /**
   * ✅ FIXED: The backend does not have an endpoint to get all team formations.
   * This method returns an empty array to prevent 404 errors on app startup.
   */
  async getAll(): Promise<TeamFormation[]> {
    console.warn("[TeamFormationService] The 'getAll' method was called, but the backend endpoint 'GET /api/team-formations' does not exist. Returning an empty array.");
    return Promise.resolve([]);
  }

  /**
   * Retrieves the team formation for a specific case by its UUID.
   * @param caseId The unique UUID (string) of the case.
   */
  async getByCaseId(caseId: string): Promise<TeamFormation> {
    return this.get<TeamFormation>(endpoints.teamFormation.getByCaseId(caseId));
  }
}

export const teamFormationService = new TeamFormationService();