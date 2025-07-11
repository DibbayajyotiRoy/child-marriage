
import { useState, useEffect } from 'react';
import { Department, Person, Police, DICE, Issue, Team, Report } from '@/types';

// Mock data
const MOCK_DEPARTMENTS: Department[] = [
  { id: '1', name: 'Technical', description: 'IT and technical support', createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Support', description: 'Customer support team', createdAt: new Date('2024-01-01') },
  { id: '3', name: 'Field', description: 'Field operations team', createdAt: new Date('2024-01-01') },
];

const MOCK_PERSONS: Person[] = [
  { id: '2', name: 'John Doe', email: 'john@tech.com', role: 'person', departmentId: '1', departmentName: 'Technical', createdAt: new Date('2024-01-02') },
  { id: '6', name: 'Jane Smith', email: 'jane@support.com', role: 'person', departmentId: '2', departmentName: 'Support', createdAt: new Date('2024-01-03') },
  { id: '7', name: 'Bob Johnson', email: 'bob@field.com', role: 'person', departmentId: '3', departmentName: 'Field', createdAt: new Date('2024-01-04') },
];

const MOCK_POLICE: Police[] = [
  { id: '3', name: 'Officer Smith', email: 'smith@police.com', role: 'police', badgeNumber: 'P001', station: 'Central Station', createdAt: new Date('2024-01-05') },
  { id: '8', name: 'Officer Brown', email: 'brown@police.com', role: 'police', badgeNumber: 'P002', station: 'North Station', createdAt: new Date('2024-01-06') },
];

const MOCK_DICE: DICE[] = [
  { id: '4', name: 'Agent Johnson', email: 'johnson@dice.com', role: 'dice', agentId: 'D001', clearanceLevel: 'Level 3', createdAt: new Date('2024-01-07') },
  { id: '9', name: 'Agent Wilson', email: 'wilson@dice.com', role: 'dice', agentId: 'D002', clearanceLevel: 'Level 2', createdAt: new Date('2024-01-08') },
];

const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Network connectivity issues in Building A',
    description: 'Multiple users reporting intermittent network outages',
    status: 'active',
    priority: 'high',
    reportedBy: 'External User 1',
    reportedByEmail: 'user1@external.com',
    assignedTo: '2',
    departmentId: '1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    tags: ['network', 'infrastructure']
  },
  {
    id: '2',
    title: 'Login system malfunction',
    description: 'Users unable to login to the portal',
    status: 'pending',
    priority: 'critical',
    reportedBy: 'External User 2',
    reportedByEmail: 'user2@external.com',
    departmentId: '1',
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09'),
    tags: ['authentication', 'critical']
  },
  {
    id: '3',
    title: 'Data backup verification needed',
    description: 'Weekly backup verification process',
    status: 'resolved',
    priority: 'medium',
    reportedBy: 'External User 3',
    reportedByEmail: 'user3@external.com',
    assignedTo: '6',
    departmentId: '2',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-09'),
    resolvedAt: new Date('2024-01-09'),
    tags: ['backup', 'maintenance']
  }
];

const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Emergency Response Team',
    description: 'Handles critical and urgent issues',
    members: ['2', '6'],
    leaderId: '2',
    createdAt: new Date('2024-01-05')
  }
];

const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    issueId: '1',
    authorId: '2',
    authorName: 'John Doe',
    content: 'Investigation started. Network equipment being checked.',
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
