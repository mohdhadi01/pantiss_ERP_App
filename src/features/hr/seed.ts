import { financeAreas } from '../finance/data';
import { createSalaryRecords, payrollMonths } from '../finance/salaryData';
import {
  HRState,
  Designation,
  Employee,
  Assignment,
  AttendanceRecord,
  JobPosting,
  Candidate,
  Interview,
  OfferLetter,
} from './types';

export const projects = financeAreas.flatMap((area) => area.projects);

export const skillCenterList = [
  { id: 'angul', name: 'Angul Skill Development Center' },
  { id: 'keonjhar', name: 'Keonjhar Skill Development Center' },
  { id: 'sundargarh', name: 'Sundargarh Training Center' },
  { id: 'jajpur', name: 'Jajpur Skills & Livelihood Center' },
];

export function projectCenters(projectId: string) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return [];
  return projectId === 'FIN-SKI-01'
    ? skillCenterList
    : [{ id: `${projectId}:office`, name: `${project.location} · Project office` }];
}

export function createInitialHRState(): HRState {
  const salaries = createSalaryRecords().filter((r) => r.month === payrollMonths[0]);

  const designations: Designation[] = financeAreas.flatMap((area) => [
    {
      id: `${area.id}:coordinator`,
      areaId: area.id,
      title: 'Project Coordinator',
      level: 'Individual contributor',
      description: 'Coordinate project delivery and reporting.',
    },
    {
      id: `${area.id}:manager`,
      areaId: area.id,
      title: 'Programme Manager',
      level: 'Manager',
      description: 'Lead programme planning, teams and outcomes.',
    },
  ]);

  const employees: Employee[] = salaries.map((record, index) => {
    const areaId = projects.find((p) => p.id === record.projectId)?.areaId || 'skill-development';
    const designationId = `role:${record.id}`;
    designations.push({
      id: designationId,
      areaId,
      title: record.designation,
      level: 'Individual contributor',
      description: 'Existing employee designation.',
    });
    return {
      id: record.id,
      name: record.name,
      email: `employee${index + 1}@pantiss.org`,
      phone: `+91 90000 0010${index}`,
      areaId,
      designationId,
      joiningDate: '2025-04-01',
      status: 'Active',
      loginId: record.id.replace('PAN-', 'PNT-'),
      annualSalary: Math.round((record.basicHra + record.allowance) * 12),
    };
  });

  designations.push({
    id: 'skill-development:trainer',
    areaId: 'skill-development',
    title: 'Trainer',
    level: 'Individual contributor',
    description: 'Deliver training and assess learner progress.',
  });

  employees.unshift({
    id: 'EMP-0001',
    name: 'Aditya Sahu',
    email: 'aditya.sahu@pantiss.org',
    phone: '+91 98765 43210',
    areaId: 'skill-development',
    designationId: 'skill-development:trainer',
    joiningDate: '2026-10-01',
    status: 'Active',
    annualSalary: 360000,
  });

  const assignments: Assignment[] = salaries.map((record) => ({
    employeeId: record.id,
    projectId: record.projectId || 'FIN-SKI-01',
    centerId: projectCenters(record.projectId || 'FIN-SKI-01')[0]?.id || 'angul',
    startDate: '2026-04-01',
  }));

  assignments.unshift({
    employeeId: 'EMP-0001',
    projectId: 'FIN-SKI-01',
    centerId: 'angul',
    startDate: '2026-10-01',
  });

  const attendance: AttendanceRecord[] = employees.slice(0, 6).map((employee, index) => ({
    id: `PUNCH-${index + 1}`,
    employeeId: employee.id,
    date: '2026-10-09',
    source: 'Platform punch',
    punchIn: {
      time: `2026-10-09T09:${index === 2 ? '48' : '18'}:00+05:30`,
      latitude: 20.844 + index * 0.002,
      longitude: 85.151 + index * 0.002,
      accuracy: 15 + index * 5,
    },
    ...(index !== 4
      ? {
          punchOut: {
            time: '2026-10-09T18:05:00+05:30',
            latitude: 20.844 + index * 0.002,
            longitude: 85.151 + index * 0.002,
            accuracy: 18,
          },
        }
      : {}),
  }));

  const jobPostings: JobPosting[] = [
    {
      id: 'JOB-2026-01',
      title: 'Community Livelihood Project Coordinator',
      areaId: 'livelihood',
      department: 'Field Operations & Rural Livelihoods',
      location: 'Angul & Dhenkanal · Cluster Office',
      experience: '3–5 Years',
      openings: 2,
      minSalary: 480000,
      maxSalary: 650000,
      status: 'Active',
      postedDate: '2026-09-15',
      closingDate: '2026-10-31',
      description:
        'Drive cluster-level farmer producer organisation (FPO) mobilisation, value chain interventions, and field team coordination.',
      requirements: [
        'Postgraduate degree in Rural Development, Social Work, or Agriculture.',
        'At least 3 years of demonstrated field project execution experience.',
        'Fluency in Odia and English; strong report writing skills.',
        'Willingness to travel across project intervention clusters.',
      ],
    },
    {
      id: 'JOB-2026-02',
      title: 'Vocational Skill Trainer (Electrical & Solar)',
      areaId: 'skill-development',
      department: 'Technical Training & Lab Instruction',
      location: 'Angul Skill Training Centre · On-site',
      experience: '2–4 Years',
      openings: 3,
      minSalary: 360000,
      maxSalary: 480000,
      status: 'Active',
      postedDate: '2026-09-20',
      closingDate: '2026-11-15',
      description:
        'Instruct NSQF compliant electrical installation and solar panel technician modules, oversee hands-on workshop safety, and mentor student batches.',
      requirements: [
        'Diploma or B.Tech in Electrical / Electronics Engineering.',
        'Certified TOT (Trainer of Trainers) under NSDC / Skill India preferred.',
        'Hands-on equipment maintenance and safety lab protocol experience.',
      ],
    },
    {
      id: 'JOB-2026-03',
      title: 'Senior Watershed & Agroforestry Lead',
      areaId: 'climate-change',
      department: 'Natural Resource Management',
      location: 'Bhubaneswar HQ · Field Deployment',
      experience: '5+ Years',
      openings: 1,
      minSalary: 650000,
      maxSalary: 850000,
      status: 'Active',
      postedDate: '2026-10-01',
      closingDate: '2026-11-20',
      description:
        'Lead technical hydrology surveys, watershed ridge-to-valley treatments, agroforestry plantations, and community water committees.',
      requirements: [
        'Master’s in Environmental Sciences, Hydrology, Forestry, or Civil Engineering.',
        '5+ years leading participatory watershed and natural regeneration projects.',
        'Working knowledge of GIS contour mapping and district line department liaison.',
      ],
    },
  ];

  const candidates: Candidate[] = [
    {
      id: 'APP-2026-101',
      jobId: 'JOB-2026-01',
      name: 'Priyanka Mishra',
      email: 'priyanka.mishra@example.com',
      phone: '+91 98451 22340',
      currentCompany: 'Gramin Vikas Trust',
      experienceYears: 4,
      currentSalary: 480000,
      expectedSalary: 600000,
      noticePeriod: '30 Days',
      stage: 'Selected',
      rating: 4.8,
      appliedDate: '2026-09-22',
      notes:
        'Clear field leadership in women SHG federation finance. Panel recommended immediate offer release.',
      resumeSummary:
        '4 years experience managing farm livelihoods in Dhenkanal district with focus on organic millet promotion.',
    },
    {
      id: 'APP-2026-102',
      jobId: 'JOB-2026-02',
      name: 'Subhashis Nayak',
      email: 'subhashis.nayak@example.com',
      phone: '+91 97760 88120',
      currentCompany: 'Schneider Skill Institute',
      experienceYears: 3,
      currentSalary: 380000,
      expectedSalary: 450000,
      noticePeriod: '15 Days',
      stage: 'Offer Released',
      rating: 4.5,
      appliedDate: '2026-09-25',
      notes:
        'Certified solar installer. Offer letter OFR-2026-01 released at ₹4,50,000 CTC. Awaiting acceptance.',
      resumeSummary:
        'Electrical Diploma holder with 3 years vocational classroom training experience in solar power.',
    },
    {
      id: 'APP-2026-103',
      jobId: 'JOB-2026-01',
      name: 'Tanvi Sundaram',
      email: 'tanvi.s@example.com',
      phone: '+91 94371 90876',
      currentCompany: 'Pradan Foundation',
      experienceYears: 2.5,
      currentSalary: 420000,
      expectedSalary: 520000,
      noticePeriod: 'Immediate',
      stage: 'Interview Scheduled',
      rating: 4.2,
      appliedDate: '2026-09-28',
      notes: 'Technical round scheduled for Oct 12 with Dr. Minati Biswal.',
      resumeSummary:
        'M.Sc Agriculture with field project experience in micro-irrigation and post-harvest storage.',
    },
    {
      id: 'APP-2026-104',
      jobId: 'JOB-2026-02',
      name: 'Rajendra Prasad Jena',
      email: 'rajendra.jena@example.com',
      phone: '+91 98610 33491',
      currentCompany: 'L&T Skill Academy',
      experienceYears: 5,
      currentSalary: 420000,
      expectedSalary: 480000,
      noticePeriod: '30 Days',
      stage: 'Offer Accepted',
      rating: 4.9,
      appliedDate: '2026-09-24',
      notes: 'Offer letter OFR-2026-02 accepted! Candidate ready for ERP onboarding.',
      resumeSummary:
        'TOT Certified master trainer in Industrial Wiring & Safety. 5 years teaching batches in Cuttack & Angul.',
    },
  ];

  const interviews: Interview[] = [
    {
      id: 'INT-2026-01',
      candidateId: 'APP-2026-101',
      jobId: 'JOB-2026-01',
      round: 'Thematic Panel',
      scheduledAt: '2026-10-04T11:00',
      durationMinutes: 45,
      interviewer: 'Ramesh Chandra Das (Programme Director)',
      mode: 'Google Meet',
      meetLink: 'https://meet.google.com/pan-lvh-kzp',
      status: 'Completed',
      rating: 5,
      feedback:
        'Exceptional clarity on grassroots mobilization and SHG federation finance. Recommend releasing offer for Senior Coordinator role.',
      recommendation: 'Select for Offer',
    },
    {
      id: 'INT-2026-02',
      candidateId: 'APP-2026-103',
      jobId: 'JOB-2026-01',
      round: 'Technical Assessment',
      scheduledAt: '2026-10-12T14:30',
      durationMinutes: 45,
      interviewer: 'Dr. Minati Biswal (Lead Agronomist)',
      mode: 'Google Meet',
      meetLink: 'https://meet.google.com/agr-tch-wxy',
      status: 'Scheduled',
    },
  ];

  const offerLetters: OfferLetter[] = [
    {
      id: 'OFR-2026-01',
      candidateId: 'APP-2026-102',
      jobId: 'JOB-2026-02',
      candidateName: 'Subhashis Nayak',
      candidateEmail: 'subhashis.nayak@example.com',
      candidatePhone: '+91 97760 88120',
      designationTitle: 'Vocational Trainer (Electrical & Solar)',
      areaId: 'skill-development',
      joiningDate: '2026-11-15',
      annualSalary: 450000,
      monthlySalary: 37500,
      basicHra: 26250,
      allowance: 11250,
      expiryDate: '2026-10-25',
      status: 'Released',
      releasedAt: '2026-10-06T15:30:00+05:30',
      releasedBy: 'Ritika Sen (HR Manager)',
      termsNotes: 'Probationary period: 6 months. Workstation: Angul Skill Training Centre.',
    },
    {
      id: 'OFR-2026-02',
      candidateId: 'APP-2026-104',
      jobId: 'JOB-2026-02',
      candidateName: 'Rajendra Prasad Jena',
      candidateEmail: 'rajendra.jena@example.com',
      candidatePhone: '+91 98610 33491',
      designationTitle: 'Lead Vocational Trainer',
      areaId: 'skill-development',
      joiningDate: '2026-11-01',
      annualSalary: 480000,
      monthlySalary: 40000,
      basicHra: 28000,
      allowance: 12000,
      expiryDate: '2026-10-15',
      status: 'Accepted',
      releasedAt: '2026-10-02T10:00:00+05:30',
      releasedBy: 'Ritika Sen (HR Manager)',
      termsNotes: 'Formal acceptance received on 2026-10-07. Awaiting onboarding into ERP.',
    },
  ];

  return {
    employees,
    designations,
    assignments,
    attendance,
    assessments: [],
    appraisals: [],
    leaveDecisions: {},
    jobPostings,
    candidates,
    interviews,
    offerLetters,
  };
}
