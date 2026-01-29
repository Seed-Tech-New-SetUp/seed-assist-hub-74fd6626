import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Filter,
  Database,
  FileSpreadsheet,
  Loader2,
  TableIcon,
  AlertCircle,
} from "lucide-react";
import { fetchDetailData, DetailDataResponse } from "@/lib/api/lae";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import * as XLSX from "xlsx";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string | null;
  filterType: "status" | "program";
  filterValues: string[];
  filterLabel: string;
  crossFilters?: {
    status?: string;
    program?: string;
  };
}

export function DetailModal({
  open,
  onOpenChange,
  assignmentId,
  filterType,
  filterValues,
  filterLabel,
  crossFilters,
}: DetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<DetailDataResponse | null>(null);

  useEffect(() => {
    if (open && assignmentId && filterValues.length > 0) {
      loadDetailData();
    }
  }, [open, assignmentId, filterType, filterValues]);

  const loadDetailData = async () => {
    if (!assignmentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDetailData(
        assignmentId,
        filterType,
        filterValues,
        {
          status: filterType !== "status" ? crossFilters?.status : undefined,
          program: filterType !== "program" ? crossFilters?.program : undefined,
        }
      );
      setDetailData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load data";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Frontend-based Excel export
  const handleExport = () => {
    if (!detailData || detailData.data.length === 0) {
      toast({
        title: "Error",
        description: "No data to export",
        variant: "destructive",
      });
      return;
    }

    try {
      // Transform data with formatted headers
      const exportData = detailData.data.map((row) => {
        const formattedRow: Record<string, unknown> = {};
        detailData.columns.forEach((column, index) => {
          const header = formatHeader(column, index);
          formattedRow[header] = row[column] !== null && row[column] !== undefined
            ? String(row[column])
            : "";
        });
        return formattedRow;
      });

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...exportData.map(row => String(row[key] ?? '').length)
        ) + 2
      }));
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");

      // Generate filename
      const today = format(new Date(), "yyyyMMdd_HHmmss");
      const filterValue = filterValues.length > 1 
        ? `${filterValues.length}_items` 
        : filterValues[0]?.replace(/[^a-zA-Z0-9]/g, "_") || "data";
      const filename = `${filterLabel}_${filterValue}_${today}.xlsx`;

      XLSX.writeFile(wb, filename);

      toast({
        title: "Export Complete",
        description: "Your Excel file has been downloaded.",
      });
    } catch (error) {
      console.error("Excel export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate Excel file",
        variant: "destructive",
      });
    }
  };

  const formatHeader = (column: string, index: number): string => {
    if (detailData?.headers && detailData.headers[index]) {
      return detailData.headers[index];
    }
    return column
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <TableIcon className="h-5 w-5 text-primary" />
            {filterLabel}: {filterValues.length > 1 ? `${filterValues.length} Selected` : filterValues[0]}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="font-medium text-foreground">Error Loading Data</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={loadDetailData}
              >
                Try Again
              </Button>
            </div>
          ) : detailData && detailData.data.length > 0 ? (
            <div className="space-y-4">
              {/* Info Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Filter Applied</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filterValues.map((value) => (
                        <Badge key={value} variant="secondary">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Total Records</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {detailData.data.length.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Data Table */}
              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TableIcon className="h-4 w-4 text-primary" />
                      Records
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                      Export to Excel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Allow both vertical + horizontal scroll for wide tables */}
                  <div className="h-[400px] overflow-auto">
                    <Table className="w-max">
                      <TableHeader>
                        <TableRow>
                          {detailData.columns.map((column, index) => (
                            <TableHead key={column} className="whitespace-nowrap">
                              {formatHeader(column, index)}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailData.data.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {detailData.columns.map((column) => (
                              <TableCell key={column} className="whitespace-nowrap">
                                {row[column] !== null && row[column] !== undefined
                                  ? String(row[column])
                                  : "-"}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <TableIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-foreground">No Records Found</h3>
              <p className="text-sm text-muted-foreground">
                There are no records matching the selected filter.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t shrink-0 flex items-center justify-end bg-muted/30">
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
