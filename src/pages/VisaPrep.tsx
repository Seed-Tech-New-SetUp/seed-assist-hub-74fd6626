import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, RefreshCw, Eye, UserPlus, Key, Users, Zap, PlayCircle,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Lock,
  RefreshCcw, Plus,
} from "lucide-react";
import {
  fetchLicenses, fetchStats, fetchAllocations, fetchAllocationDetail,
  type VisaLicense, type Allocation,
} from "@/lib/api/visa-tutor";
import { LicenseDetailModal } from "@/components/visa/LicenseDetailModal";
import { AssignLicenseModal } from "@/components/visa/AssignLicenseModal";
import { AssignOptionsModal } from "@/components/visa/AssignOptionsModal";
import { BulkAssignModal } from "@/components/visa/BulkAssignModal";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

type CardFilter = "available" | "allocated" | "activated" | "used" | null;
type SortKey = "allotted" | "activated" | "platform" | "usage" | "avg_score" | "best_score" | "visa_status" | "visa_date" | "visa_interview_slot" | "visa_interview_status";
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
  sortTier: number;
  // Rich visa data from allocation detail API
  richVisaStatus: string | null;
  richVisaInterviewDate: string | null;
  richVisaInterviewStatus: string | null;
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
  const [showAssignOptions, setShowAssignOptions] = useState(false);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [assignPrefill, setAssignPrefill] = useState<EnrichedLicense | undefined>();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterVisaStatus, setFilterVisaStatus] = useState<string>("all");
  const [filterInterviewStatus, setFilterInterviewStatus] = useState<string>("all");

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

  const detailFetchedRef = useRef(new Set<string>());
  const refetch = () => { refetchLicenses(); refetchAlloc(); refetchStats(); setDetailMap(new Map()); detailFetchedRef.current = new Set(); };

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

  // Fetch rich visa data from allocation detail API for all licences with students
  const [detailMap, setDetailMap] = useState<Map<string, { visa_status: string | null; visa_interview_date: string | null; visa_interview_status: string | null }>>(new Map());

  // Build set of all licences that have a student (via allocation or licence email)
  const licencesWithStudents = useMemo(() => {
    const set = new Set<string>(allocatedSet);
    allLicenses.forEach(l => { if (l.email) set.add(l.license_number); });
    return set;
  }, [allocatedSet, allLicenses]);



  useEffect(() => {
    let cancelled = false;
    const licenseNos = Array.from(licencesWithStudents);
    if (licenseNos.length === 0) return;

    const toFetch = licenseNos.filter(ln => !detailFetchedRef.current.has(ln));
    if (toFetch.length === 0) return;

    // Mark as fetched immediately to prevent re-runs
    toFetch.forEach(ln => detailFetchedRef.current.add(ln));

    const batchSize = 10;
    const batches: string[][] = [];
    for (let i = 0; i < toFetch.length; i += batchSize) {
      batches.push(toFetch.slice(i, i + batchSize));
    }

    (async () => {
      for (const batch of batches) {
        if (cancelled) return;
        const results = await Promise.all(
          batch.map(ln => fetchAllocationDetail(ln).then(res => {
            const student = res.data?.api_student ?? null;
            if (student) {
              console.log(`[DetailFetch] ${ln}: visa_status=${student.visa_status}, interview_status=${student.visa_interview_status}`);
            }
            return { ln, data: student };
          }).catch((err) => { console.error(`[DetailFetch] ${ln} error:`, err); return { ln, data: null }; }))
        );
        if (cancelled) return;
        setDetailMap(prev => {
          const next = new Map(prev);
          results.forEach(({ ln, data }) => {
            next.set(ln, {
              visa_status: data?.visa_status || null,
              visa_interview_date: data?.visa_interview_date || null,
              visa_interview_status: data?.visa_interview_status || null,
            });
          });
          return next;
        });
      }
    })();

    return () => { cancelled = true; };
  }, [licencesWithStudents]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enrich licenses
  const enrichedLicenses = useMemo<EnrichedLicense[]>(() => {
    return allLicenses.map((lic) => {
      const alloc = allocMap.get(lic.license_number);
      const perf = performerMap.get(lic.license_number);
      const isAllocated = allocatedSet.has(lic.license_number) || !!lic.email;
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

      // Merge rich visa data from detail API
      const detail = detailMap.get(lic.license_number);

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
        richVisaStatus: detail?.visa_status || null,
        richVisaInterviewDate: detail?.visa_interview_date || null,
        richVisaInterviewStatus: detail?.visa_interview_status || null,
      };
    });
  }, [allLicenses, allocMap, performerMap, allocatedSet, detailMap]);

  // Collect unique visa statuses and interview statuses for filter dropdowns
  const visaStatusOptions = useMemo(() => {
    const set = new Set<string>();
    enrichedLicenses.forEach(l => {
      const vs = l.richVisaStatus || l.visa_status;
      if (vs) set.add(vs);
    });
    return Array.from(set).sort();
  }, [enrichedLicenses]);

  const interviewStatusOptions = useMemo(() => {
    const set = new Set<string>();
    enrichedLicenses.forEach(l => {
      const vis = l.richVisaInterviewStatus || l.visa_interview_status;
      if (vis) set.add(vis);
    });
    return Array.from(set).sort();
  }, [enrichedLicenses]);

  // Filter
  const filteredLicenses = useMemo(() => {
    return enrichedLicenses.filter((lic) => {
      // Card filter
      if (activeFilter) {
        switch (activeFilter) {
          case "available": if (lic.isAllocated) return false; break;
          case "allocated": if (!lic.isAllocated) return false; break;
          case "activated": if (!lic.isActivated) return false; break;
          case "used": if (!lic.isUsed) return false; break;
        }
      }
      // Visa status filter
      if (filterVisaStatus !== "all") {
        const vs = lic.richVisaStatus || lic.visa_status;
        if (!vs || vs !== filterVisaStatus) return false;
      }
      // Visa slot booked filter (Yes/No)
      if (filterInterviewStatus !== "all") {
        const vis = lic.richVisaInterviewStatus || lic.visa_interview_status;
        const hasSlot = !!vis;
        if (filterInterviewStatus === "yes" && !hasSlot) return false;
        if (filterInterviewStatus === "no" && hasSlot) return false;
      }
      return true;
    });
  }, [enrichedLicenses, activeFilter, filterVisaStatus, filterInterviewStatus]);

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
        case "visa_status": va = a.richVisaStatus || a.visa_status; vb = b.richVisaStatus || b.visa_status; break;
        case "visa_date": va = a.richVisaInterviewDate || a.visa_interview_date || a.visa_slot_date; vb = b.richVisaInterviewDate || b.visa_interview_date || b.visa_slot_date; break;
        case "visa_interview_slot": va = a.richVisaInterviewStatus || a.visa_interview_status; vb = b.richVisaInterviewStatus || b.visa_interview_status; break;
        case "visa_interview_status": va = null; vb = null; break; // Coming Soon - no data yet
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

  // Compute counts: prefer local enriched data when loaded, fall back to stats API
  const hasLocalData = enrichedLicenses.length > 0;
  const localCounts = {
    available: enrichedLicenses.filter(l => !l.isAllocated).length,
    allocated: enrichedLicenses.filter(l => l.isAllocated).length,
    activated: enrichedLicenses.filter(l => l.isActivated).length,
    used: enrichedLicenses.filter(l => l.isUsed).length,
  };

  const statCards: Array<{ key: CardFilter; label: string; value: number; icon: React.ReactNode; color: string }> = [
    { key: "available", label: "Licences Available", value: hasLocalData ? localCounts.available : (stats?.licenses.unassigned ?? 0), icon: <Key className="h-5 w-5" />, color: "text-primary bg-primary/10" },
    { key: "allocated", label: "Licences Allocated", value: hasLocalData ? localCounts.allocated : (stats?.licenses.assigned ?? 0), icon: <Users className="h-5 w-5" />, color: "text-blue-500 bg-blue-500/10" },
    { key: "activated", label: "Licences Activated", value: hasLocalData ? localCounts.activated : (stats?.licenses.activated ?? 0), icon: <Zap className="h-5 w-5" />, color: "text-orange-500 bg-orange-500/10" },
    { key: "used", label: "Licences Used", value: hasLocalData ? localCounts.used : (stats?.licenses.in_use ?? 0), icon: <PlayCircle className="h-5 w-5" />, color: "text-green-600 bg-green-600/10" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">AI Visa Tutor</h1>
          <p className="text-muted-foreground mt-1">Manage licence allocations and track student performance</p>
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
                <CardContent className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", card.color)}>{card.icon}</div>
                    <div>
                      <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
                      <p className="text-3xl font-bold leading-tight mt-0.5">{card.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Filter Row */}
        <div className="flex items-center gap-3 flex-nowrap overflow-x-auto">
          <Select value={activeFilter || "all"} onValueChange={(v) => { setActiveFilter(v === "all" ? null : v as CardFilter); setPage(1); }}>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Licence Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Licence Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="allocated">Allocated</SelectItem>
              <SelectItem value="activated">Activated</SelectItem>
              <SelectItem value="used">Used</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterVisaStatus} onValueChange={(v) => { setFilterVisaStatus(v); setPage(1); }}>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Visa Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visa Statuses</SelectItem>
              {visaStatusOptions.map(s => (
                <SelectItem key={s} value={s}>{capitalize(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterInterviewStatus} onValueChange={(v) => { setFilterInterviewStatus(v); setPage(1); }}>
            <SelectTrigger className="min-w-[200px]">
              <SelectValue placeholder="Visa Slot Booked" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visa Slot Booked</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>

          <Select value="all" disabled>
            <SelectTrigger className="min-w-[200px] opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                <span>Visa Interview Status</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Coming Soon</SelectItem>
            </SelectContent>
          </Select>

          {(activeFilter || filterVisaStatus !== "all" || filterInterviewStatus !== "all") && (
            <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => { setActiveFilter(null); setFilterVisaStatus("all"); setFilterInterviewStatus("all"); setPage(1); }}>
              Clear all filters
            </Button>
          )}

          <div className="ml-auto shrink-0">
            <Button
              size="lg"
              className="h-11 px-8 text-sm font-semibold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md whitespace-nowrap"
              onClick={() => setShowAssignOptions(true)}
            >
              <Plus className="h-5 w-5" /> Assign Licences
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <div className="p-4 pb-0 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Licences ({totalFiltered})</p>
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
                <p>No licences found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table className="w-max min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background z-20 min-w-[170px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                          Licence No.
                        </TableHead>
                        <TableHead className="sticky left-[170px] bg-background z-20 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
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
                            No. of Mock Attempts <SortIcon col="usage" />
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
                          <button className="flex items-center" onClick={() => handleSort("visa_interview_slot")}>
                            Visa Interview Slot Booked <SortIcon col="visa_interview_slot" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            Visa Interview Status
                          </div>
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
                          <TableCell className="sticky left-[170px] bg-background z-20 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
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
                            {(() => {
                              const vs = lic.richVisaStatus || lic.visa_status;
                              return vs ? <Badge variant="outline">{capitalize(vs)}</Badge> : "—";
                            })()}
                          </TableCell>
                          {/* Visa Interview Date */}
                          <TableCell className="whitespace-nowrap">
                            {formatVisaDate(lic.richVisaInterviewDate || lic.visa_interview_date || lic.visa_slot_date)}
                          </TableCell>
                          {/* Visa Interview Slot Booked */}
                          <TableCell className="whitespace-nowrap">
                            {(() => {
                              const vis = lic.richVisaInterviewStatus || lic.visa_interview_status;
                              return vis ? <Badge variant="outline">{capitalize(vis)}</Badge> : "—";
                            })()}
                          </TableCell>
                          {/* Visa Interview Status - Coming Soon */}
                          <TableCell className="whitespace-nowrap">
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                              Coming Soon
                            </Badge>
                          </TableCell>
                          {/* Actions */}
                          <TableCell className="text-center sticky right-0 bg-background z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] min-w-[120px]">
                            <div className="flex items-center gap-1 justify-center">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedLicense(lic.license_number)} title="View details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {lic.isActivated ? (
                                <Button variant="outline" size="sm" className="h-7 text-xs opacity-50 cursor-not-allowed" disabled title="Licence already activated — cannot reassign">
                                  <Lock className="h-3 w-3 mr-1" /> Locked
                                </Button>
                              ) : lic.isAllocated ? (
                                <Button
                                  size="sm"
                                  className="h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm"
                                  onClick={() => { setAssignPrefill(lic); setShowAssignModal(true); }}
                                  title="Reassign licence (currently allocated but not activated)"
                                >
                                  <RefreshCcw className="h-3.5 w-3.5 mr-1" /> Reassign
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                                  onClick={() => { setAssignPrefill(lic); setShowAssignModal(true); }}
                                  title="Assign licence"
                                >
                                  <UserPlus className="h-3.5 w-3.5 mr-1" /> Assign
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

      <AssignOptionsModal
        open={showAssignOptions}
        onClose={() => setShowAssignOptions(false)}
        onSingleAssign={() => { setAssignPrefill(undefined); setShowAssignModal(true); }}
        onBulkAssign={() => setShowBulkAssign(true)}
      />

      <BulkAssignModal
        open={showBulkAssign}
        onClose={() => setShowBulkAssign(false)}
        onSuccess={() => { setShowBulkAssign(false); refetch(); }}
        licences={enrichedLicenses.map(l => ({
          license_number: l.license_number,
          isAllocated: l.isAllocated,
          isActivated: l.isActivated,
          studentFirstName: l.allocName?.split(" ")[0] || "",
          studentLastName: l.allocName?.split(" ").slice(1).join(" ") || "",
          studentEmail: l.allocEmail || "",
          studentPhone: allocMap.get(l.license_number)?.student?.phone || l.mobile || "",
          commsConsent: allocMap.get(l.license_number)?.comms_workflow_consent ?? true,
        }))}
      />

      <AssignLicenseModal
        open={showAssignModal}
        onClose={() => { setShowAssignModal(false); setAssignPrefill(undefined); }}
        onSuccess={() => { setShowAssignModal(false); setAssignPrefill(undefined); refetch(); }}
        prefillLicenseNo={assignPrefill?.license_number}
        isReassign={!!assignPrefill?.isAllocated}
        existingData={assignPrefill?.isAllocated ? (() => {
          const alloc = allocMap.get(assignPrefill.license_number);
          return {
            firstName: alloc?.student?.first_name || assignPrefill.allocName?.split(" ")[0] || "",
            lastName: alloc?.student?.last_name || assignPrefill.allocName?.split(" ").slice(1).join(" ") || "",
            email: alloc?.student?.email || assignPrefill.allocEmail || "",
            phone: alloc?.student?.phone || "",
            consent: alloc?.comms_workflow_consent ?? true,
          };
        })() : undefined}
      />
    </DashboardLayout>
  );
}
