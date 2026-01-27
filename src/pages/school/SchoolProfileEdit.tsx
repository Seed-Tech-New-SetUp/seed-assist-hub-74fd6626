import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageUpload } from "@/components/ui/image-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Building2,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Star,
  Trophy,
  Phone,
  GraduationCap,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Loader2,
  Pencil,
  ChevronsUpDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  useSchoolFAQs,
  useSaveSchoolFAQs,
  useSchoolInfo,
  useSaveSchoolInfo,
  useSchoolSocialMedia,
  useSaveSchoolSocialMedia,
  useSchoolFeatures,
  useCreateSchoolFeature,
  useUpdateSchoolFeature,
  useDeleteSchoolFeature,
  useSchoolLogos,
  useCreateSchoolLogo,
  useUpdateSchoolLogo,
  useDeleteSchoolLogo,
  useSchoolRankings,
  useCreateSchoolRanking,
  useUpdateSchoolRanking,
  useDeleteSchoolRanking,
  useSchoolPOCs,
  useCreateSchoolPOC,
  useUpdateSchoolPOC,
  useDeleteSchoolPOC,
} from "@/hooks/useSchoolProfile";
import {
  SchoolFAQ,
  SchoolInfo,
  SchoolSocialMedia,
  SchoolFeature,
  SchoolLogo,
  SchoolRanking,
  RankingOrganization,
  SchoolPOC,
  calculateLogoRatio,
} from "@/lib/api/school-profile";

