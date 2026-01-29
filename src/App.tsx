import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SchoolProvider } from "@/contexts/SchoolContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth & Navigation
import Login from "./pages/Login";
import SchoolSelector from "./pages/SchoolSelector";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Events - In Person
import InPersonEventsHome from "./pages/events/InPersonEventsHome";
import BSFReports from "./pages/events/BSFReports";
import CampusTourReports from "./pages/events/CampusTourReports";

// Events - Virtual
import VirtualEventsHome from "./pages/events/VirtualEventsHome";
import VirtualMasterclass from "./pages/events/VirtualMasterclass";
import VirtualMeetups from "./pages/events/VirtualMeetups";

// Scholarships
import ScholarshipApplications from "./pages/scholarships/ScholarshipApplications";
import StudentProfile from "./pages/scholarships/StudentProfile";
import ScholarshipAnalytics from "./pages/scholarships/ScholarshipAnalytics";

// School
import SchoolProfileEdit from "./pages/school/SchoolProfileEdit";
import Programs from "./pages/school/Programs";

// University Applications
import UniversityApplications from "./pages/applications/UniversityApplications";

// Other
import Analytics from "./pages/Analytics";
import UserManagement from "./pages/UserManagement";
import ReportDetail from "./pages/ReportDetail";
import InCountryReports from "./pages/InCountryReports";
import LeadAnalytics from "./pages/lae/LeadAnalytics";
import ProfileLeads from "./pages/ProfileLeads";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SchoolProvider>
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Auth Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/select-school" element={<ProtectedRoute><SchoolSelector /></ProtectedRoute>} />

                {/* Main Dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                {/* Events - In Person */}
                <Route path="/events/in-person" element={<ProtectedRoute><InPersonEventsHome /></ProtectedRoute>} />
                <Route path="/events/in-person/bsf" element={<ProtectedRoute><BSFReports /></ProtectedRoute>} />
                <Route path="/events/in-person/campus-tours" element={<ProtectedRoute><CampusTourReports /></ProtectedRoute>} />

                {/* Events - Virtual */}
                <Route path="/events/virtual" element={<ProtectedRoute><VirtualEventsHome /></ProtectedRoute>} />
                <Route path="/events/virtual/masterclass" element={<ProtectedRoute><VirtualMasterclass /></ProtectedRoute>} />
                <Route path="/events/virtual/meetups" element={<ProtectedRoute><VirtualMeetups /></ProtectedRoute>} />

                {/* Scholarships */}
                <Route path="/scholarships/applications" element={<ProtectedRoute><ScholarshipApplications /></ProtectedRoute>} />
                <Route path="/scholarships/applications/:studentId" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
                <Route path="/scholarships/analytics" element={<ProtectedRoute><ScholarshipAnalytics /></ProtectedRoute>} />

                {/* School Profile */}
                <Route path="/school-profile/edit" element={<ProtectedRoute><SchoolProfileEdit /></ProtectedRoute>} />
                <Route path="/school-profile/programs" element={<ProtectedRoute><Programs /></ProtectedRoute>} />

                {/* University Applications */}
                <Route path="/university-applications/all" element={<ProtectedRoute><UniversityApplications /></ProtectedRoute>} />

                {/* Analytics */}
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

                {/* In-Country Representation */}
                <Route path="/in-country-reports" element={<ProtectedRoute><InCountryReports /></ProtectedRoute>} />

                {/* Lead Analytics Engine */}
                <Route path="/lead-analytics" element={<ProtectedRoute><LeadAnalytics /></ProtectedRoute>} />

                {/* Profile Leads (Access Leads) */}
                <Route path="/profile-leads" element={<ProtectedRoute><ProfileLeads /></ProtectedRoute>} />

                {/* User Management */}
                <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />

                {/* Public Routes */}
                <Route path="/reports/:reportId" element={<ReportDetail />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SidebarProvider>
      </SchoolProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
