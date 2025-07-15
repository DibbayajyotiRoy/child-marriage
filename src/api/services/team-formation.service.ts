import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { TeamFormation } from '@/types';

// Matches the 'teamFormations' table structure in db.json
export interface CreateTeamRequest {
  caseId: number;
  createdBy: number;
  members: {
    personId: number;
    status: 'pending' | 'accepted';
  }[];
}

export interface TeamFormationResponse {
  personId: number;
  status: 'accepted' | 'rejected';
  responseDate?: string;
  comments?: string;
}

export class TeamFormationService extends BaseApiService {
  /**
   * Retrieves all team formations from the API.
   * Assumes an endpoint like GET /teamFormations exists.
   */
  async getAll(): Promise<TeamFormation[]> {
    return this.get<TeamFormation[]>(endpoints.teamFormation.getAll());
  }
  
  /**
   * Retrieves a single team formation by its unique ID.
   * @param id The unique ID of the team formation.
   */
  async getById(id: number): Promise<TeamFormation> {
    return this.get<TeamFormation>(endpoints.teamFormation.getById(id));
  }

  /**
   * Retrieves all team formations associated with a specific case ID.
   * Uses query parameter to filter by caseId.
   * @param caseId The unique ID of the case.
   */
  async getByCaseId(caseId: number): Promise<TeamFormation[]> {
    return this.get<TeamFormation[]>(`${endpoints.teamFormation.getAll()}?caseId=${caseId}`);
  }
  
  /**
   * Creates a new team formation for a case.
   * @param request The data for the new team.
   */
  async createTeam(request: CreateTeamRequest): Promise<TeamFormation> {
    const newTeam = {
      ...request,
      createdAt: new Date().toISOString(),
    };
    return this.post<TeamFormation>(endpoints.teamFormation.create(), newTeam);
  }

  /**
   * Updates an existing team formation.
   * @param id The ID of the team formation to update.
   * @param teamData The updated team formation data.
   */
  async updateTeam(id: number, teamData: Partial<TeamFormation>): Promise<TeamFormation> {
    return this.put<TeamFormation>(endpoints.teamFormation.update(id), teamData);
  }

  /**
   * Submits a response to a team formation (accept/reject invitation).
   * This uses the specific submitResponse endpoint.
   * @param teamFormationId The ID of the team formation.
   * @param response The response data.
   */
  async submitResponse(teamFormationId: number, response: TeamFormationResponse): Promise<TeamFormation> {
    return this.post<TeamFormation>(endpoints.teamFormation.submitResponse(teamFormationId), response);
  }

  /**
   * Updates the status of a member within a team formation (e.g., 'accepted' or 'rejected').
   * This method provides a simpler interface for updating member status.
   * @param teamFormationId The ID of the team formation to update.
   * @param personId The ID of the person whose status is changing.
   * @param newStatus The new status for the person.
   */
  async updateMemberStatus(teamFormationId: number, personId: number, newStatus: 'accepted' | 'rejected'): Promise<TeamFormation> {
    // Use the submitResponse endpoint for cleaner API interaction
    return this.submitResponse(teamFormationId, {
      personId,
      status: newStatus,
      responseDate: new Date().toISOString(),
    });
  }

  /**
   * Alternative method to update member status by fetching and updating the entire team.
   * Use this if the backend doesn't support the submitResponse endpoint properly.
   * @param teamFormationId The ID of the team formation to update.
   * @param personId The ID of the person whose status is changing.
   * @param newStatus The new status for the person.
   */
  async updateMemberStatusDirect(teamFormationId: number, personId: number, newStatus: 'accepted' | 'rejected'): Promise<TeamFormation> {
    // 1. Get the current team formation object
    const team = await this.getById(teamFormationId);
    
    // 2. Find and update the member in the array
    const memberIndex = team.members.findIndex(m => m.personId === personId);
    if (memberIndex !== -1) {
      team.members[memberIndex].status = newStatus;
    } else {
      // Handle case where member is not found
      throw new Error(`Member with personId ${personId} not found in team ${teamFormationId}`);
    }

    // 3. PUT the entire updated object back to the server
    return this.put<TeamFormation>(endpoints.teamFormation.update(teamFormationId), team);
  }

  /**
   * Get all team formations created by a specific person.
   * @param createdBy The ID of the person who created the teams.
   */
  async getByCreator(createdBy: number): Promise<TeamFormation[]> {
    return this.get<TeamFormation[]>(`${endpoints.teamFormation.getAll()}?createdBy=${createdBy}`);
  }

  /**
   * Get all team formations where a specific person is a member.
   * @param personId The ID of the person.
   */
  async getByMember(personId: number): Promise<TeamFormation[]> {
    return this.get<TeamFormation[]>(`${endpoints.teamFormation.getAll()}?memberId=${personId}`);
  }
}

export const teamFormationService = new TeamFormationService();