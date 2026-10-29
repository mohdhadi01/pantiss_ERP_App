export type Approval = 'Pending' | 'Approved' | 'Rejected';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  areaId: string;
  designationId: string;
  joiningDate: string;
  status: 'Active' | 'Onboarding';
  loginId?: string;
  annualSalary?: number;
}

export interface Designation {
  id: string;
  areaId: string;
  title: string;
  level: string;
  description: string;
}

export interface Assignment {
  employeeId: string;
  projectId: string;
  centerId: string;
  startDate: string;
}

export interface Assessment {
  employeeId: string;
  year: string;
  scores: Record<string, number>;
  notes: string;
  reviewer: string;
  updatedAt: string;
}

export interface Appraisal {
  employeeId: string;
  year: string;
  assessmentUpdatedAt: string;
  rating: number;
  notes: string;
  reviewer: string;
  completedAt: string;
  incrementPercent?: number;
  previousAnnualSalary?: number;
  revisedAnnualSalary?: number;
}

export interface LeaveDecision {
  status: 'Approved' | 'Rejected';
  reason: string;
  actor: string;
  at: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: string;
  start: string;
  end: string;
  days: number;
  balance: number;
  reason: string;
  adminStatus: Approval;
  adminBy?: string;
  adminAt?: string;
  adminNote?: string;
}

export interface Punch {
  time: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  photoUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  punchIn?: Punch;
  punchOut?: Punch;
  source: string;
}

export type CandidateStage =
  | 'Applied'
  | 'Screening'
  | 'Interview Scheduled'
  | 'Technical Round'
  | 'HR Round'
  | 'Selected'
  | 'Offer Released'
  | 'Offer Accepted'
  | 'Rejected'
  | 'Onboarded';

export interface JobPosting {
  id: string;
  title: string;
  areaId: string;
  department: string;
  location: string;
  experience: string;
  openings: number;
  minSalary: number;
  maxSalary: number;
  status: 'Active' | 'Draft' | 'Closed';
  postedDate: string;
  closingDate: string;
  description: string;
  requirements: string[];
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  currentCompany?: string;
  experienceYears: number;
  currentSalary?: number;
  expectedSalary: number;
  noticePeriod: string;
  stage: CandidateStage;
  rating?: number;
  appliedDate: string;
  notes?: string;
  resumeSummary?: string;
}

export type InterviewRound =
  | 'Initial Screening'
  | 'Technical Assessment'
  | 'Thematic Panel'
  | 'HR & Cultural Fit'
  | 'Final Leadership';

export type InterviewMode = 'Google Meet' | 'In-Person (HQ)' | 'Phone Screen' | 'Microsoft Teams';

export interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  round: InterviewRound;
  scheduledAt: string;
  durationMinutes: number;
  interviewer: string;
  mode: InterviewMode;
  meetLink?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  feedback?: string;
  rating?: number;
  recommendation?: 'Advance to Next Round' | 'Select for Offer' | 'Hold' | 'Reject';
}

export type OfferStatus = 'Draft' | 'Released' | 'Accepted' | 'Declined' | 'Onboarded';

export interface OfferLetter {
  id: string;
  candidateId: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  designationTitle: string;
  areaId: string;
  joiningDate: string;
  annualSalary: number;
  monthlySalary: number;
  basicHra: number;
  allowance: number;
  expiryDate: string;
  status: OfferStatus;
  releasedAt: string;
  releasedBy: string;
  termsNotes?: string;
}

export interface HRState {
  employees: Employee[];
  designations: Designation[];
  assignments: Assignment[];
  assessments: Assessment[];
  appraisals: Appraisal[];
  leaveDecisions: Record<string, LeaveDecision>;
  attendance: AttendanceRecord[];
  attendanceImportedAt?: string;
  jobPostings: JobPosting[];
  candidates: Candidate[];
  interviews: Interview[];
  offerLetters: OfferLetter[];
}
