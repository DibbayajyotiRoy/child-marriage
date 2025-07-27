// src/types/index.ts

// This represents the final, mapped structure our UI components will use.
export interface Case {
  id: string; 
  complainantName: string; // This will be mapped from caseDetails[0].girlName
  complainantPhone: string;
  caseAddress: string; // Mapped from caseDetails[0].girlAddress
  district: string; // Mapped from caseDetails[0].girlAddress
  description: string; // Mapped from multiple fields
  reportedAt: string;
  createdBy: string | null;
  status: 'REPORTED' | 'INVESTIGATING' | 'CLOSED' | 'active' | 'pending' | 'resolved';
  createdAt: string; 
  updatedAt: string;
  caseDetails: CaseDetail[]; // Keep the original details
}

// This represents the nested object from the API
export interface CaseDetail {
    id: string;
    caseId: string;
    createdAt: string;
    updatedAt: string;
    departmentMembers: { [key: string]: string[] } | {}; // Updated to match API
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

// This represents the final, mapped structure for a Person
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: string; // This will be mapped by matching officeName
  role: "MEMBER" | "SUPERVISOR" | "SUPERADMIN" | "SDM" | "DM" | "SP";
  address: string;
  gender: string;
  phoneNumber: string;
  officeName: string; // Keep original office name
  district: string;
}


export interface Department {
  id: string;
  name: string; // e.g., "Police", "DISE"
  district: string | null; // District is not in the API response for departments
}

export interface Post {
  id: string;
  postName: string;
  department: 'POLICE' | 'DICE' | 'ADMINISTRATION';
  rank: number;
}