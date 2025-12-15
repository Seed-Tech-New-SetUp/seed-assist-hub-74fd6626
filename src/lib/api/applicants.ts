// ===========================================
// APPLICANTS API - Replace with your actual API
// ===========================================

export type WorkflowStatus = "SHORTLISTED" | "ON_HOLD" | "REJECTED" | "WINNER" | "PENDING";

export interface Applicant {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  nationality: string;
  gender: string;
  isSeedRecommended: boolean;
  status: WorkflowStatus;
  standardizedTest: {
    name: string;
    score: number;
  };
  ugCompletionYear: number;
  ugGpa: number;
  workExperience: number;
}

export interface StudentDetails extends Applicant {
  email: string;
  phone: string;
  linkedIn: string;
  university: string;
  degree: string;
  major: string;
  currentCompany: string;
  currentRole: string;
  resumeUrl: string;
  sopUrl: string;
  transcriptUrl: string;
  lorUrls: string[];
  scholarshipName: string;
  awards?: {
    name: string;
    amount: number;
  }[];
}

// Mock data - Replace with actual API calls
const mockApplicants: Applicant[] = [
  {
    id: "1",
    name: "Priya Sharma",
    country: "India",
    countryCode: "IN",
    nationality: "Indian",
    gender: "Female",
    isSeedRecommended: true,
    status: "PENDING",
    standardizedTest: { name: "GMAT", score: 720 },
    ugCompletionYear: 2019,
    ugGpa: 3.8,
    workExperience: 5,
  },
  {
    id: "2",
    name: "Chen Wei",
    country: "China",
    countryCode: "CN",
    nationality: "Chinese",
    gender: "Male",
    isSeedRecommended: true,
    status: "SHORTLISTED",
    standardizedTest: { name: "GRE", score: 328 },
    ugCompletionYear: 2020,
    ugGpa: 3.6,
    workExperience: 4,
  },
  {
    id: "3",
    name: "Ahmed Hassan",
    country: "Egypt",
    countryCode: "EG",
    nationality: "Egyptian",
    gender: "Male",
    isSeedRecommended: false,
    status: "ON_HOLD",
    standardizedTest: { name: "GMAT", score: 680 },
    ugCompletionYear: 2018,
    ugGpa: 3.5,
    workExperience: 6,
  },
  {
    id: "4",
    name: "Maria Garcia",
    country: "Mexico",
    countryCode: "MX",
    nationality: "Mexican",
    gender: "Female",
    isSeedRecommended: true,
    status: "WINNER",
    standardizedTest: { name: "GRE", score: 335 },
    ugCompletionYear: 2019,
    ugGpa: 3.9,
    workExperience: 5,
  },
  {
    id: "5",
    name: "John Obi",
    country: "Nigeria",
    countryCode: "NG",
    nationality: "Nigerian",
    gender: "Male",
    isSeedRecommended: false,
    status: "REJECTED",
    standardizedTest: { name: "GMAT", score: 650 },
    ugCompletionYear: 2021,
    ugGpa: 3.2,
    workExperience: 3,
  },
  {
    id: "6",
    name: "Sara Kim",
    country: "South Korea",
    countryCode: "KR",
    nationality: "South Korean",
    gender: "Female",
    isSeedRecommended: true,
    status: "PENDING",
    standardizedTest: { name: "TOEFL", score: 115 },
    ugCompletionYear: 2020,
    ugGpa: 3.7,
    workExperience: 3,
  },
  {
    id: "7",
    name: "Luis Fernandez",
    country: "Brazil",
    countryCode: "BR",
    nationality: "Brazilian",
    gender: "Male",
    isSeedRecommended: false,
    status: "SHORTLISTED",
    standardizedTest: { name: "IELTS", score: 8 },
    ugCompletionYear: 2017,
    ugGpa: 3.4,
    workExperience: 7,
  },
];

