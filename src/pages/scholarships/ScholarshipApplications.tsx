import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Check, Pause, X, Trophy, Search, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ApplicationFilters, FilterState } from "@/components/scholarships/ApplicationFilters";

type WorkflowStatus = "SHORTLISTED" | "ON_HOLD" | "REJECTED" | "WINNER" | "PENDING";

interface Applicant {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  nationality: string;
  gender: string;
  isSeedRecommended: boolean;
  status: WorkflowStatus;
  standardizedTest: {
    name: string;
    score: number;
  };
  ugCompletionYear: number;
  ugGpa: number;
  workExperience: number;
}

// Initial mock data
const initialApplicants: Applicant[] = [
  {
    id: "1",
    name: "Priya Sharma",
    country: "India",
    countryCode: "IN",
    nationality: "Indian",
    gender: "Female",
    isSeedRecommended: true,
    status: "PENDING",
    standardizedTest: { name: "GMAT", score: 720 },
    ugCompletionYear: 2019,
    ugGpa: 3.8,
    workExperience: 5,
  },
  {
    id: "2",
    name: "Chen Wei",
    country: "China",
    countryCode: "CN",
    nationality: "Chinese",
    gender: "Male",
    isSeedRecommended: true,
    status: "SHORTLISTED",
    standardizedTest: { name: "GRE", score: 328 },
    ugCompletionYear: 2020,
    ugGpa: 3.6,
    workExperience: 4,
  },
  {
    id: "3",
    name: "Ahmed Hassan",
    country: "Egypt",
    countryCode: "EG",
    nationality: "Egyptian",
    gender: "Male",
    isSeedRecommended: false,
    status: "ON_HOLD",
    standardizedTest: { name: "GMAT", score: 680 },
    ugCompletionYear: 2018,
    ugGpa: 3.5,
    workExperience: 6,
  },
  {
    id: "4",
    name: "Maria Garcia",
    country: "Mexico",
    countryCode: "MX",
    nationality: "Mexican",
    gender: "Female",
    isSeedRecommended: true,
    status: "WINNER",
    standardizedTest: { name: "GRE", score: 335 },
    ugCompletionYear: 2019,
    ugGpa: 3.9,
    workExperience: 5,
  },
  {
    id: "5",
    name: "John Obi",
    country: "Nigeria",
    countryCode: "NG",
    nationality: "Nigerian",
    gender: "Male",
    isSeedRecommended: false,
    status: "REJECTED",
    standardizedTest: { name: "GMAT", score: 650 },
    ugCompletionYear: 2021,
    ugGpa: 3.2,
    workExperience: 3,
  },
  {
    id: "6",
    name: "Sara Kim",
    country: "South Korea",
    countryCode: "KR",
    nationality: "South Korean",
    gender: "Female",
    isSeedRecommended: true,
    status: "PENDING",
    standardizedTest: { name: "TOEFL", score: 115 },
    ugCompletionYear: 2020,
    ugGpa: 3.7,
    workExperience: 3,
  },
  {
    id: "7",
    name: "Luis Fernandez",
    country: "Brazil",
    countryCode: "BR",
    nationality: "Brazilian",
    gender: "Male",
    isSeedRecommended: false,
    status: "SHORTLISTED",
    standardizedTest: { name: "IELTS", score: 8 },
    ugCompletionYear: 2017,
    ugGpa: 3.4,
    workExperience: 7,
  },
];

