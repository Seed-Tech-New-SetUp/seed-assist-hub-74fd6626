import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  Search, RefreshCw, Eye, UserPlus, BarChart3, Users, Key, Activity,
} from "lucide-react";
import {
  fetchAllocations, fetchStats,
  type Allocation, type StatsResponse,
} from "@/lib/api/visa-tutor";
import { LicenseDetailModal } from "@/components/visa/LicenseDetailModal";
import { AssignLicenseModal } from "@/components/visa/AssignLicenseModal";

export default function VisaPrep() {
  const [search, setSearch] = useState("");
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["visa-stats"],
    queryFn: fetchStats,
  });

  // Allocations
  const { data: allocData, isLoading: allocLoading, refetch, isFetching } = useQuery({
    queryKey: ["visa-allocations", search],
    queryFn: () => fetchAllocations({ search: search || undefined }),
  });

  const stats = statsData?.data;
  const allocations = allocData?.data?.allocations || [];
  const pagination = allocData?.pagination;

  const getStatusBadge = (status: string, type: "activation" | "usage") => {
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
          <Button onClick={() => setShowAssignModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign License
          </Button>
        </div>

        {/* Stats Dashboard */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Licenses</p>
                    <p className="text-2xl font-bold">{stats.licenses.total}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="text-green-600">{stats.licenses.activated} activated</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{stats.licenses.not_activated} pending</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Allocations</p>
                    <p className="text-2xl font-bold">{stats.allocations.total}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-medium">{stats.allocations.coverage_pct?.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.allocations.coverage_pct || 0} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Activity className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mock Sessions</p>
                    <p className="text-2xl font-bold">{stats.sessions.total_sessions}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="text-muted-foreground">{stats.sessions.licenses_with_tests} students tested</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Score</p>
                    <p className="text-2xl font-bold">
                      {stats.sessions.avg_overall != null ? stats.sessions.avg_overall.toFixed(1) : "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="text-muted-foreground">
                    Best: {stats.sessions.best_overall ?? "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Allocations Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Allocations {pagination?.total !== undefined && `(${pagination.total})`}
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative w-[280px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, license..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {allocLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : allocations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No allocations found.</p>
                <p className="text-sm mt-1">Click "Assign License" to allocate a license to a student.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="w-max min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-10">License No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-center">Consent</TableHead>
                      <TableHead className="text-center">Activation</TableHead>
                      <TableHead className="text-center">Usage</TableHead>
                      <TableHead>Allocated At</TableHead>
                      <TableHead className="text-center sticky right-0 bg-background z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((alloc: Allocation) => (
                      <TableRow key={alloc.license_no}>
                        <TableCell className="font-mono text-sm whitespace-nowrap sticky left-0 bg-background z-10">
                          {alloc.license_no}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {[alloc.student?.first_name, alloc.student?.last_name].filter(Boolean).join(" ") || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {alloc.student?.email || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {alloc.student?.phone || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {alloc.comms_workflow_consent ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(alloc.license?.activation_status || "—", "activation")}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(alloc.license?.usage_status || "—", "usage")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {alloc.allocated_at ? new Date(alloc.allocated_at).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-center sticky right-0 bg-background z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] min-w-[80px]">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setSelectedLicense(alloc.license_no)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* License Detail Modal */}
      <LicenseDetailModal
        licenseNumber={selectedLicense}
        open={!!selectedLicense}
        onClose={() => setSelectedLicense(null)}
        onUpdate={() => refetch()}
      />

      {/* Assign License Modal */}
      <AssignLicenseModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => {
          setShowAssignModal(false);
          refetch();
        }}
      />
    </DashboardLayout>
  );
}
