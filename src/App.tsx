import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SchoolProvider } from "@/contexts/SchoolContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import SchoolSelector from "./pages/SchoolSelector";
import Dashboard from "./pages/Dashboard";
import VirtualEvents from "./pages/VirtualEvents";
import MeetupReports from "./pages/MeetupReports";
import FestivalReports from "./pages/FestivalReports";
import CampusTours from "./pages/CampusTours";
import InCountryReports from "./pages/InCountryReports";
import SchoolProfiles from "./pages/SchoolProfiles";
import ProfileLeads from "./pages/ProfileLeads";
import LeadGeneration from "./pages/LeadGeneration";
import ScholarshipApplicants from "./pages/ScholarshipApplicants";
import ApplicantProfiles from "./pages/ApplicantProfiles";
import Applications from "./pages/Applications";
import AdmitsTracking from "./pages/AdmitsTracking";
import ReportDetail from "./pages/ReportDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SchoolProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/select-school" element={<ProtectedRoute><SchoolSelector /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/virtual-events" element={<ProtectedRoute><VirtualEvents /></ProtectedRoute>} />
              <Route path="/meetup-reports" element={<ProtectedRoute><MeetupReports /></ProtectedRoute>} />
              <Route path="/festival-reports" element={<ProtectedRoute><FestivalReports /></ProtectedRoute>} />
              <Route path="/campus-tours" element={<ProtectedRoute><CampusTours /></ProtectedRoute>} />
              <Route path="/in-country-reports" element={<ProtectedRoute><InCountryReports /></ProtectedRoute>} />
              <Route path="/school-profiles" element={<ProtectedRoute><SchoolProfiles /></ProtectedRoute>} />
              <Route path="/profile-leads" element={<ProtectedRoute><ProfileLeads /></ProtectedRoute>} />
              <Route path="/lead-generation" element={<ProtectedRoute><LeadGeneration /></ProtectedRoute>} />
              <Route path="/scholarship-applicants" element={<ProtectedRoute><ScholarshipApplicants /></ProtectedRoute>} />
              <Route path="/applicant-profiles" element={<ProtectedRoute><ApplicantProfiles /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
              <Route path="/admits-tracking" element={<ProtectedRoute><AdmitsTracking /></ProtectedRoute>} />
              <Route path="/reports/:reportId" element={<ReportDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SchoolProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
