import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { TeamFormation } from '@/types';

// Matches the 'teamFormations' table structure
export interface CreateTeamRequest {
  caseId: number;
  createdBy: number;
  members: {
    personId: number;
    status: 'pending' | 'accepted';
  }[];
}

export class TeamFormationService extends BaseApiService {
  async getByCaseId(caseId: number): Promise<TeamFormation[]> {
    // A case might have multiple team formations over time
    return this.get<TeamFormation[]>(endpoints.teamFormation.getByCaseId(caseId));
  }
  
  async createTeam(request: CreateTeamRequest): Promise<TeamFormation> {
    const newTeam = {
      ...request,
      createdAt: new Date().toISOString(),
    };
    return this.post<TeamFormation>(endpoints.teamFormation.create(), newTeam);
  }

  // To accept/reject, you must update the entire team formation object
  async updateMemberStatus(teamFormationId: number, personId: number, newStatus: 'accepted' | 'rejected'): Promise<TeamFormation> {
    // 1. Get the current team formation object
    const team = await this.get<TeamFormation>(endpoints.teamFormation.getById(teamFormationId));
    
    // 2. Find and update the member
    const member = team.members.find(m => m.personId === personId);
    if (member) {
      member.status = newStatus;
    }

    // 3. PUT the entire updated object back
    return this.put<TeamFormation>(endpoints.teamFormation.update(teamFormationId), team);
  }
}

export const teamFormationService = new TeamFormationService();