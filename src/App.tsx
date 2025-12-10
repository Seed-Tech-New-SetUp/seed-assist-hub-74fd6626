import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VirtualEvents from "./pages/VirtualEvents";
import SchoolProfiles from "./pages/SchoolProfiles";
import ScholarshipApplicants from "./pages/ScholarshipApplicants";
import Applications from "./pages/Applications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/virtual-events" element={<VirtualEvents />} />
          <Route path="/meetup-reports" element={<Dashboard />} />
          <Route path="/festival-reports" element={<Dashboard />} />
          <Route path="/campus-tours" element={<Dashboard />} />
          <Route path="/in-country-reports" element={<Dashboard />} />
          <Route path="/school-profiles" element={<SchoolProfiles />} />
          <Route path="/profile-leads" element={<Dashboard />} />
          <Route path="/lead-generation" element={<Dashboard />} />
          <Route path="/scholarship-applicants" element={<ScholarshipApplicants />} />
          <Route path="/applicant-profiles" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/admits-tracking" element={<Applications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