const statusConfig: Record<WorkflowStatus, { label: string; icon: React.ElementType; color: string }> = {
  PENDING: { label: "Pending", icon: Pause, color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
  SHORTLISTED: { label: "Shortlisted", icon: Check, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  ON_HOLD: { label: "On Hold", icon: Pause, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  REJECTED: { label: "Rejected", icon: X, color: "bg-red-500/10 text-red-600 border-red-500/20" },
  WINNER: { label: "Winner", icon: Trophy, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
};

export default function ScholarshipApplications() {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<WorkflowStatus | null>(null);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    standardizedTests: [],
    testScoreRange: [0, 800],
    ugCompletionYears: [],
    cgpaScale: "4",
    cgpaRange: [0, 4],
    workExpRange: [0, 20],
    nationalities: [],
    genders: [],
  });
  const { toast } = useToast();

  // Extract unique values for filters
  const availableTests = useMemo(() => [...new Set(applicants.map(a => a.standardizedTest.name))], [applicants]);
  const availableYears = useMemo(() => [...new Set(applicants.map(a => a.ugCompletionYear))].sort((a, b) => b - a), [applicants]);
  const availableNationalities = useMemo(() => [...new Set(applicants.map(a => a.nationality))].sort(), [applicants]);
  const availableGenders = useMemo(() => [...new Set(applicants.map(a => a.gender))].sort(), [applicants]);

  // Calculate status counts
  const statusCounts = useMemo(() => applicants.reduce((acc, applicant) => {
    acc[applicant.status] = (acc[applicant.status] || 0) + 1;
    return acc;
  }, {} as Record<WorkflowStatus, number>), [applicants]);
  
  const seedRecommendedCount = useMemo(() => applicants.filter(a => a.isSeedRecommended).length, [applicants]);

  const filteredApplicants = applicants.filter(applicant => {
    // Search filter
    const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === "SEED_RECOMMENDED") {
      matchesStatus = applicant.isSeedRecommended;
    } else if (statusFilter !== "all") {
      matchesStatus = applicant.status === statusFilter;
    }

    // Advanced filters
    const matchesTest = filters.standardizedTests.length === 0 || 
      filters.standardizedTests.includes(applicant.standardizedTest.name);
    
    const matchesTestScore = applicant.standardizedTest.score >= filters.testScoreRange[0] &&
      applicant.standardizedTest.score <= filters.testScoreRange[1];
    
    const matchesYear = filters.ugCompletionYears.length === 0 ||
      filters.ugCompletionYears.includes(applicant.ugCompletionYear);
    
    const matchesCgpa = applicant.ugGpa >= filters.cgpaRange[0] &&
      applicant.ugGpa <= filters.cgpaRange[1];
    
    const matchesWorkExp = applicant.workExperience >= filters.workExpRange[0] &&
      applicant.workExperience <= filters.workExpRange[1];
    
    const matchesNationality = filters.nationalities.length === 0 ||
      filters.nationalities.includes(applicant.nationality);
    
    const matchesGender = filters.genders.length === 0 ||
      filters.genders.includes(applicant.gender);

    return matchesSearch && matchesStatus && matchesTest && matchesTestScore && 
      matchesYear && matchesCgpa && matchesWorkExp && matchesNationality && matchesGender;
  });

  const toggleSelectAll = () => {
    if (selectedApplicants.length === filteredApplicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(filteredApplicants.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedApplicants(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (status: WorkflowStatus) => {
    setNewStatus(status);
    setShowStatusDialog(true);
  };

  const confirmStatusChange = () => {
    setShowStatusDialog(false);
    setShowNotifyDialog(true);
  };

  const handleNotifyDecision = (notify: boolean) => {
    // Update the applicants state with new status
    if (newStatus) {
      setApplicants(prev => prev.map(applicant => 
        selectedApplicants.includes(applicant.id) 
          ? { ...applicant, status: newStatus }
          : applicant
      ));
    }
    setShowNotifyDialog(false);
    toast({
      title: "Status Updated",
      description: `${selectedApplicants.length} applicant(s) updated to ${newStatus}${notify ? ". Notifications sent." : "."}`,
    });
    setSelectedApplicants([]);
    setNewStatus(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Scholarship Applications</h1>
          <p className="text-muted-foreground mt-1">Review and manage scholarship applications</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* SEED Recommended Card */}
          <Card
            className={`cursor-pointer transition-all ${statusFilter === "SEED_RECOMMENDED" ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
            onClick={() => setStatusFilter(statusFilter === "SEED_RECOMMENDED" ? "all" : "SEED_RECOMMENDED")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{seedRecommendedCount}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">SEED Recommended</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {(Object.entries(statusConfig) as [WorkflowStatus, typeof statusConfig[WorkflowStatus]][]).map(([status, config]) => (
            <Card
              key={status}
              className={`cursor-pointer transition-all ${statusFilter === status ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
              onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color.split(" ")[0]}`}>
                    <config.icon className={`h-4 w-4 ${config.color.split(" ")[1]}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{statusCounts[status] || 0}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <ApplicationFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableTests={availableTests}
              availableYears={availableYears}
              availableNationalities={availableNationalities}
              availableGenders={availableGenders}
            />
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedApplicants.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{selectedApplicants.length} applicant(s) selected</span>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => handleBulkStatusChange(value as WorkflowStatus)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Assign Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig)
                        .filter(([status]) => status !== "WINNER")
                        .map(([status, config]) => (
                          <SelectItem key={status} value={status}>{config.label}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applicants Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedApplicants.length === filteredApplicants.length && filteredApplicants.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name (Country)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Standardized Test</TableHead>
                  <TableHead>UG Completion</TableHead>
                  <TableHead>UG GPA</TableHead>
                  <TableHead>Work Exp.</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplicants.map((applicant) => {
                  const status = statusConfig[applicant.status];
                  return (
                    <TableRow key={applicant.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedApplicants.includes(applicant.id)}
                          onCheckedChange={() => toggleSelect(applicant.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFlagEmoji(applicant.countryCode)}</span>
                          <div>
                            <p className="font-medium">{applicant.name}</p>
                            <p className="text-xs text-muted-foreground">{applicant.country}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {applicant.isSeedRecommended && (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              <Star className="h-3 w-3 mr-1" />
                              SEED
                            </Badge>
                          )}
                          <Badge variant="outline" className={status.color}>
                            <status.icon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{applicant.standardizedTest.name}</p>
                          <p className="text-xs text-muted-foreground">{applicant.standardizedTest.score}</p>
                        </div>
                      </TableCell>
                      <TableCell>{applicant.ugCompletionYear}</TableCell>
                      <TableCell>{applicant.ugGpa.toFixed(1)}</TableCell>
                      <TableCell>{applicant.workExperience} years</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/scholarships/applications/${applicant.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Status Change Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Status Change</DialogTitle>
              <DialogDescription>
                You are about to change the status of {selectedApplicants.length} applicant(s) to{" "}
                {newStatus && statusConfig[newStatus].label}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
              <Button onClick={confirmStatusChange}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notify Dialog */}
        <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Notification?</DialogTitle>
              <DialogDescription>
                Would you like to notify the applicants about this status change via email?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleNotifyDecision(false)}>No</Button>
              <Button onClick={() => handleNotifyDecision(true)}>Yes, Send Email</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
