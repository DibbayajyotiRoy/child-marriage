export interface Department {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  role: 'person';
  departmentId: string;
  departmentName: string;
  createdAt: Date;
}

export interface Police {
  id: string;
  name: string;
  email: string;
  role: 'police';
  badgeNumber: string;
  station: string;
  createdAt: Date;
}

export interface DICE {
  id: string;
  name: string;
  email: string;
  role: 'dice';
  agentId: string;
  clearanceLevel: string;
  createdAt: Date;
}

export type IssueStatus = 'active' | 'pending' | 'resolved';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type UrgencyLevel = 'immediate' | 'urgent' | 'normal';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  urgencyLevel: UrgencyLevel;
  reportedBy: string;
  reportedByEmail: string;
  assignedTo?: string;
  assignedTeam?: string;
  departmentId?: string;
  location: string;
  victimAge?: number;
  suspectedGroomAge?: number;
  familyInvolved: boolean;
  witnessesAvailable: boolean;
  evidenceDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  tags: string[];
  
  // Child marriage specific fields
  marriageScheduledDate?: Date;
  interventionRequired: boolean;
  lawEnforcementNotified: boolean;
  socialWorkerAssigned?: string;
  courtOrderRequired: boolean;
  rescueOperationNeeded: boolean;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[]; // Person IDs
  leaderId: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}
