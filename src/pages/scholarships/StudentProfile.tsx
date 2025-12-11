import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Download,
  FileText,
  Star,
  Check,
  Pause,
  X,
  Trophy,
  Plus,
  Trash2,
  Award,
  Bell,
  Send,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type WorkflowStatus = "SHORTLISTED" | "ON_HOLD" | "REJECTED" | "WINNER" | "PENDING";

interface ScholarshipAward {
  id: string;
  name: string;
  amount: number;
  isCustom: boolean;
}

// Mock university-provided awards for the scholarship
const universityAwards: ScholarshipAward[] = [
  { id: "1", name: "Full Tuition Waiver", amount: 50000, isCustom: false },
  { id: "2", name: "Living Stipend", amount: 15000, isCustom: false },
  { id: "3", name: "Research Grant", amount: 5000, isCustom: false },
];

// Mock data for a single student
const studentData = {
  id: "1",
  name: "Priya Sharma",
  country: "India",
  countryCode: "IN",
  isSeedRecommended: true,
  status: "PENDING" as WorkflowStatus,
  scholarshipName: "Global Leaders MBA Scholarship 2024",
  email: "priya.sharma@email.com",
  phone: "+91 98765 43210",
  gender: "Female",
  countryOfResidence: "India",
  nationality: "Indian",
  programInterest: {
    name: "Full-Time MBA",
    intake: "Fall 2024",
  },
  academic: {
    institution: "Delhi University",
    year: 2019,
    studyArea: "Computer Science",
    gpa: 3.8,
    scale: 4.0,
  },
  work: {
    industry: "Technology",
    years: 5,
    hasResume: true,
  },
  documents: {
    essay: { uploaded: true, filename: "scholarship_essay.pdf" },
    passport: { uploaded: true, filename: "passport.pdf" },
    finance: { uploaded: true, filename: "financial_docs.pdf" },
    lor1: { uploaded: true, filename: "lor_1.pdf" },
    lor2: { uploaded: false, filename: null },
  },
  standardizedTest: { name: "GMAT", score: 720 },
};

const statusConfig: Record<WorkflowStatus, { label: string; icon: React.ElementType; color: string; buttonColor: string }> = {
  PENDING: { label: "Pending", icon: Pause, color: "bg-gray-500/10 text-gray-600 border-gray-500/20", buttonColor: "bg-gray-500 hover:bg-gray-600" },
  SHORTLISTED: { label: "Shortlist", icon: Check, color: "bg-green-500/10 text-green-600 border-green-500/20", buttonColor: "bg-green-500 hover:bg-green-600" },
  ON_HOLD: { label: "On Hold", icon: Pause, color: "bg-orange-500/10 text-orange-600 border-orange-500/20", buttonColor: "bg-orange-500 hover:bg-orange-600" },
  REJECTED: { label: "Reject", icon: X, color: "bg-red-500/10 text-red-600 border-red-500/20", buttonColor: "bg-red-500 hover:bg-red-600" },
  WINNER: { label: "Winner", icon: Trophy, color: "bg-purple-500/10 text-purple-600 border-purple-500/20", buttonColor: "bg-purple-500 hover:bg-purple-600" },
};

