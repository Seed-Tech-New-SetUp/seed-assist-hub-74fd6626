import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, RefreshCw, Eye, UserPlus, Key, Users, Zap, PlayCircle,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Lock,
  RefreshCcw,
} from "lucide-react";
import {
  fetchLicenses, fetchStats, fetchAllocations,
  type VisaLicense, type Allocation,
} from "@/lib/api/visa-tutor";
import { LicenseDetailModal } from "@/components/visa/LicenseDetailModal";
import { AssignLicenseModal } from "@/components/visa/AssignLicenseModal";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

type CardFilter = "available" | "allocated" | "activated" | "used" | null;
type SortKey = "allotted" | "activated" | "platform" | "usage" | "avg_score" | "best_score" | "visa_status" | "visa_date" | "visa_interview_status";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

// Enriched row type for the table
interface EnrichedLicense extends VisaLicense {
  allocName: string | null;
  allocEmail: string | null;
  isAllocated: boolean;
  isActivated: boolean;
  isUsed: boolean;
  displayAvgScore: number | null;
  displayBestScore: number | null;
  sortTier: number; // 0=used, 1=activated, 2=assigned, 3=remaining
}

function formatVisaDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd MMMM, yyyy");
  } catch {
    return dateStr;
  }
}

function capitalize(s: string | null | undefined): string {
  if (!s) return "—";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function VisaPrep() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<CardFilter>(null);
  const [page, setPage] = useState(1);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignPrefill, setAssignPrefill] = useState<string | undefined>();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["visa-stats"],
    queryFn: fetchStats,
  });

  const { data: licensesData, isLoading: licensesLoading, refetch: refetchLicenses, isFetching } = useQuery({
    queryKey: ["visa-licenses-all", search],
    queryFn: () => fetchLicenses({ search: search || undefined, page: 1, limit: 500 }),
  });

  const { data: allocData, refetch: refetchAlloc } = useQuery({
    queryKey: ["visa-allocations-all"],
    queryFn: () => fetchAllocations({ limit: 500 }),
  });

  const refetch = () => { refetchLicenses(); refetchAlloc(); refetchStats(); };

  const stats = statsData?.data;
  const allLicenses = licensesData?.data?.licenses || [];

  // Build allocation lookup
  const allocMap = useMemo(() => {
    const map = new Map<string, Allocation>();
    (allocData?.data?.allocations || []).forEach((a) => map.set(a.license_no, a));
    return map;
  }, [allocData]);

  // Build top performers lookup from stats
  const performerMap = useMemo(() => {
    const map = new Map<string, { best_score: number; attempts: number }>();
    (stats?.top_performers || []).forEach((p) => map.set(p.license_number, { best_score: p.best_score, attempts: p.attempts }));
    return map;
  }, [stats]);

  const allocatedSet = useMemo(() => new Set(allocMap.keys()), [allocMap]);

  // Enrich licenses
  const enrichedLicenses = useMemo<EnrichedLicense[]>(() => {
    return allLicenses.map((lic) => {
      const alloc = allocMap.get(lic.license_number);
      const perf = performerMap.get(lic.license_number);
      const isAllocated = allocatedSet.has(lic.license_number);
      const isActivated = lic.activation_status === "started";
      const isUsed = lic.usage_status === "started";

      const allocName = alloc
        ? [alloc.student?.first_name, alloc.student?.last_name].filter(Boolean).join(" ")
        : [lic.first_name, lic.last_name].filter(Boolean).join(" ")
          || lic.student_name
          || null;

      const allocEmail = alloc?.student?.email || lic.email || null;

      let sortTier = 3;
      if (isUsed) sortTier = 0;
      else if (isActivated) sortTier = 1;
      else if (isAllocated) sortTier = 2;

      return {
        ...lic,
        allocName,
        allocEmail,
        isAllocated,
        isActivated,
        isUsed,
        displayAvgScore: lic.avg_overall_score ?? null,
        displayBestScore: lic.best_overall_score ?? perf?.best_score ?? null,
        sortTier,
      };
    });
  }, [allLicenses, allocMap, performerMap, allocatedSet]);

  // Filter
  const filteredLicenses = useMemo(() => {
    return enrichedLicenses.filter((lic) => {
      if (!activeFilter) return true;
      switch (activeFilter) {
        case "available": return !lic.isAllocated;
        case "allocated": return lic.isAllocated;
        case "activated": return lic.isActivated;
        case "used": return lic.isUsed;
        default: return true;
      }
    });
  }, [enrichedLicenses, activeFilter]);

  // Sort
  const sortedLicenses = useMemo(() => {
    const list = [...filteredLicenses];

    if (!sortKey) {
      // Default sort: used (by avg score desc) > activated > assigned > remaining
      list.sort((a, b) => {
        if (a.sortTier !== b.sortTier) return a.sortTier - b.sortTier;
        if (a.sortTier === 0) {
          return (b.displayAvgScore ?? 0) - (a.displayAvgScore ?? 0);
        }
        return 0;
      });
      return list;
    }

    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      let va: string | number | null = null;
      let vb: string | number | null = null;

      switch (sortKey) {
        case "allotted": va = a.allocName; vb = b.allocName; break;
        case "activated": va = a.isActivated ? 1 : 0; vb = b.isActivated ? 1 : 0; break;
        case "platform": va = a.isUsed ? 1 : 0; vb = b.isUsed ? 1 : 0; break;
        case "usage": va = a.test_attempted ?? 0; vb = b.test_attempted ?? 0; break;
        case "avg_score": va = a.displayAvgScore; vb = b.displayAvgScore; break;
        case "best_score": va = a.displayBestScore; vb = b.displayBestScore; break;
        case "visa_status": va = a.visa_status; vb = b.visa_status; break;
        case "visa_date": va = a.visa_interview_date || a.visa_slot_date; vb = b.visa_interview_date || b.visa_slot_date; break;
        case "visa_interview_status": va = a.visa_interview_status; vb = b.visa_interview_status; break;
      }

      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "string" && typeof vb === "string") return va.localeCompare(vb) * dir;
      return ((va as number) - (vb as number)) * dir;
    });

    return list;
  }, [filteredLicenses, sortKey, sortDir]);

  // Pagination
  const totalFiltered = sortedLicenses.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const paginatedLicenses = sortedLicenses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCardClick = (filter: CardFilter) => {
    setActiveFilter((prev) => (prev === filter ? null : filter));
    setPage(1);
  };

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === "desc") setSortDir("asc");
      else { setSortKey(null); setSortDir("desc"); }
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }, [sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const statCards: Array<{ key: CardFilter; label: string; value: number; icon: React.ReactNode; color: string }> = [
    { key: "available", label: "No. of Licences Available", value: stats?.licenses.unassigned ?? 0, icon: <Key className="h-5 w-5" />, color: "text-primary bg-primary/10" },
    { key: "allocated", label: "No. of Licences Allocated", value: stats?.licenses.assigned ?? 0, icon: <Users className="h-5 w-5" />, color: "text-blue-500 bg-blue-500/10" },
    { key: "activated", label: "No. of Licences Activated", value: stats?.licenses.activated ?? 0, icon: <Zap className="h-5 w-5" />, color: "text-orange-500 bg-orange-500/10" },
    { key: "used", label: "No. of Licences Used", value: stats?.licenses.in_use ?? 0, icon: <PlayCircle className="h-5 w-5" />, color: "text-green-600 bg-green-600/10" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">AI Visa Tutor</h1>
          <p className="text-muted-foreground mt-1">Manage license allocations and track student performance</p>
        </div>

        {/* Stat Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <Card
                key={card.key}
                className={cn("cursor-pointer transition-all hover:shadow-md", activeFilter === card.key && "ring-2 ring-primary shadow-md")}
                onClick={() => handleCardClick(card.key)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", card.color)}>{card.icon}</div>
                    <div>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Filter indicator */}
        {activeFilter && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              Showing: {statCards.find((c) => c.key === activeFilter)?.label}
            </Badge>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setActiveFilter(null); setPage(1); }}>
              Clear filter
            </Button>
          </div>
        )}

        {/* Table */}
        <Card>
          <div className="p-4 pb-0 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Licenses ({totalFiltered})</p>
            <div className="flex items-center gap-3">
              <div className="relative w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, license..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon" onClick={refetch} disabled={isFetching}>
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          <CardContent className="pt-4">
            {licensesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : paginatedLicenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Key className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No licenses found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table className="w-max min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background z-20 min-w-[170px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                          License No.
                        </TableHead>
                        <TableHead className="min-w-[200px]">
                          <button className="flex items-center" onClick={() => handleSort("allotted")}>
                            Allotted To <SortIcon col="allotted" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => handleSort("activated")}>
                            Activated <SortIcon col="activated" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => handleSort("platform")}>
                            Platform Used <SortIcon col="platform" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => handleSort("usage")}>
                            Usage <SortIcon col="usage" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => handleSort("avg_score")}>
                            Avg Score <SortIcon col="avg_score" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => handleSort("best_score")}>
                            Best Score <SortIcon col="best_score" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => handleSort("visa_status")}>
                            Visa Status <SortIcon col="visa_status" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => handleSort("visa_date")}>
                            Visa Interview Date <SortIcon col="visa_date" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button className="flex items-center" onClick={() => handleSort("visa_interview_status")}>
                            Interview Status <SortIcon col="visa_interview_status" />
                          </button>
                        </TableHead>
                        <TableHead className="text-center sticky right-0 bg-background z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] min-w-[120px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLicenses.map((lic) => (
                        <TableRow key={lic.license_number}>
                          {/* License Number - sticky */}
                          <TableCell className="sticky left-0 bg-background z-20 min-w-[170px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                            <span className="font-mono text-xs">{lic.license_number}</span>
                          </TableCell>
                          {/* Allotted To */}
                          <TableCell className="min-w-[200px]">
                            {lic.allocName ? (
                              <div>
                                <p className="font-medium text-sm">{lic.allocName}</p>
                                {lic.allocEmail && (
                                  <p className="text-xs text-muted-foreground">{lic.allocEmail}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          {/* Activated */}
                          <TableCell>
                            <Badge variant={lic.isActivated ? "default" : "outline"} className={lic.isActivated ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}>
                              {lic.isActivated ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          {/* Platform Used */}
                          <TableCell>
                            <Badge variant={lic.isUsed ? "default" : "outline"} className={lic.isUsed ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : ""}>
                              {lic.isUsed ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          {/* Usage (attempts) */}
                          <TableCell className="font-medium">
                            {lic.test_attempted ?? 0}
                          </TableCell>
                          {/* Avg Score */}
                          <TableCell>
                            {lic.displayAvgScore != null ? (
                              <span className={cn("font-medium", lic.displayAvgScore >= 80 ? "text-green-600" : lic.displayAvgScore >= 60 ? "text-yellow-600" : "text-red-600")}>
                                {lic.displayAvgScore.toFixed(1)}
                              </span>
                            ) : "—"}
                          </TableCell>
                          {/* Best Score */}
                          <TableCell>
                            {lic.displayBestScore != null ? (
                              <span className={cn("font-medium", lic.displayBestScore >= 80 ? "text-green-600" : lic.displayBestScore >= 60 ? "text-yellow-600" : "text-red-600")}>
                                {lic.displayBestScore}
                              </span>
                            ) : "—"}
                          </TableCell>
                          {/* Visa Status */}
                          <TableCell className="whitespace-nowrap">
                            {lic.visa_status ? capitalize(lic.visa_status) : "—"}
                          </TableCell>
                          {/* Visa Interview Date */}
                          <TableCell className="whitespace-nowrap">
                            {formatVisaDate(lic.visa_interview_date || lic.visa_slot_date)}
                          </TableCell>
                          {/* Visa Interview Status */}
                          <TableCell className="whitespace-nowrap">
                            {lic.visa_interview_status ? (
                              <Badge variant="outline">{capitalize(lic.visa_interview_status)}</Badge>
                            ) : "—"}
                          </TableCell>
                          {/* Actions */}
                          <TableCell className="text-center sticky right-0 bg-background z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] min-w-[120px]">
                            <div className="flex items-center gap-1 justify-center">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedLicense(lic.license_number)} title="View details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {lic.isActivated ? (
                                <Button variant="outline" size="sm" className="h-7 text-xs opacity-50 cursor-not-allowed" disabled title="License already activated — cannot reassign">
                                  <Lock className="h-3 w-3 mr-1" /> Locked
                                </Button>
                              ) : lic.isAllocated ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-orange-500/50 text-orange-600 hover:bg-orange-500/10 dark:text-orange-400"
                                  onClick={() => { setAssignPrefill(lic.license_number); setShowAssignModal(true); }}
                                  title="Reassign license (currently allocated but not activated)"
                                >
                                  <RefreshCcw className="h-3 w-3 mr-1" /> Reassign
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => { setAssignPrefill(lic.license_number); setShowAssignModal(true); }}
                                  title="Assign license"
                                >
                                  <UserPlus className="h-3 w-3 mr-1" /> Assign
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({totalFiltered} total)</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <LicenseDetailModal
        licenseNumber={selectedLicense}
        open={!!selectedLicense}
        onClose={() => setSelectedLicense(null)}
        onUpdate={refetch}
      />

      <AssignLicenseModal
        open={showAssignModal}
        onClose={() => { setShowAssignModal(false); setAssignPrefill(undefined); }}
        onSuccess={() => { setShowAssignModal(false); setAssignPrefill(undefined); refetch(); }}
        prefillLicenseNo={assignPrefill}
      />
    </DashboardLayout>
  );
}
