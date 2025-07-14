// src/types.ts

export interface Case {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'resolved';
  createdBy: number;
  departmentId: number;
  finalReportSubmitted: boolean;
  createdAt: string;
}

export interface TeamFormation {
  id: number;
  caseId: number;
  createdBy: number;
  members: {
    personId: number;
    status: 'pending' | 'accepted' | 'rejected';
  }[];
  createdAt: string;
}

export interface Report {
  id: number;
  caseId: number;
  submittedBy: number;
  teamFormationId: number;
  content: string;
  submittedAt: string;
}

export interface Person {
  id: number;
  name: string;
  email: string;
  // Note: Password should generally not be sent to the client.
  password?: string;
  departmentId: number;
  role: 'superadmin' | 'person' | 'police';
}

export interface Department {
  id: number;
  name: string;
  district: string;
}

export interface Admin {
  id: number;
  email: string;
  password?: string;
}