const mockStudentDetails: Record<string, Partial<StudentDetails>> = {
  "1": {
    email: "priya.sharma@email.com",
    phone: "+91 98765 43210",
    linkedIn: "linkedin.com/in/priyasharma",
    university: "Indian Institute of Technology, Delhi",
    degree: "Bachelor of Technology",
    major: "Computer Science",
    currentCompany: "Infosys",
    currentRole: "Senior Software Engineer",
    resumeUrl: "/documents/resume.pdf",
    sopUrl: "/documents/sop.pdf",
    transcriptUrl: "/documents/transcript.pdf",
    lorUrls: ["/documents/lor1.pdf", "/documents/lor2.pdf"],
    scholarshipName: "SEED Excellence Scholarship 2024",
  },
  "2": {
    email: "chen.wei@email.com",
    phone: "+86 138 0000 1234",
    linkedIn: "linkedin.com/in/chenwei",
    university: "Tsinghua University",
    degree: "Bachelor of Science",
    major: "Business Administration",
    currentCompany: "Alibaba Group",
    currentRole: "Product Manager",
    resumeUrl: "/documents/resume.pdf",
    sopUrl: "/documents/sop.pdf",
    transcriptUrl: "/documents/transcript.pdf",
    lorUrls: ["/documents/lor1.pdf", "/documents/lor2.pdf"],
    scholarshipName: "Global Leaders Scholarship 2024",
  },
  "3": {
    email: "ahmed.hassan@email.com",
    phone: "+20 100 123 4567",
    linkedIn: "linkedin.com/in/ahmedhassan",
    university: "Cairo University",
    degree: "Bachelor of Commerce",
    major: "Finance",
    currentCompany: "Commercial International Bank",
    currentRole: "Financial Analyst",
    resumeUrl: "/documents/resume.pdf",
    sopUrl: "/documents/sop.pdf",
    transcriptUrl: "/documents/transcript.pdf",
    lorUrls: ["/documents/lor1.pdf"],
    scholarshipName: "MENA Excellence Award 2024",
  },
  "4": {
    email: "maria.garcia@email.com",
    phone: "+52 55 1234 5678",
    linkedIn: "linkedin.com/in/mariagarcia",
    university: "Tecnológico de Monterrey",
    degree: "Bachelor of Engineering",
    major: "Industrial Engineering",
    currentCompany: "McKinsey & Company",
    currentRole: "Business Analyst",
    resumeUrl: "/documents/resume.pdf",
    sopUrl: "/documents/sop.pdf",
    transcriptUrl: "/documents/transcript.pdf",
    lorUrls: ["/documents/lor1.pdf", "/documents/lor2.pdf", "/documents/lor3.pdf"],
    scholarshipName: "Latin America Leadership Scholarship",
    awards: [
      { name: "Full Tuition Waiver", amount: 85000 },
      { name: "Living Stipend", amount: 15000 },
    ],
  },
  "5": {
    email: "john.obi@email.com",
    phone: "+234 803 123 4567",
    linkedIn: "linkedin.com/in/johnobi",
    university: "University of Lagos",
    degree: "Bachelor of Science",
    major: "Economics",
    currentCompany: "Access Bank",
    currentRole: "Associate",
    resumeUrl: "/documents/resume.pdf",
    sopUrl: "/documents/sop.pdf",
    transcriptUrl: "/documents/transcript.pdf",
    lorUrls: ["/documents/lor1.pdf"],
    scholarshipName: "African Scholars Program 2024",
  },
  "6": {
    email: "sara.kim@email.com",
    phone: "+82 10 1234 5678",
    linkedIn: "linkedin.com/in/sarakim",
    university: "Seoul National University",
    degree: "Bachelor of Arts",
    major: "International Relations",
    currentCompany: "Samsung Electronics",
    currentRole: "Strategy Associate",
    resumeUrl: "/documents/resume.pdf",
    sopUrl: "/documents/sop.pdf",
    transcriptUrl: "/documents/transcript.pdf",
    lorUrls: ["/documents/lor1.pdf", "/documents/lor2.pdf"],
    scholarshipName: "Asia Pacific Excellence Award",
  },
  "7": {
    email: "luis.fernandez@email.com",
    phone: "+55 11 98765 4321",
    linkedIn: "linkedin.com/in/luisfernandez",
    university: "Universidade de São Paulo",
    degree: "Bachelor of Business Administration",
    major: "Marketing",
    currentCompany: "Nubank",
    currentRole: "Senior Marketing Manager",
    resumeUrl: "/documents/resume.pdf",
    sopUrl: "/documents/sop.pdf",
    transcriptUrl: "/documents/transcript.pdf",
    lorUrls: ["/documents/lor1.pdf", "/documents/lor2.pdf"],
    scholarshipName: "LATAM Business Leaders Scholarship",
  },
};

// API Functions - Replace these implementations with actual fetch calls

export async function fetchApplicants(): Promise<Applicant[]> {
  // TODO: Replace with actual API call
  // Example: return fetch('/api/applicants').then(res => res.json());
  return Promise.resolve(mockApplicants);
}

export async function fetchApplicantById(id: string): Promise<Applicant | undefined> {
  // TODO: Replace with actual API call
  // Example: return fetch(`/api/applicants/${id}`).then(res => res.json());
  return Promise.resolve(mockApplicants.find(a => a.id === id));
}

export async function fetchStudentDetails(id: string): Promise<StudentDetails | undefined> {
  // TODO: Replace with actual API call
  // Example: return fetch(`/api/applicants/${id}/details`).then(res => res.json());
  const applicant = mockApplicants.find(a => a.id === id);
  const details = mockStudentDetails[id];
  
  if (!applicant) return undefined;
  
  return Promise.resolve({
    ...applicant,
    email: details?.email || "email@example.com",
    phone: details?.phone || "+1 000 000 0000",
    linkedIn: details?.linkedIn || "linkedin.com/in/user",
    university: details?.university || "University",
    degree: details?.degree || "Bachelor's Degree",
    major: details?.major || "Major",
    currentCompany: details?.currentCompany || "Company",
    currentRole: details?.currentRole || "Role",
    resumeUrl: details?.resumeUrl || "/documents/resume.pdf",
    sopUrl: details?.sopUrl || "/documents/sop.pdf",
    transcriptUrl: details?.transcriptUrl || "/documents/transcript.pdf",
    lorUrls: details?.lorUrls || ["/documents/lor1.pdf"],
    scholarshipName: details?.scholarshipName || "Scholarship",
    awards: details?.awards,
  } as StudentDetails);
}

export async function updateApplicantStatus(id: string, status: WorkflowStatus): Promise<Applicant> {
  // TODO: Replace with actual API call
  // Example: return fetch(`/api/applicants/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(res => res.json());
  const applicant = mockApplicants.find(a => a.id === id);
  if (!applicant) throw new Error("Applicant not found");
  return Promise.resolve({ ...applicant, status });
}

export async function bulkUpdateApplicantStatus(ids: string[], status: WorkflowStatus): Promise<Applicant[]> {
  // TODO: Replace with actual API call
  // Example: return fetch('/api/applicants/bulk-status', { method: 'PATCH', body: JSON.stringify({ ids, status }) }).then(res => res.json());
  return Promise.resolve(
    mockApplicants
      .filter(a => ids.includes(a.id))
      .map(a => ({ ...a, status }))
  );
}
