import { financeAreas } from '../finance/data';
import { indicators } from './constants';
import { projectCenters, projects } from './seed';
import {
  HRState,
  Employee,
  Assignment,
  Assessment,
  Appraisal,
  LeaveDecision,
  AttendanceRecord,
  JobPosting,
  Candidate,
  CandidateStage,
  Interview,
  OfferLetter,
  OfferStatus,
} from './types';

export const MAX_INCREMENT_PERCENT = 100;

export function isDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

export const monthlyFromAnnual = (annual: number) => Math.round(annual / 12);
export const annualFromMonthly = (monthly: number) => Math.round(monthly * 12);
export const revisedSalary = (annual: number, incrementPercent: number) =>
  Math.round(annual * (1 + incrementPercent / 100));

export function assessmentScore(assessment: Pick<Assessment, 'scores'>): number {
  return Number(
    indicators
      .reduce(
        (sum, indicator) => sum + ((assessment.scores[indicator.id] || 0) * indicator.weight) / 100,
        0
      )
      .toFixed(2)
  );
}

export function attendanceIssue(record?: AttendanceRecord): string {
  if (!record?.punchIn) return 'No punch-in';
  if (!record.punchOut) return 'Missing punch-out';
  if (!record.punchIn.photoUrl || !record.punchOut.photoUrl) return 'Photo evidence missing';
  return 'Evidence received';
}

export function areaName(id: string): string {
  return financeAreas.find((a) => a.id === id)?.name ?? 'Unassigned';
}

