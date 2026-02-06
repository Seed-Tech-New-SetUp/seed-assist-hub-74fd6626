import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, RefreshCw, Eye, UserPlus, Key, Users, Zap, PlayCircle,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  fetchLicenses, fetchStats, fetchAllocations,
  type VisaLicense, type Allocation,
} from "@/lib/api/visa-tutor";
import { LicenseDetailModal } from "@/components/visa/LicenseDetailModal";
import { AssignLicenseModal } from "@/components/visa/AssignLicenseModal";
import { cn } from "@/lib/utils";

type CardFilter = "available" | "allocated" | "activated" | "used" | null;

const PAGE_SIZE = 20;

export default function VisaPrep() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<CardFilter>(null);
  const [page, setPage] = useState(1);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignPrefill, setAssignPrefill] = useState<string | undefined>();

  // Stats
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["visa-stats"],
    queryFn: fetchStats,
  });

  // All licenses (single fetch, high limit for client-side filtering)
  const { data: licensesData, isLoading: licensesLoading, refetch: refetchLicenses, isFetching } = useQuery({
    queryKey: ["visa-licenses-all", search],
    queryFn: () => fetchLicenses({ search: search || undefined, page: 1, limit: 500 }),
  });

  // All allocations (to merge student data)
  const { data: allocData, refetch: refetchAlloc } = useQuery({
    queryKey: ["visa-allocations-all"],
    queryFn: () => fetchAllocations({ limit: 500 }),
  });

  const refetch = () => { refetchLicenses(); refetchAlloc(); refetchStats(); };

  const stats = statsData?.data;
  const allLicenses = licensesData?.data?.licenses || [];

  // Build allocation lookup by license_no
  const allocMap = useMemo(() => {
    const map = new Map<string, Allocation>();
    (allocData?.data?.allocations || []).forEach((a) => map.set(a.license_no, a));
    return map;
  }, [allocData]);

  // Determine filter sets
  const allocatedSet = useMemo(() => new Set(allocMap.keys()), [allocMap]);

  // Client-side filtering
  const filteredLicenses = useMemo(() => {
    return allLicenses.filter((lic) => {
      if (!activeFilter) return true;
      switch (activeFilter) {
        case "available":
          return !allocatedSet.has(lic.license_number);
        case "allocated":
          return allocatedSet.has(lic.license_number);
        case "activated":
          return lic.activation_status === "started";
        case "used":
          return lic.usage_status === "started";
        default:
          return true;
      }
    });
  }, [allLicenses, activeFilter, allocatedSet]);

  // Client-side pagination
  const totalFiltered = filteredLicenses.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const paginatedLicenses = filteredLicenses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusBadge = (status: string) => {
    const colorMap: Record<string, string> = {
      started: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      not_started: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      <Badge className={colorMap[status] || ""} variant={colorMap[status] ? undefined : "outline"}>
        {status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—"}
      </Badge>
    );
  };

  const handleCardClick = (filter: CardFilter) => {
    setActiveFilter((prev) => (prev === filter ? null : filter));
    setPage(1);
  };

  const statCards: Array<{ key: CardFilter; label: string; value: number; icon: React.ReactNode; color: string }> = [
    {
      key: "available",
      label: "Licenses Available",
      value: stats?.licenses.unassigned ?? 0,
      icon: <Key className="h-5 w-5" />,
      color: "text-primary bg-primary/10",
    },
    {
      key: "allocated",
      label: "Licenses Allocated",
      value: stats?.licenses.assigned ?? 0,
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      key: "activated",
      label: "Licenses Activated",
      value: stats?.licenses.activated ?? 0,
      icon: <Zap className="h-5 w-5" />,
      color: "text-orange-500 bg-orange-500/10",
    },
    {
      key: "used",
      label: "Licenses Used",
      value: stats?.licenses.in_use ?? 0,
      icon: <PlayCircle className="h-5 w-5" />,
      color: "text-green-600 bg-green-600/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">AI Visa Tutor</h1>
            <p className="text-muted-foreground mt-1">
              Manage license allocations and track student performance
            </p>
          </div>
          <Button onClick={() => { setAssignPrefill(undefined); setShowAssignModal(true); }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign License
          </Button>
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
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  activeFilter === card.key && "ring-2 ring-primary shadow-md"
                )}
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

        {/* Active Filter Indicator */}
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

        {/* Licenses Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Licenses ({totalFiltered})
              </CardTitle>
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
                <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
                  <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                        <TableHead className="sticky left-0 bg-background z-10">License No.</TableHead>
                        <TableHead>Alloted To</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Target Degree</TableHead>
                        <TableHead>Visa Type</TableHead>
                        <TableHead>Visa Interview Date</TableHead>
                        <TableHead className="text-center">Activation</TableHead>
                        <TableHead className="text-center">Usage</TableHead>
                        <TableHead className="text-center">Tests</TableHead>
                        <TableHead className="text-center sticky right-0 bg-background z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] min-w-[140px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLicenses.map((license: VisaLicense) => {
                        const alloc = allocMap.get(license.license_number);
                        const allocName = alloc
                          ? [alloc.student?.first_name, alloc.student?.last_name].filter(Boolean).join(" ")
                          : null;
                        const allocEmail = alloc?.student?.email || null;

                        return (
                          <TableRow key={license.license_number}>
                            <TableCell className="font-mono text-sm whitespace-nowrap sticky left-0 bg-background z-10">
                              {license.license_number}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {allocName || license.alloted_to || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {allocEmail || license.email || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {alloc?.student?.phone || license.mobile || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{license.target_degree || "—"}</TableCell>
                            <TableCell className="whitespace-nowrap">{license.visa_app_type || "—"}</TableCell>
                            <TableCell className="whitespace-nowrap">{license.visa_slot_date || "—"}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(license.activation_status)}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(license.usage_status)}</TableCell>
                            <TableCell className="text-center font-medium">{license.test_attempted ?? 0}</TableCell>
                            <TableCell className="text-center sticky right-0 bg-background z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] min-w-[140px]">
                              <div className="flex items-center gap-1 justify-center">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setSelectedLicense(license.license_number)}
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => { setAssignPrefill(license.license_number); setShowAssignModal(true); }}
                                  title="Assign license"
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Assign
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} ({totalFiltered} total)
                    </p>
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
        onUpdate={() => refetch()}
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
