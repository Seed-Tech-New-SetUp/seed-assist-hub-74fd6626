import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchApplicantProfile, updateApplicantStatus, ApplicantProfile, WorkflowStatus } from "@/lib/api/scholarship";

function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  // Avoid mixed-content blocks when the API returns http links.
  return trimmed.replace(/^http:\/\/seedglobaleducation\.com\//i, "https://seedglobaleducation.com/");
}

type ProfileDocument = { label: string; url: string; description?: string };

function parseSupportingDocuments(raw: string | null | undefined): ProfileDocument[] {
  if (!raw) return [];

  const value = raw.trim();
  if (!value) return [];

  // Most common: a single URL
  if (/^https?:\/\//i.test(value)) {
    return [{ label: "Supporting Document", url: normalizeExternalUrl(value) }];
  }

  // Sometimes APIs send JSON (stringified) list of urls or objects
  if (value.startsWith("[") || value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((item, idx) => {
            if (typeof item === "string") {
              return { label: `Document ${idx + 1}`, url: normalizeExternalUrl(item) } as ProfileDocument;
            }
            if (item && typeof item === "object") {
              const maybe = item as { url?: unknown; link?: unknown; name?: unknown; label?: unknown; description?: unknown };
              const url = (typeof maybe.url === "string" ? maybe.url : typeof maybe.link === "string" ? maybe.link : "").trim();
              if (!url) return null;
              const label =
                (typeof maybe.label === "string" && maybe.label.trim()) ||
                (typeof maybe.name === "string" && maybe.name.trim()) ||
                `Document ${idx + 1}`;
              const description = typeof maybe.description === "string" ? maybe.description : undefined;
              return { label, url: normalizeExternalUrl(url), description } as ProfileDocument;
            }
            return null;
          })
          .filter((x): x is ProfileDocument => Boolean(x));
      }
    } catch {
      // fall through
    }
  }

  // Fallback: split on commas/newlines if it looks like a list
  const parts = value
    .split(/[\n,]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length <= 1) return [];
  return parts
    .filter((p) => /^https?:\/\//i.test(p))
    .map((p, idx) => ({ label: `Document ${idx + 1}`, url: normalizeExternalUrl(p) }));
}

type UIWorkflowStatus = "SHORTLISTED" | "ON_HOLD" | "REJECTED" | "WINNER" | "PENDING";

const statusConfig: Record<UIWorkflowStatus, { label: string; icon: React.ElementType; color: string; buttonColor: string }> = {
  PENDING: { label: "Pending", icon: Pause, color: "bg-gray-500/10 text-gray-600 border-gray-500/20", buttonColor: "bg-gray-500 hover:bg-gray-600" },
  SHORTLISTED: { label: "Shortlist", icon: Check, color: "bg-green-500/10 text-green-600 border-green-500/20", buttonColor: "bg-green-500 hover:bg-green-600" },
  ON_HOLD: { label: "On Hold", icon: Pause, color: "bg-orange-500/10 text-orange-600 border-orange-500/20", buttonColor: "bg-orange-500 hover:bg-orange-600" },
  REJECTED: { label: "Reject", icon: X, color: "bg-red-500/10 text-red-600 border-red-500/20", buttonColor: "bg-red-500 hover:bg-red-600" },
  WINNER: { label: "Winner", icon: Trophy, color: "bg-purple-500/10 text-purple-600 border-purple-500/20", buttonColor: "bg-purple-500 hover:bg-purple-600" },
};

// Map API status to UI status
function mapApiStatusToUI(status: WorkflowStatus): UIWorkflowStatus {
  switch (status) {
    case "shortlisted": return "SHORTLISTED";
    case "onhold": return "ON_HOLD";
    case "rejected": return "REJECTED";
    case "winner": return "WINNER";
    default: return "PENDING";
  }
}

