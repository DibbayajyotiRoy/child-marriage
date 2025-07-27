// src/types/index.ts

export interface Case {
  id: string;
  complainantName: string;
  complainantPhone: string;
  caseAddress: string;
  district: string;
  description: string;
  reportedAt: string;
  createdBy: string | null;
  status: 'REPORTED' | 'INVESTIGATING' | 'CLOSED' | 'active' | 'pending' | 'resolved';
  createdAt: string;
  updatedAt: string;
  caseDetails: CaseDetail[];
}

export interface CaseDetail {
  id: string;
  caseId: string;
  notes: string | null;
  evidencePath: string | null;
  createdAt: string;
  updatedAt: string;
  departmentMembers: Record<string, any>; // Assuming this is an object
  supervisorId: string;
  marriageDate: string;
  boyName: string;
  boyFatherName: string;
  boyAddress: string;
  girlName: string;
  girlFatherName: string;
  girlAddress: string;
  girlSubdivision: string;
  teamId: string;
  marriageAddress: string;
}

export interface TeamFormation {
  team_id: string;
  case_id: string;
  supervisor_id: string;
  member_ids: string[];
  formed_at?: string;
}

export interface Report {
  id: number;
  caseId: string;
  personId: string;
  content: string;
  submittedAt: string;
  sdmFeedback?: string;
}

// This now reflects the backend structure
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: string; // We will try to populate this
  role: "MEMBER" | "SUPERVISOR" | "SUPERADMIN" | "SDM" | "DM" | "SP";
  address: string;
  gender: string;
  phoneNumber: string;
  // New fields from the API response
  officeName: string; 
  district: string;
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