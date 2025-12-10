import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
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
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type ApplicationStatus = "SEED_RECOMMENDED" | "SHORTLISTED" | "ON_HOLD" | "REJECTED" | "WINNER";

// Mock data for a single student
const studentData = {
  id: "1",
  name: "Priya Sharma",
  country: "India",
  countryCode: "IN",
  status: "SEED_RECOMMENDED" as ApplicationStatus,
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

const statusConfig: Record<ApplicationStatus, { label: string; icon: React.ElementType; color: string; buttonColor: string }> = {
  SEED_RECOMMENDED: { label: "SEED Recommended", icon: Star, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", buttonColor: "bg-yellow-500 hover:bg-yellow-600" },
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

  const handleStatusChange = (status: ApplicationStatus) => {
    toast({
      title: "Status Updated",
      description: `${student.name}'s status has been changed to ${statusConfig[status].label}.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/scholarships/applications">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Applicants
            </Link>
          </Button>
          <div className="flex gap-2">
            {(["SHORTLISTED", "ON_HOLD", "REJECTED", "WINNER"] as ApplicationStatus[]).map((status) => {
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
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{student.scholarshipName}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-display font-bold">{student.name}</h1>
                  <Badge variant="outline" className={statusConfig[student.status].color}>
                    {statusConfig[student.status].label}
                  </Badge>
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
      </div>
    </DashboardLayout>
  );
}
