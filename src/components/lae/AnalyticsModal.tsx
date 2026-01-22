import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  GraduationCap,
  ListChecks,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Loader2,
  Clock,
  BarChart3,
  PieChart,
  TableIcon,
  X,
} from "lucide-react";
import {
  AnalyticsData,
  DistributionItem,
  fetchAnalyticsData,
} from "@/lib/api/lae";
import { AnalyticsChart } from "./AnalyticsChart";
import { AnalyticsTable } from "./AnalyticsTable";
import { DetailModal } from "./DetailModal";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string | null;
  assignmentName: string;
}

type ChartType = "bar" | "doughnut" | "table";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(220 25% 20%)",
  "hsl(160 50% 42%)",
  "hsl(220 15% 50%)",
  "hsl(35 85% 50%)",
  "hsl(240 50% 60%)",
  "hsl(0 65% 50%)",
  "hsl(190 70% 45%)",
  "hsl(270 50% 55%)",
  "hsl(330 60% 55%)",
  "hsl(220 20% 35%)",
  "hsl(210 15% 60%)",
];

export function AnalyticsModal({
  open,
  onOpenChange,
  assignmentId,
  assignmentName,
}: AnalyticsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [programChartType, setProgramChartType] = useState<ChartType>("table");
  const [statusChartType, setStatusChartType] = useState<ChartType>("bar");
  const [generatedTime, setGeneratedTime] = useState<Date | null>(null);

  // Multi-select state
  const [multiSelectMode, setMultiSelectMode] = useState<{
    status: boolean;
    program: boolean;
  }>({ status: false, program: false });
  const [selectedItems, setSelectedItems] = useState<{
    status: string[];
    program: string[];
  }>({ status: [], program: [] });

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailFilterType, setDetailFilterType] = useState<"status" | "program">("status");
  const [detailFilterValues, setDetailFilterValues] = useState<string[]>([]);

  // Column labels
  const statusLabel = useMemo(
    () =>
      analyticsData?.columns?.status_column
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()) || "Status",
    [analyticsData]
  );
  const programLabel = useMemo(
    () =>
      analyticsData?.columns?.program_column
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()) || "Program",
    [analyticsData]
  );

  // Load analytics data
  const loadData = async () => {
    if (!assignmentId) return;

    setIsLoading(true);
    try {
      const data = await fetchAnalyticsData(assignmentId, statusFilter, programFilter);
      // Ensure data has required structure
      const safeData: AnalyticsData = {
        success: data?.success ?? false,
        columns: data?.columns ?? { status_column: null, program_column: null },
        filters: {
          statuses: data?.filters?.statuses ?? [],
          programs: data?.filters?.programs ?? [],
        },
        total_records: data?.total_records ?? 0,
        program_total: data?.program_total ?? 0,
        status_total: data?.status_total ?? 0,
        program_distribution: data?.program_distribution ?? [],
        status_distribution: data?.status_distribution ?? [],
      };
      setAnalyticsData(safeData);
      setGeneratedTime(new Date());
    } catch (error) {
      console.error("Analytics load error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load analytics",
        variant: "destructive",
      });
      // Set empty data on error to prevent crash
      setAnalyticsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && assignmentId) {
      setStatusFilter("all");
      setProgramFilter("all");
      setProgramChartType("table");
      setStatusChartType("bar");
      setMultiSelectMode({ status: false, program: false });
      setSelectedItems({ status: [], program: [] });
      loadData();
    }
  }, [open, assignmentId]);

  useEffect(() => {
    if (open && assignmentId && analyticsData) {
      loadData();
    }
  }, [statusFilter, programFilter]);

  const handleResetFilters = () => {
    setStatusFilter("all");
    setProgramFilter("all");
  };

  const activeFiltersCount =
    (statusFilter !== "all" ? 1 : 0) + (programFilter !== "all" ? 1 : 0);

  // Handle chart/table item click
  const handleItemClick = (type: "status" | "program", value: string) => {
    if (multiSelectMode[type]) {
      // Multi-select mode - toggle selection
      setSelectedItems((prev) => {
        const current = prev[type];
        const newSelection = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [type]: newSelection };
      });
    } else {
      // Single click - open detail modal
      setDetailFilterType(type);
      setDetailFilterValues([value]);
      setDetailModalOpen(true);
    }
  };

  // Handle multi-select view
  const handleViewSelected = (type: "status" | "program") => {
    if (selectedItems[type].length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item",
        variant: "destructive",
      });
      return;
    }
    setDetailFilterType(type);
    setDetailFilterValues(selectedItems[type]);
    setDetailModalOpen(true);
  };

  // Toggle multi-select mode
  const toggleMultiSelect = (type: "status" | "program") => {
    setMultiSelectMode((prev) => ({ ...prev, [type]: !prev[type] }));
    if (multiSelectMode[type]) {
      setSelectedItems((prev) => ({ ...prev, [type]: [] }));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                {assignmentName} - Analytics
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto px-6 py-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading analytics data...</p>
              </div>
            ) : analyticsData ? (
              <div className="space-y-6">
                {/* Filters */}
                <Card>
                  <CardContent className="py-4">
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                          <Filter className="h-3.5 w-3.5" />
                          Filter by {statusLabel}
                        </label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder={`All ${statusLabel}es`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All {statusLabel}es</SelectItem>
                            {analyticsData.filters.statuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                          <Filter className="h-3.5 w-3.5" />
                          Filter by {programLabel}
                        </label>
                        <Select value={programFilter} onValueChange={setProgramFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder={`All ${programLabel}s`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All {programLabel}s</SelectItem>
                            {analyticsData.filters.programs.map((program) => (
                              <SelectItem key={program} value={program}>
                                {program}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleResetFilters}
                        disabled={activeFiltersCount === 0}
                      >
                        <RotateCcw className="h-4 w-4 mr-1.5" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Records</p>
                          <p className="text-2xl font-bold text-foreground">
                            {analyticsData.total_records.toLocaleString()}
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Database className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Unique {programLabel}s
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {analyticsData.program_distribution.length}
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Unique {statusLabel}es
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {analyticsData.status_distribution.length}
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ListChecks className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Filters</p>
                          <p className="text-2xl font-bold text-foreground">
                            {activeFiltersCount}
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Filter className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Program Distribution */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          {programLabel} Distribution
                        </CardTitle>
                        <Tabs
                          value={programChartType}
                          onValueChange={(v) => setProgramChartType(v as ChartType)}
                        >
                          <TabsList className="h-8">
                            <TabsTrigger value="bar" className="h-7 px-2">
                              <BarChart3 className="h-3.5 w-3.5" />
                            </TabsTrigger>
                            <TabsTrigger value="doughnut" className="h-7 px-2">
                              <PieChart className="h-3.5 w-3.5" />
                            </TabsTrigger>
                            <TabsTrigger value="table" className="h-7 px-2">
                              <TableIcon className="h-3.5 w-3.5" />
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[400px]">
                      {programChartType === "table" ? (
                        <AnalyticsTable
                          data={analyticsData.program_distribution.map((d) => ({
                            label: d.program || "N/A",
                            count: d.count,
                          }))}
                          total={analyticsData.program_total}
                          headerLabel={programLabel}
                          onItemClick={(value) => handleItemClick("program", value)}
                          multiSelectMode={multiSelectMode.program}
                          selectedItems={selectedItems.program}
                          onToggleMultiSelect={() => toggleMultiSelect("program")}
                          onViewSelected={() => handleViewSelected("program")}
                        />
                      ) : (
                        <AnalyticsChart
                          type={programChartType}
                          data={analyticsData.program_distribution.map((d) => ({
                            label: d.program || "N/A",
                            value: d.count,
                          }))}
                          colors={CHART_COLORS}
                          onItemClick={(value) => handleItemClick("program", value)}
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Status Distribution */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ListChecks className="h-4 w-4 text-primary" />
                          {statusLabel} Distribution
                        </CardTitle>
                        <Tabs
                          value={statusChartType}
                          onValueChange={(v) => setStatusChartType(v as ChartType)}
                        >
                          <TabsList className="h-8">
                            <TabsTrigger value="bar" className="h-7 px-2">
                              <BarChart3 className="h-3.5 w-3.5" />
                            </TabsTrigger>
                            <TabsTrigger value="doughnut" className="h-7 px-2">
                              <PieChart className="h-3.5 w-3.5" />
                            </TabsTrigger>
                            <TabsTrigger value="table" className="h-7 px-2">
                              <TableIcon className="h-3.5 w-3.5" />
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[400px]">
                      {statusChartType === "table" ? (
                        <AnalyticsTable
                          data={analyticsData.status_distribution.map((d) => ({
                            label: d.lead_status || "N/A",
                            count: d.count,
                          }))}
                          total={analyticsData.status_total}
                          headerLabel={statusLabel}
                          onItemClick={(value) => handleItemClick("status", value)}
                          multiSelectMode={multiSelectMode.status}
                          selectedItems={selectedItems.status}
                          onToggleMultiSelect={() => toggleMultiSelect("status")}
                          onViewSelected={() => handleViewSelected("status")}
                        />
                      ) : (
                        <AnalyticsChart
                          type={statusChartType}
                          data={analyticsData.status_distribution.map((d) => ({
                            label: d.lead_status || "N/A",
                            value: d.count,
                          }))}
                          colors={CHART_COLORS}
                          onItemClick={(value) => handleItemClick("status", value)}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <PieChart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground">No Analytics Data</h3>
                <p className="text-sm text-muted-foreground">
                  There is no data to display for this assignment.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t shrink-0 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {generatedTime
                ? format(generatedTime, "MMM d, yyyy 'at' h:mm a")
                : "--"}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                Export Excel
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1.5" />
                Export PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <DetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        assignmentId={assignmentId}
        filterType={detailFilterType}
        filterValues={detailFilterValues}
        filterLabel={detailFilterType === "status" ? statusLabel : programLabel}
        crossFilters={{
          status: statusFilter,
          program: programFilter,
        }}
      />
    </>
  );
}
