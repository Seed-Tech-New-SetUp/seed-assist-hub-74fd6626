import { useState, useMemo, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Star, Check, Pause, X, Trophy, Search, Eye, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ApplicationFilters, FilterState } from "@/components/scholarships/ApplicationFilters";
import { 
  fetchApplicants, 
  updateApplicantStatus,
  Applicant, 
  WorkflowStatus, 
  ApiMeta, 
  ApiFilterOptions 
} from "@/lib/api/scholarship";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const statusConfig: Record<WorkflowStatus, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pending", icon: Pause, color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
  shortlisted: { label: "Shortlisted", icon: Check, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  onhold: { label: "On Hold", icon: Pause, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  rejected: { label: "Rejected", icon: X, color: "bg-red-500/10 text-red-600 border-red-500/20" },
  winner: { label: "Winner", icon: Trophy, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  recommended: { label: "SEED Recommended", icon: Star, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
};

export default function ScholarshipApplications() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [filterOptions, setFilterOptions] = useState<ApiFilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<WorkflowStatus | null>(null);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
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

  // Fetch applicants from API
  const loadApplicants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchApplicants();
      setApplicants(data.applicants);
      setMeta(data.meta);
      setFilterOptions(data.filterOptions);
    } catch (err) {
      console.error("Failed to load applicants:", err);
      setError(err instanceof Error ? err.message : "Failed to load applicants");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, []);

  // Use API filter options if available
  const availableTests = useMemo(() => 
    filterOptions?.test_types || [...new Set(applicants.map(a => a.standardizedTest.name))], 
    [filterOptions, applicants]
  );
  const availableYears = useMemo(() => 
    filterOptions?.completion_years || [...new Set(applicants.map(a => a.ugCompletionYear))].sort((a, b) => b - a), 
    [filterOptions, applicants]
  );
  const availableNationalities = useMemo(() => 
    filterOptions?.nationalities || [...new Set(applicants.map(a => a.nationality))].sort(), 
    [filterOptions, applicants]
  );
  const availableGenders = useMemo(() => 
    filterOptions?.genders || [...new Set(applicants.map(a => a.gender))].sort(), 
    [filterOptions, applicants]
  );

  // Calculate status counts directly from applicants array for accuracy
  const statusCounts = useMemo(() => {
    return applicants.reduce((acc, applicant) => {
      acc[applicant.status] = (acc[applicant.status] || 0) + 1;
      return acc;
    }, {} as Record<WorkflowStatus, number>);
  }, [applicants]);
  
  // SEED Recommended count should be based on the isSeedRecommended flag, not status
  const seedRecommendedCount = useMemo(() => 
    applicants.filter(a => a.isSeedRecommended).length, 
    [applicants]
  );

  const filteredApplicants = useMemo(() => applicants.filter(applicant => {
    // Search filter
    const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === "SEED_RECOMMENDED") {
      matchesStatus = applicant.isSeedRecommended;
    } else if (statusFilter !== "all") {
      matchesStatus = applicant.status === statusFilter.toLowerCase();
    }

    // Advanced filters
    const matchesTest = filters.standardizedTests.length === 0 || 
      filters.standardizedTests.includes(applicant.standardizedTest.name);
    
    const matchesTestScore = applicant.standardizedTest.score >= filters.testScoreRange[0] &&
      applicant.standardizedTest.score <= filters.testScoreRange[1];
    
    const matchesYear = filters.ugCompletionYears.length === 0 ||
      filters.ugCompletionYears.includes(applicant.ugCompletionYear);
    
    const matchesWorkExp = applicant.workExperience >= filters.workExpRange[0] &&
      applicant.workExperience <= filters.workExpRange[1];
    
    const matchesNationality = filters.nationalities.length === 0 ||
      filters.nationalities.includes(applicant.nationality);
    
    const matchesGender = filters.genders.length === 0 ||
      filters.genders.includes(applicant.gender);

    return matchesSearch && matchesStatus && matchesTest && matchesTestScore && 
      matchesYear && matchesWorkExp && matchesNationality && matchesGender;
  }), [applicants, searchQuery, statusFilter, filters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, filters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredApplicants.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredApplicants.length);
  const paginatedApplicants = filteredApplicants.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const toggleSelectAll = () => {
    if (selectedApplicants.length === paginatedApplicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(paginatedApplicants.map(a => a.id));
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

  const handleNotifyDecision = async (notify: boolean) => {
    if (!newStatus) return;
    
    setIsUpdatingStatus(true);
    
    try {
      // Map internal status to API status format
      const statusMap: Record<string, string> = {
        pending: "PENDING",
        shortlisted: "SHORTLISTED",
        onhold: "ON_HOLD",
        rejected: "REJECTED",
        winner: "WINNER",
      };
      
      await updateApplicantStatus({
        contact_ids: selectedApplicants,
        status: statusMap[newStatus] || newStatus.toUpperCase(),
        send_email: notify,
      });

      // Update the applicants state with new status
      setApplicants(prev => prev.map(applicant => 
        selectedApplicants.includes(applicant.id) 
          ? { ...applicant, status: newStatus }
          : applicant
      ));

      toast({
        title: "Status Updated",
        description: `${selectedApplicants.length} applicant(s) updated to ${statusConfig[newStatus]?.label || newStatus}${notify ? ". Notifications sent." : "."}`,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setShowNotifyDialog(false);
      setSelectedApplicants([]);
      setNewStatus(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Scholarship Applications</h1>
            <p className="text-muted-foreground mt-1">Review and manage scholarship applications</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-full max-w-md mb-4" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Scholarship Applications</h1>
            <p className="text-muted-foreground mt-1">Review and manage scholarship applications</p>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load applicants</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadApplicants}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Scholarship Applications</h1>
            <p className="text-muted-foreground mt-1">
              Review and manage scholarship applications
              {meta && ` • ${meta.total_applicants} total applicants`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadApplicants}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
          {(["pending", "shortlisted", "onhold", "rejected", "winner"] as WorkflowStatus[]).map((status) => {
            const config = statusConfig[status];
            return (
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
            );
          })}
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or country..."
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

        {/* Bulk Actions - Sticky */}
        {selectedApplicants.length > 0 && (
          <div className="sticky top-16 z-40">
            <Card className="bg-background border-primary/20 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{selectedApplicants.length} applicant(s) selected</span>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => handleBulkStatusChange(value as WorkflowStatus)}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Assign Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {(["pending", "shortlisted", "onhold", "rejected"] as WorkflowStatus[]).map((status) => (
                          <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applicants Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Applicants
                {filteredApplicants.length !== applicants.length && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (filtered: {filteredApplicants.length} of {applicants.length})
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select value={pageSize.toString()} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
            </div>
            {filteredApplicants.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Showing {startIndex + 1}-{endIndex} of {filteredApplicants.length} applicants
              </p>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedApplicants.length === paginatedApplicants.length && paginatedApplicants.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name (Country)</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead>Standardized Test</TableHead>
                  <TableHead>UG Completion</TableHead>
                  <TableHead>UG GPA</TableHead>
                  <TableHead>Work Exp.</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApplicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No applicants found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedApplicants.map((applicant) => {
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
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 whitespace-nowrap">
                                <Star className="h-3 w-3 mr-1" />
                                SEED Recommended
                              </Badge>
                            )}
                            {applicant.selectionStatus && (
                              <Badge variant="outline" className={statusConfig[applicant.selectionStatus]?.color || status.color}>
                                {(() => {
                                  const selConfig = statusConfig[applicant.selectionStatus];
                                  const Icon = selConfig?.icon || status.icon;
                                  return <Icon className="h-3 w-3 mr-1" />;
                                })()}
                                {statusConfig[applicant.selectionStatus]?.label || applicant.selectionStatus}
                              </Badge>
                            )}
                            {!applicant.isSeedRecommended && !applicant.selectionStatus && (
                              <Badge variant="outline" className={status.color}>
                                <status.icon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{applicant.standardizedTest.name}</p>
                            {applicant.standardizedTest.score > 0 && (
                              <p className="text-xs text-muted-foreground">{applicant.standardizedTest.score}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{applicant.ugCompletionYear}</TableCell>
                        <TableCell>{applicant.ugGpaDisplay}</TableCell>
                        <TableCell>{applicant.workExperience} years</TableCell>
                        <TableCell>
                          <Badge variant="secondary">R{applicant.round}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                            <Link to={`/scholarships/applications/${applicant.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {getPageNumbers().map((page, i) =>
                      page === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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
        <Dialog open={showNotifyDialog} onOpenChange={(open) => !isUpdatingStatus && setShowNotifyDialog(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Notification?</DialogTitle>
              <DialogDescription>
                Would you like to notify the applicants about this status change via email?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleNotifyDecision(false)} disabled={isUpdatingStatus}>
                {isUpdatingStatus ? "Updating..." : "No"}
              </Button>
              <Button onClick={() => handleNotifyDecision(true)} disabled={isUpdatingStatus}>
                {isUpdatingStatus ? "Sending..." : "Yes, Send Email"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode === "UN") return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
