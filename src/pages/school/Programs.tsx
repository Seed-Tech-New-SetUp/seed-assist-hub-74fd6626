import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import { Skeleton } from "@/components/ui/skeleton";
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
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import {
  usePrograms,
  useProgramInfo,
  useSaveProgramInfo,
  useProgramFeatures,
  useSaveProgramFeature,
  useDeleteProgramFeature,
  useProgramMembers,
  useSaveProgramMember,
  useDeleteProgramMember,
  useProgramRankings,
  useRankingOrganizations,
  useSaveProgramRanking,
  useDeleteProgramRanking,
  useProgramRecruiters,
  useSaveProgramRecruiter,
  useDeleteProgramRecruiter,
  useProgramJobRoles,
  useSaveProgramJobRole,
  useDeleteProgramJobRole,
  useProgramFAQs,
  useSaveProgramFAQ,
  useDeleteProgramFAQ,
  useProgramPOCs,
  useSaveProgramPOC,
  useDeleteProgramPOC,
} from "@/hooks/usePrograms";
import type {
  ProgramInfo,
  ProgramFeature,
  ProgramMember,
  ProgramRanking,
  ProgramRecruiter,
  ProgramJobRole,
  ProgramFAQ,
  ProgramPOC,
} from "@/lib/api/programs";

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

