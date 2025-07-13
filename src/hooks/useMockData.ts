
import { useState, useEffect } from 'react';
import { Department, Person, Police, DICE, Issue, Team, Report } from '@/types';

// Mock data
const MOCK_DEPARTMENTS: Department[] = [
  { id: '1', name: 'Social Services', description: 'Child protection and social welfare', createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Legal Aid', description: 'Legal support and court proceedings', createdAt: new Date('2024-01-01') },
  { id: '3', name: 'Field Operations', description: 'Ground intervention and rescue operations', createdAt: new Date('2024-01-01') },
];

const MOCK_PERSONS: Person[] = [
  { id: '2', name: 'Sarah Ahmed', email: 'sarah@social.gov', role: 'person', departmentId: '1', departmentName: 'Social Services', createdAt: new Date('2024-01-02') },
  { id: '6', name: 'Priya Sharma', email: 'priya@legal.gov', role: 'person', departmentId: '2', departmentName: 'Legal Aid', createdAt: new Date('2024-01-03') },
  { id: '7', name: 'Rahul Singh', email: 'rahul@field.gov', role: 'person', departmentId: '3', departmentName: 'Field Operations', createdAt: new Date('2024-01-04') },
];

const MOCK_POLICE: Police[] = [
  { id: '3', name: 'Inspector Meera', email: 'meera@police.gov', role: 'police', badgeNumber: 'P001', station: 'Women Protection Unit', createdAt: new Date('2024-01-05') },
  { id: '8', name: 'Sub-Inspector Kumar', email: 'kumar@police.gov', role: 'police', badgeNumber: 'P002', station: 'Child Protection Cell', createdAt: new Date('2024-01-06') },
];

const MOCK_DICE: DICE[] = [
  { id: '4', name: 'Agent Lakshmi', email: 'lakshmi@dice.gov', role: 'dice', agentId: 'D001', clearanceLevel: 'Level 3', createdAt: new Date('2024-01-07') },
  { id: '9', name: 'Agent Vikram', email: 'vikram@dice.gov', role: 'dice', agentId: 'D002', clearanceLevel: 'Level 2', createdAt: new Date('2024-01-08') },
];

const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Urgent: 14-year-old girl to be married in 3 days',
    description: 'Anonymous tip about forced child marriage in rural village. Family planning to marry minor girl to 35-year-old man.',
    status: 'active',
    priority: 'critical',
    urgencyLevel: 'immediate',
    reportedBy: 'Anonymous Caller',
    reportedByEmail: 'anonymous@helpline.gov',
    assignedTo: '2',
    departmentId: '1',
    location: 'Village Rampur, District Hardoi',
    victimAge: 14,
    suspectedGroomAge: 35,
    familyInvolved: true,
    witnessesAvailable: true,
    evidenceDescription: 'Wedding preparations visible, invitation cards printed',
    marriageScheduledDate: new Date('2024-01-13'),
    interventionRequired: true,
    lawEnforcementNotified: true,
    socialWorkerAssigned: '2',
    courtOrderRequired: true,
    rescueOperationNeeded: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    tags: ['urgent', 'rescue-needed', 'court-order', 'minor-victim']
  },
  {
    id: '2',
    title: '12-year-old married off last month - seeking justice',
    description: 'Report of child marriage that already occurred. Victim now pregnant and seeking help to escape.',
    status: 'pending',
    priority: 'high',
    urgencyLevel: 'urgent',
    reportedBy: 'NGO Worker Sunita',
    reportedByEmail: 'sunita@childaid.org',
    departmentId: '2',
    location: 'Slum Area, Ghaziabad',
    victimAge: 12,
    suspectedGroomAge: 28,
    familyInvolved: true,
    witnessesAvailable: false,
    evidenceDescription: 'Marriage certificate found, victim currently pregnant',
    interventionRequired: true,
    lawEnforcementNotified: false,
    courtOrderRequired: true,
    rescueOperationNeeded: true,
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09'),
    tags: ['already-married', 'pregnant-victim', 'legal-action', 'rescue-needed']
  },
  {
    id: '3',
    title: 'Prevented child marriage through community intervention',
    description: 'Successfully prevented marriage of 15-year-old girl through family counseling and legal awareness.',
    status: 'resolved',
    priority: 'medium',
    urgencyLevel: 'normal',
    reportedBy: 'Community Leader Rajesh',
    reportedByEmail: 'rajesh@community.org',
    assignedTo: '6',
    departmentId: '1',
    location: 'Village Khatoli, Muzaffarnagar',
    victimAge: 15,
    suspectedGroomAge: 32,
    familyInvolved: true,
    witnessesAvailable: true,
    evidenceDescription: 'Family agreed to cancel marriage, girl enrolled in school',
    interventionRequired: false,
    lawEnforcementNotified: false,
    courtOrderRequired: false,
    rescueOperationNeeded: false,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-09'),
    resolvedAt: new Date('2024-01-09'),
    tags: ['prevention-success', 'family-counseling', 'education', 'community-support']
  }
];

const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Emergency Child Protection Team',
    description: 'Rapid response team for critical child marriage cases',
    members: ['2', '6', '3'],
    leaderId: '2',
    createdAt: new Date('2024-01-05')
  }
];

const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    issueId: '1',
    authorId: '2',
    authorName: 'Sarah Ahmed',
    content: 'Initial assessment completed. Family contacted and informed about legal consequences. Court order application filed.',
    createdAt: new Date('2024-01-10')
  }
];

export function useMockData() {
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [persons, setPersons] = useState<Person[]>(MOCK_PERSONS);
  const [police, setPolice] = useState<Police[]>(MOCK_POLICE);
  const [dice, setDice] = useState<DICE[]>(MOCK_DICE);
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);

  return {
    departments,
    setDepartments,
    persons,
    setPersons,
    police,
    setPolice,
    dice,
    setDice,
    issues,
    setIssues,
    teams,
    setTeams,
    reports,
    setReports
  };
}
