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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrganizationCombobox } from "@/components/programs/OrganizationCombobox";
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
  Pencil,
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
  useProgramRankingsWithOrganizations,
  useSaveProgramRanking,
  useDeleteProgramRanking,
  useProgramRecruiters,
  useSaveProgramRecruiters,
  useProgramJobRoles,
  useSaveProgramJobRoles,
  useProgramFAQs,
  useSaveProgramFAQ,
  useDeleteProgramFAQ,
  useProgramPOCs,
  useSaveProgramPOC,
  useDeleteProgramPOC,
} from "@/hooks/usePrograms";
import type {
  ProgramInfo,
  ProgramDiversity,
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
    setCompletedSections((prev) => [...new Set([...prev, sectionId])]);

    const currentIndex = programSections.findIndex((s) => s.id === sectionId);
    if (currentIndex < programSections.length - 1) {
      setActiveSection(programSections[currentIndex + 1].id);
    }
  };

  const handleNext = () => {
    const currentIndex = programSections.findIndex((s) => s.id === activeSection);
    if (currentIndex < programSections.length - 1) {
      setActiveSection(programSections[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = programSections.findIndex((s) => s.id === activeSection);
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

  const selectedProgramData = programs.find((p) => p.id === selectedProgram);

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
                        {program.program_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedProgramData && <Badge variant="secondary">{selectedProgramData.university}</Badge>}
            </div>
          </CardContent>
        </Card>

        {selectedProgram && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation - Sticky */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
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
                              : "hover:bg-muted text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium",
                              isCompleted
                                ? "bg-green-500 text-white"
                                : isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                            )}
                          >
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
            </div>

            {/* Form Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {programSections.find((s) => s.id === activeSection)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {activeSection === "info" && (
                    <ProgramInfoSection programId={selectedProgram} onSave={() => handleSave("info")} />
                  )}
                  {activeSection === "features" && (
                    <ProgramFeaturesSection programId={selectedProgram} onSave={() => handleSave("features")} />
                  )}
                  {activeSection === "faculty" && (
                    <ProgramMembersSection
                      programId={selectedProgram}
                      category="faculty"
                      title="Faculty Member"
                      onSave={() => handleSave("faculty")}
                    />
                  )}
                  {activeSection === "students" && (
                    <ProgramMembersSection
                      programId={selectedProgram}
                      category="current_student"
                      title="Current Student"
                      onSave={() => handleSave("students")}
                    />
                  )}
                  {activeSection === "alumni" && (
                    <ProgramMembersSection
                      programId={selectedProgram}
                      category="alumni"
                      title="Alumni"
                      onSave={() => handleSave("alumni")}
                    />
                  )}
                  {activeSection === "rankings" && (
                    <ProgramRankingsSection programId={selectedProgram} onSave={() => handleSave("rankings")} />
                  )}
                  {activeSection === "recruiters" && (
                    <ProgramRecruitersSection programId={selectedProgram} onSave={() => handleSave("recruiters")} />
                  )}
                  {activeSection === "jobroles" && (
                    <ProgramJobRolesSection programId={selectedProgram} onSave={() => handleSave("jobroles")} />
                  )}
                  {activeSection === "faqs" && (
                    <ProgramFAQsSection programId={selectedProgram} onSave={() => handleSave("faqs")} />
                  )}
                  {activeSection === "pocs" && (
                    <ProgramPOCsSection programId={selectedProgram} onSave={() => handleSave("pocs")} />
                  )}

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
    class_size: 0,
    avg_age: "",
    avg_work_experience: "",
    median_earnings_after_graduation: "",
    graduation_rate: "",
    brochure_link: "",
    hero_category: 0,
    diversity: [],
  });

  const [newDiversity, setNewDiversity] = useState({ country: "", percentage: "" });

  useEffect(() => {
    if (info) {
      setFormData({
        ...info,
        diversity: info.diversity || [],
      });
    }
  }, [info]);

  const handleSave = () => {
    saveMutation.mutate(
      { programId, info: formData },
      {
        onSuccess: () => onSave(),
      },
    );
  };

  const addDiversity = () => {
    if (newDiversity.country?.trim() && newDiversity.percentage?.trim()) {
      const currentDiversity = formData.diversity || [];
      const percentageNum = parseFloat(newDiversity.percentage) || 0;
      setFormData((prev) => ({
        ...prev,
        diversity: [...currentDiversity, { country: newDiversity.country!, percentage: percentageNum }],
      }));
      setNewDiversity({ country: "", percentage: "" });
    }
  };

  const removeDiversity = (index: number) => {
    const currentDiversity = formData.diversity || [];
    setFormData((prev) => ({
      ...prev,
      diversity: currentDiversity.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Read-only Program Info */}
      {info && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="text-xs text-muted-foreground">Program Name</Label>
            <p className="font-medium">{info.program_name}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">School</Label>
            <p className="font-medium">{info.school_name}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">University</Label>
            <p className="font-medium">{info.university}</p>
          </div>
        </div>
      )}

      {/* Class Profile */}
      <div>
        <h4 className="font-medium mb-3">Class Profile</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Class Size</Label>
            <Input
              type="number"
              value={formData.class_size ?? ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, class_size: parseInt(e.target.value) || 0 }))}
              className="mt-1.5"
              placeholder="e.g. 950"
            />
          </div>
          <div>
            <Label>Average Age</Label>
            <Input
              type="text"
              value={formData.avg_age || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, avg_age: e.target.value }))}
              className="mt-1.5"
              placeholder="e.g. 28"
            />
          </div>
          <div>
            <Label>Average Work Experience</Label>
            <Input
              type="text"
              value={formData.avg_work_experience || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, avg_work_experience: e.target.value }))}
              className="mt-1.5"
              placeholder="e.g. 5 years"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Outcomes */}
      <div>
        <h4 className="font-medium mb-3">Outcomes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Median Earnings After Graduation (USD/Year)</Label>
            <Input
              type="text"
              value={formData.median_earnings_after_graduation || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, median_earnings_after_graduation: e.target.value }))}
              className="mt-1.5"
              placeholder="e.g. 175000"
            />
          </div>
          <div>
            <Label>Graduation Rate (%)</Label>
            <Input
              type="text"
              value={formData.graduation_rate || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, graduation_rate: e.target.value }))}
              className="mt-1.5"
              placeholder="e.g. 95"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Brochure & Hero Program */}
      <div>
        <h4 className="font-medium mb-3">Program Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Program Brochure Link</Label>
            <Input
              type="url"
              value={formData.brochure_link || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, brochure_link: e.target.value }))}
              className="mt-1.5"
              placeholder="https://example.com/brochure.pdf"
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="hero_category"
              checked={(formData.hero_category ?? 0) > 0}
              onChange={(e) => setFormData((prev) => ({ ...prev, hero_category: e.target.checked ? 1 : 0 }))}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="hero_category" className="cursor-pointer">
              Mark as Hero Program
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Program Diversity */}
      <div>
        <h4 className="font-medium mb-3">Program Diversity</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Add countries and their percentage representation in the program.
        </p>

        {/* Existing Diversity Entries */}
        {formData.diversity && formData.diversity.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.diversity.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">{item.country}</span>
                </div>
                <Badge variant="secondary">{item.percentage}%</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDiversity(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Diversity Entry */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label>Country</Label>
                <Input
                  type="text"
                  value={newDiversity.country || ""}
                  onChange={(e) => setNewDiversity((prev) => ({ ...prev, country: e.target.value }))}
                  className="mt-1.5"
                  placeholder="e.g. United States"
                />
              </div>
              <div>
                <Label>Percentage (%)</Label>
                <Input
                  type="text"
                  value={newDiversity.percentage || ""}
                  onChange={(e) => setNewDiversity((prev) => ({ ...prev, percentage: e.target.value }))}
                  className="mt-1.5"
                  placeholder="e.g. 25"
                />
              </div>
              <Button onClick={addDiversity} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Country
              </Button>
            </div>
          </CardContent>
        </Card>
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

  const [newFeature, setNewFeature] = useState<Partial<ProgramFeature>>({
    usp_title: "",
    usp_description: "",
    usp_image_name: "",
  });
  const [editingFeature, setEditingFeature] = useState<ProgramFeature | null>(null);
  const [deleteConfirmFeature, setDeleteConfirmFeature] = useState<ProgramFeature | null>(null);

  const handleSaveFeature = () => {
    if (editingFeature) {
      // Update existing feature
      if (editingFeature.usp_title?.trim()) {
        saveMutation.mutate(
          {
            programId,
            feature: {
              usp_id: editingFeature.usp_id,
              usp_title: editingFeature.usp_title || "",
              usp_description: editingFeature.usp_description || "",
              usp_image_name: editingFeature.usp_image_name || "",
            },
          },
          {
            onSuccess: () => setEditingFeature(null),
          },
        );
      }
    } else {
      // Add new feature
      if (newFeature.usp_title?.trim()) {
        saveMutation.mutate({
          programId,
          feature: {
            usp_title: newFeature.usp_title || "",
            usp_description: newFeature.usp_description || "",
            usp_image_name: newFeature.usp_image_name || "",
          },
        });
        setNewFeature({ usp_title: "", usp_description: "", usp_image_name: "" });
      }
    }
  };

  const startEditing = (feature: ProgramFeature) => {
    setEditingFeature({
      ...feature,
      // Convert server image path to full URL for preview
      usp_image_name: feature.usp_image_name
        ? `https://assist.seedglobaleducation.com/program_usp_uploads/${feature.usp_image_name}`
        : "",
    });
    setNewFeature({ usp_title: "", usp_description: "", usp_image_name: "" });
  };

  const cancelEditing = () => {
    setEditingFeature(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmFeature?.usp_id) {
      deleteMutation.mutate(
        { programId, featureId: deleteConfirmFeature.usp_id },
        {
          onSuccess: () => setDeleteConfirmFeature(null),
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const formFeature = editingFeature || newFeature;
  const isEditing = !!editingFeature;

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteConfirmFeature} onOpenChange={(open) => !open && setDeleteConfirmFeature(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmFeature?.usp_title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">
            {isEditing ? "Edit Feature" : "Add New Feature"}
          </h4>
          <div>
            <Label>Feature Title</Label>
            <Input
              value={formFeature.usp_title || ""}
              onChange={(e) =>
                isEditing
                  ? setEditingFeature({ ...editingFeature!, usp_title: e.target.value })
                  : setNewFeature({ ...newFeature, usp_title: e.target.value })
              }
              placeholder="Enter feature title..."
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Feature Description</Label>
            <Textarea
              value={formFeature.usp_description || ""}
              onChange={(e) =>
                isEditing
                  ? setEditingFeature({ ...editingFeature!, usp_description: e.target.value })
                  : setNewFeature({ ...newFeature, usp_description: e.target.value })
              }
              placeholder="Enter feature description..."
              className="mt-1.5"
              rows={3}
            />
          </div>
          <div>
            <Label>Feature Photo</Label>
            <ImageUpload
              value={formFeature.usp_image_name || ""}
              onChange={(url) =>
                isEditing
                  ? setEditingFeature({ ...editingFeature!, usp_image_name: url })
                  : setNewFeature({ ...newFeature, usp_image_name: url })
              }
              placeholder="Click to upload feature photo"
              aspectRatio="video"
              className="mt-1.5 max-w-[200px] max-h-[100px]"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveFeature} disabled={!formFeature.usp_title?.trim() || saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Update Feature
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </>
              )}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Features ({features.length})</h4>
        {features.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No features added yet</p>
        ) : (
          <div className="space-y-3">
            {features.map((feature) => (
              <Card key={feature.usp_id}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    {feature.usp_image_name ? (
                      <img
                        src={`https://assist.seedglobaleducation.com/program_usp_uploads/${feature.usp_image_name}`}
                        alt={feature.usp_title}
                        className="w-16 h-16 rounded object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h5 className="font-medium">{feature.usp_title}</h5>
                      <p className="text-sm text-muted-foreground">{feature.usp_description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(feature)}
                      disabled={saveMutation.isPending}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteConfirmFeature(feature)}
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

      <Button onClick={onSave}>Save & Continue</Button>
    </div>
  );
}

// ============ Member Form Component ============

interface MemberFormProps {
  member: Partial<ProgramMember>;
  onChange: (member: Partial<ProgramMember>) => void;
  onSave: () => void;
  onCancel?: () => void;
  isEditing: boolean;
  isSaving: boolean;
  title: string;
  defaultCategory: string;
}

function MemberForm({
  member,
  onChange,
  onSave,
  onCancel,
  isEditing,
  isSaving,
  title,
  defaultCategory,
}: MemberFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name *</Label>
          <Input
            value={member?.first_name || ""}
            onChange={(e) => onChange({ ...member, first_name: e.target.value })}
            placeholder="First name..."
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Last Name *</Label>
          <Input
            value={member?.last_name || ""}
            onChange={(e) => onChange({ ...member, last_name: e.target.value })}
            placeholder="Last name..."
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={member?.email || ""}
            onChange={(e) => onChange({ ...member, email: e.target.value })}
            placeholder="Email address..."
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>LinkedIn URL</Label>
          <Input
            type="url"
            value={member?.linkedin_url || ""}
            onChange={(e) => onChange({ ...member, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/..."
            className="mt-1.5"
          />
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Designation</Label>
          <Input
            value={member?.designation || ""}
            onChange={(e) => onChange({ ...member, designation: e.target.value })}
            placeholder="Title/Position..."
            className="mt-1.5"
          />
        </div>
        <div>
            <Label>Organisation</Label>
          <Input
              value={member?.orgnaisation || ""}
              onChange={(e) => onChange({ ...member, orgnaisation: e.target.value })}
              placeholder="Organisation name..."
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Call to Action</Label>
          <Select
            value={member?.call_to_action || ""}
            onValueChange={(value) => onChange({ ...member, call_to_action: value })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select action..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Category</Label>
          <Input value={defaultCategory} disabled className="mt-1.5 bg-muted" />
        </div>
      </div>

      <div>
        <Label>Profile Photo</Label>
        <ImageUpload
          value={member?.image_name || ""}
          onChange={(url) => onChange({ ...member, image_name: url })}
          placeholder="Upload photo"
          aspectRatio="square"
          className="mt-1.5 h-[80px] w-[80px]"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave} disabled={!member?.first_name?.trim() || !member?.last_name?.trim() || isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Update {title}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add {title}
            </>
          )}
        </Button>
        {isEditing && onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
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

  const defaultCategory =
    category === "faculty" ? "Faculty" : category === "current_student" ? "Current Student" : "Alumni";

  const [newMember, setNewMember] = useState<Partial<ProgramMember>>({
    first_name: "",
    last_name: "",
    email: "",
    linkedin_url: "",
    designation: "",
    orgnaisation: "",
    call_to_action: "",
    category,
    image_name: "",
  });

  // Track editing member by ID for inline editing
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberData, setEditingMemberData] = useState<Partial<ProgramMember>>({});
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<ProgramMember | null>(null);

  const startEditing = (member: ProgramMember) => {
    // Convert stored image_name to full URL for display
    const imageUrl = member.image_name
      ? `https://assist.seedglobaleducation.com/school_member_uploads/${member.image_name}`
      : "";
    setEditingMemberId(member.member_id || null);
    setEditingMemberData({
      ...member,
      image_name: imageUrl,
    });
  };

  const cancelEditing = () => {
    setEditingMemberId(null);
    setEditingMemberData({});
  };

  const handleSaveNewMember = () => {
    if (newMember?.first_name?.trim() && newMember?.last_name?.trim()) {
      saveMutation.mutate(
        {
          programId,
          category,
          member: {
            category,
            first_name: newMember.first_name || "",
            last_name: newMember.last_name || "",
            email: newMember.email || "",
            linkedin_url: newMember.linkedin_url || "",
            designation: newMember.designation || "",
            orgnaisation: newMember.orgnaisation || "",
            call_to_action: newMember.call_to_action || "",
            image_name: newMember.image_name || "",
          },
        },
        {
          onSuccess: () => {
            setNewMember({
              first_name: "",
              last_name: "",
              email: "",
              linkedin_url: "",
              designation: "",
              orgnaisation: "",
              call_to_action: "",
              category,
              image_name: "",
            });
          },
        },
      );
    }
  };

  const handleSaveEditingMember = () => {
    if (editingMemberData?.first_name?.trim() && editingMemberData?.last_name?.trim()) {
      saveMutation.mutate(
        {
          programId,
          category,
          member: {
            member_id: editingMemberData.member_id,
            category,
            first_name: editingMemberData.first_name || "",
            last_name: editingMemberData.last_name || "",
            email: editingMemberData.email || "",
            linkedin_url: editingMemberData.linkedin_url || "",
            designation: editingMemberData.designation || "",
            orgnaisation: editingMemberData.orgnaisation || "",
            call_to_action: editingMemberData.call_to_action || "",
            image_name: editingMemberData.image_name || "",
          },
        },
        {
          onSuccess: () => {
            cancelEditing();
          },
        },
      );
    }
  };

  const handleDeleteMember = () => {
    if (deleteConfirmMember?.member_id) {
      deleteMutation.mutate(
        { programId, category, memberId: deleteConfirmMember.member_id },
        {
          onSuccess: () => setDeleteConfirmMember(null),
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmMember} onOpenChange={() => setDeleteConfirmMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {title}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteConfirmMember?.first_name} {deleteConfirmMember?.last_name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add New Member Form */}
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Add New {title}</h4>
          <MemberForm
            member={newMember}
            onChange={setNewMember}
            onSave={handleSaveNewMember}
            isEditing={false}
            isSaving={saveMutation.isPending && !editingMemberId}
            title={title}
            defaultCategory={defaultCategory}
          />
        </CardContent>
      </Card>

      {/* Members List */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">
          Added {title}s ({members.length})
        </h4>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
            No {title.toLowerCase()}s added yet
          </p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <Card key={member.member_id}>
                <CardContent className="p-4">
                  {editingMemberId === member.member_id ? (
                    /* Inline Edit Form */
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Edit {title}</h4>
                      <MemberForm
                        member={editingMemberData}
                        onChange={setEditingMemberData}
                        onSave={handleSaveEditingMember}
                        onCancel={cancelEditing}
                        isEditing={true}
                        isSaving={saveMutation.isPending && editingMemberId === member.member_id}
                        title={title}
                        defaultCategory={defaultCategory}
                      />
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        {member.image_name ? (
                          <img
                            src={`https://assist.seedglobaleducation.com/school_member_uploads/${member.image_name}`}
                            alt={`${member.first_name} ${member.last_name}`}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-foreground">
                              {member.first_name} {member.last_name}
                            </h5>
                            <Badge variant="secondary" className="text-xs">
                              {defaultCategory}
                            </Badge>
                          </div>
                          {(member.designation || member.orgnaisation) && (
                            <p className="text-sm text-muted-foreground">
                              {member.designation}
                              {member.designation && member.orgnaisation ? " at " : ""}
                              {member.orgnaisation}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {member.email && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {member.email}
                              </span>
                            )}
                            {member.linkedin_url && (
                              <a
                                href={member.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary"
                              >
                                <Linkedin className="h-3 w-3" /> LinkedIn
                              </a>
                            )}
                            {member.call_to_action && (
                              <span className="text-xs text-primary font-medium">{member.call_to_action}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(member)}
                          disabled={saveMutation.isPending}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteConfirmMember(member)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button onClick={onSave}>Save & Continue</Button>
    </div>
  );
}
// ============ Program Rankings Section ============

function ProgramRankingsSection({ programId, onSave }: SectionProps) {
  const { data: rankingsData, isLoading } = useProgramRankingsWithOrganizations(programId);
  const rankings = rankingsData?.rankings || [];
  const organizations = rankingsData?.organizations || [];
  const saveMutation = useSaveProgramRanking();
  const deleteMutation = useDeleteProgramRanking();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRanking, setEditingRanking] = useState<ProgramRanking | null>(null);
  const [newRanking, setNewRanking] = useState<Partial<ProgramRanking>>({
    ranking_organisation: "",
    ranking_year: "",
    rank: "",
    supporting_text: "",
  });

  const handleAddNew = () => {
    if (newRanking.ranking_organisation && newRanking.ranking_year && newRanking.rank) {
      saveMutation.mutate(
        {
          programId,
          ranking: {
            ranking_organisation: newRanking.ranking_organisation || "",
            ranking_year: newRanking.ranking_year || "",
            rank: newRanking.rank || "",
            supporting_text: newRanking.supporting_text || "",
          } as ProgramRanking,
        },
        {
          onSuccess: () => {
            setNewRanking({ ranking_organisation: "", ranking_year: "", rank: "", supporting_text: "" });
          },
        }
      );
    }
  };

  const handleEdit = (ranking: ProgramRanking) => {
    // Normalize to strings because backend sometimes returns numeric IDs/years
    const normalizedId = ranking.ranking_addition_id ? String(ranking.ranking_addition_id) : null;
    setEditingId(normalizedId);
    setEditingRanking({
      ...ranking,
      ranking_addition_id: normalizedId ?? undefined,
      ranking_organisation: String(ranking.ranking_organisation ?? ""),
      ranking_year: String((ranking as any).ranking_year ?? (ranking as any).year ?? ""),
      rank: String((ranking as any).rank ?? ""),
    });
  };

  const handleSaveEdit = () => {
    if (editingRanking && editingRanking.ranking_organisation && editingRanking.ranking_year && editingRanking.rank) {
      saveMutation.mutate(
        {
          programId,
          ranking: editingRanking,
        },
        {
          onSuccess: () => {
            setEditingId(null);
            setEditingRanking(null);
          },
        }
      );
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingRanking(null);
  };

  const removeRanking = (ranking: ProgramRanking) => {
    if (ranking.ranking_organisation && ranking.ranking_addition_id) {
      deleteMutation.mutate({ 
        programId, 
        rankingOrgId: ranking.ranking_organisation, 
        rankingAdditionId: ranking.ranking_addition_id 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Ranking Form */}
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Add New Ranking</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ranking Organisation</Label>
              <div className="mt-1.5">
                <OrganizationCombobox
                  organizations={organizations}
                  value={newRanking.ranking_organisation || ""}
                  onValueChange={(value) => setNewRanking({ ...newRanking, ranking_organisation: value })}
                  placeholder="Search and select organisation..."
                />
              </div>
            </div>
            <div>
              <Label>Ranking Year</Label>
              <Input
                value={newRanking.ranking_year || ""}
                onChange={(e) => setNewRanking({ ...newRanking, ranking_year: e.target.value })}
                placeholder="e.g., 2024"
                className="mt-1.5"
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

          <Button
            onClick={handleAddNew}
            disabled={!newRanking.ranking_organisation || !newRanking.ranking_year || !newRanking.rank || saveMutation.isPending}
          >
            {saveMutation.isPending && !editingId && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Add Ranking
          </Button>
        </CardContent>
      </Card>

      {/* Rankings List */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Rankings ({rankings.length})</h4>
        {rankings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No rankings added yet</p>
        ) : (
          <div className="space-y-3">
            {rankings.map((ranking, idx) => {
              const isEditingThis =
                editingId !== null &&
                String(editingId) === String((ranking as any).ranking_addition_id ?? "");
              
              return (
                <Card key={ranking.ranking_addition_id || idx} className={isEditingThis ? "border-primary" : ""}>
                  <CardContent className="p-4">
                    {isEditingThis && editingRanking ? (
                      // Inline Edit Form
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">Edit Ranking</h4>
                          <Button variant="ghost" size="sm" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Ranking Organisation</Label>
                            <div className="mt-1.5">
                              <OrganizationCombobox
                                organizations={organizations}
                                value={editingRanking.ranking_organisation || ""}
                                onValueChange={(value) => setEditingRanking({ ...editingRanking, ranking_organisation: value })}
                                placeholder="Search and select organisation..."
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Ranking Year</Label>
                            <Input
                              value={editingRanking.ranking_year || ""}
                              onChange={(e) => setEditingRanking({ ...editingRanking, ranking_year: e.target.value })}
                              placeholder="e.g., 2024"
                              className="mt-1.5"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Rank</Label>
                            <Input
                              type="number"
                              value={editingRanking.rank || ""}
                              onChange={(e) => setEditingRanking({ ...editingRanking, rank: e.target.value })}
                              placeholder="e.g., 5"
                              className="mt-1.5"
                              min="1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Supporting Text</Label>
                            <Input
                              value={editingRanking.supporting_text || ""}
                              onChange={(e) => setEditingRanking({ ...editingRanking, supporting_text: e.target.value })}
                              placeholder="Additional context about this ranking..."
                              className="mt-1.5"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={handleSaveEdit}
                          disabled={!editingRanking.ranking_organisation || !editingRanking.ranking_year || !editingRanking.rank || saveMutation.isPending}
                        >
                          {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <Check className="h-4 w-4 mr-2" />
                          Update Ranking
                        </Button>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                              #{ranking.rank}
                            </div>
                            <div>
                              <h5 className="font-medium text-foreground">{ranking.ranking_org_name || ranking.ranking_organisation}</h5>
                              <p className="text-sm text-muted-foreground">
                                {ranking.ranking_year}
                              </p>
                            </div>
                          </div>
                          {ranking.supporting_text && (
                            <p className="text-sm text-muted-foreground mt-2 ml-[52px]">{ranking.supporting_text}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={() => handleEdit(ranking)}
                            disabled={saveMutation.isPending || !!editingId}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive shrink-0"
                            onClick={() => removeRanking(ranking)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Button onClick={onSave}>Save & Continue</Button>
    </div>
  );
}

// ============ Program Recruiters Section ============

function ProgramRecruitersSection({ programId, onSave }: SectionProps) {
  const { data: recruiters = [], isLoading } = useProgramRecruiters(programId);
  const saveMutation = useSaveProgramRecruiters();
  const [localRecruiters, setLocalRecruiters] = useState<string[]>([]);
  const [newRecruiter, setNewRecruiter] = useState("");

  // Sync local state when data loads
  useEffect(() => {
    setLocalRecruiters(recruiters);
  }, [recruiters]);

  const addRecruiter = () => {
    if (newRecruiter.trim() && !localRecruiters.includes(newRecruiter.trim())) {
      const updated = [...localRecruiters, newRecruiter.trim()];
      setLocalRecruiters(updated);
      saveMutation.mutate({ programId, recruiters: updated });
      setNewRecruiter("");
    }
  };

  const removeRecruiter = (name: string) => {
    const updated = localRecruiters.filter((r) => r !== name);
    setLocalRecruiters(updated);
    saveMutation.mutate({ programId, recruiters: updated });
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
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Recruiters ({localRecruiters.length})</h4>
        {localRecruiters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No recruiters added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {localRecruiters.map((name, idx) => (
              <Badge key={`${name}-${idx}`} variant="secondary" className="text-sm py-1.5 px-3 gap-2">
                <Building2 className="h-3.5 w-3.5" />
                {name}
                <button
                  onClick={() => removeRecruiter(name)}
                  className="ml-1 hover:text-destructive transition-colors"
                  disabled={saveMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button onClick={onSave}>Save & Continue</Button>
    </div>
  );
}

// ============ Program Job Roles Section ============

function ProgramJobRolesSection({ programId, onSave }: SectionProps) {
  const { data: jobRoles = [], isLoading } = useProgramJobRoles(programId);
  const saveMutation = useSaveProgramJobRoles();
  const [localJobRoles, setLocalJobRoles] = useState<string[]>([]);
  const [newJobRole, setNewJobRole] = useState("");

  // Sync local state when data loads
  useEffect(() => {
    if (jobRoles.length > 0) {
      setLocalJobRoles(jobRoles);
    }
  }, [jobRoles]);

  const addJobRole = () => {
    if (newJobRole.trim() && !localJobRoles.includes(newJobRole.trim())) {
      const updated = [...localJobRoles, newJobRole.trim()];
      setLocalJobRoles(updated);
      saveMutation.mutate({ programId, jobRoles: updated });
      setNewJobRole("");
    }
  };

  const removeJobRole = (role: string) => {
    const updated = localJobRoles.filter((r) => r !== role);
    setLocalJobRoles(updated);
    saveMutation.mutate({ programId, jobRoles: updated });
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
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Job Roles ({localJobRoles.length})</h4>
        {localJobRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No job roles added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {localJobRoles.map((role, idx) => (
              <Badge key={`${role}-${idx}`} variant="secondary" className="text-sm py-1.5 px-3 gap-2">
                <Briefcase className="h-3.5 w-3.5" />
                {role}
                <button
                  onClick={() => removeJobRole(role)}
                  className="ml-1 hover:text-destructive transition-colors"
                  disabled={saveMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button onClick={onSave}>Save & Continue</Button>
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
      faq: { id: faq.id, question: editData.question, answer: editData.answer },
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
              <Button
                onClick={addFaq}
                disabled={!newFaq.question.trim() || !newFaq.answer.trim() || saveMutation.isPending}
              >
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewFaq({ question: "", answer: "" });
                }}
              >
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

      <Button onClick={onSave}>Save & Continue</Button>
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
    orgnaisation: "",
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
          orgnaisation: newPoc.orgnaisation || "",
          contact_no: newPoc.contact_no || "",
          email: newPoc.email || "",
        },
      });
      setNewPoc({ full_name: "", designation: "", orgnaisation: "", contact_no: "", email: "" });
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
                value={newPoc.orgnaisation || ""}
                onChange={(e) => setNewPoc({ ...newPoc, orgnaisation: e.target.value })}
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
          <Button
            onClick={addPoc}
            disabled={!newPoc.full_name?.trim() || !newPoc.email?.trim() || saveMutation.isPending}
          >
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Add POC
          </Button>
        </CardContent>
      </Card>

      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">Added Points of Contact ({pocs.length})</h4>
        {pocs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
            No points of contact added yet
          </p>
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
                        <p className="text-sm text-muted-foreground">
                          {poc.designation} • {poc.orgnaisation}
                        </p>
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

      <Button onClick={onSave}>Save & Continue</Button>
    </div>
  );
}
