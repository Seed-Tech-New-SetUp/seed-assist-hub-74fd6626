import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Search,
  Plus,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Briefcase,
  HelpCircle,
  Phone,
  Star,
  ChevronRight,
  Building2,
  Clock,
  DollarSign,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { toast } from "sonner";
import { z } from "zod";

// Validation schemas
const programInfoSchema = z.object({
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  applicationDeadline: z.string().min(1, "Application deadline is required"),
  intake: z.string().min(1, "Intake is required"),
});

const facultySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  title: z.string().trim().min(2, "Title is required").max(100),
  expertise: z.string().trim().min(2, "Expertise is required").max(100),
});

const alumniSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  position: z.string().trim().min(2, "Position is required").max(150),
  graduationYear: z.number().min(1950).max(new Date().getFullYear()),
});

const faqSchema = z.object({
  question: z.string().trim().min(5, "Question must be at least 5 characters").max(500),
  answer: z.string().trim().min(10, "Answer must be at least 10 characters").max(2000),
});

const pocSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  role: z.string().trim().min(2, "Role is required").max(100),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(5, "Phone is required").max(20),
});

// Types
interface Faculty {
  name: string;
  title: string;
  expertise: string;
}

interface Alumni {
  name: string;
  position: string;
  graduationYear: number;
}

interface Ranking {
  source: string;
  rank: number;
  year: number;
}

