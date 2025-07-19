// src/types.ts

export interface Case {
  id: string; 
  title: string;
  description: string;
  status: 'active' | 'pending' | 'resolved';
  createdBy: string; 
  departmentId: string; 
  finalReportSubmitted: boolean;
  createdAt?: string; 
  updatedAt?: string;
}

export interface TeamFormation {
  team_id: string; 
  case_id: string; 
  supervisor_id: string;
  member_ids: string[];
  admin_status?: string;
  police_status?: string;
  dice_status?: string;
  response_status?: string;
  formed_at?: string;
}

export interface Report {
  id: number; 
  caseId: string; 
  personId: string;
  content: string;
  submittedAt: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  departmentId?: string;
  // ✅ FIXED: Role now includes 'SUPERADMIN' to match all possible user types.
  role?: 'MEMBER' | 'SUPERVISOR' | 'SUPERADMIN';
}

export interface Department {
  id: string;
  name: string;
  district: string;
}

export interface Post {
  id: string;
  postName: string;
  department: 'POLICE' | 'DICE' | 'ADMINISTRATION';
  rank: number;
}