export default function StudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAwardsModal, setShowAwardsModal] = useState(false);
  const [selectedAwards, setSelectedAwards] = useState<string[]>([]);
  const [customAwards, setCustomAwards] = useState<{ name: string; amount: string }[]>([]);
  const [newAwardName, setNewAwardName] = useState("");
  const [newAwardAmount, setNewAwardAmount] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pendingStatusData, setPendingStatusData] = useState<{
    status: UIWorkflowStatus;
    totalAmount?: number;
    awardCount?: number;
    selectedAwardId?: string;
    customAmount?: string;
    customCurrency?: string;
  } | null>(null);

  const loadProfile = async () => {
    if (!studentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchApplicantProfile(studentId);
      setProfile(data);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [studentId]);

  const handleStatusChange = (status: UIWorkflowStatus) => {
    if (status === "WINNER") {
      setShowAwardsModal(true);
    } else {
      setPendingStatusData({ status });
      setShowNotificationModal(true);
    }
  };

  const toggleAwardSelection = (awardId: string) => {
    setSelectedAwards(prev => {
      const newSelection = prev.includes(awardId) ? prev.filter(id => id !== awardId) : [...prev, awardId];
      // Clear custom awards when a predefined award is selected
      if (newSelection.length > 0) {
        setCustomAwards([]);
        setNewAwardName("");
        setNewAwardAmount("");
      }
      return newSelection;
    });
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
    if (!profile) return;
    
    const selectedUniversityAwards = profile.awards.available.filter(a => selectedAwards.includes(a.id));
    const totalAmount = selectedUniversityAwards.reduce((sum, a) => sum + a.value, 0) +
      customAwards.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

    // Determine award_id and custom award details
    let selectedAwardId: string | undefined;
    let customAmount: string | undefined;
    let customCurrency: string | undefined;

    if (selectedUniversityAwards.length > 0) {
      // Use the first selected university award
      selectedAwardId = selectedUniversityAwards[0].id;
    } else if (customAwards.length > 0) {
      // Use custom award
      selectedAwardId = "other";
      customAmount = customAwards[0].amount;
      customCurrency = "USD"; // Default currency
    }

    setPendingStatusData({
      status: "WINNER",
      totalAmount,
      awardCount: selectedUniversityAwards.length + customAwards.length,
      selectedAwardId,
      customAmount,
      customCurrency,
    });

    setShowAwardsModal(false);
    setShowNotificationModal(true);
  };

  const handleNotificationChoice = async (sendNotification: boolean) => {
    if (!profile || !pendingStatusData) return;

    setIsUpdatingStatus(true);

    try {
      // Map UI status to API status format
      const statusMap: Record<string, string> = {
        PENDING: "PENDING",
        SHORTLISTED: "SHORTLISTED",
        ON_HOLD: "ON_HOLD",
        REJECTED: "REJECTED",
        WINNER: "WINNER",
      };

      const request: {
        contact_ids: string[];
        status: string;
        send_email?: boolean;
        award_id?: string;
        custom_currency?: string;
        custom_amount?: string;
      } = {
        contact_ids: [profile.id],
        status: statusMap[pendingStatusData.status] || pendingStatusData.status,
        send_email: sendNotification,
      };

      // Add award details for winner status
      if (pendingStatusData.status === "WINNER" && pendingStatusData.selectedAwardId) {
        request.award_id = pendingStatusData.selectedAwardId;
        if (pendingStatusData.selectedAwardId === "other" && pendingStatusData.customAmount) {
          request.custom_currency = pendingStatusData.customCurrency || "USD";
          request.custom_amount = pendingStatusData.customAmount;
        }
      }

      await updateApplicantStatus(request);

      if (pendingStatusData.status === "WINNER" && pendingStatusData.awardCount) {
        toast({
          title: "Winner Confirmed!",
          description: `${profile.name} has been marked as winner with ${pendingStatusData.awardCount} award(s) totaling $${pendingStatusData.totalAmount?.toLocaleString()}.${sendNotification ? " Notification sent." : ""}`,
        });
      } else {
        toast({
          title: "Status Updated",
          description: `${profile.name}'s status has been changed to ${statusConfig[pendingStatusData.status].label}.${sendNotification ? " Notification sent." : ""}`,
        });
      }

      // Reload profile to get updated status
      await loadProfile();
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setShowNotificationModal(false);
      setPendingStatusData(null);
      setSelectedAwards([]);
      setCustomAwards([]);
    }
  };

  const navigateToPrev = () => {
    if (profile?.navigation.previous) {
      navigate(`/scholarships/applications/${profile.navigation.previous.contactId}`);
    }
  };

  const navigateToNext = () => {
    if (profile?.navigation.next) {
      navigate(`/scholarships/applications/${profile.navigation.next.contactId}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Failed to Load Profile</h2>
          <p className="text-muted-foreground text-center max-w-md">
            {error || "Profile not found"}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/scholarships/applications">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applicants
              </Link>
            </Button>
            <Button onClick={loadProfile}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const uiStatus = mapApiStatusToUI(profile.status);

  const supportingDocs = parseSupportingDocuments(profile.supportingDocuments);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Scholarship Info */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Scholarship Application</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-muted-foreground">
                    Round {profile.currentRound}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Applicant {profile.navigation.currentPosition} of {profile.navigation.totalApplicants}
                  </span>
                </div>
              </div>
            </div>
            {profile.programsOfInterest.length > 0 && (
              <div className="flex gap-2">
                {profile.programsOfInterest.map((program, idx) => (
                  <Badge key={idx} variant="secondary">{program}</Badge>
                ))}
              </div>
            )}
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
            {(["SHORTLISTED", "ON_HOLD", "REJECTED", "WINNER"] as UIWorkflowStatus[]).map((status) => {
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
                <h1 className="text-2xl font-display font-bold">{profile.name}</h1>
                <div className="flex gap-2">
                  {profile.isSeedRecommended && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 whitespace-nowrap">
                      <Star className="h-3 w-3 mr-1" />
                      SEED Recommended
                    </Badge>
                  )}
                  {uiStatus !== "PENDING" && (
                    <Badge variant="outline" className={statusConfig[uiStatus].color}>
                      {statusConfig[uiStatus].label}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={navigateToPrev}
                  disabled={!profile.navigation.previous}
                  title={profile.navigation.previous ? `Previous: ${profile.navigation.previous.name}` : "No previous applicant"}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={navigateToNext}
                  disabled={!profile.navigation.next}
                  title={profile.navigation.next ? `Next: ${profile.navigation.next.name}` : "No next applicant"}
                >
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
                    <p className="text-sm">{profile.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{profile.phone || "Not provided"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="text-sm mt-1">{profile.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Country of Residence</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{profile.countryOfResidence}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nationality</p>
                  <p className="text-sm mt-1">{profile.nationality}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Interest */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Programs of Interest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.programsOfInterest.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.programsOfInterest.map((program, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-3">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {program}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No programs specified</p>
              )}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Current Round</p>
                <p className="text-lg font-semibold mt-1">Round {profile.currentRound}</p>
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
            <div className="space-y-6">
              {/* Undergraduate */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Undergraduate
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Institution</p>
                    <p className="text-sm font-medium mt-1">{profile.education.undergraduate.institution}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completion Year</p>
                    <p className="text-sm mt-1">{profile.education.undergraduate.completionYear}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Study Area</p>
                    <p className="text-sm mt-1">{profile.education.undergraduate.studyArea}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">GPA</p>
                    <p className="text-sm font-medium mt-1">{profile.education.undergraduate.gpaDisplay}</p>
                  </div>
                </div>
                {profile.education.undergraduate.transcriptsUrl && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.education.undergraduate.transcriptsUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download Transcripts
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Postgraduate if exists */}
              {profile.education.hasPostgraduate && profile.education.postgraduate && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Postgraduate
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Institution</p>
                        <p className="text-sm font-medium mt-1">{profile.education.postgraduate.institution}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Completion Year</p>
                        <p className="text-sm mt-1">{profile.education.postgraduate.completionYear}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Study Area</p>
                        <p className="text-sm mt-1">{profile.education.postgraduate.studyArea}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">GPA</p>
                        <p className="text-sm font-medium mt-1">{profile.education.postgraduate.gpaDisplay}</p>
                      </div>
                    </div>
                    {profile.education.postgraduate.transcriptsUrl && (
                      <div className="mt-3">
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.education.postgraduate.transcriptsUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download PG Transcripts
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Test Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Standardized Test</p>
                  <p className="text-sm font-medium mt-1">
                    {profile.testScores.standardizedTest && profile.testScores.standardizedTest !== "None" 
                      ? profile.testScores.standardizedTest 
                      : "None"}
                  </p>
                </div>
                {profile.testScores.standardizedTest && profile.testScores.standardizedTest !== "None" && (
                  <div>
                    <p className="text-xs text-muted-foreground">Test Score</p>
                    <p className="text-sm mt-1">{profile.testScores.standardizedTestScore}</p>
                  </div>
                )}
                {profile.testScores.englishProficiencyTest && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">English Proficiency</p>
                      <p className="text-sm font-medium mt-1">{profile.testScores.englishProficiencyTest}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">English Score</p>
                      <p className="text-sm mt-1">{profile.testScores.englishProficiencyScore}</p>
                    </div>
                  </>
                )}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Years of Experience</p>
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{profile.workExperience.years} years</p>
                </div>
              </div>
              {profile.workExperience.industry && (
                <div>
                  <p className="text-xs text-muted-foreground">Industry</p>
                  <p className="text-sm mt-1">{profile.workExperience.industry}</p>
                </div>
              )}
              {profile.workExperience.currentRole && (
                <div>
                  <p className="text-xs text-muted-foreground">Current Role</p>
                  <p className="text-sm mt-1">{profile.workExperience.currentRole}</p>
                </div>
              )}
              {profile.workExperience.currentCompany && (
                <div>
                  <p className="text-xs text-muted-foreground">Current Company</p>
                  <p className="text-sm mt-1">{profile.workExperience.currentCompany}</p>
                </div>
              )}
            </div>
            
            {/* Resume */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Resume / CV</p>
              {profile.workExperience.resumeUrl ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={normalizeExternalUrl(profile.workExperience.resumeUrl)} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    View Resume
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Not provided</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Essay */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Essay</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.essaysUrl ? (
              <div className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors inline-block">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Application Essay</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Motivational letter / Essay submission
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <a href={normalizeExternalUrl(profile.essaysUrl)} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        View PDF
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No essay submitted</p>
            )}
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents & Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Undergraduate Transcripts */}
              {profile.education.undergraduate.transcriptsUrl ? (
                <div className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Undergraduate Transcripts</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {profile.education.undergraduate.institution}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <a href={normalizeExternalUrl(profile.education.undergraduate.transcriptsUrl)} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3.5 w-3.5 mr-1" />
                          View PDF
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg border bg-muted/10">
                  <p className="font-medium text-sm">Undergraduate Transcripts</p>
                  <p className="text-xs text-muted-foreground mt-1">Not provided</p>
                </div>
              )}

              {/* Postgraduate Transcripts */}
              {profile.education.hasPostgraduate && profile.education.postgraduate?.transcriptsUrl ? (
                <div className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Postgraduate Transcripts</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {profile.education.postgraduate.institution}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <a href={normalizeExternalUrl(profile.education.postgraduate.transcriptsUrl)} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3.5 w-3.5 mr-1" />
                          View PDF
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg border bg-muted/10">
                  <p className="font-medium text-sm">Postgraduate Transcripts</p>
                  <p className="text-xs text-muted-foreground mt-1">Not provided</p>
                </div>
              )}


              {/* Supporting Documents */}
              {supportingDocs.length > 0 ? (
                supportingDocs.map((doc) => (
                  <div key={doc.url} className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{doc.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {doc.description || "Additional application materials"}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            View Document
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg border bg-muted/10">
                  <p className="font-medium text-sm">Supporting Documents</p>
                  <p className="text-xs text-muted-foreground mt-1">Not provided</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* Awards Modal for Winner */}
        <Dialog open={showAwardsModal} onOpenChange={setShowAwardsModal}>
          <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-500" />
                Assign Awards to Winner
              </DialogTitle>
              <DialogDescription>
                Select the awards to grant to {profile.name} and add any custom awards.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 max-h-[60vh] pr-4">
              <div className="space-y-6 py-4">
                {/* Available Awards */}
                {profile.awards.available.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Available Awards</Label>
                    {profile.awards.available.map((award) => (
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
                          <div>
                            <span className="text-sm font-medium">{award.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({award.percentage}%)</span>
                          </div>
                        </div>
                        <span className="text-sm font-medium">${award.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Awards - Only show if no predefined award is selected */}
                <div className={`space-y-3 ${selectedAwards.length > 0 ? "opacity-50 pointer-events-none" : ""}`}>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    Custom Awards
                    {selectedAwards.length > 0 && (
                      <span className="text-xs text-muted-foreground font-normal">(Disabled when predefined award is selected)</span>
                    )}
                  </Label>
                  
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
                        disabled={selectedAwards.length > 0}
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
                      disabled={selectedAwards.length > 0}
                    />
                    <Input
                      placeholder="Amount"
                      type="number"
                      value={newAwardAmount}
                      onChange={(e) => setNewAwardAmount(e.target.value)}
                      disabled={selectedAwards.length > 0}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={addCustomAward}
                      disabled={selectedAwards.length > 0 || !newAwardName.trim() || !newAwardAmount.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>

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
        <Dialog open={showNotificationModal} onOpenChange={(open) => !isUpdatingStatus && setShowNotificationModal(open)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Send Notification?
              </DialogTitle>
              <DialogDescription>
                {pendingStatusData?.status === "WINNER" 
                  ? `Would you like to send a notification to ${profile.name} about their scholarship award?`
                  : `Would you like to notify ${profile.name} about their status update to "${pendingStatusData ? statusConfig[pendingStatusData.status].label : ""}"?`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  An email notification will be sent to <span className="font-medium text-foreground">{profile.email}</span> 
                  {pendingStatusData?.status === "WINNER" 
                    ? " with details about their scholarship awards."
                    : ` informing them of their updated application status.`
                  }
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleNotificationChoice(false)}
                className="flex-1"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? "Updating..." : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Skip Notification
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleNotificationChoice(true)}
                className="flex-1"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? "Sending..." : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}