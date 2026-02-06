import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, FileSpreadsheet, GraduationCap, Clock, RefreshCw, Loader2, CheckCircle, ArrowRight, ArrowDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  UniversityApplication,
  fetchApplications,
  downloadApplicationsAsExcel,
} from "@/lib/api/applications";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  Applied: { label: "Applied", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  Admitted: { label: "Admitted", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  Rejected: { label: "Rejected", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  Waitlisted: { label: "Waitlisted", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  "Under Review": { label: "Under Review", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
};

type FilterType = "applications" | "admits";

export default function UniversityApplications() {
  const [applications, setApplications] = useState<UniversityApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("applications");
  const [stats, setStats] = useState({
    total: 0,
    admitted: 0,
    applied: 0,
  });

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchApplications({ search: searchQuery });
      if (response.success && response.data) {
        const apps = response.data.applications || [];
        setApplications(apps);
        
        // Calculate stats from data
        setStats({
          total: response.data.meta?.total_applications || apps.length,
          admitted: apps.filter((a) => a.status === "Admitted").length,
          applied: apps.filter((a) => a.status !== "Admitted").length,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Filter by active filter type
  const filteredByType = useMemo(() => {
    switch (activeFilter) {
      case "applications":
        return applications.filter((app) => app.status !== "Admitted");
      case "admits":
        return applications.filter((app) => app.status === "Admitted");
      default:
        return applications;
    }
  }, [applications, activeFilter]);

  // Filter locally for immediate search feedback
  const filteredApplications = filteredByType.filter(
    (app) =>
      app.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.program_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = () => {
    setIsExporting(true);
    try {
      downloadApplicationsAsExcel(filteredApplications);
      toast({
        title: "Success",
        description: "Excel file downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to download export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Applications & Admits Pipeline
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage student applications and admits submitted via SEED
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadApplications} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="success" onClick={handleDownload} disabled={isExporting} className="gap-2">
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "Downloading..." : "Download"}
            </Button>
          </div>
        </div>

        {/* Funnel Pipeline - Two Stage Flow */}
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          {/* Applications Card */}
          <Card 
            className={cn(
              "flex-1 cursor-pointer transition-all border-2 md:rounded-r-none",
              activeFilter === "applications" 
                ? "border-amber-500 bg-amber-500/5 shadow-lg" 
                : "border-border hover:border-amber-500/50 hover:bg-muted/30"
            )}
            onClick={() => setActiveFilter("applications")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-4 rounded-xl",
                  activeFilter === "applications" ? "bg-amber-500/20" : "bg-muted"
                )}>
                  <Clock className={cn(
                    "h-6 w-6",
                    activeFilter === "applications" ? "text-amber-600" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    activeFilter === "applications" ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    Applications
                  </p>
                  <p className="text-4xl font-bold text-foreground">{stats.applied}</p>
                  <p className="text-xs text-muted-foreground">Pending decisions</p>
                </div>
                {activeFilter === "applications" && (
                  <CheckCircle className="h-5 w-5 text-amber-600" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Funnel Arrow Connector */}
          <div className="hidden md:flex items-center justify-center bg-gradient-to-r from-amber-500/20 to-emerald-500/20 px-4 border-y-2 border-border">
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-6 w-6 text-primary" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Flow</span>
            </div>
          </div>
          <div className="flex md:hidden items-center justify-center py-3 bg-gradient-to-b from-amber-500/10 to-emerald-500/10">
            <ArrowDown className="h-5 w-5 text-primary" />
          </div>

          {/* Admits Card */}
          <Card 
            className={cn(
              "flex-1 cursor-pointer transition-all border-2 md:rounded-l-none",
              activeFilter === "admits" 
                ? "border-emerald-500 bg-emerald-500/5 shadow-lg" 
                : "border-border hover:border-emerald-500/50 hover:bg-muted/30"
            )}
            onClick={() => setActiveFilter("admits")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-4 rounded-xl",
                  activeFilter === "admits" ? "bg-emerald-500/20" : "bg-muted"
                )}>
                  <GraduationCap className={cn(
                    "h-6 w-6",
                    activeFilter === "admits" ? "text-emerald-600" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    activeFilter === "admits" ? "text-emerald-600" : "text-muted-foreground"
                  )}>
                    Admits
                  </p>
                  <p className="text-4xl font-bold text-foreground">{stats.admitted}</p>
                  <p className="text-xs text-muted-foreground">Admitted students</p>
                </div>
                {activeFilter === "admits" && (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rate Bar */}
        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Conversion Rate</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${stats.total > 0 ? (stats.admitted / stats.total) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {stats.total > 0 ? Math.round((stats.admitted / stats.total) * 100) : 0}%
          </span>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                {activeFilter === "applications" && "Applications"}
                {activeFilter === "admits" && "Admits"}
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-24">First Name</TableHead>
                        <TableHead className="w-24">Last Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Program Name</TableHead>
                        <TableHead className="w-36">Intake</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                            No {activeFilter === "admits" ? "admits" : "applications"} found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((app) => (
                          <TableRow key={app.record_id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{app.first_name?.trim()}</TableCell>
                            <TableCell>{app.last_name?.trim()}</TableCell>
                            <TableCell className="text-muted-foreground">{app.email}</TableCell>
                            <TableCell>{app.phone_number || "-"}</TableCell>
                            <TableCell>{app.program_name}</TableCell>
                            <TableCell>{app.intake}</TableCell>
                            <TableCell>
                              {app.status === "Admitted" ? (
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs px-2">
                                    Applied
                                  </Badge>
                                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs px-2">
                                    Admitted
                                  </Badge>
                                </div>
                              ) : (
                                <Badge variant="outline" className={statusConfig[app.status]?.className || "bg-gray-500/10 text-gray-600 border-gray-500/20"}>
                                  {statusConfig[app.status]?.label || app.status}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredApplications.length} of {filteredByType.length} {activeFilter === "admits" ? "admits" : "applications"}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
