import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Info,
  Sparkles,
  Users,
  GraduationCap,
  Trophy,
  Building2,
  Briefcase,
  HelpCircle,
  Phone,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Image,
  Mail,
  Linkedin,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAdminStatus } from "@/hooks/useAdminStatus";

const programSections = [
  { id: "info", label: "Core Details", icon: Info },
  { id: "features", label: "Key Highlights", icon: Sparkles },
  { id: "faculty", label: "Faculty Members", icon: Users },
  { id: "students", label: "Current Cohort", icon: GraduationCap },
  { id: "alumni", label: "Alumni Network", icon: GraduationCap },
  { id: "rankings", label: "Accreditations & Rankings", icon: Trophy },
  { id: "recruiters", label: "Recruiting Partners", icon: Building2 },
  { id: "jobroles", label: "Career Outcomes", icon: Briefcase },
  { id: "faqs", label: "Knowledge Base", icon: HelpCircle },
  { id: "pocs", label: "Key Contacts", icon: Phone },
];

// Mock programs data
const mockPrograms = [
  { id: "1", name: "MBA Full-Time", type: "MBA" },
  { id: "2", name: "Executive MBA", type: "EMBA" },
  { id: "3", name: "Master in Finance", type: "MiF" },
];

export default function Programs() {
  const [selectedProgram, setSelectedProgram] = useState(mockPrograms[0]?.id || "");
  const [activeSection, setActiveSection] = useState("info");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const { toast } = useToast();
  const { isAdmin } = useAdminStatus();

  const handleSave = (sectionId: string) => {
    setCompletedSections(prev => [...new Set([...prev, sectionId])]);
    toast({
      title: "Section Saved",
      description: "Your changes have been saved successfully.",
    });
    
    const currentIndex = programSections.findIndex(s => s.id === sectionId);
    if (currentIndex < programSections.length - 1) {
      setActiveSection(programSections[currentIndex + 1].id);
    }
  };

  const handleNext = () => {
    const currentIndex = programSections.findIndex(s => s.id === activeSection);
    if (currentIndex < programSections.length - 1) {
      setActiveSection(programSections[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = programSections.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(programSections[currentIndex - 1].id);
    }
  };

  const handleRequestNewProgram = () => {
    toast({
      title: "Request Submitted",
      description: "Your request for a new program has been submitted for review.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Academic Programs</h1>
            <p className="text-muted-foreground mt-1">Manage your program portfolio and settings</p>
          </div>
          {isAdmin && (
            <Button onClick={handleRequestNewProgram}>
              <Plus className="h-4 w-4 mr-2" />
              Request New Program
            </Button>
          )}
        </div>

        {/* Program Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">Select Program:</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {mockPrograms.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary">{mockPrograms.find(p => p.id === selectedProgram)?.type}</Badge>
            </div>
          </CardContent>
        </Card>

        {selectedProgram && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <Card className="lg:col-span-1 h-fit">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {programSections.map((section, index) => {
                    const isActive = activeSection === section.id;
                    const isCompleted = completedSections.includes(section.id);
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium",
                          isCompleted ? "bg-green-500 text-white" : isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                        </div>
                        <span className="flex-1">{section.label}</span>
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Form Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {programSections.find(s => s.id === activeSection)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {activeSection === "info" && <ProgramInfoSection />}
                  {activeSection === "features" && <ProgramFeaturesSection />}
                  {activeSection === "faculty" && <ProgramFacultySection />}
                  {activeSection === "students" && <CurrentStudentsSection />}
                  {activeSection === "alumni" && <ProgramAlumniSection />}
                  {activeSection === "rankings" && <ProgramRankingsSection />}
                  {activeSection === "recruiters" && <ProgramRecruitersSection />}
                  {activeSection === "jobroles" && <ProgramJobRolesSection />}
                  {activeSection === "faqs" && <ProgramFAQsSection />}
                  {activeSection === "pocs" && <ProgramPOCsSection />}

                  {/* Navigation Buttons */}
                  <Separator />
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={activeSection === programSections[0].id}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSave(activeSection)}>
                        Save Section
                      </Button>
                      {activeSection !== programSections[programSections.length - 1].id && (
                        <Button variant="outline" onClick={handleNext}>
                          Next
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ProgramInfoSection() {
  const [diversity, setDiversity] = useState([
    { country: "India", percentage: 35 },
    { country: "USA", percentage: 20 },
    { country: "China", percentage: 15 },
  ]);

  const addDiversity = () => setDiversity([...diversity, { country: "", percentage: 0 }]);
  const removeDiversity = (index: number) => setDiversity(diversity.filter((_, i) => i !== index));
  const updateDiversity = (index: number, field: string, value: string | number) => {
    const newDiversity = [...diversity];
    newDiversity[index] = { ...newDiversity[index], [field]: value };
    setDiversity(newDiversity);
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Program Name (full width) */}
      <div>
        <Label>Program Name</Label>
        <Input defaultValue="MBA Full-Time" className="mt-1.5" placeholder="Enter program name..." />
      </div>

      {/* Row 2: Class Size, Average Age, Avg Work Exp */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Class Size</Label>
          <Input type="number" defaultValue="120" className="mt-1.5" placeholder="Enter class size..." />
        </div>
        <div>
          <Label>Average Age</Label>
          <Input type="number" defaultValue="28" className="mt-1.5" placeholder="Enter average age..." />
        </div>
        <div>
          <Label>Average Work Experience (Years)</Label>
          <Input type="number" defaultValue="5" className="mt-1.5" placeholder="Enter avg work exp..." />
        </div>
      </div>

      {/* Row 3: Median Earnings, Graduation Rate, Hero Program */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Median Earnings After Graduation (USD/Year)</Label>
          <Input type="number" defaultValue="150000" className="mt-1.5" placeholder="Enter median earnings..." />
        </div>
        <div>
          <Label>Graduation Rate (%)</Label>
          <Input type="number" defaultValue="95" className="mt-1.5" placeholder="Enter graduation rate..." min="0" max="100" />
        </div>
        <div>
          <Label>Is this a Hero Program?</Label>
          <Select defaultValue="no">
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Program Brochure Link */}
      <div>
        <Label>Program Brochure Link</Label>
        <Input type="url" defaultValue="https://example.com/brochure.pdf" className="mt-1.5" placeholder="Enter brochure URL..." />
      </div>

      {/* Program Diversity */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Program Diversity (Country-wise)</Label>
          <Button variant="outline" size="sm" onClick={addDiversity}>
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </Button>
        </div>
        <div className="space-y-2">
          {diversity.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={item.country}
                onChange={(e) => updateDiversity(index, "country", e.target.value)}
                placeholder="Country name..."
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={item.percentage}
                  onChange={(e) => updateDiversity(index, "percentage", parseFloat(e.target.value) || 0)}
                  placeholder="%"
                  className="w-20"
                  min="0"
                  max="100"
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive shrink-0"
                onClick={() => removeDiversity(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {diversity.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">No diversity data added yet</p>
        )}
      </div>
    </div>
  );
}

function ProgramFeaturesSection() {
  const [features, setFeatures] = useState([
    { title: "Global Immersion", description: "Study abroad opportunities in 3 countries", photo: "" },
    { title: "Leadership Lab", description: "Hands-on leadership development program", photo: "" },
  ]);
  const [newFeature, setNewFeature] = useState({ title: "", description: "", photo: "" });

  const addFeature = () => {
    if (newFeature.title.trim()) {
      setFeatures([...features, { ...newFeature }]);
      setNewFeature({ title: "", description: "", photo: "" });
    }
  };
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      {/* Add New Feature Form */}
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Add New Feature</h4>
          <div>
            <Label>Program Title</Label>
            <Input 
              value={newFeature.title}
              onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
              placeholder="Enter feature title..." 
              className="mt-1.5" 
            />
          </div>
          <div>
            <Label>Program Description</Label>
            <Textarea 
              value={newFeature.description}
              onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
              placeholder="Enter feature description..." 
              className="mt-1.5" 
              rows={3}
            />
          </div>
          <div>
            <Label>Feature Photo</Label>
            <ImageUpload
              value={newFeature.photo}
              onChange={(url) => setNewFeature({ ...newFeature, photo: url })}
              placeholder="Click to upload feature photo"
              aspectRatio="video"
              className="mt-1.5"
            />
          </div>
          <Button onClick={addFeature} disabled={!newFeature.title.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </CardContent>
      </Card>

      {/* Added Features List */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Features ({features.length})</h4>
        {features.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No features added yet</p>
        ) : (
          <div className="space-y-3">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {feature.photo ? (
                        <img src={feature.photo} alt={feature.title} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-foreground">{feature.title}</h5>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{feature.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Person Form Component for Faculty, Students, Alumni
interface PersonData {
  firstName: string;
  lastName: string;
  email: string;
  linkedinUrl: string;
  designation: string;
  organisation: string;
  category: string;
  callToAction: "email" | "linkedin";
  profileImage: string;
}

const emptyPerson: PersonData = {
  firstName: "",
  lastName: "",
  email: "",
  linkedinUrl: "",
  designation: "",
  organisation: "",
  category: "Faculty",
  callToAction: "email",
  profileImage: "",
};

interface PersonFormSectionProps {
  title: string;
  defaultCategory: string;
  persons: PersonData[];
  setPersons: React.Dispatch<React.SetStateAction<PersonData[]>>;
  addButtonLabel: string;
}

function PersonFormSection({ title, defaultCategory, persons, setPersons, addButtonLabel }: PersonFormSectionProps) {
  const [newPerson, setNewPerson] = useState<PersonData>({ ...emptyPerson, category: defaultCategory });

  const addPerson = () => {
    if (newPerson.firstName.trim() && newPerson.lastName.trim()) {
      setPersons([...persons, { ...newPerson }]);
      setNewPerson({ ...emptyPerson, category: defaultCategory });
    }
  };

  const removePerson = (index: number) => setPersons(persons.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      {/* Add New Person Form */}
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Add New {title}</h4>
          
          {/* Row 1: First Name, Last Name, Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>First Name</Label>
              <Input 
                value={newPerson.firstName}
                onChange={(e) => setNewPerson({ ...newPerson, firstName: e.target.value })}
                placeholder="First name..." 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input 
                value={newPerson.lastName}
                onChange={(e) => setNewPerson({ ...newPerson, lastName: e.target.value })}
                placeholder="Last name..." 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                value={newPerson.email}
                onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                placeholder="Email address..." 
                className="mt-1.5" 
              />
            </div>
          </div>

          {/* Row 2: LinkedIn, Designation, Organisation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>LinkedIn URL</Label>
              <Input 
                type="url"
                value={newPerson.linkedinUrl}
                onChange={(e) => setNewPerson({ ...newPerson, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..." 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label>Designation</Label>
              <Input 
                value={newPerson.designation}
                onChange={(e) => setNewPerson({ ...newPerson, designation: e.target.value })}
                placeholder="Title/Position..." 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label>Organisation</Label>
              <Input 
                value={newPerson.organisation}
                onChange={(e) => setNewPerson({ ...newPerson, organisation: e.target.value })}
                placeholder="Organisation name..." 
                className="mt-1.5" 
              />
            </div>
          </div>

          {/* Row 3: Category, Call to Action */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Input 
                value={newPerson.category}
                disabled
                className="mt-1.5 bg-muted" 
              />
            </div>
            <div>
              <Label>Call to Action</Label>
              <Select 
                value={newPerson.callToAction} 
                onValueChange={(value: "email" | "linkedin") => setNewPerson({ ...newPerson, callToAction: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Profile Image</Label>
              <ImageUpload
                value={newPerson.profileImage}
                onChange={(url) => setNewPerson({ ...newPerson, profileImage: url })}
                placeholder="Upload photo"
                aspectRatio="square"
                className="mt-1.5 h-[80px] w-[80px]"
              />
            </div>
          </div>

          <Button onClick={addPerson} disabled={!newPerson.firstName.trim() || !newPerson.lastName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            {addButtonLabel}
          </Button>
        </CardContent>
      </Card>

      {/* Added Persons List */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added {title}s ({persons.length})</h4>
        {persons.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No {title.toLowerCase()}s added yet</p>
        ) : (
          <div className="space-y-3">
            {persons.map((person, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {person.profileImage ? (
                        <img src={person.profileImage} alt={`${person.firstName} ${person.lastName}`} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-foreground">{person.firstName} {person.lastName}</h5>
                          <Badge variant="secondary" className="text-xs">{person.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{person.designation} {person.organisation && `at ${person.organisation}`}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {person.email && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {person.email}
                            </span>
                          )}
                          {person.linkedinUrl && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Linkedin className="h-3 w-3" /> LinkedIn
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => removePerson(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramFacultySection() {
  const [faculty, setFaculty] = useState<PersonData[]>([
    { firstName: "John", lastName: "Smith", email: "john.smith@university.edu", linkedinUrl: "https://linkedin.com/in/johnsmith", designation: "Professor of Finance", organisation: "Business School", category: "Faculty", callToAction: "email", profileImage: "" },
    { firstName: "Sarah", lastName: "Johnson", email: "sarah.johnson@university.edu", linkedinUrl: "", designation: "Associate Professor", organisation: "Marketing Department", category: "Faculty", callToAction: "linkedin", profileImage: "" },
  ]);

  return (
    <PersonFormSection 
      title="Faculty Member" 
      defaultCategory="Faculty" 
      persons={faculty} 
      setPersons={setFaculty}
      addButtonLabel="Add Faculty Member"
    />
  );
}

function CurrentStudentsSection() {
  const [students, setStudents] = useState<PersonData[]>([
    { firstName: "Emily", lastName: "Chen", email: "emily.chen@student.edu", linkedinUrl: "https://linkedin.com/in/emilychen", designation: "MBA Candidate", organisation: "Class of 2025", category: "Current Student", callToAction: "linkedin", profileImage: "" },
  ]);

  return (
    <PersonFormSection 
      title="Current Student" 
      defaultCategory="Current Student" 
      persons={students} 
      setPersons={setStudents}
      addButtonLabel="Add Current Student"
    />
  );
}

function ProgramAlumniSection() {
  const [alumni, setAlumni] = useState<PersonData[]>([
    { firstName: "Michael", lastName: "Chen", email: "michael.chen@google.com", linkedinUrl: "https://linkedin.com/in/michaelchen", designation: "Product Manager", organisation: "Google", category: "Alumni", callToAction: "linkedin", profileImage: "" },
    { firstName: "Emily", lastName: "Rodriguez", email: "emily.r@mckinsey.com", linkedinUrl: "", designation: "Senior Consultant", organisation: "McKinsey", category: "Alumni", callToAction: "email", profileImage: "" },
  ]);

  return (
    <PersonFormSection 
      title="Alumni" 
      defaultCategory="Alumni" 
      persons={alumni} 
      setPersons={setAlumni}
      addButtonLabel="Add Alumni"
    />
  );
}

// Mock ranking organizations from backend
const mockRankingOrganizations = [
  { id: "1", name: "Financial Times" },
  { id: "2", name: "QS World University Rankings" },
  { id: "3", name: "The Economist" },
  { id: "4", name: "Bloomberg Businessweek" },
  { id: "5", name: "US News & World Report" },
  { id: "6", name: "Forbes" },
];

interface RankingData {
  organisation: string;
  year: string;
  level: string;
  rank: string;
  supportingText: string;
}

function ProgramRankingsSection() {
  const [rankings, setRankings] = useState<RankingData[]>([
    { organisation: "Financial Times", year: "2024", level: "Program", rank: "5", supportingText: "Top 5 globally for MBA programs" },
    { organisation: "QS World University Rankings", year: "2024", level: "Program", rank: "8", supportingText: "Ranked 8th in the QS Global MBA Rankings" },
  ]);
  const [newRanking, setNewRanking] = useState<RankingData>({
    organisation: "",
    year: "",
    level: "Program",
    rank: "",
    supportingText: "",
  });

  const addRanking = () => {
    if (newRanking.organisation && newRanking.year && newRanking.rank) {
      setRankings([...rankings, { ...newRanking }]);
      setNewRanking({ organisation: "", year: "", level: "Program", rank: "", supportingText: "" });
    }
  };

  const removeRanking = (index: number) => setRankings(rankings.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      {/* Add New Ranking Form */}
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Add New Ranking</h4>
          
          {/* Row 1: Organisation, Year, Level */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Ranking Organisation</Label>
              <Select 
                value={newRanking.organisation} 
                onValueChange={(value) => setNewRanking({ ...newRanking, organisation: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select organisation..." />
                </SelectTrigger>
                <SelectContent>
                  {mockRankingOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.name}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ranking Year</Label>
              <Input 
                value={newRanking.year}
                onChange={(e) => setNewRanking({ ...newRanking, year: e.target.value })}
                placeholder="e.g., 2024" 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label>Ranking Level</Label>
              <Input 
                value={newRanking.level}
                disabled
                className="mt-1.5 bg-muted" 
              />
            </div>
          </div>

          {/* Row 2: Rank, Supporting Text */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Rank</Label>
              <Input 
                type="number"
                value={newRanking.rank}
                onChange={(e) => setNewRanking({ ...newRanking, rank: e.target.value })}
                placeholder="e.g., 5" 
                className="mt-1.5" 
                min="1"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Supporting Text</Label>
              <Input 
                value={newRanking.supportingText}
                onChange={(e) => setNewRanking({ ...newRanking, supportingText: e.target.value })}
                placeholder="Additional context about this ranking..." 
                className="mt-1.5" 
              />
            </div>
          </div>

          <Button onClick={addRanking} disabled={!newRanking.organisation || !newRanking.year || !newRanking.rank}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ranking
          </Button>
        </CardContent>
      </Card>

      {/* Added Rankings List */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Rankings ({rankings.length})</h4>
        {rankings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No rankings added yet</p>
        ) : (
          <div className="space-y-3">
            {rankings.map((ranking, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                          #{ranking.rank}
                        </div>
                        <div>
                          <h5 className="font-medium text-foreground">{ranking.organisation}</h5>
                          <p className="text-sm text-muted-foreground">{ranking.year} • {ranking.level} Level</p>
                        </div>
                      </div>
                      {ranking.supportingText && (
                        <p className="text-sm text-muted-foreground mt-2 ml-[52px]">{ranking.supportingText}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => removeRanking(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramRecruitersSection() {
  const [recruiters, setRecruiters] = useState(["Google", "McKinsey & Company", "Goldman Sachs"]);
  const [newRecruiter, setNewRecruiter] = useState("");

  const addRecruiter = () => {
    if (newRecruiter.trim()) {
      setRecruiters([...recruiters, newRecruiter.trim()]);
      setNewRecruiter("");
    }
  };
  const removeRecruiter = (index: number) => setRecruiters(recruiters.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {/* Add Recruiter */}
      <div className="flex gap-2">
        <Input
          value={newRecruiter}
          onChange={(e) => setNewRecruiter(e.target.value)}
          placeholder="Enter company name..."
          onKeyDown={(e) => e.key === "Enter" && addRecruiter()}
        />
        <Button onClick={addRecruiter} disabled={!newRecruiter.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Recruiters List */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Recruiters ({recruiters.length})</h4>
        {recruiters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No recruiters added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recruiters.map((recruiter, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3 gap-2">
                <Building2 className="h-3.5 w-3.5" />
                {recruiter}
                <button 
                  onClick={() => removeRecruiter(index)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramJobRolesSection() {
  const [jobRoles, setJobRoles] = useState(["Product Manager", "Consultant", "Investment Banker"]);
  const [newJobRole, setNewJobRole] = useState("");

  const addJobRole = () => {
    if (newJobRole.trim()) {
      setJobRoles([...jobRoles, newJobRole.trim()]);
      setNewJobRole("");
    }
  };
  const removeJobRole = (index: number) => setJobRoles(jobRoles.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {/* Add Job Role */}
      <div className="flex gap-2">
        <Input
          value={newJobRole}
          onChange={(e) => setNewJobRole(e.target.value)}
          placeholder="Enter job role name..."
          onKeyDown={(e) => e.key === "Enter" && addJobRole()}
        />
        <Button onClick={addJobRole} disabled={!newJobRole.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Job Roles List */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Job Roles ({jobRoles.length})</h4>
        {jobRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No job roles added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {jobRoles.map((role, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3 gap-2">
                <Briefcase className="h-3.5 w-3.5" />
                {role}
                <button 
                  onClick={() => removeJobRole(index)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramFAQsSection() {
  const [faqs, setFaqs] = useState([
    { question: "What is the application deadline?", answer: "Applications are reviewed on a rolling basis with final deadline in April." },
    { question: "Is GMAT required?", answer: "Yes, we accept both GMAT and GRE scores." },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      setFaqs([...faqs, { ...newFaq }]);
      setNewFaq({ question: "", answer: "" });
      setIsAdding(false);
    }
  };
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
  const updateFaq = (index: number, field: string, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqs(newFaqs);
  };

  return (
    <div className="space-y-4">
      {/* Add FAQ Button */}
      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-4 space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Add New FAQ</h4>
            <div>
              <Label>Question</Label>
              <Input
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                placeholder="Enter question..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                placeholder="Enter answer..."
                className="mt-1.5"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addFaq} disabled={!newFaq.question.trim() || !newFaq.answer.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
              <Button variant="outline" onClick={() => { setIsAdding(false); setNewFaq({ question: "", answer: "" }); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQs List */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added FAQs ({faqs.length})</h4>
        {faqs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No FAQs added yet</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {editingIndex === index ? (
                        <>
                          <div>
                            <Label>Question</Label>
                            <Input
                              value={faq.question}
                              onChange={(e) => updateFaq(index, "question", e.target.value)}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Answer</Label>
                            <Textarea
                              value={faq.answer}
                              onChange={(e) => updateFaq(index, "answer", e.target.value)}
                              className="mt-1.5"
                              rows={3}
                            />
                          </div>
                          <Button size="sm" onClick={() => setEditingIndex(null)}>
                            <Check className="h-4 w-4 mr-2" />
                            Done
                          </Button>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="font-medium text-foreground">{faq.question}</p>
                            <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setEditingIndex(index)}>
                            Edit
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => removeFaq(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramPOCsSection() {
  const [pocs, setPocs] = useState([
    { fullName: "Sarah Williams", designation: "Admissions Director", organisation: "Harvard Business School", contactNo: "5550123", email: "sarah.w@school.edu" },
    { fullName: "James Chen", designation: "Program Coordinator", organisation: "Harvard Business School", contactNo: "5550124", email: "james.c@school.edu" },
  ]);
  const [newPoc, setNewPoc] = useState({ fullName: "", designation: "", organisation: "Harvard Business School", contactNo: "", email: "" });

  const addPoc = () => {
    if (newPoc.fullName.trim() && newPoc.email.trim()) {
      setPocs([...pocs, { ...newPoc }]);
      setNewPoc({ fullName: "", designation: "", organisation: "Harvard Business School", contactNo: "", email: "" });
    }
  };
  const removePoc = (index: number) => setPocs(pocs.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      {/* Add POC Form */}
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Add New Point of Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={newPoc.fullName}
                onChange={(e) => setNewPoc({ ...newPoc, fullName: e.target.value })}
                placeholder="Enter full name..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Designation</Label>
              <Input
                value={newPoc.designation}
                onChange={(e) => setNewPoc({ ...newPoc, designation: e.target.value })}
                placeholder="Enter designation..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Organisation (School)</Label>
              <Input
                value={newPoc.organisation}
                className="mt-1.5 bg-muted"
                disabled
              />
            </div>
            <div>
              <Label>Contact No (without country code)</Label>
              <Input
                type="tel"
                value={newPoc.contactNo}
                onChange={(e) => setNewPoc({ ...newPoc, contactNo: e.target.value })}
                placeholder="5551234567"
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={newPoc.email}
                onChange={(e) => setNewPoc({ ...newPoc, email: e.target.value })}
                placeholder="email@example.com"
                className="mt-1.5"
              />
            </div>
          </div>
          <Button onClick={addPoc} disabled={!newPoc.fullName.trim() || !newPoc.email.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add POC
          </Button>
        </CardContent>
      </Card>

      {/* POCs List */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Points of Contact ({pocs.length})</h4>
        {pocs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No points of contact added yet</p>
        ) : (
          <div className="space-y-3">
            {pocs.map((poc, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-foreground">{poc.fullName}</h5>
                        <p className="text-sm text-muted-foreground">{poc.designation} • {poc.organisation}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {poc.email}
                          </span>
                          {poc.contactNo && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {poc.contactNo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => removePoc(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