export default function Programs() {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [activeSection, setActiveSection] = useState("info");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const { toast } = useToast();
  const { isAdmin } = useAdminStatus();

  // Fetch programs list
  const { data: programs = [], isLoading: programsLoading } = usePrograms();

  // Set first program as default when loaded
  useEffect(() => {
    if (programs.length > 0 && !selectedProgram) {
      setSelectedProgram(programs[0].id);
    }
  }, [programs, selectedProgram]);

  const handleSave = (sectionId: string) => {
    setCompletedSections(prev => [...new Set([...prev, sectionId])]);
    
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

  const selectedProgramData = programs.find(p => p.id === selectedProgram);

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
              {programsLoading ? (
                <Skeleton className="h-10 w-[300px]" />
              ) : (
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedProgramData?.type && (
                <Badge variant="secondary">{selectedProgramData.type}</Badge>
              )}
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
                  {activeSection === "info" && <ProgramInfoSection programId={selectedProgram} onSave={() => handleSave("info")} />}
                  {activeSection === "features" && <ProgramFeaturesSection programId={selectedProgram} onSave={() => handleSave("features")} />}
                  {activeSection === "faculty" && <ProgramMembersSection programId={selectedProgram} category="faculty" title="Faculty Member" onSave={() => handleSave("faculty")} />}
                  {activeSection === "students" && <ProgramMembersSection programId={selectedProgram} category="current_student" title="Current Student" onSave={() => handleSave("students")} />}
                  {activeSection === "alumni" && <ProgramMembersSection programId={selectedProgram} category="alumni" title="Alumni" onSave={() => handleSave("alumni")} />}
                  {activeSection === "rankings" && <ProgramRankingsSection programId={selectedProgram} onSave={() => handleSave("rankings")} />}
                  {activeSection === "recruiters" && <ProgramRecruitersSection programId={selectedProgram} onSave={() => handleSave("recruiters")} />}
                  {activeSection === "jobroles" && <ProgramJobRolesSection programId={selectedProgram} onSave={() => handleSave("jobroles")} />}
                  {activeSection === "faqs" && <ProgramFAQsSection programId={selectedProgram} onSave={() => handleSave("faqs")} />}
                  {activeSection === "pocs" && <ProgramPOCsSection programId={selectedProgram} onSave={() => handleSave("pocs")} />}

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

// ============ Program Info Section ============

interface SectionProps {
  programId: string;
  onSave: () => void;
}

function ProgramInfoSection({ programId, onSave }: SectionProps) {
  const { data: info, isLoading } = useProgramInfo(programId);
  const saveMutation = useSaveProgramInfo();
  
  const [formData, setFormData] = useState<Partial<ProgramInfo>>({
    program_name: "",
    class_size: 0,
    average_age: 0,
    average_work_experience: 0,
    median_earnings: 0,
    graduation_rate: 0,
    brochure_link: "",
    is_hero_program: false,
    diversity: [],
  });

  useEffect(() => {
    if (info) {
      setFormData(info);
    }
  }, [info]);

  const handleSave = () => {
    saveMutation.mutate({ programId, info: formData }, {
      onSuccess: () => onSave(),
    });
  };

  const addDiversity = () => {
    setFormData(prev => ({
      ...prev,
      diversity: [...(prev.diversity || []), { country: "", percentage: 0 }],
    }));
  };

  const removeDiversity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diversity: (prev.diversity || []).filter((_, i) => i !== index),
    }));
  };

  const updateDiversity = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      diversity: (prev.diversity || []).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Program Name</Label>
        <Input 
          value={formData.program_name || ""} 
          onChange={(e) => setFormData(prev => ({ ...prev, program_name: e.target.value }))}
          className="mt-1.5" 
          placeholder="Enter program name..." 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Class Size</Label>
          <Input 
            type="number" 
            value={formData.class_size || ""} 
            onChange={(e) => setFormData(prev => ({ ...prev, class_size: parseInt(e.target.value) || 0 }))}
            className="mt-1.5" 
            placeholder="Enter class size..." 
          />
        </div>
        <div>
          <Label>Average Age</Label>
          <Input 
            type="number" 
            value={formData.average_age || ""} 
            onChange={(e) => setFormData(prev => ({ ...prev, average_age: parseInt(e.target.value) || 0 }))}
            className="mt-1.5" 
            placeholder="Enter average age..." 
          />
        </div>
        <div>
          <Label>Average Work Experience (Years)</Label>
          <Input 
            type="number" 
            value={formData.average_work_experience || ""} 
            onChange={(e) => setFormData(prev => ({ ...prev, average_work_experience: parseFloat(e.target.value) || 0 }))}
            className="mt-1.5" 
            placeholder="Enter avg work exp..." 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Median Earnings After Graduation (USD/Year)</Label>
          <Input 
            type="number" 
            value={formData.median_earnings || ""} 
            onChange={(e) => setFormData(prev => ({ ...prev, median_earnings: parseInt(e.target.value) || 0 }))}
            className="mt-1.5" 
            placeholder="Enter median earnings..." 
          />
        </div>
        <div>
          <Label>Graduation Rate (%)</Label>
          <Input 
            type="number" 
            value={formData.graduation_rate || ""} 
            onChange={(e) => setFormData(prev => ({ ...prev, graduation_rate: parseFloat(e.target.value) || 0 }))}
            className="mt-1.5" 
            placeholder="Enter graduation rate..." 
            min="0" 
            max="100" 
          />
        </div>
        <div>
          <Label>Is this a Hero Program?</Label>
          <Select 
            value={formData.is_hero_program ? "yes" : "no"}
            onValueChange={(value) => setFormData(prev => ({ ...prev, is_hero_program: value === "yes" }))}
          >
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

      <div>
        <Label>Program Brochure Link</Label>
        <Input 
          type="url" 
          value={formData.brochure_link || ""} 
          onChange={(e) => setFormData(prev => ({ ...prev, brochure_link: e.target.value }))}
          className="mt-1.5" 
          placeholder="Enter brochure URL..." 
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Program Diversity (Country-wise)</Label>
          <Button variant="outline" size="sm" onClick={addDiversity}>
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </Button>
        </div>
        <div className="space-y-2">
          {(formData.diversity || []).map((item, index) => (
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
        {(formData.diversity || []).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">No diversity data added yet</p>
        )}
      </div>

      <Button onClick={handleSave} disabled={saveMutation.isPending}>
        {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Save Section
      </Button>
    </div>
  );
}

// ============ Program Features Section ============

function ProgramFeaturesSection({ programId, onSave }: SectionProps) {
  const { data: features = [], isLoading } = useProgramFeatures(programId);
  const saveMutation = useSaveProgramFeature();
  const deleteMutation = useDeleteProgramFeature();
  
  const [newFeature, setNewFeature] = useState<Partial<ProgramFeature>>({ title: "", description: "", photo_url: "" });

  const addFeature = () => {
    if (newFeature.title?.trim()) {
      saveMutation.mutate({
        programId,
        feature: {
          title: newFeature.title || "",
          description: newFeature.description || "",
          photo_url: newFeature.photo_url || "",
        },
      });
      setNewFeature({ title: "", description: "", photo_url: "" });
    }
  };

  const removeFeature = (featureId: string) => {
    deleteMutation.mutate({ programId, featureId });
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-20 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Add New Feature</h4>
          <div>
            <Label>Feature Title</Label>
            <Input 
              value={newFeature.title || ""}
              onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
              placeholder="Enter feature title..." 
              className="mt-1.5" 
            />
          </div>
          <div>
            <Label>Feature Description</Label>
            <Textarea 
              value={newFeature.description || ""}
              onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
              placeholder="Enter feature description..." 
              className="mt-1.5" 
              rows={3}
            />
          </div>
          <div>
            <Label>Feature Photo</Label>
            <ImageUpload
              value={newFeature.photo_url || ""}
              onChange={(url) => setNewFeature({ ...newFeature, photo_url: url })}
              placeholder="Click to upload feature photo"
              aspectRatio="video"
              className="mt-1.5"
            />
          </div>
          <Button onClick={addFeature} disabled={!newFeature.title?.trim() || saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </CardContent>
      </Card>

      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Features ({features.length})</h4>
        {features.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No features added yet</p>
        ) : (
          <div className="space-y-3">
            {features.map((feature) => (
              <Card key={feature.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {feature.photo_url ? (
                        <img src={feature.photo_url} alt={feature.title} className="w-16 h-16 rounded-lg object-cover" />
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
                      onClick={() => feature.id && removeFeature(feature.id)}
                      disabled={deleteMutation.isPending}
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

      <Button onClick={onSave}>
        Save & Continue
      </Button>
    </div>
  );
}

// ============ Program Members Section (Faculty, Students, Alumni) ============

interface MembersSectionProps extends SectionProps {
  category: "faculty" | "current_student" | "alumni";
  title: string;
}

function ProgramMembersSection({ programId, category, title, onSave }: MembersSectionProps) {
  const { data: members = [], isLoading } = useProgramMembers(programId, category);
  const saveMutation = useSaveProgramMember();
  const deleteMutation = useDeleteProgramMember();

  const defaultCategory = category === "faculty" ? "Faculty" : category === "current_student" ? "Current Student" : "Alumni";
  
  const [newMember, setNewMember] = useState<Partial<ProgramMember>>({
    first_name: "",
    last_name: "",
    email: "",
    linkedin_url: "",
    designation: "",
    organisation: "",
    category,
    call_to_action: "email",
    profile_image: "",
  });

  const addMember = () => {
    if (newMember.first_name?.trim() && newMember.last_name?.trim()) {
      saveMutation.mutate({
        programId,
        category,
        member: {
          first_name: newMember.first_name || "",
          last_name: newMember.last_name || "",
          email: newMember.email || "",
          linkedin_url: newMember.linkedin_url || "",
          designation: newMember.designation || "",
          organisation: newMember.organisation || "",
          category,
          call_to_action: newMember.call_to_action || "email",
          profile_image: newMember.profile_image || "",
        },
      });
      setNewMember({
        first_name: "",
        last_name: "",
        email: "",
        linkedin_url: "",
        designation: "",
        organisation: "",
        category,
        call_to_action: "email",
        profile_image: "",
      });
    }
  };

  const removeMember = (memberId: string) => {
    deleteMutation.mutate({ programId, category, memberId });
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-20 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Add New {title}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>First Name</Label>
              <Input 
                value={newMember.first_name || ""}
                onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                placeholder="First name..." 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input 
                value={newMember.last_name || ""}
                onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
                placeholder="Last name..." 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                value={newMember.email || ""}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="Email address..." 
                className="mt-1.5" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>LinkedIn URL</Label>
              <Input 
                type="url"
                value={newMember.linkedin_url || ""}
                onChange={(e) => setNewMember({ ...newMember, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..." 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label>Designation</Label>
              <Input 
                value={newMember.designation || ""}
                onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
                placeholder="Title/Position..." 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label>Organisation</Label>
              <Input 
                value={newMember.organisation || ""}
                onChange={(e) => setNewMember({ ...newMember, organisation: e.target.value })}
                placeholder="Organisation name..." 
                className="mt-1.5" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Input 
                value={defaultCategory}
                disabled
                className="mt-1.5 bg-muted" 
              />
            </div>
            <div>
              <Label>Call to Action</Label>
              <Select 
                value={newMember.call_to_action || "email"} 
                onValueChange={(value: "email" | "linkedin") => setNewMember({ ...newMember, call_to_action: value })}
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
                value={newMember.profile_image || ""}
                onChange={(url) => setNewMember({ ...newMember, profile_image: url })}
                placeholder="Upload photo"
                aspectRatio="square"
                className="mt-1.5 h-[80px] w-[80px]"
              />
            </div>
          </div>

          <Button onClick={addMember} disabled={!newMember.first_name?.trim() || !newMember.last_name?.trim() || saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Add {title}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added {title}s ({members.length})</h4>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No {title.toLowerCase()}s added yet</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {member.profile_image ? (
                        <img src={member.profile_image} alt={`${member.first_name} ${member.last_name}`} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-foreground">{member.first_name} {member.last_name}</h5>
                          <Badge variant="secondary" className="text-xs">{defaultCategory}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.designation} {member.organisation && `at ${member.organisation}`}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {member.email && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {member.email}
                            </span>
                          )}
                          {member.linkedin_url && (
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
                      onClick={() => member.id && removeMember(member.id)}
                      disabled={deleteMutation.isPending}
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

      <Button onClick={onSave}>
        Save & Continue
      </Button>
    </div>
  );
}

// ============ Program Rankings Section ============

function ProgramRankingsSection({ programId, onSave }: SectionProps) {
  const { data: rankings = [], isLoading } = useProgramRankings(programId);
  const { data: organizations = [] } = useRankingOrganizations();
  const saveMutation = useSaveProgramRanking();
  const deleteMutation = useDeleteProgramRanking();

  const [newRanking, setNewRanking] = useState<Partial<ProgramRanking>>({
    organisation: "",
    year: "",
    level: "Program",
    rank: "",
    supporting_text: "",
  });

  const addRanking = () => {
    if (newRanking.organisation && newRanking.year && newRanking.rank) {
      saveMutation.mutate({
        programId,
        ranking: {
          organisation: newRanking.organisation || "",
          year: newRanking.year || "",
          level: "Program",
          rank: newRanking.rank || "",
          supporting_text: newRanking.supporting_text || "",
        },
      });
      setNewRanking({ organisation: "", year: "", level: "Program", rank: "", supporting_text: "" });
    }
  };

  const removeRanking = (rankingId: string) => {
    deleteMutation.mutate({ programId, rankingId });
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-20 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Add New Ranking</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Ranking Organisation</Label>
              <Select 
                value={newRanking.organisation || ""} 
                onValueChange={(value) => setNewRanking({ ...newRanking, organisation: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select organisation..." />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.name}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ranking Year</Label>
              <Input 
                value={newRanking.year || ""}
                onChange={(e) => setNewRanking({ ...newRanking, year: e.target.value })}
                placeholder="e.g., 2024" 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label>Ranking Level</Label>
              <Input 
                value="Program"
                disabled
                className="mt-1.5 bg-muted" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Rank</Label>
              <Input 
                type="number"
                value={newRanking.rank || ""}
                onChange={(e) => setNewRanking({ ...newRanking, rank: e.target.value })}
                placeholder="e.g., 5" 
                className="mt-1.5" 
                min="1"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Supporting Text</Label>
              <Input 
                value={newRanking.supporting_text || ""}
                onChange={(e) => setNewRanking({ ...newRanking, supporting_text: e.target.value })}
                placeholder="Additional context about this ranking..." 
                className="mt-1.5" 
              />
            </div>
          </div>

          <Button onClick={addRanking} disabled={!newRanking.organisation || !newRanking.year || !newRanking.rank || saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Add Ranking
          </Button>
        </CardContent>
      </Card>

      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Rankings ({rankings.length})</h4>
        {rankings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No rankings added yet</p>
        ) : (
          <div className="space-y-3">
            {rankings.map((ranking) => (
              <Card key={ranking.id}>
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
                      {ranking.supporting_text && (
                        <p className="text-sm text-muted-foreground mt-2 ml-[52px]">{ranking.supporting_text}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => ranking.id && removeRanking(ranking.id)}
                      disabled={deleteMutation.isPending}
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

      <Button onClick={onSave}>
        Save & Continue
      </Button>
    </div>
  );
}

// ============ Program Recruiters Section ============

function ProgramRecruitersSection({ programId, onSave }: SectionProps) {
  const { data: recruiters = [], isLoading } = useProgramRecruiters(programId);
  const saveMutation = useSaveProgramRecruiter();
  const deleteMutation = useDeleteProgramRecruiter();
  const [newRecruiter, setNewRecruiter] = useState("");

  const addRecruiter = () => {
    if (newRecruiter.trim()) {
      saveMutation.mutate({ programId, recruiter: { company_name: newRecruiter.trim() } });
      setNewRecruiter("");
    }
  };

  const removeRecruiter = (recruiterId: string) => {
    deleteMutation.mutate({ programId, recruiterId });
  };

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newRecruiter}
          onChange={(e) => setNewRecruiter(e.target.value)}
          placeholder="Enter company name..."
          onKeyDown={(e) => e.key === "Enter" && addRecruiter()}
        />
        <Button onClick={addRecruiter} disabled={!newRecruiter.trim() || saveMutation.isPending}>
          {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Recruiters ({recruiters.length})</h4>
        {recruiters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No recruiters added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recruiters.map((recruiter) => (
              <Badge key={recruiter.id} variant="secondary" className="text-sm py-1.5 px-3 gap-2">
                <Building2 className="h-3.5 w-3.5" />
                {recruiter.company_name}
                <button 
                  onClick={() => recruiter.id && removeRecruiter(recruiter.id)}
                  className="ml-1 hover:text-destructive transition-colors"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button onClick={onSave}>
        Save & Continue
      </Button>
    </div>
  );
}

// ============ Program Job Roles Section ============

function ProgramJobRolesSection({ programId, onSave }: SectionProps) {
  const { data: jobRoles = [], isLoading } = useProgramJobRoles(programId);
  const saveMutation = useSaveProgramJobRole();
  const deleteMutation = useDeleteProgramJobRole();
  const [newJobRole, setNewJobRole] = useState("");

  const addJobRole = () => {
    if (newJobRole.trim()) {
      saveMutation.mutate({ programId, jobRole: { role_name: newJobRole.trim() } });
      setNewJobRole("");
    }
  };

  const removeJobRole = (jobRoleId: string) => {
    deleteMutation.mutate({ programId, jobRoleId });
  };

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newJobRole}
          onChange={(e) => setNewJobRole(e.target.value)}
          placeholder="Enter job role name..."
          onKeyDown={(e) => e.key === "Enter" && addJobRole()}
        />
        <Button onClick={addJobRole} disabled={!newJobRole.trim() || saveMutation.isPending}>
          {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Job Roles ({jobRoles.length})</h4>
        {jobRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No job roles added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {jobRoles.map((role) => (
              <Badge key={role.id} variant="secondary" className="text-sm py-1.5 px-3 gap-2">
                <Briefcase className="h-3.5 w-3.5" />
                {role.role_name}
                <button 
                  onClick={() => role.id && removeJobRole(role.id)}
                  className="ml-1 hover:text-destructive transition-colors"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button onClick={onSave}>
        Save & Continue
      </Button>
    </div>
  );
}

// ============ Program FAQs Section ============

function ProgramFAQsSection({ programId, onSave }: SectionProps) {
  const { data: faqs = [], isLoading } = useProgramFAQs(programId);
  const saveMutation = useSaveProgramFAQ();
  const deleteMutation = useDeleteProgramFAQ();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ question: "", answer: "" });

  const addFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      saveMutation.mutate({ programId, faq: newFaq });
      setNewFaq({ question: "", answer: "" });
      setIsAdding(false);
    }
  };

  const updateFaq = (faq: ProgramFAQ) => {
    saveMutation.mutate({ 
      programId, 
      faq: { id: faq.id, question: editData.question, answer: editData.answer } 
    });
    setEditingId(null);
  };

  const removeFaq = (faqId: string) => {
    deleteMutation.mutate({ programId, faqId });
  };

  const startEditing = (faq: ProgramFAQ) => {
    setEditingId(faq.id || null);
    setEditData({ question: faq.question, answer: faq.answer });
  };

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <div className="space-y-4">
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
              <Button onClick={addFaq} disabled={!newFaq.question.trim() || !newFaq.answer.trim() || saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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

      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added FAQs ({faqs.length})</h4>
        {faqs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No FAQs added yet</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {editingId === faq.id ? (
                        <>
                          <div>
                            <Label>Question</Label>
                            <Input
                              value={editData.question}
                              onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Answer</Label>
                            <Textarea
                              value={editData.answer}
                              onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
                              className="mt-1.5"
                              rows={3}
                            />
                          </div>
                          <Button size="sm" onClick={() => updateFaq(faq)} disabled={saveMutation.isPending}>
                            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
                          <Button size="sm" variant="outline" onClick={() => startEditing(faq)}>
                            Edit
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => faq.id && removeFaq(faq.id)}
                      disabled={deleteMutation.isPending}
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

      <Button onClick={onSave}>
        Save & Continue
      </Button>
    </div>
  );
}

// ============ Program POCs Section ============

function ProgramPOCsSection({ programId, onSave }: SectionProps) {
  const { data: pocs = [], isLoading } = useProgramPOCs(programId);
  const saveMutation = useSaveProgramPOC();
  const deleteMutation = useDeleteProgramPOC();

  const [newPoc, setNewPoc] = useState<Partial<ProgramPOC>>({
    full_name: "",
    designation: "",
    organisation: "",
    contact_no: "",
    email: "",
  });

  const addPoc = () => {
    if (newPoc.full_name?.trim() && newPoc.email?.trim()) {
      saveMutation.mutate({
        programId,
        poc: {
          full_name: newPoc.full_name || "",
          designation: newPoc.designation || "",
          organisation: newPoc.organisation || "",
          contact_no: newPoc.contact_no || "",
          email: newPoc.email || "",
        },
      });
      setNewPoc({ full_name: "", designation: "", organisation: "", contact_no: "", email: "" });
    }
  };

  const removePoc = (pocId: string) => {
    deleteMutation.mutate({ programId, pocId });
  };

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Add New Point of Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={newPoc.full_name || ""}
                onChange={(e) => setNewPoc({ ...newPoc, full_name: e.target.value })}
                placeholder="Enter full name..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Designation</Label>
              <Input
                value={newPoc.designation || ""}
                onChange={(e) => setNewPoc({ ...newPoc, designation: e.target.value })}
                placeholder="Enter designation..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Organisation (School)</Label>
              <Input
                value={newPoc.organisation || ""}
                onChange={(e) => setNewPoc({ ...newPoc, organisation: e.target.value })}
                placeholder="Enter organisation..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Contact No (without country code)</Label>
              <Input
                type="tel"
                value={newPoc.contact_no || ""}
                onChange={(e) => setNewPoc({ ...newPoc, contact_no: e.target.value })}
                placeholder="5551234567"
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={newPoc.email || ""}
                onChange={(e) => setNewPoc({ ...newPoc, email: e.target.value })}
                placeholder="email@example.com"
                className="mt-1.5"
              />
            </div>
          </div>
          <Button onClick={addPoc} disabled={!newPoc.full_name?.trim() || !newPoc.email?.trim() || saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Add POC
          </Button>
        </CardContent>
      </Card>

      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Points of Contact ({pocs.length})</h4>
        {pocs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No points of contact added yet</p>
        ) : (
          <div className="space-y-3">
            {pocs.map((poc) => (
              <Card key={poc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-foreground">{poc.full_name}</h5>
                        <p className="text-sm text-muted-foreground">{poc.designation} • {poc.organisation}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {poc.email}
                          </span>
                          {poc.contact_no && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {poc.contact_no}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => poc.id && removePoc(poc.id)}
                      disabled={deleteMutation.isPending}
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

      <Button onClick={onSave}>
        Save & Continue
      </Button>
    </div>
  );
}