export function dateLabel(date?: string): string {
  return date
    ? new Date(date.length === 10 ? `${date}T12:00:00` : date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Awaiting decision';
}

export function timestampLabel(date?: string): string {
  return date
    ? new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not received';
}

export const rupees = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`;

export function filterEmployees(state: HRState, query: string, area: string): Employee[] {
  return state.employees.filter(
    (e) =>
      (area === 'all' || e.areaId === area) &&
      `${e.name} ${e.id} ${e.email}`.toLowerCase().includes(query.trim().toLowerCase())
  );
}

export function assignEmployee(state: HRState, assignment: Assignment): HRState {
  const employee = state.employees.find((e) => e.id === assignment.employeeId);
  const project = projects.find((p) => p.id === assignment.projectId);
  if (!employee || !project || employee.areaId !== project.areaId) {
    throw new Error('Choose a project within the employee’s thematic area.');
  }
  if (!projectCenters(project.id).some((center) => center.id === assignment.centerId)) {
    throw new Error('Choose a centre belonging to this project.');
  }
  if (!isDate(assignment.startDate) || assignment.startDate < employee.joiningDate) {
    throw new Error('Assignment date must be on or after the joining date.');
  }
  return {
    ...state,
    assignments: [...state.assignments.filter((a) => a.employeeId !== employee.id), assignment],
  };
}

export function saveEmployee(state: HRState, employee: Employee): HRState {
  if (
    !employee.name.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email) ||
    employee.phone.replace(/\D/g, '').length < 10 ||
    !isDate(employee.joiningDate)
  ) {
    throw new Error('Enter a name, valid email, phone number and joining date.');
  }
  if (!state.designations.some((d) => d.id === employee.designationId && d.areaId === employee.areaId)) {
    throw new Error('Choose a designation in this thematic area.');
  }
  if (
    !Number.isFinite(employee.annualSalary) ||
    employee.annualSalary! <= 0 ||
    employee.annualSalary! > 100_000_000
  ) {
    throw new Error('Enter a valid annual salary.');
  }
  if (
    state.employees.some(
      (e) => e.id !== employee.id && e.email.toLowerCase() === employee.email.toLowerCase()
    )
  ) {
    throw new Error('An employee with this email already exists.');
  }
  const existing = state.employees.find((e) => e.id === employee.id);
  const assignment = state.assignments.find((a) => a.employeeId === employee.id);
  if (assignment && employee.joiningDate > assignment.startDate) {
    throw new Error('Joining date cannot be after the current project assignment date.');
  }
  return {
    ...state,
    employees: existing
      ? state.employees.map((e) => (e.id === employee.id ? employee : e))
      : [...state.employees, employee],
    assignments:
      existing?.areaId !== employee.areaId
        ? state.assignments.filter((a) => a.employeeId !== employee.id)
        : state.assignments,
  };
}

export function saveAssessment(state: HRState, assessment: Assessment): HRState {
  if (!state.employees.some((e) => e.id === assessment.employeeId)) {
    throw new Error('Choose a valid employee.');
  }
  if (
    indicators.some(
      (i) =>
        !Number.isInteger(assessment.scores[i.id]) ||
        assessment.scores[i.id] < 1 ||
        assessment.scores[i.id] > 5
    )
  ) {
    throw new Error('Rate every indicator from 1 to 5.');
  }
  if (assessment.notes.trim().length < 10) {
    throw new Error('Add supporting examples (at least 10 characters).');
  }
  if (
    state.appraisals.some(
      (a) => a.employeeId === assessment.employeeId && a.year === assessment.year
    )
  ) {
    throw new Error('The year-end appraisal is complete. Its KBI assessment is locked.');
  }
  return {
    ...state,
    assessments: [
      ...state.assessments.filter(
        (a) => a.employeeId !== assessment.employeeId || a.year !== assessment.year
      ),
      assessment,
    ],
  };
}

export function completeAppraisal(state: HRState, appraisal: Appraisal): HRState {
  const assessment = state.assessments.find(
    (a) => a.employeeId === appraisal.employeeId && a.year === appraisal.year
  );
  if (!assessment || assessment.updatedAt !== appraisal.assessmentUpdatedAt) {
    throw new Error('Save and review the current employee KBI assessment first.');
  }
  if (
    state.appraisals.some((a) => a.employeeId === appraisal.employeeId && a.year === appraisal.year)
  ) {
    throw new Error('This appraisal is already complete.');
  }
  if (
    !Number.isInteger(appraisal.rating) ||
    appraisal.rating < 1 ||
    appraisal.rating > 5 ||
    appraisal.notes.trim().length < 10
  ) {
    throw new Error('Provide a valid rating and development notes (at least 10 characters).');
  }
  const employee = state.employees.find((e) => e.id === appraisal.employeeId);
  if (!employee?.annualSalary) {
    throw new Error('Record the employee’s current salary in Onboarding before finalising the appraisal.');
  }
  const increment = appraisal.incrementPercent;
  if (
    increment === undefined ||
    !Number.isFinite(increment) ||
    increment < 0 ||
    increment > MAX_INCREMENT_PERCENT
  ) {
    throw new Error(`Enter an increment between 0% and ${MAX_INCREMENT_PERCENT}%.`);
  }
  const previousAnnualSalary = employee.annualSalary;
  const revisedAnnualSalary = revisedSalary(previousAnnualSalary, increment);
  return {
    ...state,
    employees: state.employees.map((e) =>
      e.id === employee.id ? { ...e, annualSalary: revisedAnnualSalary } : e
    ),
    appraisals: [
      ...state.appraisals,
      {
        ...appraisal,
        incrementPercent: increment,
        previousAnnualSalary,
        revisedAnnualSalary,
      },
    ],
  };
}

export function decideLeave(state: HRState, id: string, decision: LeaveDecision): HRState {
  if (state.leaveDecisions[id]) {
    throw new Error('This request has already been reviewed.');
  }
  if (decision.status === 'Rejected' && !decision.reason.trim()) {
    throw new Error('Add a reason for rejection.');
  }
  return {
    ...state,
    leaveDecisions: {
      ...state.leaveDecisions,
      [id]: decision,
    },
  };
}

export function saveJobPosting(state: HRState, posting: JobPosting): HRState {
  if (!posting.title.trim()) throw new Error('Job title is required.');
  if (!posting.areaId) throw new Error('Thematic area is required.');
  if (!posting.location.trim()) throw new Error('Job location is required.');
  if (posting.openings < 1) throw new Error('At least 1 vacancy opening is required.');
  if (posting.minSalary <= 0 || posting.maxSalary < posting.minSalary) {
    throw new Error('Valid salary range (Annual CTC) is required.');
  }
  const existing = state.jobPostings.find((j) => j.id === posting.id);
  return {
    ...state,
    jobPostings: existing
      ? state.jobPostings.map((j) => (j.id === posting.id ? posting : j))
      : [posting, ...state.jobPostings],
  };
}

export function saveCandidate(state: HRState, candidate: Candidate): HRState {
  if (!candidate.name.trim()) throw new Error('Candidate name is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) {
    throw new Error('Valid candidate email is required.');
  }
  if (candidate.phone.replace(/\D/g, '').length < 10) {
    throw new Error('Valid 10-digit phone number is required.');
  }
  if (candidate.expectedSalary <= 0) {
    throw new Error('Expected salary must be greater than zero.');
  }
  const existing = state.candidates.find((c) => c.id === candidate.id);
  return {
    ...state,
    candidates: existing
      ? state.candidates.map((c) => (c.id === candidate.id ? candidate : c))
      : [candidate, ...state.candidates],
  };
}

export function updateCandidateStage(
  state: HRState,
  candidateId: string,
  stage: CandidateStage,
  note?: string
): HRState {
  const candidate = state.candidates.find((c) => c.id === candidateId);
  if (!candidate) throw new Error('Candidate not found.');
  return {
    ...state,
    candidates: state.candidates.map((c) =>
      c.id === candidateId
        ? {
            ...c,
            stage,
            notes: note
              ? c.notes
                ? `${c.notes}\n[${new Date().toISOString().slice(0, 10)}] ${note}`
                : note
              : c.notes,
          }
        : c
    ),
  };
}

export function scheduleInterview(state: HRState, interview: Interview): HRState {
  if (!state.candidates.some((c) => c.id === interview.candidateId)) {
    throw new Error('Select a valid candidate.');
  }
  if (!interview.interviewer.trim()) throw new Error('Interviewer / Panel name is required.');
  if (!interview.scheduledAt) throw new Error('Interview date and time are required.');
  const existing = state.interviews.find((i) => i.id === interview.id);
  const updatedInterviews = existing
    ? state.interviews.map((i) => (i.id === interview.id ? interview : i))
    : [interview, ...state.interviews];

  const candidate = state.candidates.find((c) => c.id === interview.candidateId);
  const nextCandidates =
    candidate && (candidate.stage === 'Applied' || candidate.stage === 'Screening')
      ? state.candidates.map((c) =>
          c.id === interview.candidateId
            ? { ...c, stage: 'Interview Scheduled' as CandidateStage }
            : c
        )
      : state.candidates;

  return { ...state, interviews: updatedInterviews, candidates: nextCandidates };
}

export function submitInterviewFeedback(
  state: HRState,
  interviewId: string,
  feedback: string,
  rating: number,
  recommendation: NonNullable<Interview['recommendation']>
): HRState {
  const interview = state.interviews.find((i) => i.id === interviewId);
  if (!interview) throw new Error('Interview not found.');
  if (!feedback.trim()) throw new Error('Detailed evaluation feedback is required.');

  let nextStage: CandidateStage | undefined;
  if (recommendation === 'Select for Offer') nextStage = 'Selected';
  else if (recommendation === 'Reject') nextStage = 'Rejected';
  else if (recommendation === 'Advance to Next Round') nextStage = 'Technical Round';

  const updatedInterviews = state.interviews.map((i) =>
    i.id === interviewId
      ? {
          ...i,
          status: 'Completed' as const,
          feedback: feedback.trim(),
          rating,
          recommendation,
        }
      : i
  );

  const updatedCandidates = nextStage
    ? state.candidates.map((c) =>
        c.id === interview.candidateId ? { ...c, stage: nextStage!, rating } : c
      )
    : state.candidates;

  return { ...state, interviews: updatedInterviews, candidates: updatedCandidates };
}

export function releaseOfferLetter(state: HRState, offer: OfferLetter): HRState {
  const candidate = state.candidates.find((c) => c.id === offer.candidateId);
  if (!candidate) throw new Error('Candidate not found.');
  if (offer.annualSalary <= 0) throw new Error('Valid annual salary (CTC) is required.');
  if (!offer.designationTitle.trim()) throw new Error('Designation title is required.');

  const existing = state.offerLetters.find((o) => o.id === offer.id);
  const updatedOffers = existing
    ? state.offerLetters.map((o) => (o.id === offer.id ? offer : o))
    : [offer, ...state.offerLetters];

  const updatedCandidates = state.candidates.map((c) =>
    c.id === offer.candidateId
      ? {
          ...c,
          stage: (offer.status === 'Accepted'
            ? 'Offer Accepted'
            : offer.status === 'Released'
            ? 'Offer Released'
            : c.stage) as CandidateStage,
        }
      : c
  );

  return { ...state, offerLetters: updatedOffers, candidates: updatedCandidates };
}

export function updateOfferStatus(
  state: HRState,
  offerId: string,
  status: OfferStatus
): HRState {
  const offer = state.offerLetters.find((o) => o.id === offerId);
  if (!offer) throw new Error('Offer letter not found.');
  const updatedOffers = state.offerLetters.map((o) => (o.id === offerId ? { ...o, status } : o));
  const nextCandidateStage: CandidateStage =
    status === 'Accepted'
      ? 'Offer Accepted'
      : status === 'Declined'
      ? 'Rejected'
      : status === 'Onboarded'
      ? 'Onboarded'
      : 'Offer Released';
  const updatedCandidates = state.candidates.map((c) =>
    c.id === offer.candidateId ? { ...c, stage: nextCandidateStage } : c
  );
  return { ...state, offerLetters: updatedOffers, candidates: updatedCandidates };
}

export function onboardCandidateFromOffer(state: HRState, offerId: string): HRState {
  const offer = state.offerLetters.find((o) => o.id === offerId);
  if (!offer) throw new Error('Offer letter not found.');
  const candidate = state.candidates.find((c) => c.id === offer.candidateId);
  if (!candidate) throw new Error('Associated candidate not found.');

  if (state.employees.some((e) => e.email.toLowerCase() === candidate.email.toLowerCase())) {
    throw new Error(`An employee with email ${candidate.email} is already registered.`);
  }

  let designation = state.designations.find(
    (d) =>
      d.areaId === offer.areaId &&
      d.title.toLowerCase() === offer.designationTitle.toLowerCase()
  );
  const updatedDesignations = [...state.designations];
  if (!designation) {
    designation = {
      id: `${offer.areaId}:role:${Date.now().toString(36).slice(-4)}`,
      areaId: offer.areaId,
      title: offer.designationTitle,
      level: 'Individual contributor',
      description: `Role created during recruitment of ${candidate.name}.`,
    };
    updatedDesignations.push(designation);
  }

  const newEmployeeId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
  const newEmployee: Employee = {
    id: newEmployeeId,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    areaId: offer.areaId,
    designationId: designation.id,
    joiningDate: offer.joiningDate,
    status: 'Onboarding',
    annualSalary: offer.annualSalary,
  };

  const updatedOffers = state.offerLetters.map((o) =>
    o.id === offerId ? { ...o, status: 'Onboarded' as OfferStatus } : o
  );
  const updatedCandidates = state.candidates.map((c) =>
    c.id === candidate.id ? { ...c, stage: 'Onboarded' as CandidateStage } : c
  );

  return {
    ...state,
    employees: [newEmployee, ...state.employees],
    designations: updatedDesignations,
    offerLetters: updatedOffers,
    candidates: updatedCandidates,
  };
}
