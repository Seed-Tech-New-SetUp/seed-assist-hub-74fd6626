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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  MapPin,
  Clock,
  DollarSign,
} from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { toast } from "sonner";

// Mock data for programs - TODO: Replace with API call
const mockPrograms = [
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
    recruiters: [
      "Amazon", "Google", "McKinsey", "Goldman Sachs", "Apple", "Microsoft", "Bain & Company", "JP Morgan"
    ],
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
  const [selectedProgram, setSelectedProgram] = useState<typeof mockPrograms[0] | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [newProgramRequest, setNewProgramRequest] = useState({ name: "", description: "", justification: "" });
  const { isAdmin } = useAdminStatus();

  const filteredPrograms = mockPrograms.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestProgram = () => {
    // TODO: Implement API call to submit program request
    toast.success("Program request submitted successfully");
    setIsRequestDialogOpen(false);
    setNewProgramRequest({ name: "", description: "", justification: "" });
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
                    <Label htmlFor="program-name">Program Name</Label>
                    <Input
                      id="program-name"
                      placeholder="e.g., Master of Science in AI"
                      value={newProgramRequest.name}
                      onChange={(e) => setNewProgramRequest(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program-description">Program Description</Label>
                    <Textarea
                      id="program-description"
                      placeholder="Brief description of the program..."
                      value={newProgramRequest.description}
                      onChange={(e) => setNewProgramRequest(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program-justification">Justification</Label>
                    <Textarea
                      id="program-justification"
                      placeholder="Why should this program be added?"
                      value={newProgramRequest.justification}
                      onChange={(e) => setNewProgramRequest(prev => ({ ...prev, justification: e.target.value }))}
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
          <ProgramDetail program={selectedProgram} onBack={() => setSelectedProgram(null)} />
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

// Program Detail Component
function ProgramDetail({ program, onBack }: { program: typeof mockPrograms[0]; onBack: () => void }) {
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
              <h2 className="text-xl font-display font-bold text-foreground">{program.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {program.duration}</span>
                <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {program.mode}</span>
                <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> {program.tuition}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {program.info.highlights.map((highlight, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{highlight}</Badge>
                ))}
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

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Program Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{program.info.description}</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Application Deadline</p>
                  <p className="font-medium mt-1">{program.applicationDeadline}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Next Intake</p>
                  <p className="font-medium mt-1">{program.intake}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Program Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {program.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Star className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {program.faculty.map((member, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{member.title}</p>
                    <Badge variant="outline" className="mt-2 text-xs">{member.expertise}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">{program.currentStudents.totalEnrollment}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Enrollment</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">{program.currentStudents.demographics.international}</p>
                  <p className="text-xs text-muted-foreground mt-1">International</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">{program.currentStudents.demographics.women}</p>
                  <p className="text-xs text-muted-foreground mt-1">Women</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">{program.currentStudents.demographics.avgAge}</p>
                  <p className="text-xs text-muted-foreground mt-1">Avg Age</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Top Countries</p>
                <div className="flex flex-wrap gap-2">
                  {program.currentStudents.topCountries.map((country, i) => (
                    <Badge key={i} variant="secondary">{country}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alumni">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alumni Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">{program.alumni.totalCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Alumni</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">{program.alumni.avgSalaryIncrease}</p>
                  <p className="text-xs text-muted-foreground mt-1">Avg Salary Increase</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Notable Alumni</p>
                <div className="space-y-3">
                  {program.alumni.notableAlumni.map((alum, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{alum.name}</p>
                        <p className="text-xs text-muted-foreground">{alum.position} · Class of {alum.graduationYear}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rankings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Program Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {program.rankings.map((ranking, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card text-center">
                    <p className="text-3xl font-bold text-primary">#{ranking.rank}</p>
                    <p className="font-medium text-sm mt-2">{ranking.source}</p>
                    <p className="text-xs text-muted-foreground">{ranking.year}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiters">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Recruiters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {program.recruiters.map((recruiter, i) => (
                  <div key={i} className="px-4 py-3 rounded-lg border bg-card flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{recruiter}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Common Job Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {program.jobRoles.map((job, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{job.title}</span>
                    </div>
                    <Badge variant="outline">{job.avgSalary}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {program.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-sm text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pocs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Points of Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {program.pocs.map((poc, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{poc.name}</p>
                        <p className="text-xs text-muted-foreground">{poc.role}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>{poc.email}</p>
                      <p>{poc.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
