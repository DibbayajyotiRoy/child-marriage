// src/types.ts


export interface Case {
  id: string; 
  complainantName: string;
  complainantPhone: string;
  caseAddress: string;
  district: string;
  state: string;
  description: string;
  reportedAt: string;
  createdBy: string; 
  status: 'REPORTED' | 'INVESTIGATING' | 'CLOSED' | 'active' | 'pending' | 'resolved'; // Include all possible statuses
  createdAt: string; 
  updatedAt: string;
  // This represents the nested details object
  caseDetails: CaseDetail[];
}

export interface CaseDetail {
    id: string;
    caseId: string;
    notes: string;
    evidencePath: string;
    createdAt: string;
    updatedAt: string;
    policeMembers: string[];
    diceMembers: string[];
    adminMembers: string[];
    supervisorId: string;
    marriageDate: string;
    boyName: string;
    boyFatherName: string;
    boyAddress: string;
    boyAge: number;
    girlName: string;
    girlFatherName: string;
    girlAge: number;
    girlAddress: string;
    girlVillage: string;
    girlPoliceStation: string;
    girlPostOffice: string;
    girlSubdivision: string;
    girlDistrict: string;
    teamId: string;
    marriageAddress: string;
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
  sdmFeedback?: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: string;
  role: "MEMBER" | "SUPERADMIN" | "SDM" | "DM" | "SP";
  address: string;
  gender: string;
  phoneNumber: string;
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