import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageUpload } from "@/components/ui/image-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  Globe, 
  HelpCircle, 
  Image, 
  Star, 
  Trophy, 
  Phone,
  GraduationCap,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSchoolFAQs, useSaveSchoolFAQs, useSchoolInfo, useSaveSchoolInfo } from "@/hooks/useSchoolProfile";
import { SchoolFAQ, SchoolInfo } from "@/lib/api/school-profile";

const sections = [
  { id: "info", label: "Organisation Details", icon: Building2 },
  { id: "social", label: "Digital Presence", icon: Globe },
  { id: "faqs", label: "Knowledge Base", icon: HelpCircle },
  { id: "features", label: "Key Highlights", icon: Star },
  { id: "logos", label: "Brand Assets", icon: Image },
  { id: "rankings", label: "Accreditations & Rankings", icon: Trophy },
  { id: "contact", label: "Key Contacts", icon: Phone },
  { id: "programs", label: "Program Portfolio", icon: GraduationCap },
];

export default function SchoolProfileEdit() {
  const [activeSection, setActiveSection] = useState("info");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const { toast } = useToast();
  
  // School Info state and mutation - lifted up for global save button
  const { data: apiInfo, isLoading: infoLoading } = useSchoolInfo();
  const saveInfo = useSaveSchoolInfo();
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({});
  const [infoHasChanges, setInfoHasChanges] = useState(false);

  // Initialize School Info from API data
  useEffect(() => {
    if (apiInfo) {
      setSchoolInfo(apiInfo);
    }
  }, [apiInfo]);

  // FAQs state and mutation - lifted up for global save button
  const { data: apiFaqs, isLoading: faqsLoading } = useSchoolFAQs();
  const saveFAQs = useSaveSchoolFAQs();
  const [faqs, setFaqs] = useState<SchoolFAQ[]>([]);
  const [faqsHasChanges, setFaqsHasChanges] = useState(false);

  // Initialize FAQs from API data
  useEffect(() => {
    if (apiFaqs && apiFaqs.length > 0) {
      setFaqs(apiFaqs);
    } else if (apiFaqs && apiFaqs.length === 0) {
      setFaqs([{ question: "", answer: "" }]);
    }
  }, [apiFaqs]);

  const handleSave = (sectionId: string) => {
    // Handle section-specific save logic
    if (sectionId === "info") {
      saveInfo.mutate(schoolInfo, {
        onSuccess: () => {
          setInfoHasChanges(false);
          setCompletedSections(prev => [...new Set([...prev, sectionId])]);
          // Auto-advance to next section
          const currentIndex = sections.findIndex(s => s.id === sectionId);
          if (currentIndex < sections.length - 1) {
            setActiveSection(sections[currentIndex + 1].id);
          }
        },
      });
      return;
    }

    if (sectionId === "faqs") {
      const validFaqs = faqs.filter(faq => faq.question.trim() || faq.answer.trim());
      saveFAQs.mutate(validFaqs, {
        onSuccess: () => {
          setFaqsHasChanges(false);
          setCompletedSections(prev => [...new Set([...prev, sectionId])]);
          // Auto-advance to next section
          const currentIndex = sections.findIndex(s => s.id === sectionId);
          if (currentIndex < sections.length - 1) {
            setActiveSection(sections[currentIndex + 1].id);
          }
        },
      });
      return;
    }
    
    // Default save behavior for other sections
    setCompletedSections(prev => [...new Set([...prev, sectionId])]);
    toast({
      title: "Section Saved",
      description: "Your changes have been saved successfully.",
    });
    
    // Auto-advance to next section
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const handleNext = () => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Organisation Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your organisation's information and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {sections.map((section, index) => {
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
                  {sections.find(s => s.id === activeSection)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeSection === "info" && (
                  <SchoolInfoSection 
                    info={schoolInfo}
                    setInfo={setSchoolInfo}
                    isLoading={infoLoading}
                    setHasChanges={setInfoHasChanges}
                  />
                )}
                {activeSection === "social" && <SocialMediaSection />}
                {activeSection === "faqs" && (
                  <FAQsSection 
                    faqs={faqs}
                    setFaqs={setFaqs}
                    isLoading={faqsLoading}
                    hasChanges={faqsHasChanges}
                    setHasChanges={setFaqsHasChanges}
                    onSave={() => handleSave("faqs")}
                    isSaving={saveFAQs.isPending}
                  />
                )}
                {activeSection === "features" && <FeaturesSection />}
                {activeSection === "logos" && <LogosSection />}
                {activeSection === "rankings" && <RankingsSection />}
                {activeSection === "contact" && <ContactSection />}
                {activeSection === "programs" && <ProgramsSection />}

                {/* Navigation Buttons */}
                <Separator />
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={activeSection === sections[0].id}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSave(activeSection)}
                      disabled={
                        (activeSection === "info" && saveInfo.isPending) ||
                        (activeSection === "faqs" && saveFAQs.isPending)
                      }
                    >
                      {((activeSection === "info" && saveInfo.isPending) ||
                        (activeSection === "faqs" && saveFAQs.isPending)) && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Save Section
                    </Button>
                    {activeSection !== sections[sections.length - 1].id && (
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
      </div>
    </DashboardLayout>
  );
}

interface SchoolInfoSectionProps {
  info: SchoolInfo;
  setInfo: React.Dispatch<React.SetStateAction<SchoolInfo>>;
  isLoading: boolean;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

function SchoolInfoSection({ info, setInfo, isLoading, setHasChanges }: SchoolInfoSectionProps) {
  const updateField = (field: keyof SchoolInfo, value: string | number) => {
    setInfo(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* School Name & University */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>School Name</Label>
          <Input 
            placeholder="School name" 
            className="mt-1.5" 
            value={info.school_name || ""}
            onChange={(e) => updateField("school_name", e.target.value)}
          />
        </div>
        <div>
          <Label>University</Label>
          <Input 
            placeholder="University name" 
            className="mt-1.5" 
            value={info.university || ""}
            onChange={(e) => updateField("university", e.target.value)}
          />
        </div>
      </div>

      {/* About / Description - Rich Text Editor */}
      <div>
        <Label>About</Label>
        <RichTextEditor
          value={info.about || ""}
          onChange={(value) => updateField("about", value)}
          placeholder="Describe your school..."
          className="mt-1.5"
        />
      </div>

      {/* Location & Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Currency</Label>
          <Select 
            value={info.currency || ""} 
            onValueChange={(value) => updateField("currency", value)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
              <SelectItem value="SGD">SGD</SelectItem>
              <SelectItem value="AED">AED</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>City</Label>
          <Input 
            placeholder="City" 
            className="mt-1.5" 
            value={info.city || ""}
            onChange={(e) => updateField("city", e.target.value)}
          />
        </div>
        <div>
          <Label>State</Label>
          <Input 
            placeholder="State/Province" 
            className="mt-1.5" 
            value={info.state || ""}
            onChange={(e) => updateField("state", e.target.value)}
          />
        </div>
        <div>
          <Label>Country</Label>
          <Input 
            placeholder="Country" 
            className="mt-1.5" 
            value={info.country || ""}
            onChange={(e) => updateField("country", e.target.value)}
          />
        </div>
      </div>

      {/* School Banner Preview with Upload Option */}
      <div>
        <Label>School Banner</Label>
        <div className="mt-2 space-y-3">
          {info.school_banner && (
            <div className="rounded-lg overflow-hidden border relative group">
              <img 
                src={`http://admin.seedglobaleducation.com/assets/img/school_banners/${info.school_banner}`}
                alt="School Banner"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Current Banner</span>
              </div>
            </div>
          )}
          <ImageUpload
            value=""
            onChange={(url) => {
              // For now, just update the field - actual upload would need backend integration
              updateField("school_banner", url);
            }}
            placeholder={info.school_banner ? "Click to replace banner" : "Click to upload banner"}
            aspectRatio="wide"
            className="h-32"
          />
          <p className="text-xs text-muted-foreground">
            Recommended size: 1200x400 pixels. Supported formats: JPG, PNG, WebP
          </p>
        </div>
      </div>

      {/* Brochure Link */}
      <div>
        <Label>School Brochure Link</Label>
        <Input 
          placeholder="https://example.com/brochure.pdf" 
          className="mt-1.5" 
          value={info.school_brochure_link || ""}
          onChange={(e) => updateField("school_brochure_link", e.target.value)}
        />
      </div>

      {/* Programs & Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Graduate/PhD Programs</Label>
          <Input 
            type="number" 
            placeholder="25" 
            className="mt-1.5" 
            value={info.graduate_phd_programs || ""}
            onChange={(e) => updateField("graduate_phd_programs", e.target.value)}
          />
        </div>
        <div>
          <Label>International Students %</Label>
          <Input 
            type="number" 
            placeholder="35" 
            className="mt-1.5" 
            value={info.international_students || ""}
            onChange={(e) => updateField("international_students", e.target.value)}
          />
        </div>
        <div>
          <Label>Scholarship Amount (USD)</Label>
          <Input 
            placeholder="3,000,000" 
            className="mt-1.5" 
            value={info.scholarship_amount || ""}
            onChange={(e) => updateField("scholarship_amount", e.target.value)}
          />
        </div>
      </div>

    </div>
  );
}

function SocialMediaSection() {
  return (
    <div className="space-y-4">
      <div>
        <Label>Instagram URL</Label>
        <Input placeholder="https://instagram.com/..." className="mt-1.5" />
      </div>
      <div>
        <Label>X (Twitter) URL</Label>
        <Input placeholder="https://x.com/..." className="mt-1.5" />
      </div>
      <div>
        <Label>LinkedIn URL</Label>
        <Input placeholder="https://linkedin.com/..." className="mt-1.5" />
      </div>
      <div>
        <Label>YouTube URL</Label>
        <Input placeholder="https://youtube.com/..." className="mt-1.5" />
      </div>
    </div>
  );
}

interface FAQsSectionProps {
  faqs: SchoolFAQ[];
  setFaqs: React.Dispatch<React.SetStateAction<SchoolFAQ[]>>;
  isLoading: boolean;
  hasChanges: boolean;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
  onSave: () => void;
  isSaving: boolean;
}

function FAQsSection({ faqs, setFaqs, isLoading, hasChanges, setHasChanges, onSave, isSaving }: FAQsSectionProps) {
  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
    setHasChanges(true);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={addFaq} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
        {hasChanges && (
          <Button onClick={onSave} disabled={isSaving} size="sm">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save FAQs
          </Button>
        )}
      </div>
      {faqs.map((faq, index) => (
        <Card key={faq.faq_id || index}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div>
                  <Label>Question</Label>
                  <Input 
                    placeholder="Enter question..." 
                    className="mt-1.5"
                    value={faq.question}
                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Answer</Label>
                  <Textarea 
                    placeholder="Enter answer..." 
                    className="mt-1.5"
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeFaq(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {faqs.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-8">
          No FAQs added yet. Click "Add FAQ" to create your first one.
        </div>
      )}
    </div>
  );
}

function FeaturesSection() {
  const [features, setFeatures] = useState<{title: string; description: string; image: string}[]>([]);
  const [newFeature, setNewFeature] = useState({ title: "", description: "", image: "" });

  const addFeature = () => {
    if (newFeature.title.trim()) {
      setFeatures([...features, { ...newFeature }]);
      setNewFeature({ title: "", description: "", image: "" });
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add Feature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input 
              value={newFeature.title}
              onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
              placeholder="Feature title" 
              className="mt-1.5" 
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              value={newFeature.description}
              onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
              placeholder="Feature description" 
              className="mt-1.5" 
            />
          </div>
          <div>
            <Label>Image</Label>
            <ImageUpload
              value={newFeature.image}
              onChange={(url) => setNewFeature({ ...newFeature, image: url })}
              placeholder="Click to upload feature image"
              aspectRatio="video"
              className="mt-1.5"
            />
          </div>
          <Button onClick={addFeature} disabled={!newFeature.title.trim()}>Add Feature</Button>
        </CardContent>
      </Card>
      {features.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          No features added yet
        </div>
      ) : (
        <div className="space-y-3">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  {feature.image ? (
                    <img src={feature.image} alt={feature.title} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Image className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h5 className="font-medium">{feature.title}</h5>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFeature(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LogosSection() {
  const [logo1x1, setLogo1x1] = useState("");
  const [logo3x1, setLogo3x1] = useState("");

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Logo (1:1 ratio)</Label>
        <ImageUpload
          value={logo1x1}
          onChange={setLogo1x1}
          placeholder="Upload 1:1 logo"
          aspectRatio="square"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>Logo (3:1 ratio)</Label>
        <ImageUpload
          value={logo3x1}
          onChange={setLogo3x1}
          placeholder="Upload 3:1 logo"
          aspectRatio="wide"
          className="mt-1.5"
        />
      </div>
    </div>
  );
}

function RankingsSection() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add Ranking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Organization</Label>
              <Input placeholder="e.g., Financial Times" className="mt-1.5" />
            </div>
            <div>
              <Label>Year</Label>
              <Select>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Rank</Label>
            <Input type="number" placeholder="1" className="mt-1.5" />
          </div>
          <div>
            <Label>Supporting Text</Label>
            <Textarea placeholder="Additional details..." className="mt-1.5" />
          </div>
          <Button>Add Ranking</Button>
        </CardContent>
      </Card>
      <div className="text-sm text-muted-foreground text-center py-4">
        No rankings added yet
      </div>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Contact Name</Label>
          <Input placeholder="Full name" className="mt-1.5" />
        </div>
        <div>
          <Label>Designation</Label>
          <Input placeholder="Job title" className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label>Organization</Label>
        <Input placeholder="Organization name" className="mt-1.5" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input type="email" placeholder="email@example.com" className="mt-1.5" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input type="tel" placeholder="Phone number" className="mt-1.5" />
        </div>
      </div>
    </div>
  );
}

function ProgramsSection() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Manage your program offerings</p>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Request New Program
        </Button>
      </div>
      <div className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
        No programs configured. Contact support to add programs.
      </div>
    </div>
  );
}