interface JobRole {
  title: string;
  avgSalary: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface POC {
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface CurrentStudents {
  totalEnrollment: number;
  demographics: { international: string; women: string; avgAge: number };
  topCountries: string[];
}

interface AlumniData {
  totalCount: number;
  notableAlumni: Alumni[];
  avgSalaryIncrease: string;
}

interface Program {
  id: string;
  name: string;
  type: string;
  duration: string;
  mode: string;
  intake: string;
  tuition: string;
  status: string;
  applicationDeadline: string;
  info: {
    description: string;
    highlights: string[];
  };
  features: string[];
  faculty: Faculty[];
  currentStudents: CurrentStudents;
  alumni: AlumniData;
  rankings: Ranking[];
  recruiters: string[];
  jobRoles: JobRole[];
  faqs: FAQ[];
  pocs: POC[];
}

// Mock data for programs - TODO: Replace with API call
const initialMockPrograms: Program[] = [
  {
    id: "1",
    name: "Master of Business Administration (MBA)",
    type: "Graduate",
    duration: "2 Years",
    mode: "Full-Time",
    intake: "Fall 2025",
    tuition: "$65,000/year",
    status: "Active",
    applicationDeadline: "March 15, 2025",
    info: {
      description: "Our flagship MBA program prepares leaders for the challenges of modern business. With a focus on innovation, sustainability, and global perspectives, graduates are equipped to drive organizational success.",
      highlights: ["AACSB Accredited", "Top 20 Global Ranking", "98% Employment Rate"],
    },
    features: [
      "Case-based learning methodology",
      "Global immersion trips to 3 continents",
      "Personalized leadership coaching",
      "Industry consulting projects",
      "Entrepreneurship incubator access",
    ],
    faculty: [
      { name: "Dr. Sarah Chen", title: "Dean, Professor of Strategy", expertise: "Corporate Strategy" },
      { name: "Prof. Michael Roberts", title: "Professor of Finance", expertise: "Investment Banking" },
      { name: "Dr. Priya Sharma", title: "Associate Professor", expertise: "Organizational Behavior" },
    ],
    currentStudents: {
      totalEnrollment: 450,
      demographics: { international: "45%", women: "42%", avgAge: 28 },
      topCountries: ["USA", "India", "China", "UK", "Brazil"],
    },
    alumni: {
      totalCount: 15000,
      notableAlumni: [
        { name: "John Smith", position: "CEO, TechCorp", graduationYear: 2010 },
        { name: "Maria Garcia", position: "Partner, McKinsey", graduationYear: 2015 },
      ],
      avgSalaryIncrease: "85%",
    },
    rankings: [
      { source: "Financial Times", rank: 15, year: 2024 },
      { source: "US News", rank: 18, year: 2024 },
      { source: "The Economist", rank: 12, year: 2024 },
    ],
    recruiters: ["Amazon", "Google", "McKinsey", "Goldman Sachs", "Apple", "Microsoft", "Bain & Company", "JP Morgan"],
    jobRoles: [
      { title: "Strategy Consultant", avgSalary: "$175,000" },
      { title: "Product Manager", avgSalary: "$165,000" },
      { title: "Investment Banking Analyst", avgSalary: "$180,000" },
      { title: "Operations Manager", avgSalary: "$145,000" },
    ],
    faqs: [
      { question: "What is the GMAT requirement?", answer: "We accept GMAT scores of 680 and above, though we review applications holistically." },
      { question: "Is work experience required?", answer: "Yes, we require a minimum of 3 years of full-time work experience." },
      { question: "Are scholarships available?", answer: "Yes, merit-based scholarships covering up to 50% of tuition are available." },
    ],
    pocs: [
      { name: "Jennifer Wilson", role: "Admissions Director", email: "jwilson@university.edu", phone: "+1-555-0101" },
      { name: "David Park", role: "Student Services", email: "dpark@university.edu", phone: "+1-555-0102" },
    ],
  },
  {
    id: "2",
    name: "Master of Science in Data Science",
    type: "Graduate",
    duration: "1.5 Years",
    mode: "Full-Time",
    intake: "Spring 2025",
    tuition: "$55,000/year",
    status: "Active",
    applicationDeadline: "November 30, 2024",
    info: {
      description: "A cutting-edge program combining statistics, machine learning, and business analytics to prepare data leaders.",
      highlights: ["Industry Partnership with Tech Giants", "Hands-on Capstone Projects", "Python & R Intensive"],
    },
    features: [
      "Real-world datasets from partner companies",
      "Cloud computing infrastructure access",
      "Machine learning specialization track",
      "Internship placement guarantee",
    ],
    faculty: [
      { name: "Dr. Alex Kim", title: "Program Director", expertise: "Machine Learning" },
      { name: "Prof. Lisa Wang", title: "Professor of Statistics", expertise: "Bayesian Methods" },
    ],
    currentStudents: {
      totalEnrollment: 120,
      demographics: { international: "60%", women: "38%", avgAge: 26 },
      topCountries: ["India", "China", "USA", "Germany", "Canada"],
    },
    alumni: {
      totalCount: 800,
      notableAlumni: [
        { name: "Kevin Lee", position: "Data Science Lead, Netflix", graduationYear: 2020 },
      ],
      avgSalaryIncrease: "70%",
    },
    rankings: [
      { source: "QS World Rankings", rank: 8, year: 2024 },
    ],
    recruiters: ["Meta", "Netflix", "Spotify", "Uber", "Airbnb"],
    jobRoles: [
      { title: "Data Scientist", avgSalary: "$155,000" },
      { title: "ML Engineer", avgSalary: "$170,000" },
    ],
    faqs: [
      { question: "Is programming experience required?", answer: "Basic Python proficiency is expected. We offer a pre-program bootcamp for those needing to brush up." },
    ],
    pocs: [
      { name: "Rachel Green", role: "Program Coordinator", email: "rgreen@university.edu", phone: "+1-555-0201" },
    ],
  },
];

export default function Programs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [programs, setPrograms] = useState<Program[]>(initialMockPrograms);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [newProgramRequest, setNewProgramRequest] = useState({ name: "", description: "", justification: "" });
  const { isAdmin } = useAdminStatus();

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestProgram = () => {
    if (!newProgramRequest.name.trim() || !newProgramRequest.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    // TODO: Implement API call to submit program request
    toast.success("Program request submitted successfully");
    setIsRequestDialogOpen(false);
    setNewProgramRequest({ name: "", description: "", justification: "" });
  };

  const handleUpdateProgram = (updatedProgram: Program) => {
    setPrograms(prev => prev.map(p => p.id === updatedProgram.id ? updatedProgram : p));
    setSelectedProgram(updatedProgram);
    toast.success("Program updated successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Programs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view all academic programs
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Request New Program
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Request New Program</DialogTitle>
                  <DialogDescription>
                    Submit a request to add a new program to the catalog.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="program-name">Program Name *</Label>
                    <Input
                      id="program-name"
                      placeholder="e.g., Master of Science in AI"
                      value={newProgramRequest.name}
                      onChange={(e) => setNewProgramRequest(prev => ({ ...prev, name: e.target.value }))}
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program-description">Program Description *</Label>
                    <Textarea
                      id="program-description"
                      placeholder="Brief description of the program..."
                      value={newProgramRequest.description}
                      onChange={(e) => setNewProgramRequest(prev => ({ ...prev, description: e.target.value }))}
                      maxLength={1000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program-justification">Justification</Label>
                    <Textarea
                      id="program-justification"
                      placeholder="Why should this program be added?"
                      value={newProgramRequest.justification}
                      onChange={(e) => setNewProgramRequest(prev => ({ ...prev, justification: e.target.value }))}
                      maxLength={1000}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleRequestProgram}>
                      Submit Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Programs Grid or Detail View */}
        {selectedProgram ? (
          <ProgramDetail 
            program={selectedProgram} 
            onBack={() => setSelectedProgram(null)} 
            onUpdate={handleUpdateProgram}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrograms.map((program) => (
              <Card
                key={program.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/30 group"
                onClick={() => setSelectedProgram(program)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                          {program.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">{program.type}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{program.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>{program.tuition}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={program.status === "Active" ? "default" : "secondary"} className="text-xs">
                      {program.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                      View details <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredPrograms.length === 0 && !selectedProgram && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No programs found</p>
              <p className="text-sm mt-1">Try adjusting your search terms</p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

// Editable Field Component
function EditableField({ 
  value, 
  onSave, 
  isAdmin,
  type = "text",
  placeholder = "",
  multiline = false,
}: { 
  value: string; 
  onSave: (value: string) => void;
  isAdmin: boolean;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isAdmin) {
    return <span>{value}</span>;
  }

  if (isEditing) {
    return (
      <div className="flex items-start gap-2">
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="text-sm"
            maxLength={2000}
          />
        ) : (
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="text-sm h-8"
            maxLength={200}
          />
        )}
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave}>
          <Save className="h-4 w-4 text-green-600" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel}>
          <X className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2">
      <span className="flex-1">{value || <span className="text-muted-foreground italic">{placeholder}</span>}</span>
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  );
}

// Program Detail Component
function ProgramDetail({ 
  program, 
  onBack, 
  onUpdate,
  isAdmin 
}: { 
  program: Program; 
  onBack: () => void; 
  onUpdate: (program: Program) => void;
  isAdmin: boolean;
}) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [localProgram, setLocalProgram] = useState(program);

  // Feature editing
  const [newFeature, setNewFeature] = useState("");
  const addFeature = () => {
    if (newFeature.trim()) {
      const updated = { ...localProgram, features: [...localProgram.features, newFeature.trim()] };
      setLocalProgram(updated);
      onUpdate(updated);
      setNewFeature("");
    }
  };
  const removeFeature = (index: number) => {
    const updated = { ...localProgram, features: localProgram.features.filter((_, i) => i !== index) };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // Faculty editing
  const [newFaculty, setNewFaculty] = useState<Faculty>({ name: "", title: "", expertise: "" });
  const addFaculty = () => {
    const result = facultySchema.safeParse(newFaculty);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    const updated = { ...localProgram, faculty: [...localProgram.faculty, newFaculty] };
    setLocalProgram(updated);
    onUpdate(updated);
    setNewFaculty({ name: "", title: "", expertise: "" });
  };
  const removeFaculty = (index: number) => {
    const updated = { ...localProgram, faculty: localProgram.faculty.filter((_, i) => i !== index) };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // Alumni editing
  const [newAlumni, setNewAlumni] = useState<Alumni>({ name: "", position: "", graduationYear: new Date().getFullYear() });
  const addAlumni = () => {
    const result = alumniSchema.safeParse(newAlumni);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    const updated = { 
      ...localProgram, 
      alumni: { ...localProgram.alumni, notableAlumni: [...localProgram.alumni.notableAlumni, newAlumni] } 
    };
    setLocalProgram(updated);
    onUpdate(updated);
    setNewAlumni({ name: "", position: "", graduationYear: new Date().getFullYear() });
  };
  const removeAlumni = (index: number) => {
    const updated = { 
      ...localProgram, 
      alumni: { ...localProgram.alumni, notableAlumni: localProgram.alumni.notableAlumni.filter((_, i) => i !== index) } 
    };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // Ranking editing
  const [newRanking, setNewRanking] = useState<Ranking>({ source: "", rank: 1, year: new Date().getFullYear() });
  const addRanking = () => {
    if (!newRanking.source.trim()) {
      toast.error("Source is required");
      return;
    }
    const updated = { ...localProgram, rankings: [...localProgram.rankings, newRanking] };
    setLocalProgram(updated);
    onUpdate(updated);
    setNewRanking({ source: "", rank: 1, year: new Date().getFullYear() });
  };
  const removeRanking = (index: number) => {
    const updated = { ...localProgram, rankings: localProgram.rankings.filter((_, i) => i !== index) };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // Recruiter editing
  const [newRecruiter, setNewRecruiter] = useState("");
  const addRecruiter = () => {
    if (newRecruiter.trim()) {
      const updated = { ...localProgram, recruiters: [...localProgram.recruiters, newRecruiter.trim()] };
      setLocalProgram(updated);
      onUpdate(updated);
      setNewRecruiter("");
    }
  };
  const removeRecruiter = (index: number) => {
    const updated = { ...localProgram, recruiters: localProgram.recruiters.filter((_, i) => i !== index) };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // Job Role editing
  const [newJobRole, setNewJobRole] = useState<JobRole>({ title: "", avgSalary: "" });
  const addJobRole = () => {
    if (!newJobRole.title.trim()) {
      toast.error("Job title is required");
      return;
    }
    const updated = { ...localProgram, jobRoles: [...localProgram.jobRoles, newJobRole] };
    setLocalProgram(updated);
    onUpdate(updated);
    setNewJobRole({ title: "", avgSalary: "" });
  };
  const removeJobRole = (index: number) => {
    const updated = { ...localProgram, jobRoles: localProgram.jobRoles.filter((_, i) => i !== index) };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // FAQ editing
  const [newFaq, setNewFaq] = useState<FAQ>({ question: "", answer: "" });
  const addFaq = () => {
    const result = faqSchema.safeParse(newFaq);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    const updated = { ...localProgram, faqs: [...localProgram.faqs, newFaq] };
    setLocalProgram(updated);
    onUpdate(updated);
    setNewFaq({ question: "", answer: "" });
  };
  const removeFaq = (index: number) => {
    const updated = { ...localProgram, faqs: localProgram.faqs.filter((_, i) => i !== index) };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // POC editing
  const [newPoc, setNewPoc] = useState<POC>({ name: "", role: "", email: "", phone: "" });
  const addPoc = () => {
    const result = pocSchema.safeParse(newPoc);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    const updated = { ...localProgram, pocs: [...localProgram.pocs, newPoc] };
    setLocalProgram(updated);
    onUpdate(updated);
    setNewPoc({ name: "", role: "", email: "", phone: "" });
  };
  const removePoc = (index: number) => {
    const updated = { ...localProgram, pocs: localProgram.pocs.filter((_, i) => i !== index) };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // Update info
  const updateInfo = (field: string, value: string) => {
    const updated = { ...localProgram, info: { ...localProgram.info, [field]: value } };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  const updateField = (field: string, value: string) => {
    const updated = { ...localProgram, [field]: value };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // Highlight editing
  const [newHighlight, setNewHighlight] = useState("");
  const addHighlight = () => {
    if (newHighlight.trim()) {
      const updated = { 
        ...localProgram, 
        info: { ...localProgram.info, highlights: [...localProgram.info.highlights, newHighlight.trim()] } 
      };
      setLocalProgram(updated);
      onUpdate(updated);
      setNewHighlight("");
    }
  };
  const removeHighlight = (index: number) => {
    const updated = { 
      ...localProgram, 
      info: { ...localProgram.info, highlights: localProgram.info.highlights.filter((_, i) => i !== index) } 
    };
    setLocalProgram(updated);
    onUpdate(updated);
  };
  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...localProgram.info.highlights];
    newHighlights[index] = value;
    const updated = { ...localProgram, info: { ...localProgram.info, highlights: newHighlights } };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // Students editing
  const updateStudentsDemographics = (field: string, value: string | number) => {
    const updated = {
      ...localProgram,
      currentStudents: {
        ...localProgram.currentStudents,
        demographics: { ...localProgram.currentStudents.demographics, [field]: value }
      }
    };
    setLocalProgram(updated);
    onUpdate(updated);
  };
  const updateStudentsEnrollment = (value: number) => {
    const updated = {
      ...localProgram,
      currentStudents: { ...localProgram.currentStudents, totalEnrollment: value }
    };
    setLocalProgram(updated);
    onUpdate(updated);
  };
  const [newCountry, setNewCountry] = useState("");
  const addCountry = () => {
    if (newCountry.trim()) {
      const updated = {
        ...localProgram,
        currentStudents: { ...localProgram.currentStudents, topCountries: [...localProgram.currentStudents.topCountries, newCountry.trim()] }
      };
      setLocalProgram(updated);
      onUpdate(updated);
      setNewCountry("");
    }
  };
  const removeCountry = (index: number) => {
    const updated = {
      ...localProgram,
      currentStudents: { ...localProgram.currentStudents, topCountries: localProgram.currentStudents.topCountries.filter((_, i) => i !== index) }
    };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // Alumni stats editing
  const updateAlumniStats = (field: string, value: string | number) => {
    const updated = {
      ...localProgram,
      alumni: { ...localProgram.alumni, [field]: value }
    };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  // Inline editing for existing items
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...localProgram.features];
    newFeatures[index] = value;
    const updated = { ...localProgram, features: newFeatures };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  const updateFaculty = (index: number, field: keyof Faculty, value: string) => {
    const newFaculty = [...localProgram.faculty];
    newFaculty[index] = { ...newFaculty[index], [field]: value };
    const updated = { ...localProgram, faculty: newFaculty };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  const updateAlumni = (index: number, field: keyof Alumni, value: string | number) => {
    const newAlumni = [...localProgram.alumni.notableAlumni];
    newAlumni[index] = { ...newAlumni[index], [field]: value };
    const updated = { ...localProgram, alumni: { ...localProgram.alumni, notableAlumni: newAlumni } };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  const updateRanking = (index: number, field: keyof Ranking, value: string | number) => {
    const newRankings = [...localProgram.rankings];
    newRankings[index] = { ...newRankings[index], [field]: value };
    const updated = { ...localProgram, rankings: newRankings };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  const updateRecruiter = (index: number, value: string) => {
    const newRecruiters = [...localProgram.recruiters];
    newRecruiters[index] = value;
    const updated = { ...localProgram, recruiters: newRecruiters };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  const updateJobRole = (index: number, field: keyof JobRole, value: string) => {
    const newJobRoles = [...localProgram.jobRoles];
    newJobRoles[index] = { ...newJobRoles[index], [field]: value };
    const updated = { ...localProgram, jobRoles: newJobRoles };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    const newFaqs = [...localProgram.faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    const updated = { ...localProgram, faqs: newFaqs };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  const updatePoc = (index: number, field: keyof POC, value: string) => {
    const newPocs = [...localProgram.pocs];
    newPocs[index] = { ...newPocs[index], [field]: value };
    const updated = { ...localProgram, pocs: newPocs };
    setLocalProgram(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Programs
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-primary/20 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <EditableField 
                value={localProgram.name} 
                onSave={(v) => updateField("name", v)}
                isAdmin={isAdmin}
                placeholder="Program name"
              />
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 
                  <EditableField value={localProgram.duration} onSave={(v) => updateField("duration", v)} isAdmin={isAdmin} placeholder="Duration" />
                </span>
                <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> 
                  <EditableField value={localProgram.mode} onSave={(v) => updateField("mode", v)} isAdmin={isAdmin} placeholder="Mode" />
                </span>
                <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> 
                  <EditableField value={localProgram.tuition} onSave={(v) => updateField("tuition", v)} isAdmin={isAdmin} placeholder="Tuition" />
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {localProgram.info.highlights.map((highlight, i) => (
                  <div key={i} className="group flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">{highlight}</Badge>
                    {isAdmin && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => removeHighlight(i)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <Input 
                      placeholder="Add highlight..." 
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      className="h-6 text-xs w-32"
                      maxLength={50}
                    />
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={addHighlight}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="info" className="gap-1.5 text-xs"><BookOpen className="h-3.5 w-3.5" /> Info</TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5 text-xs"><Star className="h-3.5 w-3.5" /> Features</TabsTrigger>
          <TabsTrigger value="faculty" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Faculty</TabsTrigger>
          <TabsTrigger value="students" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Students</TabsTrigger>
          <TabsTrigger value="alumni" className="gap-1.5 text-xs"><Award className="h-3.5 w-3.5" /> Alumni</TabsTrigger>
          <TabsTrigger value="rankings" className="gap-1.5 text-xs"><TrendingUp className="h-3.5 w-3.5" /> Rankings</TabsTrigger>
          <TabsTrigger value="recruiters" className="gap-1.5 text-xs"><Briefcase className="h-3.5 w-3.5" /> Recruiters</TabsTrigger>
          <TabsTrigger value="jobs" className="gap-1.5 text-xs"><Briefcase className="h-3.5 w-3.5" /> Job Roles</TabsTrigger>
          <TabsTrigger value="faqs" className="gap-1.5 text-xs"><HelpCircle className="h-3.5 w-3.5" /> FAQs</TabsTrigger>
          <TabsTrigger value="pocs" className="gap-1.5 text-xs"><Phone className="h-3.5 w-3.5" /> POCs</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Program Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <div className="mt-1">
                  <EditableField 
                    value={localProgram.info.description} 
                    onSave={(v) => updateInfo("description", v)}
                    isAdmin={isAdmin}
                    multiline
                    placeholder="Enter program description..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Application Deadline</p>
                  <EditableField 
                    value={localProgram.applicationDeadline} 
                    onSave={(v) => updateField("applicationDeadline", v)}
                    isAdmin={isAdmin}
                    placeholder="e.g., March 15, 2025"
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Next Intake</p>
                  <EditableField 
                    value={localProgram.intake} 
                    onSave={(v) => updateField("intake", v)}
                    isAdmin={isAdmin}
                    placeholder="e.g., Fall 2025"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Program Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {localProgram.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Star className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1">
                      <EditableField 
                        value={feature} 
                        onSave={(v) => updateFeature(i, v)}
                        isAdmin={isAdmin}
                        placeholder="Feature description"
                      />
                    </div>
                    {isAdmin && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => removeFeature(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              {isAdmin && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Input 
                    placeholder="Add new feature..." 
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="text-sm"
                    maxLength={200}
                  />
                  <Button size="sm" onClick={addFeature}><Plus className="h-4 w-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faculty Tab */}
        <TabsContent value="faculty">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {localProgram.faculty.map((member, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card relative group">
                    {isAdmin && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => removeFaculty(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-medium text-sm">
                      <EditableField value={member.name} onSave={(v) => updateFaculty(i, "name", v)} isAdmin={isAdmin} placeholder="Name" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <EditableField value={member.title} onSave={(v) => updateFaculty(i, "title", v)} isAdmin={isAdmin} placeholder="Title" />
                    </div>
                    <div className="mt-2">
                      <EditableField value={member.expertise} onSave={(v) => updateFaculty(i, "expertise", v)} isAdmin={isAdmin} placeholder="Expertise" />
                    </div>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <p className="text-sm font-medium">Add Faculty Member</p>
                  <div className="grid gap-2 md:grid-cols-3">
                    <Input 
                      placeholder="Name" 
                      value={newFaculty.name}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, name: e.target.value }))}
                      maxLength={100}
                    />
                    <Input 
                      placeholder="Title" 
                      value={newFaculty.title}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, title: e.target.value }))}
                      maxLength={100}
                    />
                    <Input 
                      placeholder="Expertise" 
                      value={newFaculty.expertise}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, expertise: e.target.value }))}
                      maxLength={100}
                    />
                  </div>
                  <Button size="sm" onClick={addFaculty}><Plus className="h-4 w-4 mr-1" /> Add Faculty</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  {isAdmin ? (
                    <Input 
                      type="number"
                      value={localProgram.currentStudents.totalEnrollment}
                      onChange={(e) => updateStudentsEnrollment(parseInt(e.target.value) || 0)}
                      className="text-2xl font-bold text-primary text-center h-auto py-0 border-0 bg-transparent"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{localProgram.currentStudents.totalEnrollment}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Total Enrollment</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  {isAdmin ? (
                    <Input 
                      value={localProgram.currentStudents.demographics.international}
                      onChange={(e) => updateStudentsDemographics("international", e.target.value)}
                      className="text-2xl font-bold text-primary text-center h-auto py-0 border-0 bg-transparent"
                      placeholder="e.g., 45%"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{localProgram.currentStudents.demographics.international}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">International</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  {isAdmin ? (
                    <Input 
                      value={localProgram.currentStudents.demographics.women}
                      onChange={(e) => updateStudentsDemographics("women", e.target.value)}
                      className="text-2xl font-bold text-primary text-center h-auto py-0 border-0 bg-transparent"
                      placeholder="e.g., 42%"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{localProgram.currentStudents.demographics.women}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Women</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  {isAdmin ? (
                    <Input 
                      type="number"
                      value={localProgram.currentStudents.demographics.avgAge}
                      onChange={(e) => updateStudentsDemographics("avgAge", parseInt(e.target.value) || 0)}
                      className="text-2xl font-bold text-primary text-center h-auto py-0 border-0 bg-transparent"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{localProgram.currentStudents.demographics.avgAge}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Avg Age</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Top Countries</p>
                <div className="flex flex-wrap gap-2">
                  {localProgram.currentStudents.topCountries.map((country, i) => (
                    <div key={i} className="group flex items-center gap-1">
                      <Badge variant="secondary">{country}</Badge>
                      {isAdmin && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-4 w-4 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() => removeCountry(i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <Input 
                        placeholder="Add country..." 
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        className="h-6 text-xs w-24"
                        maxLength={50}
                      />
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={addCountry}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alumni Tab */}
        <TabsContent value="alumni">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alumni Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  {isAdmin ? (
                    <Input 
                      type="number"
                      value={localProgram.alumni.totalCount}
                      onChange={(e) => updateAlumniStats("totalCount", parseInt(e.target.value) || 0)}
                      className="text-2xl font-bold text-primary text-center h-auto py-0 border-0 bg-transparent"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{localProgram.alumni.totalCount.toLocaleString()}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Total Alumni</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  {isAdmin ? (
                    <Input 
                      value={localProgram.alumni.avgSalaryIncrease}
                      onChange={(e) => updateAlumniStats("avgSalaryIncrease", e.target.value)}
                      className="text-2xl font-bold text-primary text-center h-auto py-0 border-0 bg-transparent"
                      placeholder="e.g., 85%"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{localProgram.alumni.avgSalaryIncrease}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Avg Salary Increase</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Notable Alumni</p>
                <div className="space-y-3">
                  {localProgram.alumni.notableAlumni.map((alum, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border group">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          <EditableField value={alum.name} onSave={(v) => updateAlumni(i, "name", v)} isAdmin={isAdmin} placeholder="Name" />
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <EditableField value={alum.position} onSave={(v) => updateAlumni(i, "position", v)} isAdmin={isAdmin} placeholder="Position" />
                          <span>·</span>
                          <span>Class of </span>
                          {isAdmin ? (
                            <Input 
                              type="number"
                              value={alum.graduationYear}
                              onChange={(e) => updateAlumni(i, "graduationYear", parseInt(e.target.value) || new Date().getFullYear())}
                              className="w-16 h-5 text-xs px-1"
                              min={1950}
                              max={new Date().getFullYear()}
                            />
                          ) : (
                            <span>{alum.graduationYear}</span>
                          )}
                        </div>
                      </div>
                      {isAdmin && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() => removeAlumni(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {isAdmin && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <p className="text-sm font-medium">Add Notable Alumni</p>
                    <div className="grid gap-2 md:grid-cols-3">
                      <Input 
                        placeholder="Name" 
                        value={newAlumni.name}
                        onChange={(e) => setNewAlumni(prev => ({ ...prev, name: e.target.value }))}
                        maxLength={100}
                      />
                      <Input 
                        placeholder="Position" 
                        value={newAlumni.position}
                        onChange={(e) => setNewAlumni(prev => ({ ...prev, position: e.target.value }))}
                        maxLength={150}
                      />
                      <Input 
                        type="number"
                        placeholder="Graduation Year" 
                        value={newAlumni.graduationYear}
                        onChange={(e) => setNewAlumni(prev => ({ ...prev, graduationYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                        min={1950}
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <Button size="sm" onClick={addAlumni}><Plus className="h-4 w-4 mr-1" /> Add Alumni</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rankings Tab */}
        <TabsContent value="rankings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Program Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {localProgram.rankings.map((ranking, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card text-center relative group">
                    {isAdmin && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => removeRanking(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    <div className="text-3xl font-bold text-primary">
                      #{isAdmin ? (
                        <Input 
                          type="number"
                          value={ranking.rank}
                          onChange={(e) => updateRanking(i, "rank", parseInt(e.target.value) || 1)}
                          className="w-16 inline-block text-center h-auto py-0 border-0 bg-transparent text-3xl font-bold text-primary"
                          min={1}
                        />
                      ) : ranking.rank}
                    </div>
                    <div className="font-medium text-sm mt-2">
                      <EditableField value={ranking.source} onSave={(v) => updateRanking(i, "source", v)} isAdmin={isAdmin} placeholder="Source" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isAdmin ? (
                        <Input 
                          type="number"
                          value={ranking.year}
                          onChange={(e) => updateRanking(i, "year", parseInt(e.target.value) || new Date().getFullYear())}
                          className="w-16 text-center h-5 text-xs"
                          min={2000}
                          max={new Date().getFullYear() + 1}
                        />
                      ) : ranking.year}
                    </div>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <p className="text-sm font-medium">Add Ranking</p>
                  <div className="grid gap-2 md:grid-cols-3">
                    <Input 
                      placeholder="Source (e.g., US News)" 
                      value={newRanking.source}
                      onChange={(e) => setNewRanking(prev => ({ ...prev, source: e.target.value }))}
                      maxLength={100}
                    />
                    <Input 
                      type="number"
                      placeholder="Rank" 
                      value={newRanking.rank}
                      onChange={(e) => setNewRanking(prev => ({ ...prev, rank: parseInt(e.target.value) || 1 }))}
                      min={1}
                    />
                    <Input 
                      type="number"
                      placeholder="Year" 
                      value={newRanking.year}
                      onChange={(e) => setNewRanking(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                      min={2000}
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <Button size="sm" onClick={addRanking}><Plus className="h-4 w-4 mr-1" /> Add Ranking</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recruiters Tab */}
        <TabsContent value="recruiters">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Recruiters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {localProgram.recruiters.map((recruiter, i) => (
                  <div key={i} className="px-4 py-3 rounded-lg border bg-card flex items-center gap-2 group">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm font-medium">
                      <EditableField value={recruiter} onSave={(v) => updateRecruiter(i, v)} isAdmin={isAdmin} placeholder="Company name" />
                    </div>
                    {isAdmin && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 text-destructive ml-1"
                        onClick={() => removeRecruiter(i)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {isAdmin && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Input 
                    placeholder="Add recruiter company..." 
                    value={newRecruiter}
                    onChange={(e) => setNewRecruiter(e.target.value)}
                    className="text-sm max-w-xs"
                    maxLength={100}
                  />
                  <Button size="sm" onClick={addRecruiter}><Plus className="h-4 w-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Roles Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Common Job Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {localProgram.jobRoles.map((job, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card flex items-center justify-between group">
                    <div className="flex items-center gap-3 flex-1">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <div className="text-sm font-medium flex-1">
                        <EditableField value={job.title} onSave={(v) => updateJobRole(i, "title", v)} isAdmin={isAdmin} placeholder="Job title" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <EditableField value={job.avgSalary} onSave={(v) => updateJobRole(i, "avgSalary", v)} isAdmin={isAdmin} placeholder="Salary" />
                      </div>
                      {isAdmin && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() => removeJobRole(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <p className="text-sm font-medium">Add Job Role</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input 
                      placeholder="Job Title" 
                      value={newJobRole.title}
                      onChange={(e) => setNewJobRole(prev => ({ ...prev, title: e.target.value }))}
                      maxLength={100}
                    />
                    <Input 
                      placeholder="Avg Salary (e.g., $150,000)" 
                      value={newJobRole.avgSalary}
                      onChange={(e) => setNewJobRole(prev => ({ ...prev, avgSalary: e.target.value }))}
                      maxLength={50}
                    />
                  </div>
                  <Button size="sm" onClick={addJobRole}><Plus className="h-4 w-4 mr-1" /> Add Job Role</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {localProgram.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <div className="flex items-center">
                      <AccordionTrigger className="text-sm text-left flex-1">
                        {isAdmin ? (
                          <div className="flex-1 pr-2" onClick={(e) => e.stopPropagation()}>
                            <EditableField value={faq.question} onSave={(v) => updateFaq(i, "question", v)} isAdmin={isAdmin} placeholder="Question" />
                          </div>
                        ) : faq.question}
                      </AccordionTrigger>
                      {isAdmin && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 text-destructive mr-2"
                          onClick={(e) => { e.stopPropagation(); removeFaq(i); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {isAdmin ? (
                        <EditableField value={faq.answer} onSave={(v) => updateFaq(i, "answer", v)} isAdmin={isAdmin} placeholder="Answer" multiline />
                      ) : faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {isAdmin && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <p className="text-sm font-medium">Add FAQ</p>
                  <div className="space-y-2">
                    <Input 
                      placeholder="Question" 
                      value={newFaq.question}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                      maxLength={500}
                    />
                    <Textarea 
                      placeholder="Answer" 
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                      maxLength={2000}
                    />
                  </div>
                  <Button size="sm" onClick={addFaq}><Plus className="h-4 w-4 mr-1" /> Add FAQ</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* POCs Tab */}
        <TabsContent value="pocs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Points of Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {localProgram.pocs.map((poc, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card relative group">
                    {isAdmin && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => removePoc(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          <EditableField value={poc.name} onSave={(v) => updatePoc(i, "name", v)} isAdmin={isAdmin} placeholder="Name" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <EditableField value={poc.role} onSave={(v) => updatePoc(i, "role", v)} isAdmin={isAdmin} placeholder="Role" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>
                        <EditableField value={poc.email} onSave={(v) => updatePoc(i, "email", v)} isAdmin={isAdmin} placeholder="Email" />
                      </div>
                      <div>
                        <EditableField value={poc.phone} onSave={(v) => updatePoc(i, "phone", v)} isAdmin={isAdmin} placeholder="Phone" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <p className="text-sm font-medium">Add Point of Contact</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input 
                      placeholder="Name" 
                      value={newPoc.name}
                      onChange={(e) => setNewPoc(prev => ({ ...prev, name: e.target.value }))}
                      maxLength={100}
                    />
                    <Input 
                      placeholder="Role" 
                      value={newPoc.role}
                      onChange={(e) => setNewPoc(prev => ({ ...prev, role: e.target.value }))}
                      maxLength={100}
                    />
                    <Input 
                      type="email"
                      placeholder="Email" 
                      value={newPoc.email}
                      onChange={(e) => setNewPoc(prev => ({ ...prev, email: e.target.value }))}
                      maxLength={255}
                    />
                    <Input 
                      placeholder="Phone" 
                      value={newPoc.phone}
                      onChange={(e) => setNewPoc(prev => ({ ...prev, phone: e.target.value }))}
                      maxLength={20}
                    />
                  </div>
                  <Button size="sm" onClick={addPoc}><Plus className="h-4 w-4 mr-1" /> Add Contact</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
