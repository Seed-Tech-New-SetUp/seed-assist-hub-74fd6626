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
import { Download, Search, FileSpreadsheet, Users, GraduationCap, Clock, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  UniversityApplication,
  fetchApplications,
  downloadApplicationsAsExcel,
} from "@/lib/api/applications";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  Applied: { label: "Applied", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  Admitted: { label: "Admitted", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  Rejected: { label: "Rejected", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  Waitlisted: { label: "Waitlisted", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  "Under Review": { label: "Under Review", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

type FilterType = "all" | "applications" | "admits";

export default function UniversityApplications() {
  const [applications, setApplications] = useState<UniversityApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
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

  const filterCards: { id: FilterType; label: string; icon: React.ElementType; count: number; description: string }[] = [
    { id: "all", label: "All Applications & Admits", icon: Users, count: stats.total, description: "View all records" },
    { id: "applications", label: "All Applications", icon: Clock, count: stats.applied, description: "Pending decisions" },
    { id: "admits", label: "All Admits", icon: GraduationCap, count: stats.admitted, description: "Admitted students" },
  ];

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

        {/* Filter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filterCards.map((card) => {
            const Icon = card.icon;
            const isActive = activeFilter === card.id;
            return (
              <Card
                key={card.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isActive 
                    ? "ring-2 ring-primary border-primary bg-primary/5" 
                    : "hover:border-primary/50"
                )}
                onClick={() => setActiveFilter(card.id)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn(
                    "p-3 rounded-lg",
                    isActive ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-medium",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{card.count}</p>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </div>
                  {isActive && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                {activeFilter === "all" && "All Applications & Admits"}
                {activeFilter === "applications" && "Applications"}
                {activeFilter === "admits" && "Admits"}
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
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
                <p className="text-sm text-muted-foreground">Loading applications...</p>
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
                            No {activeFilter === "admits" ? "admits" : activeFilter === "applications" ? "applications" : "records"} found
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
                              <Badge variant="outline" className={statusConfig[app.status]?.className || "bg-gray-500/10 text-gray-600 border-gray-500/20"}>
                                {statusConfig[app.status]?.label || app.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredApplications.length} of {filteredByType.length} {activeFilter === "admits" ? "admits" : activeFilter === "applications" ? "applications" : "records"}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
