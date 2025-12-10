import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Calendar,
  FileText,
} from "lucide-react";

const applicants = [
  {
    id: "1",
    name: "Ananya Krishnan",
    email: "ananya.k@email.com",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    currentRole: "Senior Product Manager",
    company: "Microsoft",
    education: "B.Tech, IIT Delhi",
    gmat: 740,
    experience: "6 years",
    targetProgram: "MBA Full-Time",
    targetSchools: ["Harvard", "Stanford", "Wharton"],
    status: "in_progress",
    profileComplete: 85,
    createdAt: "Nov 15, 2024",
  },
  {
    id: "2",
    name: "Michael Chang",
    email: "m.chang@email.com",
    phone: "+1 555 234 5678",
    location: "San Francisco, USA",
    currentRole: "Investment Banking Analyst",
    company: "Goldman Sachs",
    education: "BS Finance, NYU Stern",
    gmat: 760,
    experience: "3 years",
    targetProgram: "MBA Full-Time",
    targetSchools: ["Stanford", "Harvard", "MIT Sloan"],
    status: "applied",
    profileComplete: 100,
    createdAt: "Oct 28, 2024",
  },
  {
    id: "3",
    name: "Sofia Rodriguez",
    email: "sofia.r@email.com",
    phone: "+44 7700 900123",
    location: "London, UK",
    currentRole: "Management Consultant",
    company: "McKinsey & Company",
    education: "BA Economics, LSE",
    gmat: 720,
    experience: "5 years",
    targetProgram: "Executive MBA",
    targetSchools: ["INSEAD", "LBS", "Columbia"],
    status: "in_progress",
    profileComplete: 72,
    createdAt: "Dec 1, 2024",
  },
  {
    id: "4",
    name: "Ahmed Ibrahim",
    email: "ahmed.i@email.com",
    phone: "+971 50 123 4567",
    location: "Dubai, UAE",
    currentRole: "Regional Director",
    company: "Procter & Gamble",
    education: "MBA, AUB",
    gmat: 680,
    experience: "12 years",
    targetProgram: "Executive MBA",
    targetSchools: ["INSEAD", "Wharton", "Chicago Booth"],
    status: "submitted",
    profileComplete: 95,
    createdAt: "Nov 20, 2024",
  },
  {
    id: "5",
    name: "Yuki Tanaka",
    email: "yuki.t@email.com",
    phone: "+81 90 1234 5678",
    location: "Tokyo, Japan",
    currentRole: "Software Engineer",
    company: "Google",
    education: "MS Computer Science, Tokyo University",
    gmat: 710,
    experience: "4 years",
    targetProgram: "MS Management",
    targetSchools: ["MIT Sloan", "Stanford", "Berkeley Haas"],
    status: "new",
    profileComplete: 45,
    createdAt: "Dec 5, 2024",
  },
];

const statusConfig = {
  new: { label: "New", className: "bg-info/10 text-info border-info/20" },
  in_progress: { label: "In Progress", className: "bg-warning/10 text-warning border-warning/20" },
  submitted: { label: "Submitted", className: "bg-accent/10 text-accent border-accent/20" },
  applied: { label: "Applied", className: "bg-success/10 text-success border-success/20" },
};

export default function ApplicantProfiles() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Scholarship Applicant Profiles</h1>
          <p className="text-muted-foreground">
            View detailed profiles and application progress of scholarship applicants.
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Profiles
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profiles</p>
                <p className="text-2xl font-bold font-display">892</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Complete Profiles</p>
                <p className="text-2xl font-bold font-display text-success">567</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. GMAT</p>
                <p className="text-2xl font-bold font-display text-accent">718</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Experience</p>
                <p className="text-2xl font-bold font-display">5.2 yrs</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Applicant Profiles</CardTitle>
              <CardDescription>Detailed view of scholarship applicant backgrounds</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search applicants..." className="pl-9 w-64" variant="ghost" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Profiles</TabsTrigger>
              <TabsTrigger value="complete">Complete</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="space-y-4">
                {applicants.map((applicant, index) => {
                  const status = statusConfig[applicant.status as keyof typeof statusConfig];
                  return (
                    <Card
                      key={applicant.id}
                      variant="interactive"
                      className="animate-fade-in-up opacity-0"
                      style={{ animationDelay: `${400 + index * 50}ms`, animationFillMode: 'forwards' }}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          {/* Avatar & Basic Info */}
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="h-14 w-14">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {applicant.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{applicant.name}</h3>
                                <Badge variant="outline" className={status.className}>
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {applicant.currentRole} at {applicant.company}
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {applicant.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {applicant.experience}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3" />
                                  {applicant.education}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-6 lg:w-auto">
                            <div className="text-center">
                              <p className="text-2xl font-bold font-display text-primary">{applicant.gmat}</p>
                              <p className="text-xs text-muted-foreground">GMAT</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold font-display">{applicant.targetSchools.length}</p>
                              <p className="text-xs text-muted-foreground">Target Schools</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold font-display text-success">{applicant.profileComplete}%</p>
                              <p className="text-xs text-muted-foreground">Complete</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Profile
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Target Schools & Progress */}
                        <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Target:</span>
                            <div className="flex gap-1.5">
                              {applicant.targetSchools.map((school) => (
                                <Badge key={school} variant="secondary" className="text-xs">
                                  {school}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">Profile completion:</span>
                            <div className="w-32">
                              <Progress value={applicant.profileComplete} className="h-1.5" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="complete">
              <p className="text-muted-foreground text-center py-8">Showing complete profiles only</p>
            </TabsContent>
            <TabsContent value="in_progress">
              <p className="text-muted-foreground text-center py-8">Showing profiles in progress</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