export default function StudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const student = studentData;

  const [showAwardsModal, setShowAwardsModal] = useState(false);
  const [selectedAwards, setSelectedAwards] = useState<string[]>([]);
  const [customAwards, setCustomAwards] = useState<{ name: string; amount: string }[]>([]);
  const [newAwardName, setNewAwardName] = useState("");
  const [newAwardAmount, setNewAwardAmount] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [pendingWinnerData, setPendingWinnerData] = useState<{ totalAmount: number; awardCount: number } | null>(null);

  const handleStatusChange = (status: WorkflowStatus) => {
    if (status === "WINNER") {
      setShowAwardsModal(true);
    } else {
      toast({
        title: "Status Updated",
        description: `${student.name}'s status has been changed to ${statusConfig[status].label}.`,
      });
    }
  };

  const toggleAwardSelection = (awardId: string) => {
    setSelectedAwards(prev =>
      prev.includes(awardId) ? prev.filter(id => id !== awardId) : [...prev, awardId]
    );
  };

  const addCustomAward = () => {
    if (newAwardName.trim() && newAwardAmount.trim()) {
      setCustomAwards(prev => [...prev, { name: newAwardName.trim(), amount: newAwardAmount.trim() }]);
      setNewAwardName("");
      setNewAwardAmount("");
    }
  };

  const removeCustomAward = (index: number) => {
    setCustomAwards(prev => prev.filter((_, i) => i !== index));
  };

  const confirmWinner = () => {
    const selectedUniversityAwards = universityAwards.filter(a => selectedAwards.includes(a.id));
    const totalAmount = selectedUniversityAwards.reduce((sum, a) => sum + a.amount, 0) +
      customAwards.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

    // Store data for notification step
    setPendingWinnerData({
      totalAmount,
      awardCount: selectedUniversityAwards.length + customAwards.length,
    });

    setShowAwardsModal(false);
    setShowNotificationModal(true);
  };

  const handleNotificationChoice = (sendNotification: boolean) => {
    if (pendingWinnerData) {
      toast({
        title: "Winner Confirmed!",
        description: `${student.name} has been marked as winner with ${pendingWinnerData.awardCount} award(s) totaling $${pendingWinnerData.totalAmount.toLocaleString()}.${sendNotification ? " Notification sent." : ""}`,
      });
    }

    setShowNotificationModal(false);
    setPendingWinnerData(null);
    setSelectedAwards([]);
    setCustomAwards([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Scholarship Name - Top Most */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Scholarship</p>
              <h2 className="text-xl font-display font-bold text-foreground">{student.scholarshipName}</h2>
            </div>
          </div>
        </div>

        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/scholarships/applications">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Applicants
            </Link>
          </Button>
          <div className="flex gap-2">
            {(["SHORTLISTED", "ON_HOLD", "REJECTED", "WINNER"] as WorkflowStatus[]).map((status) => {
              const config = statusConfig[status];
              return (
                <Button
                  key={status}
                  size="sm"
                  className={`${config.buttonColor} text-white`}
                  onClick={() => handleStatusChange(status)}
                >
                  <config.icon className="h-3.5 w-3.5 mr-1" />
                  {config.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Header Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-display font-bold">{student.name}</h1>
                <div className="flex gap-2">
                  {student.isSeedRecommended && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      <Star className="h-3 w-3 mr-1" />
                      SEED Recommended
                    </Badge>
                  )}
                  <Badge variant="outline" className={statusConfig[student.status].color}>
                    {statusConfig[student.status].label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{student.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{student.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="text-sm mt-1">{student.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Country of Residence</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{student.countryOfResidence}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nationality</p>
                  <p className="text-sm mt-1">{student.nationality}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Interest */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Program Interest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Program</p>
                  <div className="flex items-center gap-2 mt-1">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{student.programInterest.name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Intake Interested In</p>
                  <p className="text-sm mt-1">{student.programInterest.intake}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Background */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Academic Background</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Institution</p>
                <p className="text-sm font-medium mt-1">{student.academic.institution}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completion Year</p>
                <p className="text-sm mt-1">{student.academic.year}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Study Area</p>
                <p className="text-sm mt-1">{student.academic.studyArea}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">GPA</p>
                <p className="text-sm mt-1">{student.academic.gpa} / {student.academic.scale}</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Standardized Test</p>
                <p className="text-sm font-medium mt-1">{student.standardizedTest.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-sm mt-1">{student.standardizedTest.score}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Work Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Industry</p>
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{student.work.industry}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Years of Experience</p>
                <p className="text-sm mt-1">{student.work.years} years</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Resume</p>
                <Button variant="outline" size="sm" className="mt-1">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="essay">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="essay">Essay</TabsTrigger>
                <TabsTrigger value="passport">Passport</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
                <TabsTrigger value="lor1">LOR 1</TabsTrigger>
                <TabsTrigger value="lor2">LOR 2</TabsTrigger>
              </TabsList>
              {Object.entries(student.documents).map(([key, doc]) => (
                <TabsContent key={key} value={key} className="mt-4">
                  {doc.uploaded ? (
                    <div className="border rounded-lg p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">{doc.filename}</p>
                      <div className="flex justify-center gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-lg p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">Not Uploaded</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Awards Modal for Winner */}
        <Dialog open={showAwardsModal} onOpenChange={setShowAwardsModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-500" />
                Assign Awards to Winner
              </DialogTitle>
              <DialogDescription>
                Select the awards to grant to {student.name} and add any custom awards.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* University-provided Awards */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">University Awards</Label>
                {universityAwards.map((award) => (
                  <div
                    key={award.id}
                    onClick={() => toggleAwardSelection(award.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedAwards.includes(award.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selectedAwards.includes(award.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}>
                        {selectedAwards.includes(award.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{award.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">${award.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Custom Awards */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Custom Awards</Label>
                
                {customAwards.map((award, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg border border-primary/50 bg-primary/5">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{award.name}</p>
                      <p className="text-xs text-muted-foreground">${parseFloat(award.amount).toLocaleString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeCustomAward(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add Custom Award Form */}
                <div className="grid grid-cols-[1fr,120px,auto] gap-2">
                  <Input
                    placeholder="Award name"
                    value={newAwardName}
                    onChange={(e) => setNewAwardName(e.target.value)}
                  />
                  <Input
                    placeholder="Amount"
                    type="number"
                    value={newAwardAmount}
                    onChange={(e) => setNewAwardAmount(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={addCustomAward}
                    disabled={!newAwardName.trim() || !newAwardAmount.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAwardsModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmWinner}
                className="bg-purple-500 hover:bg-purple-600"
                disabled={selectedAwards.length === 0 && customAwards.length === 0}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Confirm Winner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notification Confirmation Modal */}
        <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Send Notification?
              </DialogTitle>
              <DialogDescription>
                Would you like to send a notification to {student.name} about their scholarship award?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  An email notification will be sent to <span className="font-medium text-foreground">{student.email}</span> with details about their scholarship awards.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleNotificationChoice(false)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Skip Notification
              </Button>
              <Button
                onClick={() => handleNotificationChoice(true)}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}