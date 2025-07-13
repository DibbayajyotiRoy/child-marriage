
import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Team } from '@/types';

export interface TeamFormationRequest {
  caseId: string;
  memberIds: string[];
  leaderId: string;
  isAutomatic?: boolean;
}

export interface TeamResponse {
  teamId: string;
  memberId: string;
  response: 'accepted' | 'rejected';
  reason?: string;
}

export class TeamFormationService extends BaseApiService {
  async getById(id: string): Promise<Team> {
    return this.get<Team>(endpoints.teamFormation.getById(id));
  }

  async getByCaseId(caseId: string): Promise<Team> {
    return this.get<Team>(endpoints.teamFormation.getByCaseId(caseId));
  }

  async createTeam(request: TeamFormationRequest): Promise<Team> {
    return this.post<Team>(endpoints.teamFormation.create(), request);
  }

  async respondToTeamInvitation(id: string, response: TeamResponse): Promise<void> {
    return this.put<void>(endpoints.teamFormation.updateResponse(id), response);
  }

  async getPendingResponses(): Promise<TeamResponse[]> {
    return this.get<TeamResponse[]>(endpoints.teamFormation.getPendingResponses());
  }

  async createAutomaticTeam(caseId: string): Promise<Team> {
    return this.post<Team>(endpoints.teamFormation.create(), {
      caseId,
      isAutomatic: true,
    });
  }
}

export const teamFormationService = new TeamFormationService();
