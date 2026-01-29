// ===========================================
// REPORTS API - Replace with your actual API
// ===========================================

export interface BSFReport {
  id: string;
  eventName: string;
  city: string;
  date: string;
  registrants: number;
  attendees: number;
  connections: number;
}

export interface CampusTourReport {
  id: string;
  eventName: string;
  campus: string;
  date: string;
  campusesReached: number;
  attendees: number;
  studentsConnected: number;
}

// Mock data - Replace with actual API calls
const mockBSFReports: BSFReport[] = [
  { id: "1", eventName: "Business School Festival Lagos 2024", city: "Lagos", date: "2024-03-15", registrants: 245, attendees: 198, connections: 156 },
  { id: "2", eventName: "Business School Festival Nairobi 2024", city: "Nairobi", date: "2024-04-20", registrants: 312, attendees: 267, connections: 201 },
  { id: "3", eventName: "Business School Festival Accra 2024", city: "Accra", date: "2024-05-10", registrants: 189, attendees: 145, connections: 112 },
  { id: "4", eventName: "Business School Festival Mumbai 2024", city: "Mumbai", date: "2024-06-08", registrants: 278, attendees: 234, connections: 189 },
  { id: "5", eventName: "Business School Festival Dubai 2024", city: "Dubai", date: "2024-07-12", registrants: 221, attendees: 198, connections: 134 },
];

const mockCampusTourReports: CampusTourReport[] = [
  { id: "1", eventName: "IIT Delhi Tour", campus: "IIT Delhi", date: "2024-02-20", campusesReached: 1, attendees: 450, studentsConnected: 280 },
  { id: "2", eventName: "BITS Pilani Tour", campus: "BITS Pilani", date: "2024-03-05", campusesReached: 1, attendees: 380, studentsConnected: 245 },
  { id: "3", eventName: "IIM Bangalore Tour", campus: "IIM Bangalore", date: "2024-03-18", campusesReached: 1, attendees: 520, studentsConnected: 356 },
  { id: "4", eventName: "NUS Singapore Tour", campus: "NUS", date: "2024-04-10", campusesReached: 1, attendees: 290, studentsConnected: 198 },
  { id: "5", eventName: "University of Lagos Tour", campus: "UNILAG", date: "2024-05-02", campusesReached: 1, attendees: 680, studentsConnected: 445 },
  { id: "6", eventName: "Ashesi University Tour", campus: "Ashesi", date: "2024-05-15", campusesReached: 1, attendees: 340, studentsConnected: 212 },
  { id: "7", eventName: "Strathmore Tour", campus: "Strathmore", date: "2024-06-01", campusesReached: 1, attendees: 410, studentsConnected: 278 },
  { id: "8", eventName: "Makerere University Tour", campus: "Makerere", date: "2024-06-20", campusesReached: 1, attendees: 350, studentsConnected: 198 },
];

// API Functions - Replace these implementations with actual fetch calls

export async function fetchBSFReports(): Promise<BSFReport[]> {
  // TODO: Replace with actual API call
  // Example: return fetch('/api/reports/bsf').then(res => res.json());
  return Promise.resolve(mockBSFReports);
}

export async function fetchBSFReportById(id: string): Promise<BSFReport | undefined> {
  // TODO: Replace with actual API call
  // Example: return fetch(`/api/reports/bsf/${id}`).then(res => res.json());
  return Promise.resolve(mockBSFReports.find(r => r.id === id));
}

export async function fetchCampusTourReports(): Promise<CampusTourReport[]> {
  // TODO: Replace with actual API call
  // Example: return fetch('/api/reports/campus-tour').then(res => res.json());
  return Promise.resolve(mockCampusTourReports);
}

export async function fetchCampusTourReportById(id: string): Promise<CampusTourReport | undefined> {
  // TODO: Replace with actual API call
  // Example: return fetch(`/api/reports/campus-tour/${id}`).then(res => res.json());
  return Promise.resolve(mockCampusTourReports.find(r => r.id === id));
}