const sections = [
  { id: "info", label: "Organisation Details", icon: Building2 },
  { id: "social", label: "Digital Presence", icon: Globe },
  { id: "faqs", label: "Knowledge Base", icon: HelpCircle },
  { id: "features", label: "Key Highlights", icon: Star },
  { id: "logos", label: "Brand Assets", icon: ImageIcon },
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
  const [bannerPreview, setBannerPreview] = useState<string>("");

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

  // Social Media state and mutation - lifted up for global save button
  const { data: apiSocialMedia, isLoading: socialLoading } = useSchoolSocialMedia();
  const saveSocialMedia = useSaveSchoolSocialMedia();
  const [socialMedia, setSocialMedia] = useState<SchoolSocialMedia>({});
  const [socialHasChanges, setSocialHasChanges] = useState(false);

  // Initialize Social Media from API data
  useEffect(() => {
    if (apiSocialMedia) {
      setSocialMedia(apiSocialMedia);
    }
  }, [apiSocialMedia]);

  // Features state and mutations - lifted up for global save button
  const { data: apiFeatures, isLoading: featuresLoading } = useSchoolFeatures();
  const createFeature = useCreateSchoolFeature();
  const updateFeature = useUpdateSchoolFeature();
  const deleteFeature = useDeleteSchoolFeature();

  const handleSave = (sectionId: string) => {
    // Handle section-specific save logic
    if (sectionId === "info") {
      saveInfo.mutate(schoolInfo, {
        onSuccess: () => {
          setInfoHasChanges(false);
          setCompletedSections((prev) => [...new Set([...prev, sectionId])]);
          // Auto-advance to next section
          const currentIndex = sections.findIndex((s) => s.id === sectionId);
          if (currentIndex < sections.length - 1) {
            setActiveSection(sections[currentIndex + 1].id);
          }
        },
      });
      return;
    }

    if (sectionId === "faqs") {
      const validFaqs = faqs.filter((faq) => faq.question.trim() || faq.answer.trim());
      saveFAQs.mutate(validFaqs, {
        onSuccess: () => {
          setFaqsHasChanges(false);
          setCompletedSections((prev) => [...new Set([...prev, sectionId])]);
          // Auto-advance to next section
          const currentIndex = sections.findIndex((s) => s.id === sectionId);
          if (currentIndex < sections.length - 1) {
            setActiveSection(sections[currentIndex + 1].id);
          }
        },
      });
      return;
    }

    if (sectionId === "social") {
      saveSocialMedia.mutate(socialMedia, {
        onSuccess: () => {
          setSocialHasChanges(false);
          setCompletedSections((prev) => [...new Set([...prev, sectionId])]);
          // Auto-advance to next section
          const currentIndex = sections.findIndex((s) => s.id === sectionId);
          if (currentIndex < sections.length - 1) {
            setActiveSection(sections[currentIndex + 1].id);
          }
        },
      });
      return;
    }

    // Default save behavior for other sections
    setCompletedSections((prev) => [...new Set([...prev, sectionId])]);
    toast({
      title: "Section Saved",
      description: "Your changes have been saved successfully.",
    });

    // Auto-advance to next section
    const currentIndex = sections.findIndex((s) => s.id === sectionId);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const handleNext = () => {
    const currentIndex = sections.findIndex((s) => s.id === activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = sections.findIndex((s) => s.id === activeSection);
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
          {/* Sidebar Navigation - Sticky */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
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
                <CardTitle className="text-lg">{sections.find((s) => s.id === activeSection)?.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeSection === "info" && (
                  <SchoolInfoSection
                    info={schoolInfo}
                    setInfo={setSchoolInfo}
                    isLoading={infoLoading}
                    setHasChanges={setInfoHasChanges}
                    bannerPreview={bannerPreview}
                    setBannerPreview={setBannerPreview}
                  />
                )}
                {activeSection === "social" && (
                  <SocialMediaSection
                    socialMedia={socialMedia}
                    setSocialMedia={setSocialMedia}
                    isLoading={socialLoading}
                    setHasChanges={setSocialHasChanges}
                  />
                )}
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
                {activeSection === "features" && (
                  <FeaturesSection
                    features={apiFeatures || []}
                    isLoading={featuresLoading}
                    onCreate={createFeature.mutate}
                    onUpdate={updateFeature.mutate}
                    onDelete={deleteFeature.mutate}
                    isCreating={createFeature.isPending}
                    isUpdating={updateFeature.isPending}
                    isDeleting={deleteFeature.isPending}
                  />
                )}
                {activeSection === "logos" && <LogosSection />}
                {activeSection === "rankings" && <RankingsSection />}
                {activeSection === "contact" && <POCsSection />}
                {activeSection === "programs" && <ProgramsSection />}

                {/* Navigation Buttons */}
                <Separator />
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevious} disabled={activeSection === sections[0].id}>
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave(activeSection)}
                      disabled={
                        (activeSection === "info" && saveInfo.isPending) ||
                        (activeSection === "faqs" && saveFAQs.isPending) ||
                        (activeSection === "social" && saveSocialMedia.isPending)
                      }
                    >
                      {((activeSection === "info" && saveInfo.isPending) ||
                        (activeSection === "faqs" && saveFAQs.isPending) ||
                        (activeSection === "social" && saveSocialMedia.isPending)) && (
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
  bannerPreview: string;
  setBannerPreview: React.Dispatch<React.SetStateAction<string>>;
}

function SchoolInfoSection({
  info,
  setInfo,
  isLoading,
  setHasChanges,
  bannerPreview,
  setBannerPreview,
}: SchoolInfoSectionProps) {
  const updateField = (field: keyof SchoolInfo, value: string | number) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
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
          <Select value={info.currency || ""} onValueChange={(value) => updateField("currency", value)}>
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
        <Label htmlFor="imageUpload">School Banner</Label>
        <div className="mt-2 space-y-3">
          {(bannerPreview || info.school_banner) && (
            <div className="rounded-lg overflow-hidden border relative group">
              <img
                src={
                  bannerPreview ||
                  `http://admin.seedglobaleducation.com/assets/img/school_banners/${info.school_banner}`
                }
                alt="School Banner"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {bannerPreview ? "New Banner" : "Current Banner"}
                </span>
              </div>
            </div>
          )}
          <ImageUpload
            value={bannerPreview}
            onChange={(url) => {
              setBannerPreview(url);
              updateField("school_banner", url);
            }}
            placeholder={info.school_banner || bannerPreview ? "Click to replace banner" : "Click to upload banner"}
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
          <Label>Scholarship Amount</Label>
          <Input
            placeholder="3 Million USD"
            className="mt-1.5"
            value={info.scholarship_amount || ""}
            onChange={(e) => updateField("scholarship_amount", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

interface SocialMediaSectionProps {
  socialMedia: SchoolSocialMedia;
  setSocialMedia: React.Dispatch<React.SetStateAction<SchoolSocialMedia>>;
  isLoading: boolean;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

function SocialMediaSection({ socialMedia, setSocialMedia, isLoading, setHasChanges }: SocialMediaSectionProps) {
  const updateField = (field: keyof SchoolSocialMedia, value: string) => {
    setSocialMedia((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Instagram URL</Label>
        <Input
          placeholder="https://instagram.com/..."
          className="mt-1.5"
          value={socialMedia.instagram || ""}
          onChange={(e) => updateField("instagram", e.target.value)}
        />
      </div>
      <div>
        <Label>X (Twitter) URL</Label>
        <Input
          placeholder="https://x.com/..."
          className="mt-1.5"
          value={socialMedia.twitter || ""}
          onChange={(e) => updateField("twitter", e.target.value)}
        />
      </div>
      <div>
        <Label>LinkedIn URL</Label>
        <Input
          placeholder="https://linkedin.com/..."
          className="mt-1.5"
          value={socialMedia.linkedin || ""}
          onChange={(e) => updateField("linkedin", e.target.value)}
        />
      </div>
      <div>
        <Label>YouTube URL</Label>
        <Input
          placeholder="https://youtube.com/..."
          className="mt-1.5"
          value={socialMedia.youtube || ""}
          onChange={(e) => updateField("youtube", e.target.value)}
        />
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
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFaq(index)}>
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

const FEATURES_IMAGE_BASE_URL = "https://assist.seedglobaleducation.com/school_usp_uploads/";

interface FeaturesSectionProps {
  features: SchoolFeature[];
  isLoading: boolean;
  onCreate: (feature: { usp_title: string; usp_description: string; usp_image?: string }) => void;
  onUpdate: (feature: { usp_id: string; usp_title: string; usp_description: string; usp_image?: string }) => void;
  onDelete: (uspId: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

function FeaturesSection({
  features,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
  isUpdating,
  isDeleting,
}: FeaturesSectionProps) {
  const [featureForm, setFeatureForm] = useState({ title: "", description: "", image: "" });
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);

  const handleSaveFeature = () => {
    if (featureForm.title.trim()) {
      if (editingFeatureId) {
        // Update existing feature
        onUpdate({
          usp_id: editingFeatureId,
          usp_title: featureForm.title,
          usp_description: featureForm.description,
          usp_image: featureForm.image || undefined,
        });
        setEditingFeatureId(null);
      } else {
        // Create new feature
        onCreate({
          usp_title: featureForm.title,
          usp_description: featureForm.description,
          usp_image: featureForm.image || undefined,
        });
      }
      setFeatureForm({ title: "", description: "", image: "" });
    }
  };

  const handleEditFeature = (feature: SchoolFeature) => {
    setEditingFeatureId(feature.usp_id || null);
    const currentImageUrl = getFeatureImageUrl(feature);
    setFeatureForm({
      title: feature.usp_title,
      description: feature.usp_description,
      image: currentImageUrl, // Show current image for editing
    });
  };

  const handleCancelEdit = () => {
    setEditingFeatureId(null);
    setFeatureForm({ title: "", description: "", image: "" });
  };

  const handleDeleteFeature = (uspId: string) => {
    if (uspId) {
      onDelete(uspId);
    }
  };

  const getFeatureImageUrl = (feature: SchoolFeature) => {
    if (feature.usp_image_name) {
      return `${FEATURES_IMAGE_BASE_URL}${feature.usp_image_name}`;
    }
    return "";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const isProcessing = isCreating || isUpdating;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{editingFeatureId ? "Edit Feature" : "Add Feature"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={featureForm.title}
              onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })}
              placeholder="Feature title"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={featureForm.description}
              onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
              placeholder="Feature description"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>
              Image {editingFeatureId && <span className="text-muted-foreground">(optional - upload to replace)</span>}
            </Label>
            <ImageUpload
              value={featureForm.image}
              onChange={(url) => setFeatureForm({ ...featureForm, image: url })}
              placeholder="Click to upload feature image"
              aspectRatio="video"
              className="mt-1.5 max-w-[200px] max-h-[100px]"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveFeature} disabled={!featureForm.title.trim() || isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingFeatureId ? "Update Feature" : "Add Feature"}
            </Button>
            {editingFeatureId && (
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {features.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4">No features added yet</div>
      ) : (
        <div className="space-y-3">
          {features.map((feature) => (
            <Card key={feature.usp_id} className={editingFeatureId === feature.usp_id ? "ring-2 ring-primary" : ""}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1">
                  {getFeatureImageUrl(feature) ? (
                    <img
                      src={getFeatureImageUrl(feature)}
                      alt={feature.usp_title}
                      className="w-16 h-16 rounded object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h5 className="font-medium">{feature.usp_title}</h5>
                    <p className="text-sm text-muted-foreground">{feature.usp_description}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditFeature(feature)}
                    disabled={isUpdating || isDeleting}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDeleteFeature(feature.usp_id || "")}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const LOGO_BASE_URL = "https://assist.seedglobaleducation.com/school_logo_uploads/";

function LogosSection() {
  const { data: logos, isLoading } = useSchoolLogos();
  const createLogo = useCreateSchoolLogo();
  const updateLogo = useUpdateSchoolLogo();
  const deleteLogo = useDeleteSchoolLogo();

  const [newLogoPreview, setNewLogoPreview] = useState("");
  const [newLogoRatio, setNewLogoRatio] = useState("");
  const [editingLogoId, setEditingLogoId] = useState<string | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState("");

  const handleNewLogoUpload = async (dataUrl: string) => {
    if (!dataUrl) {
      setNewLogoPreview("");
      setNewLogoRatio("");
      return;
    }

    // Calculate ratio from image
    const img = new Image();
    img.onload = () => {
      const ratio = calculateLogoRatio(img.width, img.height);
      setNewLogoRatio(ratio);
      setNewLogoPreview(dataUrl);
    };
    img.src = dataUrl;
  };

  const handleCreateLogo = async () => {
    if (!newLogoPreview || !newLogoRatio) return;

    await createLogo.mutateAsync({
      logo: newLogoPreview,
      logoRatio: newLogoRatio,
    });

    setNewLogoPreview("");
    setNewLogoRatio("");
  };

  const handleUpdateLogo = async (logoId: string) => {
    if (!editLogoPreview) {
      setEditingLogoId(null);
      return;
    }

    // Calculate new ratio
    const img = new Image();
    img.onload = async () => {
      const ratio = calculateLogoRatio(img.width, img.height);
      await updateLogo.mutateAsync({
        logo_id: logoId,
        logo: editLogoPreview,
        logoRatio: ratio,
      });
      setEditingLogoId(null);
      setEditLogoPreview("");
    };
    img.src = editLogoPreview;
  };

  const handleDeleteLogo = async (logoId: string) => {
    await deleteLogo.mutateAsync(logoId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add New Logo</CardTitle>
          <CardDescription>Upload a logo image. The ratio will be calculated automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Logo Image</Label>
              <ImageUpload
                value={newLogoPreview}
                onChange={handleNewLogoUpload}
                placeholder="Upload logo"
                aspectRatio="auto"
                className="mt-1.5"
              />
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <Label>Detected Ratio</Label>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {newLogoRatio || "Upload an image to detect ratio"}
                </p>
              </div>
              <Button onClick={handleCreateLogo} disabled={!newLogoPreview || createLogo.isPending} className="w-full">
                {createLogo.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" /> Add Logo
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Logos */}
      {logos && logos.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {logos.map((logo) => (
            <Card key={logo.logo_id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="relative group">
                  {editingLogoId === logo.logo_id ? (
                    <div className="space-y-2">
                      <ImageUpload
                        value={editLogoPreview}
                        onChange={setEditLogoPreview}
                        placeholder="Upload new logo"
                        aspectRatio="auto"
                        className="h-24"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateLogo(logo.logo_id || "")}
                          disabled={updateLogo.isPending || !editLogoPreview}
                        >
                          {updateLogo.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingLogoId(null);
                            setEditLogoPreview("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="bg-muted rounded flex items-center justify-center p-2"
                        style={{
                          aspectRatio: logo.logo_ratio?.replace(":", "/") || "1/1",
                          maxHeight: "120px",
                        }}
                      >
                        <img
                          src={`${LOGO_BASE_URL}${logo.logo_file_name}`}
                          alt={`Logo ${logo.logo_ratio}`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Ratio: {logo.logo_ratio || "Unknown"}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingLogoId(logo.logo_id || null);
                              setEditLogoPreview("");
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteLogo(logo.logo_id || "")}
                            disabled={deleteLogo.isPending}
                          >
                            {deleteLogo.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
          No logos added yet. Upload your first logo above.
        </div>
      )}
    </div>
  );
}

// Searchable Organization Combobox for Rankings
function OrganizationCombobox({
  organizations,
  value,
  onValueChange,
  selectedYear,
}: {
  organizations: RankingOrganization[];
  value: string;
  onValueChange: (value: string) => void;
  selectedYear?: string;
}) {
  const [open, setOpen] = useState(false);

  const selectedOrg = organizations.find((org) => String(org.org_id) === value);

  const displayText = selectedOrg
    ? selectedYear
      ? `${selectedOrg.org_name} (${selectedYear})`
      : selectedOrg.org_name
    : selectedYear
      ? `Select organization (${selectedYear})`
      : "Select organization...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between mt-1.5 font-normal"
        >
          <span className="truncate">{displayText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search organization..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup>
              {organizations.map((org) => (
                <CommandItem
                  key={org.org_id}
                  value={org.org_name}
                  onSelect={() => {
                    onValueChange(String(org.org_id));
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === String(org.org_id) ? "opacity-100" : "opacity-0")} />
                  {org.org_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function RankingsSection() {
  const { data: rankingsData, isLoading, isError, error, refetch, isFetching } = useSchoolRankings();
  const createRanking = useCreateSchoolRanking();
  const updateRanking = useUpdateSchoolRanking();
  const deleteRanking = useDeleteSchoolRanking();

  const [formData, setFormData] = useState({
    ranking_organizations: "",
    year: "",
    level: "School",
    rank: "",
    minimum_range: "",
    maximum_range: "",
    supporting_text: "",
  });
  const [useRange, setUseRange] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    description_id: string;
    ranking_org_id: string;
    ranking_addition_id: string;
    ranking_organisation: string;
    ranking_year: string;
    level: string;
    rank: string;
    minimum_range: string;
    maximum_range: string;
    supporting_text: string;
  } | null>(null);

  const rankings = rankingsData?.rankings || [];
  const organizations = rankingsData?.organizations || [];

  const resetForm = () => {
    setFormData({
      ranking_organizations: "",
      year: "",
      level: "School",
      rank: "",
      minimum_range: "",
      maximum_range: "",
      supporting_text: "",
    });
    setUseRange(false);
  };

  const handleCreate = () => {
    if (!formData.ranking_organizations || !formData.year) {
      return;
    }

    createRanking.mutate(
      {
        ranking_organisation: formData.ranking_organizations,
        ranking_year: formData.year,
        level: formData.level,
        rank: useRange ? "" : formData.rank,
        minimum_range: useRange ? formData.minimum_range : "",
        maximum_range: useRange ? formData.maximum_range : "",
        supporting_text: formData.supporting_text,
      },
      {
        onSuccess: () => {
          resetForm();
        },
      },
    );
  };

  const handleStartEdit = (ranking: SchoolRanking) => {
    setEditingId(ranking.description_id || null);
    setEditData({
      description_id: ranking.description_id || "",
      ranking_org_id: ranking.ranking_org_id || "",
      ranking_addition_id: ranking.ranking_addition_id || "",
      ranking_organisation: ranking.ranking_org_id || "",
      ranking_year: ranking.year || "",
      level: ranking.level || "School",
      rank: ranking.rank || "",
      minimum_range: ranking.minimum_rank_range || "",
      maximum_range: ranking.maximum_rank_range || "",
      supporting_text: ranking.supporting_text || "",
    });
  };

  const handleUpdate = () => {
    if (!editData) return;
    updateRanking.mutate(editData, {
      onSuccess: () => {
        setEditingId(null);
        setEditData(null);
      },
    });
  };

  const handleDelete = (ranking: SchoolRanking) => {
    if (!ranking.description_id || !ranking.ranking_org_id || !ranking.ranking_addition_id) return;
    deleteRanking.mutate({
      description_id: ranking.description_id,
      ranking_org_id: ranking.ranking_org_id,
      ranking_addition_id: ranking.ranking_addition_id,
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(isError || organizations.length === 0) && (
        <Alert>
          <AlertTitle>Ranking organizations not loaded</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>
                {isError
                  ? `The backend request failed: ${(error as Error | undefined)?.message || "Unknown error"}`
                  : "The backend returned 0 organizations, so the dropdown is empty."}
              </p>
              <p>Please make sure you’re logged in and have selected a school, then click refresh.</p>
              <div>
                <Button type="button" variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                  {isFetching && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Refresh organizations
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Add New Ranking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add Ranking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Organization</Label>
              <OrganizationCombobox
                organizations={organizations}
                value={formData.ranking_organizations}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, ranking_organizations: value }))}
                selectedYear={formData.year}
              />
            </div>
            <div>
              <Label>Year</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, year: value }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Level</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, level: value }))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="School">School</SelectItem>
                <SelectItem value="Program">Program</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="use-range"
                checked={useRange}
                onChange={(e) => setUseRange(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="use-range" className="cursor-pointer">
                Use range (e.g., 9-20)
              </Label>
            </div>

            {useRange ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Rank</Label>
                  <Input
                    type="number"
                    placeholder="9"
                    className="mt-1.5"
                    value={formData.minimum_range}
                    onChange={(e) => setFormData((prev) => ({ ...prev, minimum_range: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Maximum Rank</Label>
                  <Input
                    type="number"
                    placeholder="20"
                    className="mt-1.5"
                    value={formData.maximum_range}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maximum_range: e.target.value }))}
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label>Rank</Label>
                <Input
                  type="number"
                  placeholder="1"
                  className="mt-1.5"
                  value={formData.rank}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rank: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div>
            <Label>Supporting Text</Label>
            <Textarea
              placeholder="Additional details..."
              className="mt-1.5"
              value={formData.supporting_text}
              onChange={(e) => setFormData((prev) => ({ ...prev, supporting_text: e.target.value }))}
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={createRanking.isPending || !formData.ranking_organizations || !formData.year}
          >
            {createRanking.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Ranking
          </Button>
        </CardContent>
      </Card>

      {/* Rankings List */}
      {rankings.length > 0 ? (
        <div className="space-y-3">
          {rankings.map((ranking) => (
            <Card key={`${ranking.description_id}-${ranking.ranking_org_id}-${ranking.ranking_addition_id}`}>
              <CardContent className="p-4">
                {editingId === ranking.description_id && editData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Organization</Label>
                        <OrganizationCombobox
                          organizations={organizations}
                          value={editData.ranking_organisation}
                          onValueChange={(value) =>
                            setEditData((prev) => (prev ? { ...prev, ranking_organisation: value } : null))
                          }
                          selectedYear={editData.ranking_year}
                        />
                      </div>
                      <div>
                        <Label>Year</Label>
                        <Select
                          value={editData.ranking_year}
                          onValueChange={(value) =>
                            setEditData((prev) => (prev ? { ...prev, ranking_year: value } : null))
                          }
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={String(year)}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Level</Label>
                      <Select
                        value={editData.level}
                        onValueChange={(value) => setEditData((prev) => (prev ? { ...prev, level: value } : null))}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="School">School</SelectItem>
                          <SelectItem value="Program">Program</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Rank</Label>
                        <Input
                          type="number"
                          value={editData.rank}
                          onChange={(e) => setEditData((prev) => (prev ? { ...prev, rank: e.target.value } : null))}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Min Range</Label>
                        <Input
                          type="number"
                          value={editData.minimum_range}
                          onChange={(e) =>
                            setEditData((prev) => (prev ? { ...prev, minimum_range: e.target.value } : null))
                          }
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Max Range</Label>
                        <Input
                          type="number"
                          value={editData.maximum_range}
                          onChange={(e) =>
                            setEditData((prev) => (prev ? { ...prev, maximum_range: e.target.value } : null))
                          }
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Supporting Text</Label>
                      <Textarea
                        value={editData.supporting_text}
                        onChange={(e) =>
                          setEditData((prev) => (prev ? { ...prev, supporting_text: e.target.value } : null))
                        }
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdate} disabled={updateRanking.isPending}>
                        {updateRanking.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditData(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {ranking.ranking_org_name}
                          {ranking.year && (
                            <span className="text-muted-foreground font-normal"> ({ranking.year})</span>
                          )}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-primary">
                        {ranking.rank
                          ? `#${ranking.rank}`
                          : ranking.minimum_rank_range && ranking.maximum_rank_range
                            ? `#${ranking.minimum_rank_range} - #${ranking.maximum_rank_range}`
                            : "N/A"}
                      </div>
                      {ranking.supporting_text && (
                        <p className="text-sm text-muted-foreground">{ranking.supporting_text}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleStartEdit(ranking)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ranking)}
                        disabled={deleteRanking.isPending}
                      >
                        {deleteRanking.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
          No rankings added yet. Add your first ranking above.
        </div>
      )}
    </div>
  );
}

function POCsSection() {
  const { data: pocs, isLoading } = useSchoolPOCs();
  const createPOC = useCreateSchoolPOC();
  const updatePOC = useUpdateSchoolPOC();
  const deletePOC = useDeleteSchoolPOC();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    organisation: "",
    email: "",
    phone: "",
  });
  const [editData, setEditData] = useState<{
    poc_id: string;
    name: string;
    designation: string;
    organisation: string;
    email: string;
    phone: string;
  } | null>(null);

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and email are required.",
        variant: "destructive",
      });
      return;
    }

    createPOC.mutate(formData, {
      onSuccess: () => {
        toast({ title: "Success", description: "Contact added successfully." });
        setFormData({ name: "", designation: "", organisation: "", email: "", phone: "" });
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    });
  };

  const handleStartEdit = (poc: SchoolPOC) => {
    setEditingId(poc.poc_id || null);
    setEditData({
      poc_id: poc.poc_id || "",
      name: poc.name,
      designation: poc.designation,
      organisation: poc.organisation,
      email: poc.email,
      phone: poc.phone,
    });
  };

  const handleUpdate = () => {
    if (!editData) return;

    updatePOC.mutate(editData, {
      onSuccess: () => {
        toast({ title: "Success", description: "Contact updated successfully." });
        setEditingId(null);
        setEditData(null);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    });
  };

  const handleDelete = (pocId: string) => {
    deletePOC.mutate(pocId, {
      onSuccess: () => {
        toast({ title: "Success", description: "Contact deleted successfully." });
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New POC Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Add New Contact</CardTitle>
          <CardDescription>Add a point of contact for your organisation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                placeholder="Full name"
                className="mt-1.5"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Designation</Label>
              <Input
                placeholder="Job title"
                className="mt-1.5"
                value={formData.designation}
                onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>Organization</Label>
            <Input
              placeholder="Organization name"
              className="mt-1.5"
              value={formData.organisation}
              onChange={(e) => setFormData((prev) => ({ ...prev, organisation: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                className="mt-1.5"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="mt-1.5"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={createPOC.isPending}>
            {createPOC.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Contact
          </Button>
        </CardContent>
      </Card>

      {/* POCs List */}
      {pocs && pocs.length > 0 ? (
        <div className="space-y-3">
          {pocs.map((poc) => (
            <Card key={poc.poc_id}>
              <CardContent className="p-4">
                {editingId === poc.poc_id && editData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Designation</Label>
                        <Input
                          value={editData.designation}
                          onChange={(e) =>
                            setEditData((prev) => (prev ? { ...prev, designation: e.target.value } : null))
                          }
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Organization</Label>
                      <Input
                        value={editData.organisation}
                        onChange={(e) =>
                          setEditData((prev) => (prev ? { ...prev, organisation: e.target.value } : null))
                        }
                        className="mt-1.5"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => setEditData((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdate} disabled={updatePOC.isPending}>
                        {updatePOC.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditData(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{poc.name}</div>
                      {poc.designation && (
                        <div className="text-sm text-muted-foreground">
                          {poc.designation}
                          {poc.organisation && ` at ${poc.organisation}`}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        {poc.email && (
                          <a href={`mailto:${poc.email}`} className="text-primary hover:underline">
                            {poc.email}
                          </a>
                        )}
                        {poc.phone && <span className="text-muted-foreground">{poc.phone}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleStartEdit(poc)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => poc.poc_id && handleDelete(poc.poc_id)}
                        disabled={deletePOC.isPending}
                      >
                        {deletePOC.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
          No contacts added yet. Add your first contact above.
        </div>
      )}
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
