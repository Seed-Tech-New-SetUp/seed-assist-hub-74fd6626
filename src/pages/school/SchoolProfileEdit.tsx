import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const sections = [
  { id: "info", label: "School Information", icon: Building2 },
  { id: "social", label: "Social Media", icon: Globe },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "features", label: "Features", icon: Star },
  { id: "logos", label: "Logos", icon: Image },
  { id: "rankings", label: "Rankings", icon: Trophy },
  { id: "contact", label: "Contact Details", icon: Phone },
  { id: "programs", label: "Program Information", icon: GraduationCap },
];

export default function SchoolProfileEdit() {
  const [activeSection, setActiveSection] = useState("info");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSave = (sectionId: string) => {
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
          <h1 className="text-2xl font-display font-bold text-foreground">Edit School Profile</h1>
          <p className="text-muted-foreground mt-1">Update your school's information and settings</p>
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
                {activeSection === "info" && <SchoolInfoSection />}
                {activeSection === "social" && <SocialMediaSection />}
                {activeSection === "faqs" && <FAQsSection />}
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
                    <Button onClick={() => handleSave(activeSection)}>
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

function SchoolInfoSection() {
  const [backgroundImage, setBackgroundImage] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <Label>School Description</Label>
        <Textarea 
          placeholder="Describe your school..." 
          className="mt-1.5 min-h-[120px]"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Currency</Label>
          <Select>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD</SelectItem>
              <SelectItem value="eur">EUR</SelectItem>
              <SelectItem value="gbp">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>City</Label>
          <Input placeholder="City" className="mt-1.5" />
        </div>
        <div>
          <Label>State</Label>
          <Input placeholder="State/Province" className="mt-1.5" />
        </div>
        <div>
          <Label>Country</Label>
          <Select>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="sg">Singapore</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Background Image</Label>
        <ImageUpload
          value={backgroundImage}
          onChange={setBackgroundImage}
          placeholder="Click to upload background image"
          aspectRatio="video"
          className="mt-1.5"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Graduate Programs</Label>
          <Input type="number" placeholder="0" className="mt-1.5" />
        </div>
        <div>
          <Label>PhD Programs</Label>
          <Input type="number" placeholder="0" className="mt-1.5" />
        </div>
        <div>
          <Label>International Students %</Label>
          <Input type="number" placeholder="0" className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label>Scholarship Amount</Label>
        <Input type="number" placeholder="0" className="mt-1.5" />
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

function FAQsSection() {
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <Button onClick={addFaq} variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add FAQ
      </Button>
      {faqs.map((faq, index) => (
        <Card key={index}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div>
                  <Label>Question</Label>
                  <Input placeholder="Enter question..." className="mt-1.5" />
                </div>
                <div>
                  <Label>Answer</Label>
                  <Textarea placeholder="Enter answer..." className="mt-1.5" />
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
